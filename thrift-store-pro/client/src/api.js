const API=import.meta.env.VITE_API_URL||'http://localhost:5000/api';
export async function api(path,options={}){
  const token=localStorage.getItem('thrift_token');
  const headers={'Content-Type':'application/json',...(options.headers||{})};
  if(token)headers.Authorization=`Bearer ${token}`;
  const r=await fetch(API+path,{...options,headers});
  const data=await r.json().catch(()=>({}));
  if(!r.ok)throw new Error(data.message||'Request failed');
  return data;
}
export {API};
