(()=>{'use strict';
if(window.__reportFontV25)return;window.__reportFontV25=true;
const proto=window.CanvasRenderingContext2D&&CanvasRenderingContext2D.prototype;
if(!proto)return;
const desc=Object.getOwnPropertyDescriptor(proto,'font');
if(!desc||!desc.get||!desc.set)return;
Object.defineProperty(proto,'font',{
 configurable:desc.configurable,
 enumerable:desc.enumerable,
 get(){return desc.get.call(this)},
 set(value){
  let v=String(value||'');
  try{
   if(this.canvas&&this.canvas.width===1080&&this.canvas.height===1920){
    v=v.replace(/(\d+(?:\.\d+)?)px/,(_,n)=>{
     const px=Number(n);let scale=1;
     if(px>=25)scale=1.22;
     else if(px>=18)scale=1.16;
     else if(px>=13)scale=1.10;
     return `${Math.round(px*scale)}px`;
    });
   }
  }catch(e){}
  return desc.set.call(this,v);
 }
});
})();
