"use strict";
const $ = id => document.getElementById(id);
const KEY="contrastcraft-palettes-v1";
const controls={foreground:$("foreground"),background:$("background")};
const textInputs={foreground:$("foregroundHex"),background:$("backgroundHex")};
const valid = value => /^#[0-9a-f]{6}$/i.test(value.trim());
function luminance(hex){
 const channels=[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16)/255);
 const linear=channels.map(c=>c<=0.04045?c/12.92:((c+0.055)/1.055)**2.4);
 return 0.2126*linear[0]+0.7152*linear[1]+0.0722*linear[2];
}
function contrast(first,second){
 const a=luminance(first),b=luminance(second);
 return (Math.max(a,b)+0.05)/(Math.min(a,b)+0.05);
}
function rating(id,passed){
 const item=$(id);item.textContent=passed?"Pass":"Fail";item.className=passed?"pass":"fail";
}
function refresh(){
 const fg=controls.foreground.value,bg=controls.background.value;
 textInputs.foreground.value=fg.toUpperCase();textInputs.background.value=bg.toUpperCase();
 $("preview").style.color=fg;$("preview").style.backgroundColor=bg;
 const ratio=contrast(fg,bg);
 $("ratio").textContent=ratio.toFixed(2)+":1";
 rating("normalRating",ratio>=4.5);rating("largeRating",ratio>=3);rating("aaaRating",ratio>=7);
 $("inputError").textContent="";
}
function apply(fg,bg){controls.foreground.value=fg;controls.background.value=bg;refresh();}
function readSaved(){
 try{const values=JSON.parse(localStorage.getItem(KEY)||"[]");
 return Array.isArray(values)?values.filter(p=>p&&valid(p.foreground)&&valid(p.background)):[];}catch{return [];}
}
function displaySaved(){
 const list=$("palettes");list.replaceChildren();
 for(const p of readSaved()){
 const item=document.createElement("li");
 for(const color of [p.foreground,p.background]){
 const block=document.createElement("span");block.className="swatch";block.style.background=color;item.append(block);}
 const text=document.createElement("span");text.textContent=p.foreground+" / "+p.background;item.append(text);
 const button=document.createElement("button");button.textContent="Use";button.type="button";
 button.addEventListener("click",()=>apply(p.foreground,p.background));item.append(button);list.append(item);
 }
}
for(const key of Object.keys(controls)){
 controls[key].addEventListener("input",refresh);
 textInputs[key].addEventListener("change",()=>{
 const v=textInputs[key].value.trim();
 if(!valid(v)){$("inputError").textContent="Use a six-digit hex value like #17324D.";return;}
 controls[key].value=v;refresh();
 });
}
$("swap").addEventListener("click",()=>apply(controls.background.value,controls.foreground.value));
$("random").addEventListener("click",()=>{
 const pick=()=>"#"+Math.floor(Math.random()*16777216).toString(16).padStart(6,"0");
 apply(pick(),pick());
});
$("save").addEventListener("click",()=>{
 const p={foreground:controls.foreground.value,background:controls.background.value};
 const saved=readSaved();
 if(!saved.some(s=>s.foreground===p.foreground&&s.background===p.background)){
 saved.unshift(p);try{localStorage.setItem(KEY,JSON.stringify(saved.slice(0,12)));}catch{$("inputError").textContent="Browser storage is unavailable.";}
 }
 displaySaved();
});
$("clear").addEventListener("click",()=>{try{localStorage.removeItem(KEY);}catch{}displaySaved();});
refresh();displaySaved();