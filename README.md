# rbbrto &

A little sole. A lot of rhythm. A neon foot orchestra inspired by the supplied Rbbrto reference: red feet, blue inner contours, green instruments and a flower-crowned hula dancer.

The artwork is native SVG. The feet face upward at rest. Drum and synth steps detach individual toes, send them down to strike the instruments, then return them to their exact positions on the foot. Instrument highlights follow the notes. The center foot sways and its grass skirt swings while a pattern plays. It rests when playback stops. Reduced-motion preferences disable the repeating movement.

## Play

On Safari/iPhone, tap **Enable sound** once the instruments finish loading, then hold a pattern. The status changes to **Sound on**. If sound was interrupted by another app, tap Enable sound again. If the dependency could not load, Retry sound reloads it; then tap Enable sound. MIDI output and animation can continue without local audio.

- Hold **A S D F G H J** for seven drum patterns.
- Hold **Q W E R T Y U** for seven synth patterns.
- Hold keys from both rows for a duet. Release the newest key to return to the previous held pattern.
- The left drum bank and right synth bank curve around the stage like `( app )`, with one large pill-shaped touch button per row. On a phone or tablet, hold and slide over the buttons in either grip; rows and gaps are hit-tested using the actual button bounds. Each pointer is tracked independently, so both thumbs can play together.
- Tab to a pattern button and hold Space or Enter to play it.
- Change tempo with the BPM field (30–240). Footer buttons cycle MIDI channels 1–16.

Keyboard repeat, modifier shortcuts and editing fields do not trigger patterns. Letter controls continue working when a pattern button has focus. Leaving the window or switching tabs releases local inputs and cancels their pointer ownership. Slides press the new pattern before releasing the previous one, keeping the beat running.

## Run

There is no build step. Serve this directory with `python3 -m http.server 8000`, then open `http://localhost:8000`. MIDI and service workers require HTTPS or localhost. Audio preview loads Tone.js from jsDelivr. Local controls work when MIDI is unsupported or denied.

Run `npm test` with Node 22 or newer. To run the browser touch fixture, open `/tests/browser-touch.html` through the same local server. It simulates two touch pointers against the rendered grip geometry (native pointer capture is stubbed for synthetic events). Tests require no package installation and cover input ownership, key repeat, simultaneous drum/synth control, held-pattern fallback, audio steps, scene state and offline fetching. They use browser API doubles; actual browser interaction and MIDI hardware need separate checks.

## Structure

- `src/rbbrto.js`: pattern scheduling, MIDI and audio.
- `src/scene.js`: SVG artwork, note-driven toe animation and sequencer display.
- `src/input.js`: touch and keyboard ownership.
- `src/rbbrto.css.js`: responsive layout and animations.
- `src/settings.js`: MIDI channel controls.

The artwork replaces the original gorilla/professor template and its hand-based animation selectors. Patterns and MIDI note output remain the same. The local drum preview remains approximate: every drum note uses one C2 membrane voice. Offline use depends on previously cached assets, including the external Tone.js module.

The sequencer pattern data matches `sampi/finger` (only naming comments differ). While an instrument is active, pattern changes preserve its playhead, and releasing the newest held pattern falls back to the previous one. Each instrument now sends immediate MIDI note-offs and stops its local audio voice when its last control is released, even while the other instrument continues. Repeated hardware note-ons are de-duplicated and unmatched note-offs are ignored. Two-note steps correctly retain a second note with index zero.

Portrait and landscape phones keep the app between the two curved thumb banks. Buttons grow with available screen height, with a 44px minimum in short landscape screens. Buttons remain at least 44px in the supported 320px-and-up layouts. Scrolling remains available outside the grips. Physical multitouch devices and MIDI hardware still require device testing.

Bass-note playback regression: some Finger synth patterns have negative internal indexes because their MIDI pitches are below 53. Visual indexes now wrap into the valid toe/key range without changing the musical pitches. Previously a missing toe element threw inside the shared beat loop and stopped playback. Tests exercise all 49 drum/synth pairs through several loops and each synth alone with drums added/removed. `/tests/browser-playback.html` repeats the duet check against real SVG elements using a simulated clock, touch pointers and audio/MIDI doubles. Both browser fixtures disable hardware MIDI output.

Safari audio startup: touch pointerdown alone does not establish user activation on WebKit. Sound resumes synchronously from the explicit button click, keyboard input, touch pointerup or touchend; it never waits for a module import before calling resume. The animation frame does not attempt to unlock audio, and local instrument scheduling is skipped while the audio context is suspended/interrupted. This prevents repeated scheduling on a frozen audio clock from terminating the beat loop. WebKit user activation reference: https://webkit.org/blog/13862/the-user-activation-api/

Native mobile input: pattern banks handle touchstart/touchmove/touchend/touchcancel directly, keyed by touch.identifier. Pointer capture is optional; if it fails, pointer input still starts and window-level handlers catch movement/release. When a browser sends both pointer and touch streams, ownership transfers without duplicate note-ons or an off/on gap. Touch listeners are explicitly non-passive inside the banks. The browser touch fixture deliberately throws on capture and checks both event paths; it does not substitute for physical iPhone testing.
