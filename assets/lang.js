// Language choice (Spanish added 2026-11-15). English pages that have a Spanish version suggest it to visitors whose
// browser prefers Spanish (a small banner, never a forced redirect). A visitor's choice is remembered on this device.
(()=>{
 const ES={'/':'/es/','/websites/':'/es/websites/','/start-a-project/':'/es/start-a-project/'};
 const path=location.pathname.replace(/index\.html$/,''),lang=document.documentElement.lang||'en';
 const save=v=>{try{localStorage.setItem('hn-lang',v);}catch{}};
 let saved=null;try{saved=localStorage.getItem('hn-lang');}catch{}
 document.addEventListener('click',e=>{const a=e.target.closest('[data-lang-choice]');if(a)save(a.dataset.langChoice);});
 if(lang!=='en'||!ES[path])return;
 if(saved==='es'){location.replace(ES[path]+location.hash);return;}
 const prefers=(navigator.languages||[navigator.language||'']).some((l,i)=>i<2&&/^es\b/i.test(l));
 if(saved||!prefers)return;
 const bar=document.createElement('div');bar.setAttribute('role','region');bar.setAttribute('aria-label','Idioma');bar.lang='es';bar.className='hn-lang-bar';
 bar.innerHTML='<span>¿Prefiere español?</span> <a href="'+ES[path]+'" data-lang-choice="es">Ver esta página en español</a> <button type="button">No, gracias</button>';
 bar.querySelector('button').addEventListener('click',()=>{save('en');bar.remove();});
 const css=document.createElement('style');css.textContent='.hn-lang-bar{position:fixed;left:16px;right:16px;bottom:16px;z-index:50;display:flex;gap:12px;flex-wrap:wrap;align-items:center;justify-content:center;padding:12px 16px;border-radius:12px;background:#0e281e;color:#fffdf7;font:15px/1.4 Inter,ui-sans-serif,-apple-system,sans-serif;box-shadow:0 8px 30px rgba(0,0,0,.25)}.hn-lang-bar a{color:#fffdf7;font-weight:650;text-decoration:underline}.hn-lang-bar button{font:inherit;color:#0e281e;background:#fffdf7;border:0;border-radius:8px;padding:6px 12px;cursor:pointer}.hn-lang-bar a:focus-visible,.hn-lang-bar button:focus-visible{outline:3px solid #8fb8d9;outline-offset:2px}';
 document.head.appendChild(css);document.body.appendChild(bar);
})();
