import math
from typing import List, Dict, Any


def compute_shannon_entropy(addresses: List[str]) -> float:
    """
    Compute Shannon entropy (bits) of an address sequence.
    """
    if not addresses:
        return 0.0
    freq: Dict[str, int] = {}
    for a in addresses:
        freq[a] = freq.get(a, 0) + 1
    total = len(addresses)
    entropy = 0.0
    for count in freq.values():
        p = count / total
        entropy -= p * math.log2(p)
    return round(entropy, 4)


def normalize_entropy(entropy: float, max_size: int) -> float:
    """
    Normalize entropy to [0.0–1.0] based on maximum possible entropy.
    """
    if max_size <= 1:
        return 0.0
    max_entropy = math.log2(max_size)
    return round(entropy / max_entropy, 4)


def entropy_profile(addresses: List[str]) -> Dict[str, Any]:
    """
    Provide detailed entropy profile for a list of addresses.
    """
    entropy_val = compute_shannon_entropy(addresses)
    unique_count = len(set(addresses))
    normalized = normalize_entropy(entropy_val, unique_count if unique_count > 0 else 1)
    return {
        "entropy": entropy_val,
        "unique_addresses": unique_count,
        "total_addresses": len(addresses),
        "normalized_entropy": normalized
    }


def compare_entropy(seq_a: List[str], seq_b: List[str]) -> Dict[str, Any]:
    """
    Compare entropy between two sequences of addresses.
    """
    profile_a = entropy_profile(seq_a)
    profile_b = entropy_profile(seq_b)
    return {
        "profile_a": profile_a,
        "profile_b": profile_b,
        "higher_entropy": (
            "A" if profile_a["entropy"] > profile_b["entropy"]
            else "B" if profile_b["entropy"] > profile_a["entropy"]
            else "Equal"
        )
    }
