# GlobusX 🌍

A daily geography game. We name a place — you spin a satellite globe and tap where you think it is. The closer you tap, the more points you score.

## How to play

- **Drag** the globe to rotate it; pinch or use the **+ / −** buttons to zoom.
- **Tap** the spot you think is closest — your guess locks in instantly.
- Score up to **100** per stop based on distance, plus **+5** for guessing the right country (when the stop would otherwise be under 90).
- Each stop gets progressively harder. The first stop is always somewhere in the USA.

### Trips
| Mode | Stops | Multipliers | Max score |
|------|-------|-------------|-----------|
| **Layover** | 3 | 1×, 2×, 3× | 600 |
| **Grand Tour** | 5 | 1, 1, 2, 3, 3 | 1,000 |
| **Globetrotter** | 10 | 1,1,1,2,2,2,2,3,3,3 | 2,000 |

There's one fixed set of locations per day for each trip. After finishing, you'll see the day's average and your percentile (a simulated daily field — this is a fully offline app with no backend), plus a shareable emoji recap. A leaderboard is viewable from the home screen.

## Running it

`index.html` is a **single, self-contained file** — open it directly in any modern browser. No build step, no server, no network required (the satellite/cloud textures, fonts, and map data are all inlined).

## Building from source

The `.build/` folder holds the un-bundled pieces:

- `top.html` — markup + CSS
- `game.js` — game logic, WebGL globe renderer, audio, leaderboard
- `d3-array`, `d3-geo`, `topojson-client` — geo math libraries (minified)
- `countries-110m.json` — country polygons (used only for the right-country hit test, never drawn)
- `earth.b64` / `clouds.b64` — inlined NASA Blue Marble satellite + cloud textures
- `font.b64` — inlined Space Grotesk display font

Rebuild the bundled `index.html` with:

```sh
./.build/assemble.sh
```

## Tech

Vanilla JS + a hand-written WebGL fragment-shader globe (orthographic projection, day/night terminator, ocean sun-glint, atmosphere, drifting clouds, 8K satellite texture with mipmapping + anisotropic filtering). No frameworks.

## Credits

- Earth & cloud imagery: NASA Visible Earth (Blue Marble) / Solar System Scope textures.
- Country boundaries: Natural Earth via `world-atlas`.
- Font: [Space Grotesk](https://fonts.google.com/specimen/Space+Grotesk) (SIL Open Font License).
