def require_fields(data, fields):
    """Return list of missing fields from data dict."""
    missing = [f for f in fields if data.get(f) is None]
    return missing
