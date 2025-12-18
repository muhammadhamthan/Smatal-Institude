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






import torch
print(torch.__version__)
print("CUDA available:", torch.cuda.is_available()) 



import redis, os
from dotenv import load_dotenv
load_dotenv()
r = redis.from_url(os.environ["REDIS_URL"], decode_responses=True)

r.set("test", "hello", ex=60)
print(r.get("test"))
