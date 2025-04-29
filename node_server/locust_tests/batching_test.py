from locust import between, task, TaskSet
from .base_tasks import BaseTestData, BaseUser
import random
import json

class BatchingTasks(TaskSet, BaseTestData):
    """
    Tests batch API performance by comparing:
    - Individual operations vs batch operations
    - Different batch sizes
    - Mixed read/write batches
    """
    def on_start(self):
        self.create_initial_data(self.client)
        self.batch_sizes = [5, 10, 20, 50]  # Test different batch sizes

    @task(4)
    def batch_creates(self):
        """Test bulk creation of tasks"""
        batch_size = random.choice(self.batch_sizes)
        tasks = [{
            "title": f"Batch Task {i}",
            "user_id": random.choice([1, 2, 3]),
            "status": random.choice(["pending", "completed"])
        } for i in range(batch_size)]

        with self.client.post(
            "/tasks/batch", 
            json=tasks,
            catch_response=True,
            name=f"Batch Create [{batch_size}]"
        ) as resp:
            if resp.status_code == 200:
                created_ids = resp.json().get("ids", [])
                if len(created_ids) != batch_size:
                    resp.failure(f"Only created {len(created_ids)}/{batch_size} tasks")
            else:
                resp.failure(f"Status {resp.status_code}")

    @task(3)
    def batch_gets(self):
        """Test bulk retrieval of tasks"""
        batch_size = random.choice(self.batch_sizes[:3])  # Smaller batches for reads
        task_ids = [random.randint(1, 100) for _ in range(batch_size)]
        
        with self.client.post(
            "/tasks/batch_get",
            json={"ids": task_ids},
            catch_response=True,
            name=f"Batch Get [{batch_size}]"
        ) as resp:
            if resp.status_code == 200:
                found = len(resp.json().get("tasks", []))
                if found < batch_size:
                    resp.failure(f"Only found {found}/{batch_size} tasks")
            else:
                resp.failure(f"Status {resp.status_code}")

    @task(2)
    def mixed_batch_operations(self):
        """Test mixed read/write batches"""
        operations = []
        for _ in range(random.choice([3, 5, 10])):
            if random.random() > 0.5:  # 50% chance of read vs write
                operations.append({
                    "type": "get",
                    "id": random.randint(1, 100)
                })
            else:
                operations.append({
                    "type": "create",
                    "title": f"Mixed Task {random.randint(1, 1000)}",
                    "user_id": random.choice([1, 2, 3])
                })

        with self.client.post(
            "/tasks/mixed_batch",
            json={"ops": operations},
            catch_response=True,
            name="Mixed Batch"
        ) as resp:
            if resp.status_code == 200:
                results = resp.json().get("results", [])
                if len(results) != len(operations):
                    resp.failure(f"Only processed {len(results)}/{len(operations)} ops")
            else:
                resp.failure(f"Status {resp.status_code}")

    @task(1)
    def individual_operations(self):
        """Compare with individual operations"""
        if random.random() > 0.5:
            # Single create
            with self.client.post(
                "/tasks",
                json={
                    "title": f"Single Task {random.randint(1, 1000)}",
                    "user_id": random.choice([1, 2, 3])
                },
                catch_response=True,
                name="Single Create"
            ) as resp:
                if resp.status_code != 200:
                    resp.failure(f"Status {resp.status_code}")
        else:
            with self.client.get(
                f"/tasks/{random.randint(1, 100)}",
                catch_response=True,
                name="Single Get"
            ) as resp:
                if resp.status_code != 200:
                    resp.failure(f"Status {resp.status_code}")

class BatchingUser(BaseUser):
    tasks = [BatchingTasks]
    host = "http://localhost:3001"
    wait_time = between(0.2, 1.5)  # Slightly faster pacing for batch tests