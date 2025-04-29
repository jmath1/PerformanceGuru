from locust import between, task, TaskSet
from .base_tasks import BaseTestData, BaseUser
import random
import json
import time
import gevent
import requests
from locust.exception import RescheduleTask
from locust import events

class PoolingTasks(TaskSet, BaseTestData):
    """
    Tests pooling performance by simulating:
    - Creating a request
    """
    
    def on_start(self):
        self.create_initial_data(self.client)
        self.pooling_interval = 5
        self.pooling_timeout = 10
        self.pooling_url = f"{self.host}/pooling"
        self.pooling_data = {
            "task_id": random.randint(1, 100),
            "user_id": random.choice([1, 2, 3]),
            "status": "pending"
        }
        
    @task(1)
    def pooling_request(self):
        """Test pooling request handling"""
        with self.client.post(
            self.pooling_url,
            json=self.pooling_data,
            catch_response=True,
            name="Pooling Request"
        ) as resp:
            if resp.status_code == 200:
                response_data = resp.json()
                if response_data.get("status") != "success":
                    resp.failure("Pooling request failed")
            else:
                resp.failure(f"Status {resp.status_code}")