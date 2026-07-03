import csv
import json
import math
import os
import sqlite3
import sys
import time
from datetime import datetime, timezone
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.parse import quote_plus, urlencode
from urllib.request import Request, urlopen


ROOT = Path(__file__).resolve().parents[1]
DATA_DIR = ROOT / "data"
DB_PATH = DATA_DIR / "rynki.sqlite"
LATEST_PATH = DATA_DIR / "latest.json"
CONFIG_PATH = ROOT / "config" / "portfolio.yaml"

HTTP_TIMEOUT = 8
USER_AGENT = "RynkiLocalDataPipeline/0.1"


def utc_now():
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat()


def fetch_text(url, retries=2):
    last_error = None
    for attempt in range(retries + 1):
        try:
            req = Request(url, headers={"User-Agent": USER_AGENT})
            with urlopen(req, timeout=HTTP_TIMEOUT) as response:
                text = response.read().decode("utf-8")
                if "requires JavaScript to verify your browser" in text:
                    raise RuntimeError("provider returned browser verification page")
                return text
        except (HTTPError, URLError, TimeoutError) as exc:
            last_error = exc
            time.sleep(1.5 * (attempt + 1))
    raise RuntimeError(f"Fetch failed for {url}: {last_error}")


def fetch_json(url, retries=2):
    return json.loads(fetch_text(url, retries=retries))


def load_assets():
    assets = []
    current = None
    if not CONFIG_PATH.exists():
        return assets
    in_assets = False
    for raw_line in CONFIG_PATH.read_text(encoding="utf-8").splitlines():
        line = raw_line.rstrip()
        stripped = line.strip()
        if stripped == "assets:":
            in_assets = True
            continue
        if in_assets and raw_line and not raw_line.startswith(" ") and not raw_line.startswith("-"):
            break
        if not in_assets:
            continue
        if stripped.startswith("- id:"):
            if current:
                assets.append(current)
            current = {"id": stripped.split(":", 1)[1].strip()}
        elif current and ":" in stripped:
            key, value = stripped.split(":", 1)
            value = value.strip().strip('"')
            if key in {"name", "class", "currency", "primary_symbol", "coingecko_id"}:
                current[key] = value
    if current:
        assets.append(current)
    return assets


def load_env():
    env_path = ROOT / ".env"
    if not env_path.exists():
        return
    for line in env_path.read_text(encoding="utf-8").splitlines():
        if not line or line.strip().startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        os.environ.setdefault(key.strip(), value.strip())


