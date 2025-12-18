import redis 
import json
import os
from langchain.schema import HumanMessage, AIMessage
from langchain_helper import new_memory

url = os.environ.get('REDIS_URL',"")

redis_client = redis.from_url(url,decode_responses=True)
REDIS_TTL_SECONDS = 24 * 3600 # 24 hours Time To Live (User session expiry time in seconds)

def serialize_messages(messages):
    out = []
    for m in messages:
        cls = m.__class__.__name__
        out.append({"type":cls,"content":m.content})
    return out

def deserialize_messages(serialized_messages):
    msgs = []
    for m in serialized_messages:
        t = m.get("type","")
        c = m.get("content","")
        if t == "HumanMessage":
            msgs.append(HumanMessage(content=c))
        elif t == "AIMessage":
            msgs.append(AIMessage(content=c))
    return msgs

def redis_key_for_user(user_id):
    return f"user_chat_memory:{user_id}"

def get_user_memory_from_redis(user_id):
    key = redis_key_for_user(user_id)
    try:
        raw = redis_client.get(key)
        if raw:
            payload = json.loads(raw)
            msgs = payload.get("messages",[])
            memory = new_memory()
            memory.chat_memory.messages = deserialize_messages(msgs)
            return memory
    except Exception as e:
        print(f"Error retrieving memory for user {user_id} from Redis: {e}")
    return new_memory()

def save_user_memory_to_redis(user_id, memory):
    key = redis_key_for_user(user_id)
    try:
        msgs = getattr(memory.chat_memory,"messages",[])
        serialized = serialize_messages(msgs)
        payload = {"messages":serialized}
        redis_client.set(key,json.dumps(payload),ex=REDIS_TTL_SECONDS)
    except Exception as e:
        print(f"Error saving memory for user {user_id} to Redis: {e}")
            