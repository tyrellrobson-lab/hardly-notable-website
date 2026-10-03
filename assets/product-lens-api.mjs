import {reportSchema,validateShape,validateQuestions} from './product-lens-schema.mjs';
export async function requestAnalysis(config,{action,idea,answers={},consent,signal},fetchImpl=fetch) {
 if(config.mode!=='live'||consent!==true)throw Error('AI processing requires your consent.');
 const url=new URL(config.endpoint);
 if(url.protocol!=='https:'||url.username||url.password||url.search||url.hash||url.pathname!=='/analyze')throw Error('AI mode is unavailable.');
 const controller=new AbortController();const abort=()=>controller.abort();
 if(signal?.aborted)controller.abort();else signal?.addEventListener('abort',abort,{once:true});
 const timer=setTimeout(abort,28000);
 try {
  const response=await fetchImpl(url.href,{method:'POST',credentials:'omit',cache:'no-store',referrerPolicy:'no-referrer',signal:controller.signal,headers:{'Content-Type':'application/json'},body:JSON.stringify({action,idea,answers,consent:true})});
  if(!response.ok)throw Error(response.status===429?'Too many requests. Try again later.':'Analysis is unavailable. Your idea is still here; try again later.');
  const result=await response.json();
  return action==='questions'?validateQuestions(result):validateShape(result,reportSchema);
 } finally {clearTimeout(timer);signal?.removeEventListener('abort',abort);}
}
