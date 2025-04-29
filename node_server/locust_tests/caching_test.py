from locust import task, TaskSet, between
from .base_tasks import BaseTestData, BaseUser
import random
import time
from locust.exception import RescheduleTask
import gevent

class CacheTestingTasks(TaskSet, BaseTestData):
    """
    Tests caching performance by simulating:
    - Cache hit/miss patterns
    - Cache invalidation scenarios
    - Stale data tolerance
    - Hot vs cold cache performance
    """
    def on_start(self):
        self.create_initial_data(self.client)
        self.hot_keys = [1, 2, 3]  # Frequently accessed keys
        self.cold_keys = list(range(50, 100))  # Rarely accessed keys
        self.last_invalidation = time.time()

    @task(5)
    def cache_hit_test(self):
        """Test performance of cached requests (90% cache hit expected)"""
        # 90% chance to request hot key
        task_id = random.choice(self.hot_keys) if random.random() < 0.9 else random.choice(self.cold_keys)
        
        with self.client.get(
            f"/tasks/{task_id}",
            catch_response=True,
            name="Cached Get"
        ) as resp:
            self._validate_cache_response(resp, task_id)

    @task(3)
    def cache_headers_test(self):
        """Validate proper cache header usage"""
        task_id = random.choice(self.hot_keys)
        
        with self.client.get(
            f"/tasks/{task_id}",
            catch_response=True,
            name="Cache Header Check"
        ) as resp:
            if resp.status_code == 200:
                cache_control = resp.headers.get('Cache-Control', '')
                etag = resp.headers.get('ETag', '')
                
                if 'max-age' not in cache_control and 'public' not in cache_control:
                    resp.failure("Missing cache headers")
                if not etag:
                    resp.failure("Missing ETag")
            else:
                resp.failure(f"Status {resp.status_code}")

    @task(2)
    def cache_invalidation_test(self):
        """Test cache invalidation scenarios"""
        # Invalidate cache every 30 seconds
        if time.time() - self.last_invalidation > 30:
            task_id = random.choice(self.hot_keys)
            with self.client.put(
                f"/tasks/{task_id}",
                json={"status": "completed"},
                catch_response=True,
                name="Cache Invalidation"
            ) as resp:
                if resp.status_code == 200:
                    self.last_invalidation = time.time()
                    # Verify cache was actually invalidated
                    gevent.spawn(self._verify_invalidation, task_id)
                else:
                    resp.failure(f"Status {resp.status_code}")
            raise RescheduleTask()  # Don't count this as a completed task

    @task(1)
    def stale_data_test(self):
        """Test tolerance for stale cache data"""
        with self.client.get(
            "/tasks/stale",
            params={"allow_stale": "true"},
            catch_response=True,
            name="Stale Data Check"
        ) as resp:
            if resp.status_code == 200:
                freshness = resp.headers.get('X-Cache-Freshness', 'fresh')
                if freshness not in ['fresh', 'stale']:
                    resp.failure(f"Invalid freshness: {freshness}")
            else:
                resp.failure(f"Status {resp.status_code}")

    def _validate_cache_response(self, response, task_id):
        """Common validation for cache responses"""
        if response.status_code == 200:
            cache_status = response.headers.get('X-Cache-Status', 'MISS').upper()
            
            if task_id in self.hot_keys and cache_status == 'MISS':
                response.failure("Cache miss on hot key")
            elif task_id in self.cold_keys and cache_status == 'HIT':
                response.failure("Unexpected cache hit on cold key")
            
            # Additional validation
            data = response.json()
            if not data.get('id'):
                response.failure("Invalid response format")
        else:
            response.failure(f"Status {response.status_code}")

    def _verify_invalidation(self, task_id):
        """Background verification of cache invalidation"""
        time.sleep(1)  # Allow cache propagation
        with self.client.get(
            f"/tasks/{task_id}",
            catch_response=True
        ) as resp:
            if resp.status_code == 200:
                cache_status = resp.headers.get('X-Cache-Status', 'MISS').upper()
                if cache_status != 'MISS':
                    self.environment.events.request.fire(
                        request_type="CACHE",
                        name="Invalidation Check",
                        response_time=0,
                        exception="Cache not invalidated"
                    )

class CacheTestingUser(BaseUser):
    tasks = [CacheTestingTasks]
    host = "http://localhost:3001"
    
    # Cache-specific settings
    wait_time = between(0.1, 0.5)  # Faster pacing to test cache efficiency