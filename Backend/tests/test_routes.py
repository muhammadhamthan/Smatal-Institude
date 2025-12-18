import json
import sys
sys.modules["google_sheet"] = type("FakeSheet", (), {"append_row_to_sheet": lambda x: True})

import sys
from types import SimpleNamespace

# Fake Redis memory storage
_fake_store = {}

def fake_get(key):
    return _fake_store.get(key)

def fake_set(key, value, ex=None):
    _fake_store[key] = value

# Fake redis_cache module
sys.modules["redis_cache"] = SimpleNamespace(
    save_user_memory_to_redis=lambda user_id, memory: None,
    get_user_memory_from_redis=lambda user_id: None,
    redis_key_for_user=lambda user_id: f"user_chat_memory:{user_id}",
    redis_client=SimpleNamespace(get=fake_get, set=fake_set),
)


from main import app

def test_home_route():
    client = app.test_client()
    response = client.get("/")
    assert response.status_code == 200
    assert b"Smatal Academy" in response.data

def test_chat_route_missing_fields():
    client = app.test_client()
    r = client.post("/chat", json={})
    assert r.status_code == 200
    data = r.get_json()
    assert "response" in data
    
def test_chat_route_with_message():
    client = app.test_client()

    r = client.post("/chat", json={"message": "Hi", "user_id": "test-user"})
    assert r.status_code == 200

    data = r.get_json()
    assert "response" in data
    