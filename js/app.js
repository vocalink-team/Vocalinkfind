const statusEl=document.getElementById("locationStatus");
const locationText=document.getElementById("locationText");
const accuracyText=document.getElementById("accuracyText");
const locateButton=document.getElementById("locateButton");

const map=L.map("map",{zoomControl:false}).setView([35.681236,139.767125],5);
L.control.zoom({position:"bottomright"}).addTo(map);
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",{maxZoom:19,attribution:"&copy; OpenStreetMap contributors"}).addTo(map);

let marker=null;
let circle=null;

function setStatus(text){statusEl.textContent=text}

function showLocation(position){
  const {latitude,longitude,accuracy}=position.coords;
  const point=[latitude,longitude];
  if(marker) map.removeLayer(marker);
  if(circle) map.removeLayer(circle);
  marker=L.marker(point).addTo(map).bindPopup("現在地").openPopup();
  circle=L.circle(point,{radius:accuracy,color:"#4f6b5a",fillColor:"#4f6b5a",fillOpacity:.12,weight:1}).addTo(map);
  map.setView(point,16);
  locationText.textContent=latitude.toFixed(5)+", "+longitude.toFixed(5);
  accuracyText.textContent="推定精度：約 "+Math.round(accuracy)+"m";
  setStatus("現在地を取得済み");
}

function handleError(error){
  const messages={1:"位置情報の利用が許可されていません",2:"位置情報を取得できませんでした",3:"位置情報の取得がタイムアウトしました"};
  setStatus("取得できません");
  locationText.textContent=messages[error.code]||"位置情報の取得に失敗しました";
  accuracyText.textContent="ブラウザの設定から位置情報を許可してください";
}

function locate(){
  if(!navigator.geolocation){
    setStatus("非対応");
    locationText.textContent="このブラウザは位置情報に対応していません";
    return;
  }
  locateButton.disabled=true;
  setStatus("取得中...");
  locationText.textContent="現在地を確認しています";
  accuracyText.textContent="しばらくお待ちください";
  navigator.geolocation.getCurrentPosition(showLocation,handleError,{enableHighAccuracy:true,timeout:15000,maximumAge:10000});
  locateButton.disabled=false;
}

locateButton.addEventListener("click",locate);
