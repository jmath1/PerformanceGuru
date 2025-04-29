from locust import between, task, TaskSet
from base_tasks import BaseTestData, BaseUser
import random
import gevent

class AsyncTasks(TaskSet, BaseTestData):
    """
    Tests async API performance by simulating:
    - Concurrent GET/POST requests
    - Parallel operations
    - Long-polling scenarios
    """
    def on_start(self):
        self.create_initial_data(self.client)

    @task(3)
    def concurrent_requests(self):
        """Test parallel request handling"""
        req1 = gevent.spawn(
            self.client.get,
            f"/tasks/{random.randint(1, 100)}",
            catch_response=True
        )
        req2 = gevent.spawn(
            self.client.post,
            "/comments",
            json={
                "task_id": random.randint(1, 100),
                "content": f"Async comment {random.randint(1, 1000)}"
            },
            catch_response=True
        )
        
        gevent.joinall([req1, req2])
        
        for i, resp in enumerate([req1.value, req2.value]):
            with resp as r:
                if r.status_code != 200:
                    r.failure(f"Async request {i+1} failed")

    @task(2)
    def chained_async_operations(self):
        """Test async pipeline of dependent operations"""

        with self.client.post(
            "/tasks",
            json={
                "title": f"Async Task {random.randint(1, 1000)}",
                "user_id": random.choice([1, 2, 3]),
                "status": "pending"
            },
            catch_response=True,
            name="Async Create Task"
        ) as create_resp:
            if create_resp.status_code == 200:
                task_id = create_resp.json().get("id")
                
                with self.client.post(
                    f"/tasks/{task_id}/comments",
                    json={"content": f"Comment for async task {task_id}"},
                    catch_response=True,
                    name="Async Create Comment"
                ) as comment_resp:
                    if comment_resp.status_code != 200:
                        comment_resp.failure("Async comment failed")
            else:
                create_resp.failure("Async task creation failed")

    @task(1)
    def long_running_async(self):
        """Test async long-polling endpoints"""
        with self.client.get(
            "/tasks/async_updates",
            params={"timeout": "5s"},
            catch_response=True,
            name="Long Polling"
        ) as resp:
            if resp.status_code == 200:
                if not resp.json().get("updates"):
                    resp.failure("No updates received")
            elif resp.status_code != 408:  # Allow timeout responses
                resp.failure(f"Unexpected status: {resp.status_code}")

class AsyncUser(BaseUser):
    tasks = [AsyncTasks]
    
    host = "http://localhost:3001"
    wait_time = between(0.1, 1) 