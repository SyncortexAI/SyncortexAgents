from typing import List, Dict, Any


def detect_volume_bursts(
    volumes: List[float],
    threshold_ratio: float = 1.5,
    min_interval: int = 1
) -> List[Dict[str, Any]]:
    """
    Identify indices where volume jumps by threshold_ratio over previous.
    Returns list of dicts: {index, previous, current, ratio}.
    """
    if not volumes or len(volumes) < 2:
        return []

    events: List[Dict[str, Any]] = []
    last_idx = -min_interval
    for i in range(1, len(volumes)):
        prev, curr = volumes[i - 1], volumes[i]
        ratio = (curr / prev) if prev > 0 else float("inf")
        if ratio >= threshold_ratio and (i - last_idx) >= min_interval:
            events.append({
                "index": i,
                "previous": round(prev, 6),
                "current": round(curr, 6),
                "ratio": round(ratio, 4)
            })
            last_idx = i
    return events


def summarize_bursts(events: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Summarize detected bursts into counts and averages.
    """
    if not events:
        return {"count": 0, "avg_ratio": 0.0, "indices": []}

    avg_ratio = round(sum(e["ratio"] for e in events) / len(events), 4)
    return {
        "count": len(events),
        "avg_ratio": avg_ratio,
        "indices": [e["index"] for e in events]
    }


def compare_volume_series(
    series_a: List[float],
    series_b: List[float],
    threshold_ratio: float = 1.5
) -> Dict[str, Any]:
    """
    Compare bursts between two volume series.
    Returns which series is more volatile by burst frequency.
    """
    bursts_a = detect_volume_bursts(series_a, threshold_ratio)
    bursts_b = detect_volume_bursts(series_b, threshold_ratio)

    return {
        "series_a": summarize_bursts(bursts_a),
        "series_b": summarize_bursts(bursts_b),
        "more_volatile": (
            "A" if len(bursts_a) > len(bursts_b) else
            "B" if len(bursts_b) > len(bursts_a) else "Equal"
        )
    }
