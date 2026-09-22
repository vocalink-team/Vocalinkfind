const SUPABASE_URL="https://qvxoxrzvxyyribqjnpkb.supabase.co";
const SUPABASE_KEY="sb_publishable_1zOA0YpTtJkNYsmm4zXxsA_wSJpdHKe";
const sb=window.supabase.createClient(SUPABASE_URL,SUPABASE_KEY);
const $=id=>document.getElementById(id);
const map=L.map("map",{zoomControl:false}).setView([35.681236,139.767125],5);
L.control.zoom({position:"bottomright"}).addTo(map);
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",{maxZoom:19,attribution:"&copy; OpenStreetMap contributors"}).addTo(map);
let session=null,watchId=null,myCircle=null,channel=null,markers=new Map();
function msg(t){$("message").textContent=t}
function setLocationStatus(t){$("locationStatus").textContent=t}
function markerFor(userId,loc,label){const p=[loc.latitude,loc.longitude];let m=markers.get(userId);if(!m){m=L.marker(p).addTo(map);markers.set(userId,m)}else m.setLatLng(p);m.bindPopup((label||"共有メンバー")+"<br><small>更新: "+new Date(loc.updated_at||Date.now()).toLocaleTimeString("ja-JP")+"</small>");return m}
async function refreshLocations(){if(!session)return;const {data,error}=await sb.from("user_locations").select("user_id,latitude,longitude,accuracy,updated_at");if(error){msg("位置情報の取得に失敗: "+error.message);return}for(const loc of data)markerFor(loc.user_id,loc,loc.user_id===session.user.id?"自分":"共有メンバー");if(data.length){const latest=data.slice().sort((a,b)=>new Date(b.updated_at)-new Date(a.updated_at))[0];$("lastUpdated").textContent="最終更新 "+new Date(latest.updated_at).toLocaleString("ja-JP")}}
async function publishPosition(pos){const c=pos.coords;const {error}=await sb.from("user_locations").upsert({user_id:session.user.id,latitude:c.latitude,longitude:c.longitude,accuracy:c.accuracy||null,updated_at:new Date().toISOString()});if(error)msg("位置情報の保存に失敗: "+error.message)}
function locationSuccess(pos){const c=pos.coords;const loc={latitude:c.latitude,longitude:c.longitude,accuracy:c.accuracy,updated_at:new Date().toISOString()};markerFor(session.user.id,loc,"自分").openPopup();if(myCircle)map.removeLayer(myCircle);myCircle=L.circle([c.latitude,c.longitude],{radius:c.accuracy||30,color:"#4f6b5a",fillColor:"#4f6b5a",fillOpacity:.1,weight:1}).addTo(map);map.setView([c.latitude,c.longitude],16);setLocationStatus("共有中");$("lastUpdated").textContent="自分の位置を更新 "+new Date().toLocaleTimeString("ja-JP");publishPosition(pos)}
function locationError(e){setLocationStatus("取得できません");msg(({1:"位置情報の利用が許可されていません",2:"位置情報を取得できませんでした",3:"位置情報の取得がタイムアウトしました"})[e.code]||"位置情報の取得に失敗しました")}
function startLocation(){if(!navigator.geolocation){msg("このブラウザは位置情報に対応していません");return}if(watchId!==null)return;setLocationStatus("取得中…");watchId=navigator.geolocation.watchPosition(locationSuccess,locationError,{enableHighAccuracy:true,timeout:15000,maximumAge:5000})}
function stopLocation(){if(watchId!==null){navigator.geolocation.clearWatch(watchId);watchId=null}setLocationStatus("停止中")}
function createShare(){const title=$("shareTitle").value.trim()||"位置情報共有";const hours=$("shareExpiry").value;const chars="ABCDEFGHJKLMNPQRSTUVWXYZ23456789";let code="VF-";for(let i=0;i<6;i++)code+=chars[Math.floor(Math.random()*chars.length)];const expires=hours?new Date(Date.now()+Number(hours)*3600000).toISOString():null;sb.from("location_shares").insert({owner_id:session.user.id,share_code:code,title,expires_at:expires}).select().single().then(({data,error})=>{if(error){msg("共有作成に失敗: "+error.message);return}$("shareCode").textContent=data.share_code;msg("共有コードを作成しました。相手にこのコードを伝えてください。")})}
async function joinShare(){const code=$("joinCode").value.trim();if(!code){msg("共有コードを入力してください");return}const {error}=await sb.rpc("join_location_share",{p_share_code:code});if(error){msg("参加できません: "+error.message);return}msg("共有に参加しました。");await refreshLocations()}
function subscribeRealtime(){if(channel)sb.removeChannel(channel);channel=sb.channel("vocalinkfind-locations").on("postgres_changes",{event:"*",schema:"public",table:"user_locations"},payload=>{if(payload.new?.user_id)markerFor(payload.new.user_id,payload.new,payload.new.user_id===session.user.id?"自分":"共有メンバー");$("lastUpdated").textContent="リアルタイム更新 "+new Date().toLocaleTimeString("ja-JP")}).subscribe()}
async function init(){const {data:{session:s}}=await sb.auth.getSession();session=s;if(!session){location.href="login.html";return}$("authStatus").textContent=session.user.email||"ログイン中";await refreshLocations();subscribeRealtime()}
$("startLocation").addEventListener("click",startLocation);
$("stopLocation").addEventListener("click",stopLocation);
$("createShare").addEventListener("click",createShare);
$("joinShare").addEventListener("click",joinShare);
$("logoutButton").addEventListener("click",async()=>{stopLocation();await sb.auth.signOut();location.href="login.html"});
init();