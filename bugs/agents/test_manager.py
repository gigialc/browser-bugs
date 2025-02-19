import json
import os
from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel

class TestStep(BaseModel):
    type: str
    target: Optional[str] = None
    value: Optional[str] = None
    timeout: Optional[int] = None

class TestFlow(BaseModel):
    id: str
    name: str
    instructions: str
    credentials: Optional[dict] = None
    created_at: str
    updated_at: Optional[str] = None
    last_run: Optional[str] = None
    status: str = "not_run"

class TestManager:
    def __init__(self, storage_file: str = "test_flows.json"):
        self.storage_file = storage_file
        self._ensure_storage_exists()

    def _ensure_storage_exists(self):
        if not os.path.exists(self.storage_file):
            with open(self.storage_file, 'w') as f:
                json.dump([], f)

    def get_all_tests(self) -> List[TestFlow]:
        with open(self.storage_file, 'r') as f:
            data = json.load(f)
            return [TestFlow(**test) for test in data]

    def get_test(self, test_id: str) -> Optional[TestFlow]:
        tests = self.get_all_tests()
        return next((test for test in tests if test.id == test_id), None)

    def create_test(self, name: str, instructions: str, credentials: Optional[dict] = None) -> TestFlow:
        test = TestFlow(
            id=str(int(datetime.now().timestamp() * 1000)),
            name=name,
            instructions=instructions,
            credentials=credentials,
            created_at=datetime.now().isoformat(),
            status="not_run"
        )
        
        tests = self.get_all_tests()
        tests.append(test)
        self._save_tests(tests)
        return test

    def update_test(self, test_id: str, updates: dict) -> Optional[TestFlow]:
        tests = self.get_all_tests()
        test_index = next((i for i, test in enumerate(tests) if test.id == test_id), -1)
        
        if test_index == -1:
            return None

        current_test = tests[test_index].model_dump()
        updated_test = {**current_test, **updates, "updated_at": datetime.now().isoformat()}
        tests[test_index] = TestFlow(**updated_test)
        
        self._save_tests(tests)
        return tests[test_index]

    def update_test_status(self, test_id: str, status: str) -> Optional[TestFlow]:
        return self.update_test(test_id, {
            "status": status,
            "last_run": datetime.now().isoformat()
        })

    def _save_tests(self, tests: List[TestFlow]):
        with open(self.storage_file, 'w') as f:
            json.dump([test.model_dump() for test in tests], f, indent=2) 