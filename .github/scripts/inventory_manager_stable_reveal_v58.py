from pathlib import Path
p=Path('inventory/index.html')
s=p.read_text(encoding='utf-8')
old="""let revealTries=0;const revealWhenReady=()=>{try{const md=frame.contentDocument;if(md&&md.querySelector('#managerModeTabs')&&md.querySelectorAll('.manager-final-row').length>=3){requestAnimationFrame(revealFrame);return}}catch(e){}if(++revealTries<150)setTimeout(revealWhenReady,20);else revealFrame()};revealWhenReady()"""
new="""let revealTries=0,stableHits=0,lastSig='',managerWaitStart=Date.now();const revealWhenReady=()=>{try{const md=frame.contentDocument,tabs=md?.querySelector('#managerModeTabs'),rows=md?Array.from(md.querySelectorAll('.manager-final-row')):[];const styleIds=['smooth-v12','pro-v16','manager-v17-css','receiving-link-v2-css','manager-tabs-v47-css','manager-tabs-v48-fix-css'];const stylesReady=!!md&&styleIds.every(id=>{const el=md.getElementById(id);return !el||!!el.sheet});if(tabs&&rows.length>=3&&stylesReady){const sig=[tabs,...rows].map(el=>{const r=el.getBoundingClientRect();return [el.className,Math.round(r.x),Math.round(r.y),Math.round(r.width),Math.round(r.height)].join(':')}).join('|');if(sig===lastSig)stableHits++;else{lastSig=sig;stableHits=0}const elapsed=Date.now()-managerWaitStart;if(elapsed>=900&&stableHits>=3){requestAnimationFrame(()=>requestAnimationFrame(revealFrame));return}}else{stableHits=0;lastSig=''}}catch(e){}if(++revealTries<180)setTimeout(revealWhenReady,50);else revealFrame()};revealWhenReady()"""
if old not in s:
    raise SystemExit('manager reveal marker not found')
s=s.replace(old,new,1)
if '/inventory/original.html?v=57' not in s:
    raise SystemExit('original v57 marker not found')
s=s.replace('/inventory/original.html?v=57','/inventory/original.html?v=58',1)
p.write_text(s,encoding='utf-8')
