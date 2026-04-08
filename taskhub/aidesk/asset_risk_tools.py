import math
from typing import Dict, Any

def calculate_risk_score(price_change_pct: float, liquidity_usd: float, flags_mask: int) -> float:
    """
    Compute a 0–100 risk score.
    - price_change_pct: percent change over period (e.g. +5.0 for +5%).
    - liquidity_usd: total liquidity in USD.
    - flags_mask: integer bitmask of risk flags; each set bit adds a penalty.
    """
    vol_score = min(abs(price_change_pct) / 10, 1) * 50

    if liquidity_usd > 0:
        liq_score = max(0.0, 30 - (math.log10(liquidity_usd) * 5))
    else:
        liq_score = 30.0

    flag_count = bin(flags_mask).count("1")
    flag_score = flag_count * 5

    raw_score = vol_score + liq_score + flag_score
    return min(round(raw_score, 2), 100.0)


def detailed_risk_report(price_change_pct: float, liquidity_usd: float, flags_mask: int) -> Dict[str, Any]:
    """
    Return a breakdown of risk score components including classification.
    """
    vol_score = min(abs(price_change_pct) / 10, 1) * 50
    liq_score = max(0.0, 30 - (math.log10(liquidity_usd) * 5)) if liquidity_usd > 0 else 30.0
    flag_count = bin(flags_mask).count("1")
    flag_score = flag_count * 5
    raw_score = vol_score + liq_score + flag_score
    final_score = min(round(raw_score, 2), 100.0)

    if final_score < 40:
        risk_level = "low"
    elif final_score < 70:
        risk_level = "medium"
    else:
        risk_level = "high"

    return {
        "price_change_pct": price_change_pct,
        "liquidity_usd": liquidity_usd,
        "flags_mask": flags_mask,
        "volatility_score": round(vol_score, 2),
        "liquidity_score": round(liq_score, 2),
        "flag_penalty": flag_score,
        "final_score": final_score,
        "risk_level": risk_level,
    }


def compare_risks(samples: Dict[str, Dict[str, float]]) -> Dict[str, Any]:
    """
    Compare multiple assets by their computed risk scores.
    `samples` format:
      {
        "SOL": {"price_change_pct": 4.5, "liquidity_usd": 1e7, "flags_mask": 2},
        "BTC": {"price_change_pct": 2.1, "liquidity_usd": 5e8, "flags_mask": 0}
      }
    """
    reports = {
        sym: detailed_risk_report(**vals) for sym, vals in samples.items()
    }
    ranked = sorted(reports.items(), key=lambda kv: kv[1]["final_score"], reverse=True)
    return {
        "reports": reports,
        "ranked": ranked,
    }