def init_db():
    DATA_DIR.mkdir(exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    conn.execute(
        """
        create table if not exists prices (
            asset_id text,
            symbol text,
            as_of_date text,
            close real,
            source text,
            retrieved_at text,
            raw_json text,
            primary key(asset_id, source, as_of_date)
        )
        """
    )
    conn.execute(
        """
        create table if not exists fx (
            code text,
            as_of_date text,
            value real,
            source text,
            retrieved_at text,
            primary key(code, source, as_of_date)
        )
        """
    )
    conn.execute(
        """
        create table if not exists news_events (
            id text primary key,
            title text,
            url text,
            source text,
            published_at text,
            retrieved_at text,
            query text,
            raw_json text
        )
        """
    )
    conn.execute(
        """
        create table if not exists run_log (
            retrieved_at text primary key,
            status text,
            message text
        )
        """
    )
    conn.commit()
    return conn


def upsert_price(conn, asset_id, symbol, candle, source, retrieved_at):
    conn.execute(
        """
        insert or replace into prices(asset_id, symbol, as_of_date, close, source, retrieved_at, raw_json)
        values (?, ?, ?, ?, ?, ?, ?)
        """,
        (asset_id, symbol, candle["date"], candle["close"], source, retrieved_at, json.dumps(candle)),
    )


def upsert_fx(conn, code, as_of_date, value, source, retrieved_at):
    conn.execute(
        """
        insert or replace into fx(code, as_of_date, value, source, retrieved_at)
        values (?, ?, ?, ?, ?)
        """,
        (code, as_of_date, value, source, retrieved_at),
    )


def stooq_symbol(symbol):
    if not symbol:
        return None
    if symbol.endswith(".US"):
        return symbol.lower()
    return None


def alpha_symbol(symbol):
    if not symbol:
        return None
    if symbol.endswith(".US"):
        return symbol[:-3]
    return symbol


def fetch_alpha_history(symbol):
    api_key = os.environ.get("ALPHA_VANTAGE_API_KEY")
    mapped = alpha_symbol(symbol)
    if not api_key or not mapped:
        return []
    params = urlencode(
        {
            "function": "TIME_SERIES_DAILY_ADJUSTED",
            "symbol": mapped,
            "apikey": api_key,
            "outputsize": "full",
        }
    )
    payload = fetch_json(f"https://www.alphavantage.co/query?{params}")
    if payload.get("Note") or payload.get("Information"):
        raise RuntimeError(payload.get("Note") or payload.get("Information"))
    series = payload.get("Time Series (Daily)")
    if not series:
        raise RuntimeError(f"Alpha Vantage missing daily series for {mapped}")
    rows = []
    for date, values in series.items():
        try:
            rows.append(
                {
                    "date": date,
                    "open": float(values["1. open"]),
                    "high": float(values["2. high"]),
                    "low": float(values["3. low"]),
                    "close": float(values["5. adjusted close"]),
                    "volume": float(values["6. volume"]),
                }
            )
        except (KeyError, ValueError):
            continue
    return sorted(rows, key=lambda item: item["date"])


def fetch_stooq_history(symbol):
    mapped = stooq_symbol(symbol)
    if not mapped:
        return []
    url = f"https://stooq.com/q/d/l/?s={quote_plus(mapped)}&i=d"
    text = fetch_text(url)
    rows = []
    for row in csv.DictReader(text.splitlines()):
        try:
            rows.append(
                {
                    "date": row["Date"],
                    "open": float(row["Open"]),
                    "high": float(row["High"]),
                    "low": float(row["Low"]),
                    "close": float(row["Close"]),
                    "volume": float(row["Volume"]) if row.get("Volume") else None,
                }
            )
        except (KeyError, ValueError):
            continue
    return rows


def sma(values, length):
    if len(values) < length:
        return None
    return sum(values[-length:]) / length


def volatility(values, length=30):
    if len(values) <= length:
        return None
    returns = []
    for previous, current in zip(values[-length - 1 : -1], values[-length:]):
        if previous:
            returns.append((current / previous) - 1)
    if len(returns) < 2:
        return None
    avg = sum(returns) / len(returns)
    variance = sum((item - avg) ** 2 for item in returns) / (len(returns) - 1)
    return math.sqrt(variance) * math.sqrt(252)


def drawdown(values):
    if not values:
        return None
    peak = values[0]
    max_dd = 0
    for value in values:
        peak = max(peak, value)
        if peak:
            max_dd = min(max_dd, (value / peak) - 1)
    return max_dd


def rsi(values, length=14):
    if len(values) <= length:
        return None
    gains = []
    losses = []
    for previous, current in zip(values[-length - 1 : -1], values[-length:]):
        change = current - previous
        gains.append(max(change, 0))
        losses.append(abs(min(change, 0)))
    avg_gain = sum(gains) / length
    avg_loss = sum(losses) / length
    if avg_loss == 0:
        return 100
    rs = avg_gain / avg_loss
    return 100 - (100 / (1 + rs))


def analytics_from_history(history):
    closes = [item["close"] for item in history]
    if not closes:
        return {}
    latest = closes[-1]
    previous = closes[-2] if len(closes) > 1 else None
    return {
        "latest_close": latest,
        "daily_return": (latest / previous - 1) if previous else None,
        "sma50": sma(closes, 50),
        "sma100": sma(closes, 100),
        "sma200": sma(closes, 200),
        "rsi14": rsi(closes, 14),
        "volatility30d": volatility(closes, 30),
        "drawdown": drawdown(closes),
    }


def fetch_nbp(retrieved_at, conn):
    table = fetch_json("https://api.nbp.pl/api/exchangerates/tables/a/?format=json")[0]
    gold = fetch_json("https://api.nbp.pl/api/cenyzlota?format=json")[0]
    rates = {item["code"]: item["mid"] for item in table["rates"]}
    result = {
        "source": "NBP",
        "retrieved_at": retrieved_at,
        "as_of_date": table["effectiveDate"],
        "rates": {
            "USD": {"value": rates.get("USD"), "as_of_date": table["effectiveDate"]},
            "EUR": {"value": rates.get("EUR"), "as_of_date": table["effectiveDate"]},
            "JPY": {"value": rates.get("JPY"), "as_of_date": table["effectiveDate"]},
            "GOLD": {"value": gold.get("cena"), "as_of_date": gold.get("data")},
        },
    }
    for code, payload in result["rates"].items():
        upsert_fx(conn, code, payload["as_of_date"], payload["value"], "NBP", retrieved_at)
    return result


def fetch_coingecko(assets):
    ids = [asset["coingecko_id"] for asset in assets if asset.get("coingecko_id")]
    if not ids:
        return {}
    params = urlencode(
        {
            "ids": ",".join(ids),
            "vs_currencies": "usd",
            "include_market_cap": "true",
            "include_24hr_vol": "true",
            "include_24hr_change": "true",
        }
    )
    url = f"https://api.coingecko.com/api/v3/simple/price?{params}"
    return fetch_json(url)


def fetch_gdelt(query, maxrecords=5):
    params = urlencode(
        {
            "query": query,
            "mode": "ArtList",
            "format": "json",
            "maxrecords": maxrecords,
            "sort": "HybridRel",
        }
    )
    url = f"https://api.gdeltproject.org/api/v2/doc/doc?{params}"
    payload = fetch_json(url)
    return payload.get("articles", [])


def build_news(conn, retrieved_at):
    queries = {
        "macro": "(Federal Reserve OR CPI OR PCE OR Treasury yields OR geopolitics)",
        "energy": "(oil OR natural gas OR uranium OR nuclear energy OR OPEC OR EIA)",
        "crypto": "(Bitcoin OR Ethereum OR Chainlink OR Solana OR XRP regulation)",
    }
    events = []
    seen = set()
    for label, query in queries.items():
        try:
            articles = fetch_gdelt(query, maxrecords=5)
        except RuntimeError as exc:
            events.append({"source": "GDELT", "query": label, "error": str(exc), "retrieved_at": retrieved_at})
            continue
        for article in articles:
            url = article.get("url")
            if not url or url in seen:
                continue
            seen.add(url)
            item = {
                "id": str(abs(hash(url))),
                "title": article.get("title"),
                "url": url,
                "source": article.get("domain") or "GDELT",
                "published_at": article.get("seendate"),
                "retrieved_at": retrieved_at,
                "query": label,
            }
            events.append(item)
            conn.execute(
                """
                insert or replace into news_events(id, title, url, source, published_at, retrieved_at, query, raw_json)
                values (?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    item["id"],
                    item["title"],
                    item["url"],
                    item["source"],
                    item["published_at"],
                    retrieved_at,
                    label,
                    json.dumps(article),
                ),
            )
    return events[:20]


def main():
    load_env()
    DATA_DIR.mkdir(exist_ok=True)
    retrieved_at = utc_now()
    conn = init_db()
    assets = load_assets()
    output = {
        "generated_at": retrieved_at,
        "policy": {
            "portfolio_is_manual": True,
            "market_data_is_external": True,
            "investment_advice": False,
        },
        "sources": [],
        "fx": {},
        "assets": [],
        "news_events": [],
        "warnings": [],
    }
    try:
        output["fx"] = fetch_nbp(retrieved_at, conn)
        output["sources"].append({"name": "NBP", "retrieved_at": retrieved_at})
    except RuntimeError as exc:
        output["warnings"].append({"source": "NBP", "message": str(exc)})

    try:
        crypto = fetch_coingecko(assets)
        output["sources"].append({"name": "CoinGecko", "retrieved_at": retrieved_at})
    except RuntimeError as exc:
        crypto = {}
        output["warnings"].append({"source": "CoinGecko", "message": str(exc)})

    for asset in assets:
        item = {
            "id": asset.get("id"),
            "name": asset.get("name"),
            "symbol": asset.get("primary_symbol"),
            "class": asset.get("class"),
            "currency": asset.get("currency"),
            "retrieved_at": retrieved_at,
            "sources": [],
        }
        if asset.get("coingecko_id") and asset["coingecko_id"] in crypto:
            payload = crypto[asset["coingecko_id"]]
            item["quote"] = {
                "price_usd": payload.get("usd"),
                "market_cap_usd": payload.get("usd_market_cap"),
                "volume_24h_usd": payload.get("usd_24h_vol"),
                "change_24h_pct": payload.get("usd_24h_change"),
                "source": "CoinGecko",
                "retrieved_at": retrieved_at,
            }
            item["sources"].append("CoinGecko")
        history = []
        history_source = None
        try:
            history = fetch_alpha_history(asset.get("primary_symbol"))
            if history:
                history_source = "Alpha Vantage"
                output["sources"].append({"name": "Alpha Vantage", "retrieved_at": retrieved_at})
        except RuntimeError as exc:
            output["warnings"].append({"source": "Alpha Vantage", "asset": asset.get("id"), "message": str(exc)})
        if not history:
            try:
                history = fetch_stooq_history(asset.get("primary_symbol"))
                if history:
                    history_source = "Stooq"
            except RuntimeError as exc:
                output["warnings"].append({"source": "Stooq", "asset": asset.get("id"), "message": str(exc)})
        if history:
            item["history_source"] = history_source
            item["as_of_date"] = history[-1]["date"]
            item["analytics"] = analytics_from_history(history)
            item["sources"].append(history_source)
            upsert_price(conn, asset.get("id"), asset.get("primary_symbol"), history[-1], history_source, retrieved_at)
        output["assets"].append(item)

    output["news_events"] = build_news(conn, retrieved_at)
    if output["news_events"]:
        output["sources"].append({"name": "GDELT", "retrieved_at": retrieved_at})

    conn.execute("insert or replace into run_log(retrieved_at, status, message) values (?, ?, ?)", (retrieved_at, "ok", "data updated"))
    conn.commit()
    conn.close()
    LATEST_PATH.write_text(json.dumps(output, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"Wrote {LATEST_PATH}", flush=True)
    print(f"Wrote {DB_PATH}", flush=True)
    print(f"Warnings: {len(output['warnings'])}", flush=True)


if __name__ == "__main__":
    try:
        main()
    except Exception as exc:
        print(f"update_data failed: {exc}", file=sys.stderr)
        sys.exit(1)
