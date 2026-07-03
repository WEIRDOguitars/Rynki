# Rynki Product Spec

This document captures the target direction for the app. The current app is a static dashboard. The next major version should add a data pipeline, local database, analytics layer, and daily reports.

## Goal

Monitor selected assets and market drivers without giving direct buy/sell advice. The app should separate hard data from interpretation, show sources, and keep timestamps for every fetched record.

## Asset Scope

Track:

- S&P 500 ETF
- Core MSCI World
- SHY
- Gold
- XLE
- URA
- Natural gas / UNG
- BTC
- ETH
- LINK
- XRP
- SOL
- USD/PLN
- EUR/PLN

## Analytics

For each supported asset, calculate and display:

- Price charts
- Returns
- Volatility
- Drawdown
- SMA50, SMA100, SMA200
- RSI
- Correlations
- Currency exposure
- Rolling beta vs S&P 500 and MSCI World

## Daily Report

Generate a Polish daily report with:

- What rose and fell
- Which macro data or news may have mattered
- Which risks should be watched
- Which data points require confirmation

The report must avoid direct investment advice. Use observations like:

> The move may correlate with a change in 2Y Treasury yields.

Avoid wording like:

> Buy or sell this asset.

## Data Sources

### Market Data

Primary:

- Alpha Vantage or Financial Modeling Prep for stocks, ETFs, forex, commodities, and crypto

Fallback:

- Stooq for historical data where the instrument is available
- Yahoo/yfinance only as optional dev mode fallback, not production primary

### Macro USA

- FRED API: Fed Funds, 2Y/10Y Treasury yields, 10Y-2Y spread, CPI, PCE, unemployment

### Poland / PLN

- NBP API: USD/PLN, EUR/PLN, gold price in PLN per gram

### Europe

- ECB Data Portal API
- Eurostat API

### ETF Factsheets / Holdings

- BlackRock/iShares: Core MSCI World, SHY
- State Street: XLE
- Global X: URA

### Crypto

- CoinGecko: prices, market cap, volumes, dominance
- Etherscan API V2: ETH/EVM on-chain data, gas, token metrics

### News and Events

- GDELT
- Fed, ECB, NBP, US Treasury
- EIA, OPEC, IEA
- World Nuclear Association
- Ethereum Foundation
- Chainlink
- Solana
- Ripple

## Proposed Modules

### `sources/`

API adapters. Each adapter should include:

- Rate limit handling
- Retry with backoff
- Cache
- Response validation
- Source metadata

### `data/`

Local database layer using SQLite or DuckDB.

Target tables:

- `prices`
- `macro`
- `fx`
- `holdings`
- `news_events`
- `asset_metadata`
- `daily_reports`

Every record should store:

- `source`
- `retrieved_at`
- `as_of_date`

### `analytics/`

Calculations:

- Returns
- SMA
- RSI
- Volatility
- Drawdown
- Correlations
- Currency exposure
- Rolling beta vs S&P 500 and MSCI World

### `news/`

News pipeline:

- Fetch news
- Deduplicate
- Score relevance
- Map news to assets and drivers

### `reports/`

Daily report generator in Polish:

- What happened
- Likely reasons
- What to watch
- Data requiring confirmation

### `ui/`

Dashboard:

- Asset cards
- Charts
- Alerts table
- Daily report view
- Source and timestamp visibility

### `config/portfolio.yaml`

Portfolio and monitoring configuration:

- Assets
- Tickers
- Drivers
- Alert thresholds
- Base currency

## Quality Requirements

- Do not hardcode API secrets.
- Keep `.env.example` only; real `.env` stays local.
- Store source, retrieved timestamp, and as-of date for every fetched record.
- If data differs across sources, show a warning instead of pretending certainty.
- Add tests for data normalization and analytics calculations.
- Keep analyses framed as risk monitoring and observations, not investment advice.
