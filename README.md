# Rbbrto

A browser recreation of the OP-1 Rbbrto sequencer, with MIDI output and a Tone.js audio preview.

Serve this directory with a static HTTP server (for example, `python3 -m http.server 8000`) and open `http://localhost:8000`. There is no build step. MIDI and service workers require HTTPS or localhost; the audio preview loads Tone.js from jsDelivr.

The lower pad selects seven drum patterns and the upper pad selects seven synth patterns. Drag horizontally to change patterns and release to stop. The settings bar cycles each MIDI channel from 1 through 16. MIDI output is skipped until access is available, so pad interaction can continue when MIDI is unavailable or permission is denied.

Run `npm test` with Node 22 (see `.nvmrc`). Tests use Node's built-in test runner and require no package installation. They cover MIDI availability, settings events, pad mapping and cancellation, and service-worker fetching/cache failures. They use browser API doubles; actual MIDI hardware, audio playback, and browser layout still need manual verification.

## Cleanup notes

- Touch pads previously used eight-note ranges that did not match the fourteen supported control notes. Some regions selected the wrong instrument or no pattern. Pads now derive their seven-note ranges from `whiteKeys`, stop above the settings bar, and release on pointer cancellation or lost capture.
- MIDI sends previously assumed access had already resolved. Early interaction or denied/unsupported MIDI could throw. Sends now wait for available access by skipping output until it exists, without queuing stale notes.
- Settings used the nonstandard `event.path`, assumed every click found a channel, and installed another listener on reconnect. They now use `composedPath()`, ignore background clicks, and assign one click handler.
- The service worker previously made separate network requests for display and caching. It now fetches once, caches a successful response clone, skips non-GET requests, and keeps network responses usable when cache writes fail. Registration checks API support and reports failures.
- The lockfile still used the original `@sampi/rbbrto` package name; it now matches `package.json`.

The unusual feet/toes terminology in repository history came from PRs #2 and #4, reverted by #3 and #5. In particular, #4 renamed animation symbols and comments while retaining the existing SVG selectors and artwork. The current main branch restores the gorilla/professor implementation.

The audio preview remains approximate: drum notes all trigger the same `C2` membrane sound. Offline use still depends on assets having been cached previously, including the external Tone.js module. These are existing limitations, not a full instrument or offline redesign.
