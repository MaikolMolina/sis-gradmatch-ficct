import re
import math
import hashlib
from typing import List, Dict, Tuple

# Common Spanish stopwords for academic NLP
SPANISH_STOPWORDS = {
    "el", "la", "los", "las", "un", "una", "unos", "unas", "de", "del", "a", "al",
    "en", "para", "por", "con", "sin", "sobre", "entre", "hacia", "desde", "hasta",
    "y", "e", "o", "u", "pero", "mas", "que", "como", "cuando", "donde", "quien",
    "este", "esta", "estos", "estas", "ese", "esa", "esos", "esas", "aquel", "aquella",
    "su", "sus", "mi", "mis", "tu", "tus", "nuestro", "nuestra", "se", "lo", "le",
    "les", "me", "te", "nos", "es", "son", "fue", "era", "ser", "estar", "ha", "han"
}

# Academic domain lexicon for Systems Engineering
DOMAIN_TAXONOMY = {
    "ia_ml": ["inteligencia", "artificial", "machine", "learning", "deep", "neural", "redes", "neuronales", "nlp", "vision", "vectorial", "semantica", "embeddings", "modelo", "inferencia"],
    "software": ["software", "arquitectura", "patrones", "diseno", "microservicios", "clean", "code", "scrum", "agil", "puds", "uml", "requisitos", "framework", "refactorizacion", "calidad"],
    "bbdd": ["base", "datos", "postgresql", "sql", "nosql", "mongodb", "transacciones", "relacional", "indices", "hnsw", "pgvector", "persistencia", "acceso", "optimización"],
    "redes_seguridad": ["redes", "seguridad", "ciberseguridad", "firewall", "protocolos", "tcp", "tls", "jwt", "autenticacion", "criptografia", "waf", "vulnerabilidades", "owasp", "telecomunicaciones"],
    "cloud_devops": ["cloud", "nube", "google", "gcp", "docker", "contenedores", "kubernetes", "ci", "cd", "pipeline", "actions", "despliegue", "serverless", "monitoreo", "devops"]
}

def tokenize_and_clean(text: str) -> List[str]:
    """Tokenize Spanish text, clean punctuation, and filter stopwords."""
    if not text:
        return []
    text_lower = text.lower()
    tokens = re.findall(r"\b[a-záéíóúñ]{3,}\b", text_lower)
    return [t for t in tokens if t not in SPANISH_STOPWORDS]

def extract_keywords_tfidf(text: str, top_k: int = 10) -> List[Tuple[str, float]]:
    """Extract top salient keywords using term frequency and domain boost."""
    tokens = tokenize_and_clean(text)
    if not tokens:
        return []
    
    tf: Dict[str, int] = {}
    for t in tokens:
        tf[t] = tf.get(t, 0) + 1
        
    scores: List[Tuple[str, float]] = []
    total = len(tokens)
    for term, count in tf.items():
        base_score = count / total
        # Boost if term matches domain taxonomy
        for category, terms in DOMAIN_TAXONOMY.items():
            if term in terms:
                base_score *= 2.5
        scores.append((term, round(base_score, 4)))
        
    scores.sort(key=lambda x: x[1], reverse=True)
    return scores[:top_k]

def generate_dense_embedding(text: str, dimensions: int = 768) -> List[float]:
    """
    Generate normalized 768-dimensional dense semantic embedding.
    Simulates Sentence-Transformers (paraphrase-multilingual-mpnet-base-v2)
    using deterministic semantic hashing and domain subspace projections.
    """
    tokens = tokenize_and_clean(text)
    if not tokens:
        return [0.0] * dimensions
        
    vector = [0.0] * dimensions
    
    # 1. Project domain taxonomy clusters into specific dimensions
    for i, (cat, cat_terms) in enumerate(DOMAIN_TAXONOMY.items()):
        start_idx = (i * 120) % dimensions
        cluster_energy = 0.0
        for t in tokens:
            if t in cat_terms:
                cluster_energy += 1.5
        if cluster_energy > 0:
            for j in range(start_idx, min(start_idx + 100, dimensions)):
                vector[j] += cluster_energy / (1.0 + (j - start_idx) * 0.05)
                
    # 2. Add fine-grained token hash projections
    for t in tokens:
        h = int(hashlib.sha256(t.encode("utf-8")).hexdigest(), 16)
        idx = h % dimensions
        weight = 1.0 + ((h >> 8) % 100) / 100.0
        vector[idx] += weight
        # Cross-dimension smoothing
        vector[(idx + 1) % dimensions] += weight * 0.35
        vector[(idx - 1) % dimensions] += weight * 0.35
        
    # 3. L2 Normalization (Euclidean norm = 1.0)
    norm = math.sqrt(sum(x * x for x in vector))
    if norm > 0:
        vector = [round(x / norm, 6) for x in vector]
    return vector

def calculate_cosine_similarity(vec1: List[float], vec2: List[float]) -> float:
    """
    Calculates exact Cosine Similarity between two dense vectors:
    Cosine(u, v) = (u . v) / (||u|| * ||v||)
    Returns value in range [0.0, 1.0].
    """
    if not vec1 or not vec2:
        return 0.0
    if len(vec1) != len(vec2):
        return 0.0
        
    dot_product = sum(a * b for a, b in zip(vec1, vec2))
    norm_a = math.sqrt(sum(a * a for a in vec1))
    norm_b = math.sqrt(sum(b * b for b in vec2))
    
    if norm_a == 0.0 or norm_b == 0.0:
        return 0.0
        
    similarity = dot_product / (norm_a * norm_b)
    # Clamp bounds to [0.0, 1.0]
    return max(0.0, min(1.0, round(similarity, 4)))
