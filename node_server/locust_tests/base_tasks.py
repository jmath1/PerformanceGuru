from locust import between, HttpUser
import random

class BaseTestData:
    """Shared methods for creating test data"""
    def create_initial_data(self, client):
        for i in range(100):
            user_id = random.choice([1, 2, 3])
            status = random.choice(["pending", "completed"])
            with client.post(
                "/tasks",
                json={"title": f"Initial Task {i}", "user_id": user_id, "status": status},
                catch_response=True
            ) as resp:
                if resp.status_code == 200:
                    task_id = resp.json().get("id")
                    client.post(
                        "/comments",
                        json={"task_id": task_id, "content": f"Initial Comment {i}"},
                        catch_response=True
                    )

class BaseUser(HttpUser):
    """Shared user configuration"""
    wait_time = between(0.5, 2)
    abstract = True