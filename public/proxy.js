const form=document.querySelector('#proxyForm'),input=document.querySelector('#proxyUrl'),frame=document.querySelector('#proxyFrame'),wrap=document.querySelector('#proxyWrap');
const history=[];
function openUrl(url){history.push(url);frame.src=`/api/proxy?url=${encodeURIComponent(url)}`;wrap.querySelector('.proxy-empty')?.remove();}
form.addEventListener('submit',e=>{e.preventDefault();openUrl(input.value.trim())});
document.querySelector('#proxyBack').addEventListener('click',()=>{if(history.length>1){history.pop();const url=history.pop();input.value=url;openUrl(url)}else frame.contentWindow?.history.back()});
document.querySelector('#proxyFullscreen').addEventListener('click',()=>wrap.requestFullscreen?.());
