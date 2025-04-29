from locust import task, TaskSet
from .base_tasks import BaseTestData, BaseUser
import random

class IndexingTasks(TaskSet, BaseTestData):
    def on_start(self):
        self.create_initial_data(self.client)

    @task(3)
    def get_by_user_id(self):
        user_id = random.choice([1, 2, 3])
        with self.client.get(f"/tasks?user_id={user_id}", catch_response=True) as resp:
            if not resp.json():
                resp.failure("No results")
    
    @task(1)
    def get_by_status(self):
        status = random.choice(["pending", "completed"])
        with self.client.get(f"/tasks?status={status}", catch_response=True) as resp:
            if not resp.json():
                resp.failure("No results")

class IndexingUser(BaseUser):
    tasks = [IndexingTasks]
    host = "http://localhost:3001"