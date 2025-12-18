from langchain_helper import get_retriver

_RETRIEVER = None

def get_retriever_once():
    global _RETRIEVER
    if _RETRIEVER is None:
        _RETRIEVER = get_retriver()  # heavy ONCE
    return _RETRIEVER