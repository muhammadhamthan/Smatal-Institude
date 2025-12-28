import os
from huggingface_hub import InferenceClient
from langchain_core.embeddings import Embeddings


class HFInferenceEmbeddings(Embeddings):
    def __init__(self):
        self.client = InferenceClient(
            api_key=os.environ["HF_TOKEN"]
        )
        self.model = "sentence-transformers/all-MiniLM-L6-v2"

    def embed_query(self, text: str):
        return self.client.feature_extraction(
            text,
            model=self.model
        )

    def embed_documents(self, texts):
        return [
            self.client.feature_extraction(
                text,
                model=self.model
            )
            for text in texts
        ]
        
    # def __call__(self, text: str):
    #     return self.embed_query(text)
