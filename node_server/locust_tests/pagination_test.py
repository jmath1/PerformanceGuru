from locust import between, task, TaskSet
from .base_tasks import BaseTestData, BaseUser
import random
import math
from urllib.parse import urlencode

class PaginationTasks(TaskSet, BaseTestData):
    """
    Tests pagination performance by simulating:
    - Different page sizes
    - Deep vs shallow pagination
    - Edge cases (first/last pages)
    - Invalid pagination parameters
    """
    def on_start(self):
        self.create_initial_data(self.client)
        self.page_sizes = [5, 10, 25, 50, 100]  # Test various page sizes
        self.total_items = 1000 # database size

    @task(4)
    def normal_pagination(self):
        """Test typical pagination usage"""
        page_size = random.choice(self.page_sizes)
        max_page = math.ceil(self.total_items / page_size)
        page = random.randint(1, max_page)
        
        params = {
            "page": page,
            "size": page_size,
            "sort": random.choice(["id", "title", "-created_at"])
        }
        
        with self.client.get(
            f"/tasks?{urlencode(params)}",
            catch_response=True,
            name=f"Pagination {page_size} items"
        ) as resp:
            self._validate_pagination(resp, page, page_size)

    @task(3)
    def edge_case_pagination(self):
        """Test boundary conditions"""
        page_size = random.choice(self.page_sizes)
        test_case = random.choice(["first", "last", "empty"])
        
        if test_case == "first":
            params = {"page": 1, "size": page_size}
        elif test_case == "last":
            last_page = math.ceil(self.total_items / page_size)
            params = {"page": last_page, "size": page_size}
        else:  # empty
            params = {"page": 9999, "size": page_size}  # Assuming no page 9999
        
        with self.client.get(
            f"/tasks?{urlencode(params)}",
            catch_response=True,
            name=f"Edge Case {test_case} page"
        ) as resp:
            if test_case == "empty":
                if resp.status_code == 200 and len(resp.json()) > 0:
                    resp.failure("Non-empty response for empty page")
            else:
                self._validate_pagination(resp, params["page"], params["size"])

    @task(1)
    def cursor_pagination(self):
        """Test cursor-based pagination if supported"""
        page_size = random.choice(self.page_sizes)
        
        # Initial request
        with self.client.get(
            f"/tasks?size={page_size}&cursor=true",
            catch_response=True,
            name="Cursor Initial"
        ) as resp1:
            if resp1.status_code == 200:
                data = resp1.json()
                cursor = data.get("next_cursor")
                
                if cursor:
                    # Follow-up request with cursor
                    with self.client.get(
                        f"/tasks?size={page_size}&cursor={cursor}",
                        catch_response=True,
                        name="Cursor Follow"
                    ) as resp2:
                        if resp2.status_code != 200:
                            resp2.failure("Cursor pagination failed")
                else:
                    resp1.failure("Missing cursor token")
            else:
                resp1.failure("Initial cursor request failed")

    def _validate_pagination(self, response, page, page_size):
        """Common pagination validation logic"""
        if response.status_code == 200:
            data = response.json()
            
            # Validate payload structure
            if not isinstance(data, dict):
                response.failure("Invalid response format")
                return
                
            items = data.get("items", [])
            total = data.get("total", 0)
            returned_page = data.get("page", 0)
            
            # Check basic expectations
            if len(items) > page_size:
                response.failure(f"Returned {len(items)} items, expected max {page_size}")
            
            if returned_page != page:
                response.failure(f"Returned page {returned_page}, requested {page}")
            
            # Check for pagination metadata
            if not all(key in data for key in ["total", "page", "page_count"]):
                response.failure("Missing pagination metadata")
        else:
            response.failure(f"Status {response.status_code}")

class PaginationUser(BaseUser):
    tasks = [PaginationTasks]
    host = "http://localhost:3001"
    
    # Slightly longer wait times to simulate real user behavior
    wait_time = between(1, 3)