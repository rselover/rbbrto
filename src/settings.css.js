export default `
:host { display:block; font:10px ui-monospace,SFMono-Regular,Consolas,monospace; }
#root { display:flex; justify-content:center; gap:8px; }
button { background:transparent; border:1px solid #282c30; border-radius:5px; padding:7px 10px; color:#b5b3c0; font:inherit; cursor:pointer; white-space:nowrap; }
button:hover { border-color:currentColor; }
button:focus-visible { outline:2px solid #eee8fa; outline-offset:3px; }
.drum { color:#00ef91; } .synth { color:#528aff; }
.label { font-size:8px; letter-spacing:1px; opacity:.65; margin-right:8px; }
@media(max-width:600px) { button { flex:1; padding:9px 5px; } .label { margin-right:5px; font-size:7px; } }
`;
