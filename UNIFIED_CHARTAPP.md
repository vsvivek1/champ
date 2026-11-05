# Unified chartApp.js

Single script combining UI dashboard + headless autopilot + mock trading.

## Usage

```bash
# UI dashboard (live Zerodha feeds, manual trading)
node chartApp.js

# Headless autopilot, mock trading (paper fills, real prices)
node chartApp.js --headless

# Mock trading with specific config
node chartApp.js --headless --index SENSEX --lots 2 --max 5

# Dry-run (log what would trade, no fills)
node chartApp.js --watch

# Real trading (both flags required)
node chartApp.js --live --i-mean-it

# Side-by-side UI + mock (different ports)
Terminal 1: node chartApp.js --port 3456
Terminal 2: node chartApp.js --headless --port 3457
```

## Options

| Flag | Default | Effect |
|------|---------|--------|
| `--headless` | off | Autopilot mode: picks strikes, trades automatically |
| `--mock` | auto | Paper trading (implicit with headless, unless --live) |
| `--live` | off | Real orders to Zerodha (requires --i-mean-it) |
| `--i-mean-it` | off | Confirmation for --live (both required) |
| `--watch` | off | Dry-run: log signals without trading |
| `--arm` | auto | Enable autopilot after --watch |
| `--port N` | 3456 (live) / 3457 (mock) | HTTP port for dashboard & /api |
| `--cash N` | 200000 | Paper trading balance (INR) |
| `--index` | from autoTrade.json | NIFTY or SENSEX |
| `--offset N` | from autoTrade.json | Strike offset (or 'auto') |
| `--lots N` | from autoTrade.json | Max lots per trade |
| `--max N` | from autoTrade.json | Max trades per day |
| `--alerts` | off | Enable phone alerts in mock mode |
| `--help` | - | Show full help |

## Modes Explained

### UI Mode (default)
- Browser-based dashboard on `http://localhost:3456`
- Manual order placement via UI
- Live spot + options charts
- Single resting order guard
- 10-min entry lock after stop, no lock after target
- All rules from `guardSettings.json` + `noTrade.json`

### Headless Mode
- No browser needed
- Autopilot picks strikes from `autoTrade.json`
- Trades automatically (unless `--watch`)
- Same guard logic as UI mode
- HTTP /api endpoints for monitoring
- Paper fills go to `mockBroker.js`
- State saved in `mock-*` files (mock-tradeLog.json, mock-guardState.json, etc)
- Settings files (guardSettings.json, noTrade.json) stay shared

### Mock Trading
- Paper fills, real prices, real candles
- Isolation: mock trades don't corrupt real account history
- Use for testing autopilot before going live
- Read `mock-tradeLog.json` to review paper trades

### Real Trading
- Only with `--live --i-mean-it` (both required)
- Orders go to Zerodha
- Same settings, same guard, same risk cap
- No second copy of logic: chartApp.js is the single source of truth

## File Changes

**Before:**
- chartApp.js (UI + headless logic mixed)
- chartHeadless.js (wrapper, now deprecated)

**After:**
- chartApp.js (unified, all modes in one)
- chartHeadless.js.backup-consolidated (archived)

All rules, guards, gates stay identical. Only structure changed.

## Migration from Old Workflow

```bash
# Old way
node chartHeadless.js --headless --lots 2

# New way
node chartApp.js --headless --lots 2
```

## Configuration Files

These stay shared between all modes (so mock run is judged against same rules as live):
- `guardSettings.json` — stop placement, risk cap, premium bands, lock times
- `noTrade.json` — time gates, volume checks, session blocks
- `setupAlerts.json` — SMS alerts on trades
- `oiSignals.json` — open interest signals

Mode-specific (isolated to not corrupt real trades):
- `mock-tradeLog.json` — paper trade history
- `mock-guardState.json` — paper position state
- `mock-tradeLock.json` — paper entry lock timer

Live account (unchanged):
- `tradeLog.json` — real trade history
- `guardState.json` — real position state
- `tradeLock.json` — real entry lock timer

## API Endpoints (all modes)

```bash
# Check autopilot settings and paper trades
curl localhost:3457/api/autopilot

# Paper book only
curl localhost:3457/api/mock

# Current position
curl localhost:3457/api/position

# Post-trade review
curl localhost:3457/api/review

# Enable/disable autopilot (headless mode)
curl -X POST localhost:3457/api/autopilot \
  -H 'content-type: application/json' \
  -d '{"enabled":false}'
```

## Running via pm2

```bash
# Paper autopilot
pm2 start chartApp.js --name chartMock -- --headless

# Live (requires explicit confirmation)
pm2 start chartApp.js --name chartLive -- --live --i-mean-it

# Monitor logs
pm2 logs chartMock
pm2 logs chartLive
```

## Rules (unchanged from previous)

All kept from guardSettings.json:
- Single resting SELL per BUY (no double-margin)
- Stop = 3-candle low − 1 tick (no max cap)
- Risk cap = 25% of capital (per trade)
- 3-candle breach triggers immediate exit
- 10-min entry lock after stop loss
- No entry lock after target hit
- Streak, premium bands, clock gates all active
- No time-of-day blocks (on purpose)
