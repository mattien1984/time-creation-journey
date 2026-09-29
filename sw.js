// The publisher embeds one atomic release here. No second script request can
// leave Safari activating a worker with a different manifest than its gate.
const config = {"version":"2ee7ca3dff1f738f3fea","base":"/time-creation-journey/","salt":"ZwBaWTbo7Ei1tJUbEGqecre5eZd3AxC5pQIoTVk0ttc=","iterations":210000,"files":{"assets/index-DByGtYB9.js":{"file":"9c3fe58834ea158b600264100a2be63e.bin","iv":"Rgd7CiTkJhhd//tV","type":"text/javascript; charset=utf-8"},"assets/index-DznaqJr1.css":{"file":"39d0948a6cecd77ea2fdf84e812ec67a.bin","iv":"G+ECOeDxtXnkJ4MX","type":"text/css; charset=utf-8"},"fonts/roobert-italic.otf":{"file":"59139e233e1cb9c92b63ff116f28d85b.bin","iv":"6d9ExxmNYIGwDi0n","type":"font/otf"},"fonts/roobert-medium.otf":{"file":"7ddbff5df5b8d6cdb662497373cb491f.bin","iv":"i+UxEQ+zI5WAs5EH","type":"font/otf"},"fonts/roobert-regular.otf":{"file":"4d0a5e8ccdfcacdde4209ba41c757e04.bin","iv":"/kU4eBgOVJt+Qu3k","type":"font/otf"},"fonts/roobert-semi-mono.otf":{"file":"44fd5ffc19b7a1c5ed5002cb43543305.bin","iv":"owIRC7Ta/fOsKIbU","type":"font/otf"},"fonts/season-mix-italic.otf":{"file":"36c9124c9a4dc39d3763306476787070.bin","iv":"fwDuZFUqEhCk3Lev","type":"font/otf"},"fonts/season-mix-regular.otf":{"file":"b995b7f4b4846619c532921eae431f1a.bin","iv":"0HPwInsCoCviz3GP","type":"font/otf"},"index.html":{"file":"a5932e5ac30fcfb6e06ba93813302c53.bin","iv":"Bl41FSoVhSb7qw+D","type":"text/html; charset=utf-8"},"logos/existence.svg":{"file":"ee0ab0234acd684e667ca82c96ad53a8.bin","iv":"21gyR//n/TxUeSJT","type":"image/svg+xml"},"logos/tc-mark.svg":{"file":"56d7a7706f8f92f95e65b6911b7ecd60.bin","iv":"e3rdS1poU7dcPaCJ","type":"image/svg+xml"},"logos/time-creation-project.svg":{"file":"cc4f3b8bc0d000d20cb01db5755bbb5c.bin","iv":"9j5rzxsr4ypf0toJ","type":"image/svg+xml"},"logos/time-creationism.svg":{"file":"3b75f4b58b611f0286c386bf47b8dfe4.bin","iv":"XHBzedvDdK4d60We","type":"image/svg+xml"},"logos/time-creationist.svg":{"file":"ebe6254d6ed3693575996db3f8e556e2.bin","iv":"4dW7FyPC0EGb+nP9","type":"image/svg+xml"},"media/ex-time-block.jpg":{"file":"42f3a1df7258283ddca2a2f045fc73e3.bin","iv":"+7PG0tQnSvh5oN68","type":"image/jpeg"}}};
const databaseName = 'time-creation-preview:'+config.base;
let session, unlocked=false;
const decrypted = new Map();
const decode = text => Uint8Array.from(atob(text), c=>c.charCodeAt(0));

