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
.toe.struck { opacity:0; }
.flying-toe { opacity:0; pointer-events:none; }
.flying-toe.flying { opacity:1; filter:url(#glow); animation:toe-flight var(--beat-s) ease-in-out infinite; }
@keyframes toe-flight {
    0%,100% { transform:translate(var(--home-x),var(--home-y)); }
    42%,55% { transform:translate(var(--hit-x),var(--hit-y)); }
}
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

.cockpit { display:grid; grid-template-columns:clamp(120px,15vw,220px) minmax(0,1fr) clamp(120px,15vw,220px); align-items:center; column-gap:24px; width:100%; max-width:1700px; margin:auto; position:relative; padding:20px 0 28px; }
.cockpit::after { content:''; position:absolute; bottom:37px; left:9%; right:9%; height:65px; border:2px solid #293047; border-top:0; border-radius:0 0 70px 70px; pointer-events:none; z-index:0; }
.stage { grid-column:2; grid-row:1; min-width:0; }
.bank-wrap { z-index:1; position:relative; align-self:center; }
.drum-grip { grid-column:1; grid-row:1; }
.synth-grip { grid-column:3; grid-row:1; }
.bank-heading { text-align:center; margin-bottom:14px; color:var(--green); font-size:10px; letter-spacing:1.5px; }
.synth-grip .bank-heading { color:var(--blue); }
.bank-heading small { display:block; color:#737684; font-size:7px; letter-spacing:1.2px; margin-top:7px; }
.pad-bank { display:grid; grid-template-columns:1fr; gap:8px; touch-action:none; padding:0; margin-right:30px; user-select:none; -webkit-user-select:none; -webkit-touch-callout:none; }
.synth-bank { margin-right:0; margin-left:30px; }
.pad-bank button { display:flex; align-items:center; justify-content:space-between; padding:0 20px; min-width:0; min-height:clamp(56px,8vh,90px); border:1px solid #24503c; border-radius:24px; color:var(--green); background:#0a1510; cursor:pointer; font:21px monospace; touch-action:none; user-select:none; -webkit-user-select:none; -webkit-touch-callout:none; }
.drum-bank button:nth-child(1),.drum-bank button:nth-child(7) { transform:translateX(30px); }
.drum-bank button:nth-child(2),.drum-bank button:nth-child(6) { transform:translateX(14px); }
.drum-bank button:nth-child(3),.drum-bank button:nth-child(5) { transform:translateX(4px); }
.synth-bank button:nth-child(1),.synth-bank button:nth-child(7) { transform:translateX(-30px); }
.synth-bank button:nth-child(2),.synth-bank button:nth-child(6) { transform:translateX(-14px); }
.synth-bank button:nth-child(3),.synth-bank button:nth-child(5) { transform:translateX(-4px); }
.pad-bank button small { display:block; color:#70937e; font:8px monospace; margin-top:4px; }
.synth-bank button { color:var(--blue); background:#0c101c; border-color:#283956; }
.synth-bank button small { color:#7d91ba; }
.pad-bank button:hover { border-color:currentColor; }
.drum-bank button.active { background:var(--green); color:#051c11; box-shadow:0 0 20px #00ef9133; }
.synth-bank button.active { background:var(--blue); color:#060e23; box-shadow:0 0 20px #528aff33; }
.pad-bank button.active small { color:inherit; }
.grip-caption { display:block; text-align:center; color:#626675; font-size:7px; letter-spacing:2px; margin-top:12px; }
button:focus-visible,input:focus-visible,a:focus-visible { outline:2px solid #f5edff; outline-offset:4px; }
.transport { grid-column:2; grid-row:2; text-align:center; justify-self:center; padding:0 20px; background:#070808; z-index:1; }
.tempo-label { color:#8b8d96; font-size:8px; letter-spacing:2px; }
.transport label { display:flex; align-items:baseline; justify-content:center; gap:6px; margin-top:3px; }
.transport input { width:68px; border:none; background:none; color:#eee8fa; font:30px monospace; text-align:center; appearance:textfield; }
.transport input::-webkit-inner-spin-button { appearance:none; }
.transport label span { color:#8b8d96; font-size:9px; }
.transport-note { display:block; font-size:7px; letter-spacing:1px; color:#797c87; margin-top:5px; }
footer { display:flex; align-items:center; justify-content:space-between; gap:20px; border-top:1px solid #202427; min-height:68px; }
.footer-title,.footer-hint { color:#676a73; letter-spacing:1.5px; font-size:9px; }
rbbrto-settings { flex:1; max-width:560px; }
@media (min-width:1600px) { :host { padding:0 max(4vw,calc((100vw - 1700px)/2)); } }


@media (max-width:1000px) { :host { padding:0 14px; } .cockpit { grid-template-columns:clamp(82px,18vw,160px) minmax(0,1fr) clamp(82px,18vw,160px); column-gap:8px; } .edition { display:none; } .footer-title { display:none; } .pad-bank { margin-right:20px; } .synth-bank { margin-left:20px; margin-right:0; } .pad-bank button { padding:0 12px; } .drum-bank button:nth-child(1),.drum-bank button:nth-child(7) { transform:translateX(20px); } .synth-bank button:nth-child(1),.synth-bank button:nth-child(7) { transform:translateX(-20px); } }
@media (max-width:600px) {
 :host { padding:0 10px; } .masthead { height:58px; } .wordmark { font-size:25px; } .live-status { font-size:8px; }
 .cockpit { grid-template-columns:clamp(76px,22vw,110px) minmax(0,1fr) clamp(76px,22vw,110px); gap:5px; padding:16px 0; }
 .stage { grid-column:2; grid-row:1; margin:0; } svg { min-height:0; max-height:none; }
 .bank-heading { font-size:9px; margin-bottom:10px; } .bank-heading small,.grip-caption { display:none; }
 .pad-bank { gap:6px; margin-right:12px; } .synth-bank { margin-left:12px; margin-right:0; }
 .pad-bank button { min-height:clamp(54px,8dvh,82px); border-radius:18px; padding:0 10px; font-size:19px; }
 .pad-bank button small { font-size:8px; margin:0; }
 .drum-bank button:nth-child(1),.drum-bank button:nth-child(7) { transform:translateX(12px); }
 .drum-bank button:nth-child(2),.drum-bank button:nth-child(6) { transform:translateX(6px); }
 .drum-bank button:nth-child(3),.drum-bank button:nth-child(5) { transform:translateX(2px); }
 .synth-bank button:nth-child(1),.synth-bank button:nth-child(7) { transform:translateX(-12px); }
 .synth-bank button:nth-child(2),.synth-bank button:nth-child(6) { transform:translateX(-6px); }
 .synth-bank button:nth-child(3),.synth-bank button:nth-child(5) { transform:translateX(-2px); }
 .transport { padding:0; } .transport-note { max-width:120px; line-height:1.7; } .transport input { font-size:25px; width:60px; }
 .cockpit::after { display:none; }
 footer { flex-wrap:wrap; gap:8px; padding:14px 0; } rbbrto-settings { flex-basis:100%; } .footer-hint { width:100%; text-align:center; font-size:8px; }
}
@media (max-height:550px) and (orientation:landscape) {
 :host { padding:0 12px; } .masthead { height:40px; flex-shrink:0; }
 .edition,.grip-caption,.bank-heading,.footer-hint { display:none; }
 .cockpit { grid-template-columns:clamp(110px,20vw,190px) minmax(0,1fr) clamp(110px,20vw,190px); column-gap:12px; padding:8px 0; }
 .stage { margin:0; } svg { max-height:calc(100dvh - 110px); min-height:0; }
 .pad-bank { gap:3px; } .pad-bank button { min-height:44px; height:calc((100dvh - 80px)/7); padding:0 15px; font-size:18px; }
 .transport { grid-row:2; display:flex; align-items:center; gap:8px; } .transport input { font-size:20px; }
 .transport-note,.cockpit::after { display:none; } footer { min-height:44px; }
}
@media (prefers-reduced-motion:reduce) { .playing #hula-dancer,.playing .skirt,.flying-toe.flying { animation:none; } .toe.struck { opacity:1; } .flying-toe.flying { display:none; } }
`;
