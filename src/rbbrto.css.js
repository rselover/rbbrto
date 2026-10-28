export default `
:host { --green:#00ef91; --blue:#528aff; --red:#ff365b; --beat-s:.12s; display:flex; flex-direction:column; min-height:100dvh; box-sizing:border-box; background:#070808; color:#eee8fa; font:12px/1.4 ui-monospace,SFMono-Regular,Consolas,monospace; padding:0 4vw; }
* { box-sizing:border-box; }
.masthead { height:80px; display:flex; align-items:center; justify-content:space-between; border-bottom:1px solid #202427; gap:24px; }
.wordmark { font:700 29px/1 sans-serif; letter-spacing:-1.5px; color:#f5efff; text-decoration:none; }

.edition { font-size:10px; letter-spacing:2.4px; color:#797b84; }
.audio-controls { display:flex; align-items:center; gap:12px; }
#audio-start { min-height:44px; padding:0 18px; border:1px solid #00ef9166; border-radius:12px; background:#0a1b12; color:var(--green); font:11px monospace; cursor:pointer; }
#audio-start:disabled { opacity:.6; cursor:default; }
#audio-message { font-size:9px; color:#999ca5; max-width:210px; }
@media(max-width:700px) { .masthead { flex-wrap:wrap; height:auto!important; min-height:58px; padding:12px 0; gap:12px; } .audio-controls { order:3; flex-basis:100%; justify-content:space-between; } #audio-message { max-width:180px; } }
@media(max-height:550px) and (orientation:landscape) { #audio-message { display:none; } .audio-controls { order:0; flex-basis:auto; } .masthead { flex-wrap:nowrap; } }
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
.flying-toe.flying { opacity:1; }
#motion-toggle { min-height:44px; border:1px solid #343946; border-radius:10px; padding:0 12px; background:transparent; color:#b1b5c4; font:10px monospace; cursor:pointer; }
.motion-disabled #hula-dancer,.motion-disabled .skirt { animation:none!important; }
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
@media (max-width:600px) and (orientation:portrait) {
 #drum-foot-position,.kit,#drum-flying-toes { transform:translate(560px,60px) scale(.8); }
 #synth-foot-position,.keyboard,#synth-flying-toes { transform:translate(-220px,820px) scale(.8); }
 #hula-position { transform:translate(800px,900px) scale(.7); }
 .pattern-lamps,.instrument-label,.hula-caption,#pattern-label { display:none; }
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

#lock-toggle { display:flex; align-items:center; justify-content:center; gap:10px; min-height:44px; padding:0 14px; border:1px solid #375448; border-radius:12px; background:#0a1510; color:var(--green); cursor:pointer; font:10px monospace; flex-shrink:0; }
#lock-toggle[aria-pressed="true"] { background:var(--green); color:#06190f; box-shadow:0 0 20px #00ef9133; }
.lock-icon { display:inline-block; position:relative; width:18px; height:15px; border:2px solid currentColor; border-radius:4px; margin-top:8px; }
.lock-icon::before { content:''; position:absolute; width:10px; height:10px; top:-11px; left:2px; border:2px solid currentColor; border-bottom:0; border-radius:9px 9px 0 0; transform:translateX(3px) rotate(-20deg); transform-origin:bottom right; }
#lock-toggle[aria-pressed="true"] .lock-icon::before { transform:none; }
.lock-icon::after { content:''; position:absolute; left:6px; top:4px; width:3px; height:5px; border-radius:3px; background:currentColor; }
#stop-all { display:block; margin:10px auto 0; min-width:80px; min-height:44px; color:#ff7790; border:1px solid #633343; border-radius:10px; background:#170c10; font:11px monospace; cursor:pointer; }
.expression-controls { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:24px; padding:24px 0; border-top:1px solid #202427; }
.expression-panel { min-width:0; color:var(--green); }
.synth-expression { color:var(--blue); }
.expression-heading { display:flex; align-items:center; justify-content:space-between; margin-bottom:12px; font-size:10px; letter-spacing:1px; }
.expression-heading button { min-height:44px; min-width:54px; border:1px solid #303a42; border-radius:8px; background:transparent; color:#b7b7c4; font:10px monospace; cursor:pointer; }
.expression-pad { position:relative; height:190px; min-height:160px; border:1px solid currentColor; border-radius:18px; overflow:hidden; touch-action:none; user-select:none; -webkit-user-select:none; -webkit-touch-callout:none; background-color:#090f0d; background-image:linear-gradient(#a0b8ae12 1px,transparent 1px),linear-gradient(90deg,#a0b8ae12 1px,transparent 1px); background-size:25% 25%; cursor:crosshair; }
.synth-expression .expression-pad { background-color:#0b101b; }
.expression-pad:focus-visible { outline:2px solid #eee8fa; outline-offset:5px; }
.expression-cursor { position:absolute; display:block; left:var(--x,50%); top:var(--y,35%); width:22px; height:22px; border:3px solid currentColor; border-radius:50%; background:#070808; transform:translate(-50%,-50%); box-shadow:0 0 16px currentColor; margin:0; pointer-events:none; }
.axis { position:absolute; font-size:8px; letter-spacing:1px; opacity:.65; pointer-events:none; }
.axis.top { top:10px; left:50%; transform:translateX(-50%); }.axis.bottom { bottom:10px; left:50%; transform:translateX(-50%); }.axis.left { left:12px; top:50%; }.axis.right { right:12px; top:50%; }
.expression-panel output { display:block; margin-top:10px; font-size:10px; }
.expression-panel p { font-size:9px; color:#858995; margin:8px 0 0; line-height:1.6; }
@media(max-width:700px) { .masthead { position:relative; } .live-status { position:absolute; width:1px; height:1px; overflow:hidden; clip-path:inset(50%); } #lock-toggle { margin-left:auto; } .expression-controls { gap:12px; } .expression-heading { font-size:8px; letter-spacing:0; gap:4px; } .expression-pad { height:180px; } .axis.left { left:6px; }.axis.right { right:6px; } .axis { font-size:6px; }.expression-panel output { font-size:8px; line-height:1.6; } }
@media(max-width:360px) { .expression-controls { grid-template-columns:1fr; } }

.performance-drawer { display:block; }
#drawer-toggle { display:none; }
@media (max-height:550px) and (orientation:landscape) {
 :host { position:fixed; inset:0; height:100vh; height:100dvh; min-height:0; overflow:hidden; padding:env(safe-area-inset-top) max(10px,env(safe-area-inset-right)) 0 max(10px,env(safe-area-inset-left)); }
 .masthead { height:44px; min-height:44px; flex:0 0 44px; padding:0; gap:10px; flex-wrap:nowrap; }
 .wordmark { font-size:24px; }
 .audio-controls { order:0; flex-basis:auto; gap:0; }
 #audio-message,.live-status { display:none; }
 #audio-start { padding:0 10px; min-height:44px; font-size:10px; }
 #lock-toggle { min-height:44px; padding:0 10px; margin-left:auto; }
 .cockpit { flex:1; min-height:0; width:100%; margin:0; padding:4px 0 calc(48px + env(safe-area-inset-bottom)); grid-template-columns:clamp(108px,15vw,144px) minmax(0,1fr) clamp(108px,15vw,144px); grid-template-rows:minmax(0,1fr); column-gap:12px; }
 .bank-wrap { height:100%; min-height:0; align-self:stretch; }
 .bank-heading,.grip-caption { display:none; }
 .pad-bank { height:100%; margin:0; grid-template-columns:repeat(2,minmax(0,1fr)); grid-template-rows:repeat(4,minmax(44px,1fr)); gap:4px; }
 .pad-bank button { min-height:44px; height:auto; padding:4px 8px; font-size:19px; border-radius:17px; transform:none!important; }
 .pad-bank button:last-child { grid-column:1/-1; }
 .drum-bank button:first-child { border-top-left-radius:28px; }.drum-bank button:last-child { border-bottom-left-radius:28px; }
 .synth-bank button:nth-child(2) { border-top-right-radius:28px; }.synth-bank button:last-child { border-bottom-right-radius:28px; }
 .stage { margin:0; overflow:visible; }
 .stage svg { width:100%; height:auto; min-height:0; max-height:calc(100dvh - 96px - env(safe-area-inset-top) - env(safe-area-inset-bottom)); }
 .transport { position:fixed; z-index:8; top:env(safe-area-inset-top); left:50%; transform:translateX(-50%); height:44px; display:flex; align-items:center; justify-content:center; gap:8px; padding:0; margin:0; background:#070808; }
 .tempo-label,.transport-note { display:none; }
 .transport label { margin:0; gap:3px; }.transport input { width:45px; font-size:22px; }.transport label span { font-size:8px; }
 #stop-all { margin:0; min-width:56px; min-height:44px; }
 .performance-drawer { position:fixed; z-index:20; left:max(10px,env(safe-area-inset-left)); right:max(10px,env(safe-area-inset-right)); bottom:0; max-height:calc(100dvh - 46px - env(safe-area-inset-top)); padding-bottom:env(safe-area-inset-bottom); border:1px solid #35423d; border-radius:20px 20px 0 0; background:#080d0cf5; box-shadow:0 -10px 40px #0008; transform:translateY(calc(100% - 44px - env(safe-area-inset-bottom))); transition:transform .2s ease; }
 .performance-drawer.is-open { transform:translateY(0); }
 #drawer-toggle { display:block; position:relative; width:100%; height:44px; min-height:44px; padding:10px 0 0; border:0; border-radius:20px 20px 0 0; background:transparent; color:#c6d3cc; font:10px monospace; letter-spacing:1px; touch-action:none; cursor:pointer; }
 #drawer-toggle::before { content:''; position:absolute; width:36px; height:3px; border-radius:5px; background:#7f9a8e; left:calc(50% - 18px); top:5px; }
 .drawer-content { max-height:calc(100dvh - 92px - env(safe-area-inset-top) - env(safe-area-inset-bottom)); overflow:auto; overscroll-behavior:contain; padding:0 12px 4px; }
 .performance-drawer:not(.is-open) .drawer-content { visibility:hidden; pointer-events:none; }
 .expression-controls { padding:0; gap:12px; border:0; }
 .expression-heading { margin-bottom:4px; font-size:9px; }.expression-heading button { min-height:44px; }
 .expression-pad { height:clamp(100px,30dvh,150px); min-height:100px; }
 .expression-panel p { display:none; }.expression-panel output { font-size:9px; margin-top:6px; }
 .drawer-content footer { min-height:44px; padding:0; margin-top:6px; flex-wrap:nowrap; gap:10px; }
 .drawer-content rbbrto-settings { flex-basis:auto; }.drawer-content .footer-hint { display:none; }
 #motion-toggle { min-height:40px; }
}
@media (max-width:700px) and (max-height:550px) and (orientation:landscape) { .wordmark { display:none; } }
@media (max-height:310px) and (orientation:landscape) { .cockpit { padding-top:2px; padding-bottom:calc(46px + env(safe-area-inset-bottom)); } .pad-bank { gap:2px; } }
@media (prefers-reduced-motion:reduce) { .performance-drawer { transition:none; } }

`;
