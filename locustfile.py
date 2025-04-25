from locust import HttpUser, task, between, events
import random

@events.init_command_line_parser.add_listener
def _(parser):
    parser.add_argument("--indexing", type=bool, default=False, help="Enable indexing tests")
    parser.add_argument("--batching", type=bool, default=False, help="Enable batching tests")
    parser.add_argument("--pagination", type=bool, default=False, help="Enable pagination tests")
    parser.add_argument("--caching", type=bool, default=False, help="Enable caching tests")
    parser.add_argument("--pooling", type=bool, default=False, help="Enable pooling tests")
    parser.add_argument("--async", type=bool, default=False, help="Enable async tests")

class TaskUser(HttpUser):
    wait_time = between(1, 5)

    def on_start(self):
        self.optimization = None
        opts = self.environment.parsed_options
        for opt in ["indexing", "batching", "pagination", "caching", "pooling", "async"]:
            if getattr(opts, opt):
                self.optimization = opt
                break
        if not self.optimization:
            self.optimization = "indexing"

    @task(3)
    def get_tasks(self):
        if self.optimization in ["indexing", "caching", "pagination", "pooling"]:
            if self.optimization == "pagination" and self.environment.parsed_options.pagination:
                page = random.randint(1, 5)
                limit = 10
                self.client.get(f"/tasks/{self.optimization}?user_id=1&page={page}&limit={limit}")
            else:
                self.client.get("/tasks?user_id=1")

    @task(1)
    def create_tasks(self):
        if self.optimization == "batching":
            if self.environment.parsed_options.batching:
                self.client.post(f"/tasks{self.optimization}", json=[
                    {"title": f"Task {random.randint(1, 1000)}", "user_id": 1},
                    {"title": f"Task {random.randint(1, 1000)}", "user_id": 1}
                ])
            else:
                self.client.post(f"/tasks/{self.optimization}", json={"title": f"Task {random.randint(1, 1000)}", "user_id": 1})

    @task(1)
    def add_comment(self):
        if self.optimization in ["indexing", "async"]:
            self.client.post("/comments", json={"task_id": 1, "content": f"Comment {random.randint(1, 1000)}"})

    @task(2)
    def stress_test(self):
        if self.optimization in ["caching", "pooling"]:
            self.client.get(f"/tasks/{self.optimization}?user_id=1")