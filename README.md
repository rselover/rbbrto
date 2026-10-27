# rbbrto &

A little sole. A lot of rhythm. A neon foot orchestra inspired by the supplied Rbbrto reference: red feet, blue inner contours, green instruments and a flower-crowned hula dancer.

The artwork is native SVG. The feet face upward at rest. Drum and synth steps detach individual toes, send them down to strike the instruments, then return them to their exact positions on the foot. Instrument highlights follow the notes. The center foot sways and its grass skirt swings while a pattern plays. It rests when playback stops. Reduced-motion preferences disable the repeating movement.

## Play

- Hold **A S D F G H J** for seven drum patterns.
- Hold **Q W E R T Y U** for seven synth patterns.
- Hold keys from both rows for a duet. Release the newest key to return to the previous held pattern.
- On a phone or tablet, hold and slide across either labeled button bank. Each pointer is tracked independently.
- Tab to a pattern button and hold Space or Enter to play it.
- Change tempo with the BPM field (30–240). Footer buttons cycle MIDI channels 1–16.

Keyboard repeat, modifier shortcuts and editing fields do not trigger patterns. Leaving the window or switching tabs releases local inputs. Slides press the new pattern before releasing the previous one, keeping the beat running.

## Run

There is no build step. Serve this directory with `python3 -m http.server 8000`, then open `http://localhost:8000`. MIDI and service workers require HTTPS or localhost. Audio preview loads Tone.js from jsDelivr. Local controls work when MIDI is unsupported or denied.

Run `npm test` with Node 22 or newer. Tests require no package installation and cover input ownership, key repeat, simultaneous drum/synth control, held-pattern fallback, audio steps, scene state and offline fetching. They use browser API doubles; actual browser interaction and MIDI hardware need separate checks.

## Structure

- `src/rbbrto.js`: pattern scheduling, MIDI and audio.
- `src/scene.js`: SVG artwork, note-driven toe animation and sequencer display.
- `src/input.js`: touch and keyboard ownership.
- `src/rbbrto.css.js`: responsive layout and animations.
- `src/settings.js`: MIDI channel controls.

The artwork replaces the original gorilla/professor template and its hand-based animation selectors. Patterns and MIDI note output remain the same. The local drum preview remains approximate: every drum note uses one C2 membrane voice. Offline use depends on previously cached assets, including the external Tone.js module.
