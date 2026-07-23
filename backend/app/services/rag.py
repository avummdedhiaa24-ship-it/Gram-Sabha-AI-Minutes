import os
import json
import logging
import numpy as np
from typing import List, Dict, Any

logger = logging.getLogger(__name__)

# Attempt to load SentenceTransformer for real embeddings, fallback to mock/keyword overlap if offline or missing
try:
    from sentence_transformers import SentenceTransformer
    EMBEDDING_MODEL = SentenceTransformer("all-MiniLM-L6-v2")
    HAS_MODEL = True
except Exception as e:
    logger.warning(f"Could not load SentenceTransformer: {str(e)}. Using fallback keyword matching.")
    HAS_MODEL = False

class RAGService:
    def __init__(self, index_file: str = "vector_index.json"):
        self.index_file = index_file
        self.items: List[Dict[str, Any]] = []
        self.embeddings: List[List[float]] = []
        self.load_index()

    def load_index(self):
        if os.path.exists(self.index_file):
            try:
                with open(self.index_file, "r") as f:
                    data = json.load(f)
                    self.items = data.get("items", [])
                    self.embeddings = data.get("embeddings", [])
                logger.info(f"Loaded {len(self.items)} items from vector index.")
            except Exception as e:
                logger.error(f"Error loading vector index: {str(e)}")

    def save_index(self):
        try:
            with open(self.index_file, "w") as f:
                json.dump({
                    "items": self.items,
                    "embeddings": self.embeddings
                }, f)
        except Exception as e:
            logger.error(f"Error saving vector index: {str(e)}")

    def _get_embedding(self, text: str) -> List[float]:
        if HAS_MODEL:
            try:
                embedding = EMBEDDING_MODEL.encode(text)
                return embedding.tolist()
            except Exception as e:
                logger.error(f"Embedding error: {str(e)}")
        # Simple fallback embedding representation (bag-of-words hash)
        return self._simple_mock_embedding(text)

    def _simple_mock_embedding(self, text: str) -> List[float]:
        # Generate stable mock embedding of size 384 based on character hashes
        vec = np.zeros(384)
        words = text.lower().split()
        for idx, word in enumerate(words):
            char_sum = sum(ord(c) for c in word)
            vec[char_sum % 384] += 1.0
        # Normalize
        norm = np.linalg.norm(vec)
        if norm > 0:
            vec = vec / norm
        return vec.tolist()

    def add_document(self, meeting_id: int, title: str, text: str):
        """
        Embed and index a segment of text associated with a meeting.
        """
        if not text or len(text.strip()) < 10:
            return
        
        # Split text into chunks if it is very large (e.g. paragraph level)
        chunks = [text[i:i+500] for i in range(0, len(text), 400)]
        for idx, chunk in enumerate(chunks):
            embedding = self._get_embedding(chunk)
            self.items.append({
                "meeting_id": meeting_id,
                "title": title,
                "text": chunk,
                "chunk_index": idx
            })
            self.embeddings.append(embedding)
        self.save_index()

    def search(self, query: str, limit: int = 5) -> List[Dict[str, Any]]:
        """
        Perform cosine similarity search on the query string.
        """
        if not self.embeddings or not query:
            return []

        query_emb = np.array(self._get_embedding(query))
        similarities = []

        for idx, emb in enumerate(self.embeddings):
            emb_arr = np.array(emb)
            dot_product = np.dot(query_emb, emb_arr)
            norm_q = np.linalg.norm(query_emb)
            norm_e = np.linalg.norm(emb_arr)
            
            score = 0.0
            if norm_q > 0 and norm_e > 0:
                score = float(dot_product / (norm_q * norm_e))
            
            # Boost score slightly if direct keyword overlap is found (hybrid search)
            query_words = set(query.lower().split())
            doc_words = set(self.items[idx]["text"].lower().split())
            overlap = len(query_words.intersection(doc_words))
            if len(query_words) > 0:
                score += 0.05 * (overlap / len(query_words))
            
            # Clip between 0 and 1
            score = min(max(score, 0.0), 1.0)
            
            similarities.append((score, self.items[idx]))

        # Sort descending by score
        similarities.sort(key=lambda x: x[0], reverse=True)
        
        results = []
        for score, item in similarities[:limit]:
            results.append({
                "meeting_id": item["meeting_id"],
                "title": item["title"],
                "text_segment": item["text"],
                "confidence": round(score, 3)
            })
        return results

rag_service = RAGService()
