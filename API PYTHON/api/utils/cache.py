# Cache simples para tokens válidos
import time


token_cache = {}
CACHE_TIMEOUT = 300  # 5 minutos em segundos

def clear_expired_tokens():
    """Limpa tokens expirados do cache"""
    current_time = time.time()
    expired_tokens = [
        token for token, data in token_cache.items()
        if current_time - data['timestamp'] >= CACHE_TIMEOUT
    ]
    
    for token in expired_tokens:
        del token_cache[token]
    
    return len(expired_tokens)