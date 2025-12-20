import os

def folder_size(path):
    total = 0
    for dirpath, dirs, files in os.walk(path):
        for f in files:
            fp = os.path.join(dirpath, f)
            print("File:", fp)
            total += os.path.getsize(fp)
    return total

size_bytes = folder_size("Samtal-Data-Vector")
print("FAISS size (MB):", size_bytes / (1024*1024))






import redis, os
from dotenv import load_dotenv
load_dotenv()
r = redis.from_url(os.environ["REDIS_URL"], decode_responses=True)

r.set("test", "hello", ex=60)
print(r.get("test")) 



import json
from redis_cache import redis_client

def get_all_redis_keys(pattern="*", count=100):
    keys = []
    cursor = 0

    while True:
        cursor, batch = redis_client.scan(
            cursor=cursor,
            match=pattern,
            count=count
        )
        keys.extend(batch)
        if cursor == 0:
            break

    return keys

def print_all_chat_keys():
    keys = get_all_redis_keys("user_chat_memory:*")
    print(f"Total chat users: {len(keys)}")
    for k in keys:
        print(k)

def inspect_all_chat_memories():
    keys = get_all_redis_keys("user_chat_memory:*")

    for key in keys:
        raw = redis_client.get(key)
        if not raw:
            continue

        payload = json.loads(raw)
        print(f"\n🔑 {key}")

        for msg in payload.get("messages", []):
            print(f"[{msg['type']}] {msg['content']}")

print_all_chat_keys()
inspect_all_chat_memories()


print("----- END -----")

print(f"1111111111111111111111111111111111111111",redis_client.get("user_chat_memory:uid-1766231358770-41873"))