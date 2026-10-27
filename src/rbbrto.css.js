export default `
:host { --green:#00ef91; --blue:#528aff; --red:#ff365b; --beat-s:.12s; display:flex; flex-direction:column; min-height:100dvh; box-sizing:border-box; background:#070808; color:#eee8fa; font:12px/1.4 ui-monospace,SFMono-Regular,Consolas,monospace; padding:0 4vw; }
* { box-sizing:border-box; }
.masthead { height:80px; display:flex; align-items:center; justify-content:space-between; border-bottom:1px solid #202427; gap:24px; }
.wordmark { font:700 29px/1 sans-serif; letter-spacing:-1.5px; color:#f5efff; text-decoration:none; }
.wordmark span { color:var(--green); margin-left:8px; font-weight:400; }
.edition { font-size:10px; letter-spacing:2.4px; color:#797b84; }
.live-status { color:#797b84; font-size:10px; letter-spacing:1.2px; white-space:nowrap; }
i { display:inline-block; width:6px; height:6px; border-radius:50%; background:currentColor; margin-right:7px; }
.live-status.on { color:var(--green); }
.stage { width:100%; max-width:1600px; margin:18px auto; }
svg { display:block; width:100%; height:auto; overflow:visible; }
.foot { stroke-linecap:round; stroke-linejoin:round; }
.sole-outline,.toe-outline { stroke:var(--red); stroke-width:9; fill:#070808; }
.sole-inset,.toe-inset { stroke:var(--blue); stroke-width:5; fill:none; }
.toe { transition:transform .08s ease-out; }
.toe.struck { animation:toe-press var(--beat-s) ease-out infinite; filter:url(#glow); }
@keyframes toe-press { 0%,100% { transform:translateY(0); } 35% { transform:translateY(19px) scaleY(.94); } }
.drum-piece,.synth-key { transition:stroke .08s; }
.drum-piece.struck { stroke:#f1fff7; filter:url(#glow); }
.synth-key.struck { stroke:var(--green); stroke-width:13; filter:url(#glow); }
.synth-letter { font:66px sans-serif; opacity:.55; }
.instrument-label { fill:#737580; font:11px monospace; letter-spacing:3px; }
.micro-label { fill:#737580; font:10px monospace; letter-spacing:2px; }
.step-box { fill:none; stroke:#49417d; stroke-width:4; }
.step-note { fill:#ede4ff; font:32px serif; opacity:0; }
.has-note .step-note { opacity:1; }
.current .step-box { stroke:#f5eaff; filter:url(#glow); }
[data-lamp] { fill:#00ef910b; transition:fill .15s; }
[data-lamp].lit { fill:#00ef9140; filter:url(#glow); }
#hula-dancer { transform-origin:0 25px; }
.dance-lines { opacity:.2; }
.playing #hula-dancer { animation:hula calc(var(--beat-s) * 4) ease-in-out infinite; }
.playing .skirt { transform-origin:0 10px; animation:skirt calc(var(--beat-s) * 2) ease-in-out infinite alternate; }
.playing .dance-lines { opacity:1; filter:url(#glow); }
@keyframes hula { 0%,100% { transform:translate(-9px,0) rotate(-9deg); } 50% { transform:translate(9px,-8px) rotate(9deg); } }
@keyframes skirt { from { transform:skewX(-9deg); } to { transform:skewX(9deg); } }
.performance { display:grid; grid-template-columns:minmax(0,1fr) 180px minmax(0,1fr); gap:32px; width:100%; max-width:1440px; margin:0 auto 30px; }
.bank-heading { display:flex; justify-content:space-between; align-items:center; margin-bottom:13px; color:var(--green); font-size:10px; letter-spacing:1.5px; }
.bank-wrap:last-child .bank-heading { color:var(--blue); }
.bank-heading small { color:#696b75; font-size:8px; letter-spacing:1px; }
.pad-bank { display:grid; grid-template-columns:repeat(7,1fr); gap:7px; touch-action:none; }
.pad-bank button { padding:12px 0 9px; min-height:61px; border:1px solid #24503c; border-radius:9px; color:var(--green); background:#0a1510; cursor:pointer; font:15px monospace; touch-action:none; user-select:none; }
.pad-bank button small { display:block; color:#4d7360; font:8px monospace; margin-top:6px; }
.synth-bank button { color:var(--blue); background:#0c101c; border-color:#283956; }
.synth-bank button small { color:#52658b; }
.pad-bank button:hover { border-color:currentColor; }
.drum-bank button.active { background:var(--green); color:#051c11; box-shadow:0 0 20px #00ef9133; }
.synth-bank button.active { background:var(--blue); color:#060e23; box-shadow:0 0 20px #528aff33; }
.pad-bank button.active small { color:inherit; }
button:focus-visible,input:focus-visible,a:focus-visible { outline:2px solid #f5edff; outline-offset:4px; }
.transport { text-align:center; align-self:end; }
.tempo-label { color:#6c6e76; font-size:8px; letter-spacing:2px; }
.transport label { display:flex; align-items:baseline; justify-content:center; gap:6px; margin-top:3px; }
.transport input { width:68px; border:none; background:none; color:#eee8fa; font:30px monospace; text-align:center; appearance:textfield; }
.transport input::-webkit-inner-spin-button { appearance:none; }
.transport label span { color:#6c6e76; font-size:9px; }
.transport-note { display:block; font-size:7px; letter-spacing:1px; color:#62646c; margin-top:5px; }
footer { display:flex; align-items:center; justify-content:space-between; gap:20px; border-top:1px solid #202427; min-height:68px; }
.footer-title,.footer-hint { color:#676a73; letter-spacing:1.5px; font-size:9px; }
rbbrto-settings { flex:1; max-width:560px; }
@media (min-width:1600px) { :host { padding:0 max(4vw,calc((100vw - 1700px)/2)); } }
@media (max-width:900px) { .performance { gap:14px; grid-template-columns:minmax(0,1fr) 104px minmax(0,1fr); } .bank-heading small { display:none; } .edition { font-size:8px; letter-spacing:1px; } .pad-bank { gap:4px; } .pad-bank button { min-height:54px; } .footer-title { display:none; } }
@media (max-width:600px) { :host { padding:0 18px; } .masthead { height:65px; } .edition { display:none; } svg { min-height:0; max-height:none; aspect-ratio:1600/1000; } .stage { margin:24px auto; } .performance { grid-template-columns:1fr; gap:20px; margin-bottom:25px; } .transport { grid-row:3; display:flex; justify-content:center; align-items:center; gap:10px; } .transport label { margin:0; } .transport input { font-size:24px; } .transport-note { display:none; } .bank-heading small { display:inline; } .pad-bank button { min-height:56px; } footer { flex-wrap:wrap; gap:8px; padding:18px 0; } rbbrto-settings { flex-basis:100%; } .footer-hint { width:100%; text-align:center; font-size:8px; margin-top:6px; } }
@media (prefers-reduced-motion:reduce) { .playing #hula-dancer,.playing .skirt,.toe.struck { animation:none; } .toe.struck { transform:translateY(12px); } }
`;
