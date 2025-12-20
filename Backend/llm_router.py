# llm_router.py

import os
import time
from threading import Lock
from groq import RateLimitError
from langchain_groq import ChatGroq

# ---------------- CONFIG ---------------- #

COOLDOWN_SECONDS = 3600  # 1 hour

MODEL_CONFIG = [
    ("fast", "llama-3.3-70b-versatile"),
    ("backup", "meta-llama/llama-4-scout-17b-16e-instruct"),
    ("last_resort", "moonshotai/kimi-k2-instruct-0905"),
]

# ---------------- INIT ---------------- #

LLMS = {}

for name, model in MODEL_CONFIG:
    LLMS[name] = ChatGroq(
        api_key=os.environ["GROQ_API_KEY"],
        model_name=model,
        temperature=0.2,
        max_tokens=250
    )


_llm_cooldowns = {name: 0.0 for name, _ in MODEL_CONFIG}
_cooldown_lock = Lock()

# ---------------- CORE LOGIC ---------------- #

def _get_available_models():
    now = time.time()
    for name, _ in MODEL_CONFIG:
        if now >= _llm_cooldowns[name]:
            yield name


def run_with_fallback(chain_builder, retriever, memory, question):
    """
    Executes a LangChain chain using the first available LLM.
    Falls back only on RateLimitError.
    """

    for model_name in _get_available_models():
        llm = LLMS[model_name]

        try:
            chain = chain_builder(retriever, memory, llm)
            print(f"Using LLM: {model_name}")
            return chain.invoke({"question": question})

        except RateLimitError:
            print(f"{model_name} rate-limited. Cooling down.")

            with _cooldown_lock:
                _llm_cooldowns[model_name] = time.time() + COOLDOWN_SECONDS

            continue

    raise RuntimeError("All LLMs are currently rate-limited.")