async function database() {
  return new Promise((resolve,reject) => {
    let finished=false;
    const timer=setTimeout(()=>{finished=true;reject(new Error('Preview storage took too long.'));},3000);
    const request=indexedDB.open(databaseName,1);
    request.onupgradeneeded=()=>request.result.createObjectStore('session');
    request.onsuccess=()=>{clearTimeout(timer);if(finished)request.result.close();else resolve(request.result);};
    request.onerror=()=>{clearTimeout(timer);reject(request.error);};
    request.onblocked=()=>{clearTimeout(timer);finished=true;reject(new Error('Preview storage is busy.'));};
  });
}
function storageTimeout(promise) {
  return new Promise((resolve,reject)=>{
    const timer=setTimeout(()=>reject(new Error('Preview storage took too long.')),3000);
    promise.then(value=>{clearTimeout(timer);resolve(value);},error=>{clearTimeout(timer);reject(error);});
  });
}
async function readSession() {
  const db=await database();
  try { return await storageTimeout(new Promise((resolve,reject)=>{const request=db.transaction('session').objectStore('session').get(config.version);request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error);})); }
  finally {db.close();}
}
async function saveSession(value) {
  const db=await database();
  try {await storageTimeout(new Promise((resolve,reject)=>{const transaction=db.transaction('session','readwrite');transaction.objectStore('session').clear();transaction.objectStore('session').put(value,config.version);transaction.oncomplete=resolve;transaction.onerror=()=>reject(transaction.error);transaction.onabort=()=>reject(transaction.error);}));}
  finally {db.close();}
}
const restored=readSession().then(value=>{if(!unlocked&&value?.expires>Date.now())session=value;}).catch(()=>{});
function boundedOperation(promise,milliseconds,message) {
  let timer;
  return Promise.race([promise,new Promise((_,reject)=>{timer=setTimeout(()=>reject(new Error(message)),milliseconds);})]).finally(()=>clearTimeout(timer));
}
async function decryptFile(path,key) {
  const item=config.files[path];
  const ciphertext=await boundedNetwork(async signal=>{
    let response;
    try {response=await fetch(new URL(config.base+'.sealed/'+item.file,self.location.origin),{cache:'force-cache',signal});}
    catch {throw new Error('Preview asset could not connect. Please retry. [NET]');}
    if(!response.ok)throw new Error('Preview asset could not download. Please reload. [NET]');
    return response.arrayBuffer();
  },15000,'Preview asset download took too long. Please retry. [NET]').catch(error=>{
    if(error.message.includes('[NET]'))throw error;
    throw new Error('Preview asset download was interrupted. Please retry. [NET]');
  });
  return boundedOperation(crypto.subtle.decrypt({name:'AES-GCM',iv:decode(item.iv)},key,ciphertext),8000,'Preview asset could not finish opening. Please retry. [CRYPTO]');
}
self.addEventListener('install',event=>event.waitUntil(self.skipWaiting()));
self.addEventListener('activate',event=>event.waitUntil(self.clients.claim()));
self.addEventListener('message',event=>{
  if(!event.ports[0])return;
  if(event.data?.type==='ping'){event.ports[0].postMessage({ok:true,version:config.version});return;}
  if(event.data?.type!=='unlock')return;
  event.waitUntil((async()=>{
    try {
      if(event.data.version && event.data.version!==config.version)throw new Error('The preview has been updated. Reload this page and enter the password again. [VERSION]');
      let key=event.data.key,index;
      if(event.data.keyBytes) {
        const bytes=new Uint8Array(event.data.keyBytes);
        try {
          if(bytes.byteLength!==32||!event.data.ciphertext?.byteLength)throw new Error('Preview key transfer was incomplete. Please retry. [OPEN]');
          key=await boundedOperation(crypto.subtle.importKey('raw',bytes,{name:'AES-GCM'},false,['decrypt']),3000,'Preview key transfer took too long. Please retry. [KEY]');
        } finally {bytes.fill(0);}
        // The page has already downloaded and validated this encrypted entry.
        // Validate it here too, without a second network request or key cloning.
        index=await boundedOperation(crypto.subtle.decrypt({name:'AES-GCM',iv:decode(config.files['index.html'].iv)},key,event.data.ciphertext),5000,'Preview entry could not finish opening. Please retry. [CRYPTO]');
      } else index=await decryptFile('index.html',key); // Existing unlocked tabs/tests.
      const activeSession={key,expires:Date.now()+12*60*60*1000};
      unlocked=true;session=activeSession;
      decrypted.clear();decrypted.set('index.html',Promise.resolve(index));
      event.ports[0].postMessage({ok:true,version:config.version});
      // Storage is optional for this visit. Keep the worker alive for a bounded
      // save, but never make a phone wait for IndexedDB before opening the site.
      await saveSession(activeSession).catch(()=>{});
    } catch(error) {
      const password=error.name==='OperationError';
      const code=password?'PASSWORD':/\[([A-Z]+)\]$/.exec(error.message)?.[1]||'OPEN';
      event.ports[0].postMessage({ok:false,code,error:password?'That password didn’t match. Please try again.':error.message.replace(/\s*\[[A-Z]+\]$/,'')});
    }
  })());
});
// Re-check only document navigations. A cached, unlocked old shell must not
// keep requesting ciphertext removed by a newer deployment.
let releaseProbe, checkedAt=0, checkedToken, newerRelease=false;
async function boundedNetwork(task, milliseconds=2500, message='Preview network timed out.') {
  const controller=new AbortController();let timer;
  try {return await Promise.race([task(controller.signal),new Promise((_,reject)=>{timer=setTimeout(()=>reject(new Error(message)),milliseconds);})]);}
  finally {clearTimeout(timer);controller.abort();}
}
async function hasNewRelease(url) {
  if(newerRelease)return true;
  const token=new URL(url).searchParams.get('v')||'';
  if(!releaseProbe&&(Date.now()-checkedAt>30000||checkedToken!==token)) {
    releaseProbe=boundedNetwork(async signal=>{
      const response=await fetch(config.base+'vault-config.js?check='+Date.now(),{cache:'no-store',signal});
      if(!response.ok)throw new Error('Manifest unavailable');
      const source=await response.text();
      const match=/^self\.VAULT\s*=\s*(\{[\s\S]*\})\s*;?\s*$/.exec(source);
      if(!match)throw new Error('Invalid manifest');
      const latest=JSON.parse(match[1]);
      if(typeof latest.version!=='string'||latest.base!==config.base)throw new Error('Invalid release');
      newerRelease=latest.version!==config.version;checkedAt=Date.now();checkedToken=token;
    }).catch(()=>{}).finally(()=>{releaseProbe=undefined;});
  }
  await releaseProbe;
  return newerRelease;
}
async function passwordPage() {
  try {return await boundedNetwork(async signal=>{
    const response=await fetch(config.base+'gate.html',{cache:'no-store',signal});
    return new Response(await response.arrayBuffer(),{status:response.status,headers:response.headers});
  },5000);}
  catch {return new Response('The preview could not connect. Please reload to try again.',{status:503,headers:{'Content-Type':'text/plain','Cache-Control':'no-store'}});}
}
async function respond(request,path) {
  if(!session)await restored;
  if(!session||session.expires<=Date.now()) {
    session=undefined;decrypted.clear();
    if(request.mode==='navigate') return passwordPage();
    return new Response('Preview password required',{status:401,headers:{'Cache-Control':'no-store'}});
  }
  if(request.mode==='navigate'&&await hasNewRelease(request.url))return passwordPage();
  if(path===''||path==='index.html'||(request.mode==='navigate'&&!config.files[path]))path='index.html';
  const item=config.files[path];
  if(!item)return new Response('Not found',{status:404});
  try {
    if(!decrypted.has(path))decrypted.set(path,decryptFile(path,session.key).catch(error=>{decrypted.delete(path);throw error;}));
    const buffer=await decrypted.get(path);
    const headers={'Content-Type':item.type,'Content-Length':String(buffer.byteLength),'Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Accept-Ranges':'bytes'};
    const range=request.headers.get('Range');
    if(range) {
      const match=/^bytes=(\d*)-(\d*)$/.exec(range);
      if(!match||(!match[1]&&!match[2]))return new Response(null,{status:416,headers:{'Content-Range':`bytes */${buffer.byteLength}`}});
      const start=match[1]?Number(match[1]):Math.max(0,buffer.byteLength-Number(match[2]));
      const end=match[1]&&match[2]?Math.min(Number(match[2]),buffer.byteLength-1):buffer.byteLength-1;
      if(start>end||start>=buffer.byteLength)return new Response(null,{status:416,headers:{'Content-Range':`bytes */${buffer.byteLength}`}});
      headers['Content-Range']=`bytes ${start}-${end}/${buffer.byteLength}`;
      headers['Content-Length']=String(end-start+1);
      return new Response(request.method==='HEAD'?null:buffer.slice(start,end+1),{status:206,headers});
    }
    return new Response(request.method==='HEAD'?null:buffer,{headers});
  } catch {return new Response('Unable to load preview asset. Please reload.',{status:503});}
}
self.addEventListener('fetch',event=>{
  const url=new URL(event.request.url);
  if(url.origin!==self.location.origin||!url.pathname.startsWith(config.base))return;
  const path=decodeURIComponent(url.pathname.slice(config.base.length));
  if(['gate.html','gate.js','sw.js','vault-config.js'].includes(path)||path.startsWith('.sealed/'))return;
  if(!['GET','HEAD'].includes(event.request.method))return;
  event.respondWith(respond(event.request,path));
});
