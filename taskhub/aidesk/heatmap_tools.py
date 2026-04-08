from typing import List, Dict, Any, Tuple

def generate_activity_heatmap(
    timestamps: List[int],
    counts: List[int],
    buckets: int = 10,
    normalize: bool = True
) -> List[float]:
    """
    Bucket activity counts into 'buckets' time intervals,
    returning either raw counts or normalized [0.0–1.0].
    - timestamps: list of epoch ms timestamps.
    - counts: list of integer counts per timestamp.
    """
    if not timestamps or not counts or len(timestamps) != len(counts):
        return []

    t_min, t_max = min(timestamps), max(timestamps)
    span = t_max - t_min or 1
    bucket_size = span / buckets

    agg = [0] * buckets
    for t, c in zip(timestamps, counts):
        idx = min(buckets - 1, int((t - t_min) / bucket_size))
        agg[idx] += c

    if normalize:
        m = max(agg) or 1
        return [round(val / m, 4) for val in agg]
    return agg


def generate_activity_heatmap_with_meta(
    timestamps: List[int],
    counts: List[int],
    buckets: int = 10,
    normalize: bool = True
) -> Dict[str, Any]:
    """
    Extended version: returns heatmap and metadata
    """
    heatmap = generate_activity_heatmap(timestamps, counts, buckets, normalize)
    return {
        "heatmap": heatmap,
        "buckets": buckets,
        "normalized": normalize,
        "total_count": sum(counts),
        "time_range": (min(timestamps), max(timestamps)) if timestamps else (0, 0),
        "non_empty_buckets": sum(1 for v in heatmap if v > 0)
    }


def compare_heatmaps(
    data_a: Tuple[List[int], List[int]],
    data_b: Tuple[List[int], List[int]],
    buckets: int = 10
) -> Dict[str, Any]:
    """
    Compare two sets of activity distributions side by side.
    Returns correlation and difference metrics.
    """
    ha = generate_activity_heatmap(*data_a, buckets=buckets, normalize=True)
    hb = generate_activity_heatmap(*data_b, buckets=buckets, normalize=True)

    diffs = [round(abs(a - b), 4) for a, b in zip(ha, hb)]
    avg_diff = round(sum(diffs) / len(diffs), 4) if diffs else 0.0

    return {
        "heatmap_a": ha,
        "heatmap_b": hb,
        "avg_diff": avg_diff,
        "diffs": diffs,
    }
