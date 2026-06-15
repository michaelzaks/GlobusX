/* ===================== GlobusX game logic ===================== */
(function(){
"use strict";

/* ---------- country polygons (hit-testing only, not drawn) ---------- */
var COUNTRIES = topojson.feature(COUNTRIES_TOPO, COUNTRIES_TOPO.objects.countries).features;

/* ---------- city dataset (difficulty 1=famous .. 3=obscure) ---------- */
// r = state/province/oblast/region/etc. (shown under the city). Blank where the
// place IS its own region (capitals, city-states, regions named after the island).
var PLACES = [
  // tier 1 — world famous (capitals, non-capitals & famous islands)
  {c:"Paris",        r:"Île-de-France",   w:"France",         lat:48.85, lon:2.35,   d:1},
  {c:"London",       r:"England",         w:"United Kingdom", lat:51.51, lon:-0.13,  d:1},
  {c:"New York",     r:"New York",        w:"USA",            lat:40.71, lon:-74.01, d:1},
  {c:"Tokyo",        r:"",                w:"Japan",          lat:35.68, lon:139.69, d:1},
  {c:"Rome",         r:"Lazio",           w:"Italy",          lat:41.90, lon:12.50,  d:1},
  {c:"Cairo",        r:"",                w:"Egypt",          lat:30.04, lon:31.24,  d:1},
  {c:"Sydney",       r:"New South Wales", w:"Australia",      lat:-33.87,lon:151.21, d:1},
  {c:"Rio de Janeiro",r:"",               w:"Brazil",         lat:-22.91,lon:-43.17, d:1},
  {c:"Los Angeles",  r:"California",      w:"USA",            lat:34.05, lon:-118.24,d:1},
  {c:"San Francisco",r:"California",      w:"USA",            lat:37.77, lon:-122.42,d:1},
  {c:"Barcelona",    r:"Catalonia",       w:"Spain",          lat:41.39, lon:2.17,   d:1},
  {c:"Venice",       r:"Veneto",          w:"Italy",          lat:45.44, lon:12.32,  d:1},
  {c:"Dubai",        r:"",                w:"UAE",            lat:25.20, lon:55.27,  d:1},
  {c:"Istanbul",     r:"",                w:"Turkey",         lat:41.01, lon:28.98,  d:1},
  {c:"Hong Kong",    r:"",                w:"China",          lat:22.32, lon:114.17, d:1},
  {c:"Singapore",    r:"",                w:"Singapore",      lat:1.35,  lon:103.82, d:1},
  {c:"Cape Town",    r:"Western Cape",    w:"South Africa",   lat:-33.92,lon:18.42,  d:1},
  {c:"Mumbai",       r:"Maharashtra",     w:"India",          lat:19.08, lon:72.88,  d:1},
  {c:"Moscow",       r:"",                w:"Russia",         lat:55.76, lon:37.62,  d:1},
  {c:"Honolulu",     r:"Hawaii",          w:"USA",            lat:21.31, lon:-157.86,d:1},

  // tier 2 — moderate (cities & well-known islands)
  {c:"Lisbon",       r:"",                w:"Portugal",       lat:38.72, lon:-9.14,  d:2},
  {c:"Athens",       r:"Attica",          w:"Greece",         lat:37.98, lon:23.73,  d:2},
  {c:"Santorini",    r:"",                w:"Greece",         lat:36.39, lon:25.46,  d:2},
  {c:"Bali",         r:"",                w:"Indonesia",      lat:-8.34, lon:115.09, d:2},
  {c:"Sicily",       r:"",                w:"Italy",          lat:37.60, lon:14.02,  d:2},
  {c:"Marrakech",    r:"Marrakesh-Safi",  w:"Morocco",        lat:31.63, lon:-7.99,  d:2},
  {c:"Zanzibar",     r:"",                w:"Tanzania",       lat:-6.16, lon:39.20,  d:2},
  {c:"Havana",       r:"",                w:"Cuba",           lat:23.11, lon:-82.37, d:2},
  {c:"Cancún",       r:"Quintana Roo",    w:"Mexico",         lat:21.16, lon:-86.85, d:2},
  {c:"Reykjavík",    r:"",                w:"Iceland",        lat:64.15, lon:-21.94, d:2},
  {c:"Stockholm",    r:"",                w:"Sweden",         lat:59.33, lon:18.07,  d:2},
  {c:"St. Petersburg",r:"",               w:"Russia",         lat:59.93, lon:30.34,  d:2},
  {c:"Nairobi",      r:"",                w:"Kenya",          lat:-1.29, lon:36.82,  d:2},
  {c:"Lima",         r:"",                w:"Peru",           lat:-12.05,lon:-77.04, d:2},
  {c:"Hanoi",        r:"",                w:"Vietnam",        lat:21.03, lon:105.85, d:2},
  {c:"Vancouver",    r:"British Columbia",w:"Canada",         lat:49.28, lon:-123.12,d:2},
  {c:"Mallorca",     r:"Balearic Islands",w:"Spain",          lat:39.62, lon:2.99,   d:2},
  {c:"Phuket",       r:"",                w:"Thailand",       lat:7.88,  lon:98.39,  d:2},
  {c:"Crete",        r:"",                w:"Greece",         lat:35.24, lon:24.81,  d:2},
  {c:"Auckland",     r:"",                w:"New Zealand",    lat:-36.85,lon:174.76, d:2},
  {c:"Casablanca",   r:"Casablanca-Settat",w:"Morocco",       lat:33.57, lon:-7.59,  d:2},
  {c:"Cusco",        r:"",                w:"Peru",           lat:-13.53,lon:-71.97, d:2},
  {c:"Manila",       r:"Metro Manila",    w:"Philippines",    lat:14.60, lon:120.98, d:2},
  {c:"Budapest",     r:"",                w:"Hungary",        lat:47.50, lon:19.04,  d:2},
  {c:"Helsinki",     r:"Uusimaa",         w:"Finland",        lat:60.17, lon:24.94,  d:2},

  // tier 3 — obscure (remote cities & islands)
  {c:"Ulaanbaatar",  r:"",                w:"Mongolia",       lat:47.89, lon:106.91, d:3},
  {c:"Tashkent",     r:"",                w:"Uzbekistan",     lat:41.30, lon:69.24,  d:3},
  {c:"Astana",       r:"",                w:"Kazakhstan",     lat:51.17, lon:71.43,  d:3},
  {c:"Windhoek",     r:"Khomas",          w:"Namibia",        lat:-22.56,lon:17.08,  d:3},
  {c:"La Paz",       r:"",                w:"Bolivia",        lat:-16.50,lon:-68.15, d:3},
  {c:"Asunción",     r:"",                w:"Paraguay",       lat:-25.28,lon:-57.64, d:3},
  {c:"Tbilisi",      r:"",                w:"Georgia",        lat:41.72, lon:44.78,  d:3},
  {c:"Yerevan",      r:"",                w:"Armenia",        lat:40.18, lon:44.51,  d:3},
  {c:"Vientiane",    r:"",                w:"Laos",           lat:17.97, lon:102.63, d:3},
  {c:"Ljubljana",    r:"",                w:"Slovenia",       lat:46.05, lon:14.51,  d:3},
  {c:"Chișinău",     r:"",                w:"Moldova",        lat:47.01, lon:28.86,  d:3},
  {c:"Gaborone",     r:"",                w:"Botswana",       lat:-24.65,lon:25.91,  d:3},
  {c:"Bishkek",      r:"",                w:"Kyrgyzstan",     lat:42.87, lon:74.59,  d:3},
  {c:"Paramaribo",   r:"",                w:"Suriname",       lat:5.87,  lon:-55.17, d:3},
  {c:"Thimphu",      r:"",                w:"Bhutan",         lat:27.47, lon:89.64,  d:3},
  {c:"Dushanbe",     r:"",                w:"Tajikistan",     lat:38.56, lon:68.79,  d:3},
  {c:"Easter Island",r:"Valparaíso",      w:"Chile",          lat:-27.11,lon:-109.35,d:3},
  {c:"Bora Bora",    r:"",                w:"French Polynesia",lat:-16.50,lon:-151.74,d:3},
  {c:"Tahiti",       r:"",                w:"French Polynesia",lat:-17.54,lon:-149.57,d:3},
  {c:"Victoria",     r:"",                w:"Seychelles",     lat:-4.62, lon:55.45,  d:3},
  {c:"Galápagos Islands",r:"",            w:"Ecuador",        lat:-0.74, lon:-90.31, d:3},
  {c:"Faroe Islands",r:"",                w:"Denmark",        lat:62.01, lon:-6.77,  d:3},
  {c:"Canary Islands",r:"",               w:"Spain",          lat:28.29, lon:-16.62, d:3},
  {c:"Okinawa",      r:"",                w:"Japan",          lat:26.21, lon:127.68, d:3},
  {c:"Valletta",     r:"",                w:"Malta",          lat:35.90, lon:14.51,  d:3},
  {c:"Nuuk",         r:"",                w:"Greenland",      lat:64.18, lon:-51.69, d:3},
  {c:"Suva",         r:"",                w:"Fiji",           lat:-18.14,lon:178.44, d:3},
  {c:"Antananarivo", r:"",                w:"Madagascar",     lat:-18.88,lon:47.51,  d:3},

  // --- extra USA (round 1 is always USA; more variety) ---
  {c:"Chicago",      r:"Illinois",        w:"USA",            lat:41.88, lon:-87.63, d:1},
  {c:"Miami",        r:"Florida",         w:"USA",            lat:25.76, lon:-80.19, d:1},
  {c:"Seattle",      r:"Washington",      w:"USA",            lat:47.61, lon:-122.33,d:1},
  {c:"Boston",       r:"Massachusetts",   w:"USA",            lat:42.36, lon:-71.06, d:1},
  {c:"New Orleans",  r:"Louisiana",       w:"USA",            lat:29.95, lon:-90.07, d:1},
  {c:"Las Vegas",    r:"Nevada",          w:"USA",            lat:36.17, lon:-115.14,d:1},
  {c:"Denver",       r:"Colorado",        w:"USA",            lat:39.74, lon:-104.99,d:2},
  {c:"Nashville",    r:"Tennessee",       w:"USA",            lat:36.16, lon:-86.78, d:2},
  {c:"Austin",       r:"Texas",           w:"USA",            lat:30.27, lon:-97.74, d:2},
  {c:"Anchorage",    r:"Alaska",          w:"USA",            lat:61.22, lon:-149.90,d:2},
  {c:"Boise",        r:"Idaho",           w:"USA",            lat:43.62, lon:-116.20,d:3},
  {c:"Santa Fe",     r:"New Mexico",      w:"USA",            lat:35.69, lon:-105.94,d:3},
  {c:"Burlington",   r:"Vermont",         w:"USA",            lat:44.48, lon:-73.21, d:3},
  {c:"Fargo",        r:"North Dakota",    w:"USA",            lat:46.88, lon:-96.79, d:3},

  // --- more secondary / less-populous cities worldwide ---
  {c:"Buenos Aires", r:"",                w:"Argentina",      lat:-34.60,lon:-58.38, d:1},
  {c:"Porto",        r:"",                w:"Portugal",       lat:41.15, lon:-8.61,  d:2},
  {c:"Lyon",         r:"Auvergne-Rhône-Alpes",w:"France",     lat:45.76, lon:4.84,   d:2},
  {c:"Naples",       r:"Campania",        w:"Italy",          lat:40.85, lon:14.27,  d:2},
  {c:"Seville",      r:"Andalusia",       w:"Spain",          lat:37.39, lon:-5.99,  d:2},
  {c:"Cologne",      r:"North Rhine-Westphalia",w:"Germany",  lat:50.94, lon:6.96,   d:2},
  {c:"Perth",        r:"Western Australia",w:"Australia",     lat:-31.95,lon:115.86, d:2},
  {c:"Chengdu",      r:"Sichuan",         w:"China",          lat:30.57, lon:104.07, d:2},
  {c:"Jaipur",       r:"Rajasthan",       w:"India",          lat:26.91, lon:75.79,  d:2},
  {c:"Medellín",     r:"Antioquia",       w:"Colombia",       lat:6.24,  lon:-75.58, d:2},
  {c:"Quebec City",  r:"Quebec",          w:"Canada",         lat:46.81, lon:-71.21, d:2},
  {c:"Chiang Mai",   r:"",                w:"Thailand",       lat:18.79, lon:98.99,  d:2},
  {c:"Salvador",     r:"Bahia",           w:"Brazil",         lat:-12.97,lon:-38.51, d:2},
  {c:"Dublin",       r:"",                w:"Ireland",        lat:53.35, lon:-6.26,  d:2},
  {c:"Oslo",         r:"",                w:"Norway",         lat:59.91, lon:10.75,  d:2},
  {c:"Cebu",         r:"",                w:"Philippines",    lat:10.32, lon:123.89, d:2},

  // --- obscure / remote ---
  {c:"Ushuaia",      r:"Tierra del Fuego",w:"Argentina",      lat:-54.80,lon:-68.30, d:3},
  {c:"Hobart",       r:"Tasmania",        w:"Australia",      lat:-42.88,lon:147.33, d:3},
  {c:"Darwin",       r:"Northern Territory",w:"Australia",    lat:-12.46,lon:130.84, d:3},
  {c:"Kazan",        r:"Tatarstan",       w:"Russia",         lat:55.79, lon:49.12,  d:3},
  {c:"Vladivostok",  r:"Primorsky Krai",  w:"Russia",         lat:43.12, lon:131.89, d:3},
  {c:"Harbin",       r:"Heilongjiang",    w:"China",          lat:45.80, lon:126.53, d:3},
  {c:"Kochi",        r:"Kerala",          w:"India",          lat:9.93,  lon:76.27,  d:3},
  {c:"Oaxaca",       r:"",                w:"Mexico",         lat:17.07, lon:-96.72, d:3},
  {c:"Arequipa",     r:"",                w:"Peru",           lat:-16.41,lon:-71.54, d:3},
  {c:"Manaus",       r:"Amazonas",        w:"Brazil",         lat:-3.12, lon:-60.02, d:3},
  {c:"Galway",       r:"",                w:"Ireland",        lat:53.27, lon:-9.05,  d:3},
  {c:"Tromsø",       r:"",                w:"Norway",         lat:69.65, lon:18.96,  d:3},
  {c:"Winnipeg",     r:"Manitoba",        w:"Canada",         lat:49.90, lon:-97.14, d:3},
  {c:"Gothenburg",   r:"",                w:"Sweden",         lat:57.71, lon:11.97,  d:3},
  {c:"Bratislava",   r:"",                w:"Slovakia",       lat:48.15, lon:17.11,  d:3},
  {c:"Tirana",       r:"",                w:"Albania",        lat:41.33, lon:19.82,  d:3},
  {c:"Maputo",       r:"",                w:"Mozambique",     lat:-25.97,lon:32.57,  d:3},
  {c:"Apia",         r:"",                w:"Samoa",          lat:-13.83,lon:-171.77,d:3}
];

var COUNTRY_BONUS = 5;            // added (pre-multiplier) for guessing the right country

/* ---------- game modes ----------
   mult[i] = round multiplier; tier[i] = difficulty tier (1 easy .. 3 hard).
   Round 0 is always overridden with a (recognizable) USA location. */
var MODES = {
  q3:  { key:"q3",  name:"Layover",     stops:3,  max:600,
         mult:[1,2,3],                       tier:[1,2,3] },
  g5:  { key:"g5",  name:"Grand Tour",  stops:5,  max:1000,
         mult:[1,1,2,3,3],                   tier:[1,1,2,3,3] },
  x10: { key:"x10", name:"Globetrotter", stops:10, max:2000,
         mult:[1,1,1,2,2,2,2,3,3,3],         tier:[1,1,1,2,2,2,2,3,3,3] }
};

/* ---------- seeded RNG ---------- */
function hashStr(s){var h=2166136261>>>0; for(var i=0;i<s.length;i++){h^=s.charCodeAt(i); h=Math.imul(h,16777619);} return h>>>0;}
function mulberry32(a){return function(){a|=0; a=a+0x6D2B79F5|0; var t=Math.imul(a^a>>>15,1|a); t=t+Math.imul(t^t>>>7,61|t)^t; return ((t^t>>>14)>>>0)/4294967296;};}
function shuffle(arr,rng){var a=arr.slice(); for(var i=a.length-1;i>0;i--){var j=Math.floor(rng()*(i+1)); var t=a[i]; a[i]=a[j]; a[j]=t;} return a;}

function dateKey(){var d=new Date(); var m=("0"+(d.getMonth()+1)).slice(-2); var day=("0"+d.getDate()).slice(-2); return d.getFullYear()+"-"+m+"-"+day;}

function buildRounds(cfg, seedStr){
  var rng = mulberry32(hashStr(seedStr));
  var picks={1:shuffle(PLACES.filter(function(p){return p.d===1;}),rng),
            2:shuffle(PLACES.filter(function(p){return p.d===2;}),rng),
            3:shuffle(PLACES.filter(function(p){return p.d===3;}),rng)};
  var idx={1:0,2:0,3:0}, used={}, rounds=[];
  // round 1 is always a recognizable USA location
  var usPool=shuffle(PLACES.filter(function(p){return p.w==="USA";}),rng);
  var first=usPool.filter(function(p){return p.d===1;})[0] || usPool[0];
  rounds.push(first); if(first) used[first.c]=1;
  function nextOfTier(t){
    while(idx[t]<picks[t].length && used[picks[t][idx[t]].c]) idx[t]++;
    var p=picks[t][idx[t]++]; if(p) used[p.c]=1; return p;
  }
  for(var i=1;i<cfg.stops;i++){ rounds.push(nextOfTier(cfg.tier[i])); }
  return rounds;
}

/* ---------- scoring (calibrated, generous) ----------
   score = 100 * exp(-(km/2500)^1.28)
   ~ 19km->100, 68km->99, 216km->96, 266km->94, 566km->86, 1029km->72 */
var R_KM=6371, SC_Q=2500, SC_A=1.28;
function kmBetween(a,b){ return d3.geoDistance(a,b)*R_KM; }      // a,b = [lon,lat]
function scoreFor(km){
  var s=Math.round(100*Math.exp(-Math.pow(km/SC_Q, SC_A)));
  return Math.max(0,Math.min(100,s));
}
// which country contains [lon,lat] (or null)
function countryAt(lonlat){
  for(var i=0;i<COUNTRIES.length;i++){ if(d3.geoContains(COUNTRIES[i],lonlat)) return COUNTRIES[i]; }
  return null;
}

/* ===================== rotation / projection math ===================== */
// rotation stored as yaw,pitch (radians). center faces lon=-yaw, lat=pitch.
var yaw=Math.PI/18, pitch=-0.18*Math.PI/1, view={};
yaw=0.17; pitch=0.26; // pleasant default (Africa/Europe-ish)
var W=0,H=0,DPR=1,BASE=1,zoom=1,MINZ=0.85,MAXZ=7;
var cx=0, cy=0, R=1;

/* ---------- motion engine state ---------- */
var animsOn = !(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
var nowMs=0, lastTs=0, cloudOff=0, pulsePhase=0;
var loopRunning=false, raf=0;
var dragging=false, vYaw=0, vPitch=0, lastMoveTs=0, idleAllowed=false;
var IDLE_RATE=0.00006;          // rad/ms gentle spin before first touch
function clamp(v,a,b){ return v<a?a:v>b?b:v; }
function now(){ try{ return performance.now(); }catch(e){ return 0; } }

function toRad(d){return d*Math.PI/180;}
function spherePoint(lon,lat){ // degrees -> world unit vector
  var la=toRad(lat), lo=toRad(lon), cl=Math.cos(la);
  return [cl*Math.sin(lo), Math.sin(la), cl*Math.cos(lo)];
}
function worldToView(w){
  var cY=Math.cos(yaw), sY=Math.sin(yaw), cP=Math.cos(pitch), sP=Math.sin(pitch);
  var bx=w[0]*cY + w[2]*sY, by=w[1], bz=-w[0]*sY + w[2]*cY;     // Ry(yaw)
  return [bx, by*cP - bz*sP, by*sP + bz*cP];                    // Rx(pitch)
}
function project(lon,lat){ // -> {x,y,vis}
  var v=worldToView(spherePoint(lon,lat));
  return {x:cx+v[0]*R, y:cy-v[1]*R, vis:v[2]>0};
}
function invert(sx,sy){ // screen px (css) -> [lon,lat] or null
  var x=(sx-cx)/R, y=(cy-sy)/R, r2=x*x+y*y;
  if(r2>1) return null;
  var z=Math.sqrt(1-r2);
  // view -> world : Ry(-yaw)*Rx(-pitch)
  var cP=Math.cos(pitch), sP=Math.sin(pitch), cY=Math.cos(yaw), sY=Math.sin(yaw);
  var ax=x, ay=y*cP + z*sP, az=-y*sP + z*cP;                    // Rx(-pitch)
  var wx=ax*cY - az*sY, wy=ay, wz=ax*sY + az*cY;                // Ry(-yaw)
  var lat=Math.asin(Math.max(-1,Math.min(1,wy)));
  var lon=Math.atan2(wx,wz);
  return [lon*180/Math.PI, lat*180/Math.PI];
}

/* ===================== WebGL satellite globe ===================== */
var glc=document.getElementById("globe");
var gl=glc.getContext("webgl",{alpha:true,premultipliedAlpha:false,antialias:true});
var fx=document.getElementById("fx");
var ctx=fx.getContext("2d");
var glReady=false, earthReady=false, cloudReady=false, prog, uni={}, quadBuf, tex, ctex;
function texDone(){ return earthReady && cloudReady; }

var VERT="attribute vec2 p; void main(){ gl_Position=vec4(p,0.0,1.0); }";
var FRAG=[
"precision highp float;",
"uniform sampler2D uTex; uniform sampler2D uClouds;",
"uniform vec2 uRes; uniform float uR; uniform float uYaw; uniform float uPitch; uniform float uCloudOff;",
"const float PI=3.14159265358979;",
"void main(){",
"  float x=(gl_FragCoord.x - uRes.x*0.5)/uR;",
"  float y=(gl_FragCoord.y - uRes.y*0.5)/uR;",
"  float r2=x*x+y*y;",
"  if(r2>1.55){ discard; }",
"  vec3 L=normalize(vec3(-0.32,0.42,0.84));",            // sun direction
"  if(r2>1.0){",                                          // atmosphere halo (fresnel glow)
"    float t=(sqrt(r2)-1.0)/0.32;",
"    float a=exp(-t*3.4)*0.6;",
"    gl_FragColor=vec4(0.34,0.60,1.0,a);",
"    return;",
"  }",
"  float z=sqrt(1.0-r2);",
"  vec3 n=vec3(x,y,z);",                                  // surface normal (view space)
"  float cP=cos(uPitch), sP=sin(uPitch), cY=cos(uYaw), sY=sin(uYaw);",
"  float ax=x, ay=y*cP + z*sP, az=-y*sP + z*cP;",          // Rx(-pitch)
"  float wx=ax*cY - az*sY, wy=ay, wz=ax*sY + az*cY;",       // Ry(-yaw)
"  float lat=asin(clamp(wy,-1.0,1.0));",
"  float lon=atan(wx,wz);",
"  vec2 uv=vec2((lon+PI)/(2.0*PI), 0.5 - lat/PI);",
"  vec3 col=texture2D(uTex, uv).rgb;",
"  float ndl=dot(n,L);",
"  float day=smoothstep(-0.12,0.30,ndl);",                // day/night terminator
"  vec3 base=col*(0.34 + 0.92*day);",                     // night side dim & cool
"  base += col*vec3(-0.02,0.0,0.05)*(1.0-day)*0.6;",      // bluish night tint
"  float water=smoothstep(0.0,0.30, col.b - max(col.r,col.g));",
"  vec3 Hh=normalize(L+vec3(0.0,0.0,1.0));",
"  float spec=pow(max(dot(n,Hh),0.0),64.0)*water*day;",   // ocean sun-glint
"  base += spec*vec3(1.0,0.96,0.85)*0.85;",
"  float cl=texture2D(uClouds, vec2(fract(uv.x+uCloudOff), uv.y)).a;",
"  base = mix(base, vec3(1.0)*(0.45+0.65*day), cl*0.82);", // drifting clouds, lit
"  float fres=pow(1.0-z,3.0);",                            // inner atmosphere rim
"  base += fres*vec3(0.30,0.55,1.0)*0.55*day;",
"  base *= mix(1.0,0.80,smoothstep(0.60,1.0,sqrt(r2)));",  // limb darkening
"  gl_FragColor=vec4(base,1.0);",
"}"
].join("\n");

function compile(type,src){var s=gl.createShader(type); gl.shaderSource(s,src); gl.compileShader(s);
  if(!gl.getShaderParameter(s,gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s)); return s;}

var anisoExt = gl ? (gl.getExtension("EXT_texture_filter_anisotropic")||gl.getExtension("WEBKIT_EXT_texture_filter_anisotropic")||gl.getExtension("MOZ_EXT_texture_filter_anisotropic")) : null;
var maxAniso = anisoExt ? gl.getParameter(anisoExt.MAX_TEXTURE_MAX_ANISOTROPY_EXT) : 1;
function mkTex(unit){
  var t=gl.createTexture(); gl.activeTexture(gl.TEXTURE0+unit); gl.bindTexture(gl.TEXTURE_2D,t);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.REPEAT);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
  // trilinear (mipmap) minification + linear magnification; mips set after image loads
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
  if(anisoExt) gl.texParameterf(gl.TEXTURE_2D,anisoExt.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(8,maxAniso));
  // 1x1 placeholder so sampling is valid before load
  gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,1,1,0,gl.RGBA,gl.UNSIGNED_BYTE,new Uint8Array([0,0,0,0]));
  return t;
}
function loadInto(unit,t,src,fmt,cb){
  var img=new Image();
  img.onload=function(){
    gl.activeTexture(gl.TEXTURE0+unit); gl.bindTexture(gl.TEXTURE_2D,t);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,false);
    gl.texImage2D(gl.TEXTURE_2D,0,fmt,fmt,gl.UNSIGNED_BYTE,img);
    // power-of-two textures -> generate mipmaps for crisp, alias-free sampling at all zooms
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR_MIPMAP_LINEAR);
    cb(true); draw();
  };
  img.onerror=function(){ cb(false); draw(); };
  img.src=src;
}

function initGL(){
  if(!gl) return false;
  prog=gl.createProgram();
  gl.attachShader(prog,compile(gl.VERTEX_SHADER,VERT));
  gl.attachShader(prog,compile(gl.FRAGMENT_SHADER,FRAG));
  gl.linkProgram(prog);
  if(!gl.getProgramParameter(prog,gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(prog));
  gl.useProgram(prog);
  quadBuf=gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER,quadBuf);
  gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1, 1,-1, -1,1, -1,1, 1,-1, 1,1]),gl.STATIC_DRAW);
  var loc=gl.getAttribLocation(prog,"p"); gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc,2,gl.FLOAT,false,0,0);
  ["uRes","uR","uYaw","uPitch","uCloudOff","uTex","uClouds"].forEach(function(k){ uni[k]=gl.getUniformLocation(prog,k); });
  gl.uniform1i(uni.uTex,0); gl.uniform1i(uni.uClouds,1);
  gl.enable(gl.BLEND); gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);
  tex=mkTex(0); ctex=mkTex(1);
  glReady=true;
  loadInto(0,tex,EARTH_TEX,gl.RGB,function(ok){ earthReady=true; maybeHideLoader(); });
  loadInto(1,ctex,CLOUDS_TEX,gl.RGBA,function(ok){ cloudReady=true; maybeHideLoader(); });
  return true;
}
function maybeHideLoader(){ if(texDone()){ var l=document.getElementById("loader"); if(l) l.classList.add("gone"); startLoop(); } }

function drawGlobe(){
  if(!glReady) return;
  gl.viewport(0,0,glc.width,glc.height);
  gl.clearColor(0,0,0,0); gl.clear(gl.COLOR_BUFFER_BIT);
  if(!texDone()) return;
  gl.useProgram(prog);
  gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D,tex);
  gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D,ctex);
  gl.uniform2f(uni.uRes,glc.width,glc.height);
  gl.uniform1f(uni.uR,R*DPR);
  gl.uniform1f(uni.uYaw,yaw); gl.uniform1f(uni.uPitch,pitch);
  gl.uniform1f(uni.uCloudOff,cloudOff);
  gl.drawArrays(gl.TRIANGLES,0,6);
}

/* ---------- embedded display font ---------- */
try{ var _ff=new FontFace("Space Grotesk","url("+FONT_DATA+")",{weight:"400 700",display:"swap"});
  _ff.load().then(function(f){ document.fonts.add(f); draw(); }).catch(function(){}); }catch(e){}

/* ---------- 2D overlay: pins, answer, great-circle line ---------- */
function pin(lonlat,color,dropT){
  var p=project(lonlat[0],lonlat[1]); if(!p.vis) return;
  dropT=(dropT==null)?1:clamp(dropT,0,1);
  // ease-out-back for a little overshoot, plus a vertical drop
  var e = dropT>=1?1 : (function(t){var c1=1.70158,c3=c1+1;return 1+c3*Math.pow(t-1,3)+c1*Math.pow(t-1,2);})(dropT);
  var yoff = -34*(1-Math.min(1,dropT*dropT*(3-2*dropT)));
  var sc = 0.45+0.55*e, h=24, w=8;
  ctx.save();
  ctx.translate(p.x, p.y+yoff); ctx.scale(sc,sc);
  // soft shadow on the surface
  ctx.beginPath(); ctx.ellipse(0,1,5,2.2,0,0,2*Math.PI); ctx.fillStyle="rgba(0,0,0,.28)"; ctx.fill();
  ctx.beginPath();
  ctx.moveTo(0,0);
  ctx.quadraticCurveTo(-w,-h*0.55,-w*0.45,-h*0.78);
  ctx.arc(0,-h*0.78,w*0.62,Math.PI*0.78,Math.PI*0.22,true);
  ctx.quadraticCurveTo(w,-h*0.55,0,0);
  ctx.closePath();
  ctx.fillStyle=color; ctx.fill();
  ctx.lineWidth=1.5; ctx.strokeStyle="rgba(0,0,0,.45)"; ctx.stroke();
  ctx.beginPath(); ctx.arc(0,-h*0.78,w*0.26,0,2*Math.PI);
  ctx.fillStyle="rgba(90,120,180,.95)"; ctx.fill();
  ctx.restore();
}
function answerDot(lonlat,scale){
  var p=project(lonlat[0],lonlat[1]); if(!p.vis) return;
  var rad=8*(scale==null?1:scale); if(rad<=0.2) return;
  // expanding pulse ring (loops while revealed)
  if(scale>=0.99){
    var ph=(pulsePhase%1100)/1100;
    ctx.beginPath(); ctx.arc(p.x,p.y, 9+ph*20, 0, 2*Math.PI);
    ctx.lineWidth=2; ctx.strokeStyle="rgba(255,90,106,"+(0.5*(1-ph))+")"; ctx.stroke();
  }
  ctx.beginPath(); ctx.arc(p.x,p.y,rad+3,0,2*Math.PI); ctx.fillStyle="rgba(255,90,106,.25)"; ctx.fill();
  ctx.beginPath(); ctx.arc(p.x,p.y,rad,0,2*Math.PI);
  ctx.fillStyle=css("--answer"); ctx.fill();
  ctx.lineWidth=2.5; ctx.strokeStyle="#fff"; ctx.stroke();
}
function slerp(a,b,t){ // a,b world unit vectors
  var dot=Math.max(-1,Math.min(1,a[0]*b[0]+a[1]*b[1]+a[2]*b[2]));
  var om=Math.acos(dot); if(om<1e-6) return a;
  var s0=Math.sin((1-t)*om)/Math.sin(om), s1=Math.sin(t*om)/Math.sin(om);
  return [a[0]*s0+b[0]*s1, a[1]*s0+b[1]*s1, a[2]*s0+b[2]*s1];
}
function greatCircle(g,a,frac){
  frac=(frac==null)?1:Math.max(0,Math.min(1,frac));
  var A=spherePoint(g[0],g[1]), B=spherePoint(a[0],a[1]);
  var N=Math.max(1,Math.ceil(64*frac));
  ctx.beginPath(); var drawing=false;
  for(var i=0;i<=N;i++){
    var t=Math.min(frac, i/64);
    var w=slerp(A,B,t), v=worldToView(w);
    var sx=cx+v[0]*R, sy=cy-v[1]*R, vis=v[2]>0;
    if(vis){ if(!drawing){ctx.moveTo(sx,sy); drawing=true;} else ctx.lineTo(sx,sy); }
    else drawing=false;
  }
  ctx.setLineDash([6,6]); ctx.lineWidth=2.5; ctx.strokeStyle="rgba(255,255,255,.92)"; ctx.stroke();
  ctx.setLineDash([]);
}

function css(v){ return getComputedStyle(document.documentElement).getPropertyValue(v).trim(); }

function drawOverlay(){
  ctx.clearRect(0,0,W,H);
  if(state.revealed){
    var g=state.guess, a=[state.place.lon,state.place.lat];
    var t=(state.revealT==null)?1:state.revealT;
    greatCircle(g,a,t);
    pin(g,css("--guess"), clamp(t/0.33,0,1));
    answerDot(a, clamp((t-0.5)/0.5,0,1));
  } else if(state.guess){
    pin(state.guess,css("--guess"),1);
  }
}

/* ---------- starfield ---------- */
var starC=document.getElementById("stars"), starX=starC?starC.getContext("2d"):null, STARS=[], starW=0,starH=0;
function buildStars(){
  if(!starX) return;
  var dpr=Math.min(window.devicePixelRatio||1,2);
  starW=window.innerWidth; starH=window.innerHeight;
  starC.width=Math.round(starW*dpr); starC.height=Math.round(starH*dpr);
  starX.setTransform(dpr,0,0,dpr,0,0);
  var rng=mulberry32(1337), n=Math.round(starW*starH/9000);
  STARS=[];
  for(var i=0;i<n;i++){ STARS.push({x:rng()*starW,y:rng()*starH,r:rng()*1.3+0.2,b:rng()*0.6+0.3,tw:rng()*2+0.5,ph:rng()*6.28}); }
}
function renderStars(ts){
  if(!starX) return;
  starX.clearRect(0,0,starW,starH);
  for(var i=0;i<STARS.length;i++){ var s=STARS[i];
    var a=animsOn? s.b*(0.55+0.45*Math.sin(ts*0.001*s.tw+s.ph)) : s.b;
    starX.globalAlpha=a; starX.beginPath(); starX.arc(s.x,s.y,s.r,0,6.2832);
    starX.fillStyle= s.r>1.1 ? "#bcd2ff" : "#ffffff"; starX.fill();
  }
  starX.globalAlpha=1;
}

/* ---------- render + main loop ---------- */
function draw(){ drawGlobe(); drawOverlay(); }   // immediate render (used on resize/zoom/etc.)

function loop(ts){
  if(!loopRunning) return;
  nowMs=ts;
  var dt = lastTs ? Math.min(60, ts-lastTs) : 16; lastTs=ts;
  if(rv){                                          // reveal animation
    if(!rv.t0) rv.t0=ts;
    var u=Math.min(1,(ts-rv.t0)/rv.dur), e=u<0.5?2*u*u:1-Math.pow(-2*u+2,2)/2;
    yaw=rv.sy+rv.dyaw*e; pitch=rv.sp+(rv.tPitch-rv.sp)*e; zoom=rv.sz+(rv.tZoom-rv.sz)*e; R=BASE*zoom;
    state.revealT=clamp((e-0.15)/0.85,0,1);
    if(u>=1) finalizeReveal();
  } else if(!dragging){
    if(Math.abs(vYaw)>1e-6 || Math.abs(vPitch)>1e-6){     // inertia
      yaw+=vYaw*dt; pitch=clamp(pitch+vPitch*dt,-1.49,1.49);
      var fr=Math.pow(0.0022, dt/1000); vYaw*=fr; vPitch*=fr;
    } else if(idleAllowed && animsOn && state.active && !state.revealed){  // gentle idle spin
      yaw += IDLE_RATE*dt;
    }
  }
  if(animsOn){ cloudOff += dt*0.0000035; pulsePhase += dt; }
  renderStars(ts);
  drawGlobe(); drawOverlay();
  raf=requestAnimationFrame(loop);
}
function startLoop(){ if(loopRunning) return; loopRunning=true; lastTs=0; raf=requestAnimationFrame(loop); }
function stopLoop(){ loopRunning=false; if(raf) cancelAnimationFrame(raf); raf=0; }
document.addEventListener("visibilitychange",function(){ if(!document.hidden && loopRunning){ lastTs=0; raf=requestAnimationFrame(loop); } });

/* ---------- sizing ---------- */
function resize(){
  var rect=fx.parentNode.getBoundingClientRect();
  DPR=Math.min(window.devicePixelRatio||1,2);
  W=rect.width; H=rect.height;
  glc.width=Math.round(W*DPR); glc.height=Math.round(H*DPR);
  fx.width=Math.round(W*DPR); fx.height=Math.round(H*DPR);
  ctx.setTransform(DPR,0,0,DPR,0,0);
  BASE=Math.min(W,H)/2-14; cx=W/2; cy=H/2; R=BASE*zoom;
  buildStars();
  if(starX) renderStars(now());
  draw();
}
function applyZoom(z){ zoom=Math.max(MINZ,Math.min(MAXZ,z)); R=BASE*zoom; draw(); }

/* ===================== interaction (drag to spin, tap = commit) ===================== */
var pointers={}, downAt=null, last=null, moved=0, pinchStart=null;
function rel(e){ var r=fx.getBoundingClientRect(); return [e.clientX-r.left, e.clientY-r.top]; }

fx.addEventListener("pointerdown",function(e){
  try{ fx.setPointerCapture(e.pointerId); }catch(_){}
  audioResume();
  pointers[e.pointerId]=rel(e);
  if(Object.keys(pointers).length===1){
    downAt=rel(e); last=downAt.slice(); moved=0; dragging=true; idleAllowed=false;
    vYaw=0; vPitch=0; lastMoveTs=now(); fx.classList.add("dragging");
  }
});
fx.addEventListener("pointermove",function(e){
  if(!(e.pointerId in pointers)) return;
  pointers[e.pointerId]=rel(e);
  var ids=Object.keys(pointers);
  if(ids.length>=2){
    var p0=pointers[ids[0]], p1=pointers[ids[1]];
    var dist=Math.hypot(p0[0]-p1[0],p0[1]-p1[1]);
    if(pinchStart) applyZoom(zoom*(dist/pinchStart));
    pinchStart=dist; moved=999; vYaw=0; vPitch=0; return;
  }
  if(downAt && !rv){
    var p=rel(e), dx=p[0]-last[0], dy=p[1]-last[1];
    last=p; moved=Math.max(moved,Math.hypot(p[0]-downAt[0],p[1]-downAt[1]));
    var t=now(), dtm=Math.max(8, t-lastMoveTs); lastMoveTs=t;
    var dYaw=dx/R, dPitch=dy/R;
    yaw+=dYaw; pitch=clamp(pitch+dPitch,-1.49,1.49);
    vYaw=dYaw/dtm; vPitch=dPitch/dtm;     // px velocity -> rad/ms for inertia
    if(!loopRunning) draw();
  }
});
function endPointer(e){
  if(!(e.pointerId in pointers)) return;
  var wasSingle=Object.keys(pointers).length===1;
  delete pointers[e.pointerId];
  if(Object.keys(pointers).length<2) pinchStart=null;
  if(Object.keys(pointers).length===0){
    dragging=false; fx.classList.remove("dragging");
    if(wasSingle && moved<6){
      vYaw=0; vPitch=0;
      if(!state.revealed && state.active){
        var p=rel(e), ll=invert(p[0],p[1]);
        if(ll){ state.guess=ll; commit(); }   // auto-commit: no Submit step
      }
    }
    downAt=null;
  }
}
fx.addEventListener("pointerup",endPointer);
fx.addEventListener("pointercancel",endPointer);
fx.addEventListener("wheel",function(e){ e.preventDefault(); applyZoom(zoom*(e.deltaY<0?1.12:0.89)); },{passive:false});
document.getElementById("zin").onclick=function(){ applyZoom(zoom*1.3); };
document.getElementById("zout").onclick=function(){ applyZoom(zoom/1.3); };

/* ---------- reveal animation (driven by main loop): spin to frame both + grow the "how far" line ---------- */
var rv=null, revealTimer=null;
function startReveal(onDone){
  var g=state.guess, a=[state.place.lon,state.place.lat];
  var mid=d3.geoInterpolate(g,a)(0.5);
  var sep=d3.geoDistance(g,a);
  rv={ sy:yaw, sp:pitch, sz:zoom,
       tYaw:toRad(-mid[0]), tPitch:toRad(mid[1]),
       tZoom:clamp(1.7-sep*0.55, MINZ, 2.4),
       t0:0, dur:animsOn?950:1, onDone:onDone, done:false };
  rv.dyaw=((rv.tYaw-rv.sy+Math.PI)%(2*Math.PI)+2*Math.PI)%(2*Math.PI)-Math.PI;
  vYaw=vPitch=0; idleAllowed=false;
  if(revealTimer) clearTimeout(revealTimer);
  revealTimer=setTimeout(finalizeReveal, (animsOn?950:1)+260);   // safety net (rAF paused when tab hidden)
  startLoop();
  if(!animsOn) finalizeReveal();
}
function finalizeReveal(){
  if(!rv || rv.done) return; rv.done=true;
  if(revealTimer){ clearTimeout(revealTimer); revealTimer=null; }
  yaw=rv.tYaw; pitch=rv.tPitch; zoom=rv.tZoom; R=BASE*zoom; state.revealT=1;
  var cb=rv.onDone; rv=null;
  drawGlobe(); drawOverlay();
  if(cb) cb();
}

/* ===================== game state / flow ===================== */
var state={ rounds:[], i:0, guess:null, revealed:false, active:false, results:[], total:0, practice:false };

var el={
  city:document.getElementById("city"), where:document.getElementById("where"),
  mult:document.getElementById("mult"), round:document.getElementById("roundlabel"),
  score:document.getElementById("scorelabel"), result:document.getElementById("result"),
  hint:document.getElementById("hint"), date:document.getElementById("datelabel")
};
var actionBtn=document.getElementById("action");

/* ---------- count-up tween (rAF + setTimeout safety) ---------- */
function countUp(elm,to,dur,prefix){
  prefix=prefix||"";
  var from=parseInt((elm.textContent||"").replace(/[^0-9-]/g,""))||0;
  if(!animsOn || from===to){ elm.textContent=prefix+to; return; }
  var t0=null, done=false;
  function fin(){ if(done) return; done=true; elm.textContent=prefix+to; }
  function st(ts){ if(done) return; if(t0===null)t0=ts;
    var u=Math.min(1,(ts-t0)/dur), e=1-Math.pow(1-u,3);
    elm.textContent=prefix+Math.round(from+(to-from)*e);
    if(u<1) requestAnimationFrame(st); else fin(); }
  requestAnimationFrame(st);
  setTimeout(fin, dur+140);
}

/* ---------- progress dots ---------- */
var dotsEl=document.getElementById("dots");
function buildDots(n){ dotsEl.innerHTML=""; for(var i=0;i<n;i++){ var d=document.createElement("div"); d.className="dot"; dotsEl.appendChild(d); } }
buildDots(5);
function updateDots(cur){ var ds=dotsEl.children; for(var i=0;i<ds.length;i++){ ds[i].className="dot"+(i<cur?" done":"")+(i===cur?" cur":""); } }

/* ---------- audio (hand-synthesized, opt-in toggle) ---------- */
var actx=null, soundOn=true, master=null, sndBtn=document.getElementById("snd");
function audioInit(){ if(actx) return; try{ actx=new (window.AudioContext||window.webkitAudioContext)(); master=actx.createGain(); master.gain.value=0.45; master.connect(actx.destination); }catch(e){ actx=null; } }
function audioResume(){ audioInit(); if(actx && actx.state==="suspended"){ try{ actx.resume(); }catch(e){} } }
function tone(freq,start,dur,type,vol){
  if(!actx||!soundOn) return;
  var o=actx.createOscillator(), g=actx.createGain(), t=actx.currentTime+start;
  o.type=type||"sine"; o.frequency.value=freq; o.connect(g); g.connect(master);
  g.gain.setValueAtTime(0.0001,t); g.gain.exponentialRampToValueAtTime(vol||0.25,t+0.012);
  g.gain.exponentialRampToValueAtTime(0.0001,t+dur);
  o.start(t); o.stop(t+dur+0.03);
}
function sfxClick(){ tone(520,0,0.07,"triangle",0.14); }
function sfxCommit(){ tone(523,0,0.10,"sine",0.18); tone(784,0.05,0.16,"sine",0.16); }
function sfxScore(ds){ var b=420+ds*4.2; tone(b,0,0.16,"sine",0.2); tone(b*1.5,0.07,0.22,"sine",0.14); if(ds>=90) tone(b*2,0.14,0.26,"sine",0.12); }
function sfxResults(){ [523,659,784,1047].forEach(function(f,i){ tone(f,i*0.11,0.32,"sine",0.18); }); }
function haptic(ms){ if(animsOn && navigator.vibrate){ try{ navigator.vibrate(ms); }catch(e){} } }
function setSound(on){ soundOn=on; sndBtn.textContent=on?"🔊":"🔇"; sndBtn.classList.toggle("off",!on); }
sndBtn.onclick=function(){ audioResume(); setSound(!soundOn); if(soundOn) sfxClick(); };

/* ---------- button ripple ---------- */
function ripple(btn,e){
  if(!animsOn) return;
  var r=btn.getBoundingClientRect(), s=document.createElement("span"); s.className="rip";
  var d=Math.max(r.width,r.height); s.style.width=s.style.height=d+"px";
  s.style.left=((e&&e.clientX!=null?e.clientX-r.left:r.width/2))+"px";
  s.style.top=((e&&e.clientY!=null?e.clientY-r.top:r.height/2))+"px";
  btn.appendChild(s); setTimeout(function(){ s.remove(); },560);
}

function hideHint(){ el.hint.style.opacity=0; }
function showHint(t){ el.hint.textContent=t; el.hint.style.opacity=1; }

var promptEl=document.getElementById("prompt");
function loadRound(){
  var p=state.rounds[state.i];
  state.place=p; state.guess=null; state.revealed=false; state.active=true; state.revealT=0;
  idleAllowed=false; vYaw=0; vPitch=0;          // start still — only moves when dragged
  yaw=0.17; pitch=0.26; zoom=1; R=BASE*zoom;     // reset to a neutral, motionless view
  el.city.textContent=p.c;
  el.where.textContent=(p.r?p.r+", ":"")+p.w;
  el.round.textContent=(state.i+1)+" / "+state.cfg.stops;
  updateDots(state.i);
  var m=state.cfg.mult[state.i];
  el.mult.textContent="×"+m;
  el.mult.className="mult"+(m===2?" x2":m===3?" x3":"");
  el.result.innerHTML="";
  hideScorePop();
  actionBtn.style.display="none";
  showHint("Drag to spin • tap the location to lock in your guess");
  // re-trigger prompt entrance animation
  promptEl.classList.remove("enter"); void promptEl.offsetWidth; promptEl.classList.add("enter");
  draw();
}
function bumpScore(to){
  el.score.classList.remove("bump"); void el.score.offsetWidth; el.score.classList.add("bump");
  countUp(el.score, to, 650);
}

function commit(){
  var p=state.place, a=[p.lon,p.lat], g=state.guess;
  var km=kmBetween(g,a);
  var ds=scoreFor(km);
  var ac=countryAt(a);                                   // answer's country polygon
  var inCountry = ac ? d3.geoContains(ac,g) : false;
  // country bonus applies only if the round would otherwise score below 90
  var bonus = (inCountry && ds<90) ? COUNTRY_BONUS : 0;
  var pre = ds + bonus;                                  // original round score, out of 100
  var mult=state.cfg.mult[state.i];
  var pts=pre*mult;
  var r={place:p, km:km, ds:ds, bonus:bonus, pre:pre, mult:mult, pts:pts, inCountry:inCountry};
  state.revealed=true; state.active=false; state.revealT=0;
  state.results.push(r);
  hideHint();
  el.result.innerHTML="";
  audioResume(); sfxCommit(); haptic(12);
  startReveal(function(){
    state.total+=pts; bumpScore(state.total);
    showScorePop(r); sfxScore(r.ds); haptic(r.ds>=90?[10,40,18]:8);
    afterReveal();
  });
}

function afterReveal(){
  if(state.i>=state.cfg.stops-1){ state.autoTimer=setTimeout(finish,1700); }   // last round: show results automatically
  else { actionBtn.style.display=""; actionBtn.disabled=false; actionBtn.textContent="Next place →";
    actionBtn.classList.remove("enter"); void actionBtn.offsetWidth; actionBtn.classList.add("enter"); }
}

/* ---------- score popup ---------- */
var pop=document.getElementById("scorepop");
function popBand(ds){ return ds>=90?"g":ds>=70?"y":ds>=40?"o":"r"; }
function showScorePop(r){
  var dist = r.km<10 ? r.km.toFixed(1) : Math.round(r.km).toLocaleString();
  var badge = r.ds>=98 ? "Bullseye" : r.ds>=90 ? "Brilliant" : "";
  pop.className="scorepop band-"+popBand(r.ds);
  pop.innerHTML='<div class="pbig">+0</div>'+
    (badge?'<div class="pbadge">'+badge+'</div>':'')+
    '<div class="psub">'+r.ds+' / 100'+(r.bonus?' · <span class="bonus">+'+r.bonus+' right country</span>':'')+(r.mult>1?' · ×'+r.mult:'')+'</div>'+
    '<div class="pdist">'+dist+' km away</div>';
  void pop.offsetWidth;            // restart transition
  pop.classList.add("show");
  countUp(pop.querySelector(".pbig"), r.pts, 700, "+");
}
function hideScorePop(){ pop.classList.remove("show"); }

actionBtn.onclick=function(e){
  if(!state.revealed) return;
  ripple(actionBtn,e); sfxClick();
  state.i++; loadRound();
};
document.getElementById("zin").addEventListener("click",function(){ sfxClick(); });
document.getElementById("zout").addEventListener("click",function(){ sfxClick(); });

/* ---------- results + persistence ---------- */
function storeKey(){ return "globusx-"+dateKey()+"-"+state.mode; }

function finish(){
  if(!state.practice){
    try{ localStorage.setItem(storeKey(), JSON.stringify({
      total:state.total,
      results:state.results.map(function(r){return {c:r.place.c,ds:r.ds,bonus:r.bonus,pre:r.pre,mult:r.mult,pts:r.pts,km:Math.round(r.km)};})
    })); }catch(e){}
  }
  showResults();
}

function bandEmoji(ds){ if(ds>=90)return"🟩"; if(ds>=70)return"🟨"; if(ds>=40)return"🟧"; if(ds>0)return"🟥"; return"⬛"; }
function buildShare(results,total){
  return "GlobusX · "+state.cfg.name+" "+dateKey()+"\n"+total+"/"+state.cfg.max+"\n"+results.map(function(r){return bandEmoji(r.ds);}).join("")+"\n#GlobusX";
}

/* ===================== leaderboard (simulated daily field) ===================== */
var LB_NAMES=["Atlas","MarcoP","Nomad88","Cartographer","Polaris","GeoQueen","Magellan","Wanderlust",
  "CompassRose","Sherpa","TerraNova","Voyager","Drake","AuroraB","Sundance","Meridian","Odyssey",
  "Pathfinder","Zephyr","GlobeGus","Pinpoint","Latitude","Trailblazer","Cartwheel","Vespucci","DueNorth"];
function lbField(modeKey){
  var cfg=MODES[modeKey], rng=mulberry32(hashStr("lb-"+dateKey()+"-"+modeKey));
  var n=120+Math.floor(rng()*90), scores=[];
  for(var i=0;i<n;i++){
    var b=(rng()+rng()+rng())/3;                  // bell curve ~0.5
    scores.push(Math.max(0,Math.min(cfg.max, Math.round(cfg.max*(0.16+0.68*b)))));
  }
  scores.sort(function(a,b){return b-a;});         // descending
  var sum=0; for(var j=0;j<n;j++) sum+=scores[j];
  // names for the top entries (deterministic)
  var nm=shuffle(LB_NAMES,rng);
  return {scores:scores, n:n, avg:Math.round(sum/n), names:nm};
}
function lbPercentile(field,score){
  var below=0; for(var i=0;i<field.n;i++){ if(field.scores[i]<score) below++; }
  return Math.max(1,Math.min(99,Math.round(100*below/field.n)));
}
function ordinal(n){ var s=["th","st","nd","rd"], v=n%100; return n+(s[(v-20)%10]||s[v]||s[0]); }
function savedTotal(modeKey){
  try{ var o=JSON.parse(localStorage.getItem("globusx-"+dateKey()+"-"+modeKey)); return o&&typeof o.total==="number"?o.total:null; }catch(e){ return null; }
}

function populateLeaderboard(){
  var body=document.getElementById("lb-body"); body.innerHTML="";
  ["q3","g5","x10"].forEach(function(mk){
    var cfg=MODES[mk], f=lbField(mk), you=savedTotal(mk);
    var sec=document.createElement("div"); sec.className="lbmode";
    var h='<div class="lbhead"><span class="nm">'+cfg.name+'</span><span class="av">avg <b>'+f.avg.toLocaleString()+'</b> / '+cfg.max.toLocaleString()+' · '+f.n+' players</span></div>';
    for(var i=0;i<5;i++){
      h+='<div class="lbrow"><span class="rk">'+(i+1)+'</span><span class="nm2">'+f.names[i%f.names.length]+'</span><span class="sc">'+f.scores[i].toLocaleString()+'</span></div>';
    }
    if(you!=null){ h+='<div class="lbyou">You scored <b>'+you.toLocaleString()+'</b> — '+ordinal(lbPercentile(f,you))+' percentile</div>'; }
    else { h+='<div class="lbyou">Not played yet today</div>'; }
    sec.innerHTML=h; body.appendChild(sec);
  });
}
function openLeaderboard(){ populateLeaderboard(); document.getElementById("leaderboard").classList.add("open"); }
document.getElementById("lbtn").onclick=function(e){ audioResume(); ripple(this,e); sfxClick(); openLeaderboard(); };
document.getElementById("lb-close").onclick=function(e){ ripple(this,e); sfxClick(); document.getElementById("leaderboard").classList.remove("open"); };

function showResults(){
  hideScorePop(); stopLoop(); setInGame(false);
  var results=state.results, total=state.total, max=state.cfg.max, pct=total/max;
  document.getElementById("res-of").textContent=" / "+max.toLocaleString();
  var rating = pct>=0.85?"World explorer 🌟":pct>=0.65?"Seasoned traveler ✈️":pct>=0.40?"Getting your bearings 🧭":"Keep exploring 🗺️";
  document.getElementById("res-title").textContent=(state.practice?"Practice complete — ":state.cfg.name+" — ")+rating;
  var field=lbField(state.mode), perc=lbPercentile(field,total);
  document.getElementById("res-rank").innerHTML="Today's average <b>"+field.avg.toLocaleString()+"</b> · you're in the <b>"+ordinal(perc)+"</b> percentile";
  // emoji band, each square pops in
  var share=document.getElementById("res-share");
  share.innerHTML=results.map(function(r,i){ return '<span style="animation-delay:'+(0.35+i*0.11)+'s">'+bandEmoji(r.ds)+'</span>'; }).join("");
  var bd=document.getElementById("res-breakdown"); bd.innerHTML="";
  results.forEach(function(r,i){
    var km=r.km<10?r.km.toFixed(1)+" km":Math.round(r.km).toLocaleString()+" km";
    var sub=km+' away'+(r.bonus?' · +'+r.bonus+' country':'');
    var row=document.createElement("div"); row.className="row"; row.style.animationDelay=(0.5+i*0.09)+"s";
    row.innerHTML='<div class="badge">'+(i+1)+'</div>'+
      '<div class="pl"><div class="c">'+r.place.c+', '+r.place.w+'</div><div class="d">'+sub+'</div></div>'+
      '<div class="pp">'+r.pre+'</div>';
    bd.appendChild(row);
  });
  state.shareText=buildShare(results,total);
  var rt=document.getElementById("res-total"); rt.textContent="0";
  document.getElementById("results").classList.add("open");
  setTimeout(function(){ countUp(rt,total,1000); audioResume(); sfxResults(); }, 360);
}

var shareBtn=document.getElementById("share");
shareBtn.onclick=function(e){
  ripple(shareBtn,e); audioResume(); sfxClick();
  var txt=state.shareText||"";
  function ok(){ toast("Copied results!"); haptic(10);
    var old=shareBtn.textContent; shareBtn.textContent="Copied ✓"; shareBtn.classList.add("ok");
    setTimeout(function(){ shareBtn.textContent=old; shareBtn.classList.remove("ok"); },1600); }
  if(navigator.clipboard && navigator.clipboard.writeText){
    navigator.clipboard.writeText(txt).then(ok,function(){ legacyCopy(txt); ok(); });
  } else { legacyCopy(txt); ok(); }
};
function legacyCopy(t){ var ta=document.createElement("textarea"); ta.value=t; document.body.appendChild(ta); ta.select(); try{document.execCommand("copy");}catch(e){} document.body.removeChild(ta); }

var toastEl=document.getElementById("toast"), toastT=null;
function toast(msg){ toastEl.textContent=msg; toastEl.classList.add("show"); clearTimeout(toastT); toastT=setTimeout(function(){toastEl.classList.remove("show");},1600); }

/* ---------- start ---------- */
function clearTimers(){
  if(state.autoTimer){ clearTimeout(state.autoTimer); state.autoTimer=null; }
  rv=null; if(revealTimer){ clearTimeout(revealTimer); revealTimer=null; }
}
function beginGame(modeKey, practice){
  var cfg=MODES[modeKey]; if(!cfg) return;
  state.mode=modeKey; state.cfg=cfg;
  if(!practice){
    var saved=null; try{ saved=JSON.parse(localStorage.getItem(storeKey())); }catch(e){}
    if(saved && saved.results){ showSaved(cfg, saved); return; }   // already played this mode today
  }
  clearTimers();
  // one fixed set of locations per day, per mode (same set even when replayed)
  state.rounds=buildRounds(cfg, dateKey()+"-"+modeKey);
  state.i=0; state.results=[]; state.total=0; state.practice=!!practice;
  el.score.textContent="0";
  buildDots(cfg.stops);
  document.getElementById("results").classList.remove("open");
  document.getElementById("intro").classList.remove("open");
  setInGame(true);
  yaw=0.17; pitch=0.26; applyZoom(1);
  startLoop();
  loadRound();
}
function showSaved(cfg, saved){
  state.rounds=buildRounds(cfg, dateKey()+"-"+cfg.key);
  state.results=saved.results.map(function(r,i){return {place:state.rounds[i],km:r.km,ds:r.ds,bonus:r.bonus,pre:r.pre,mult:r.mult,pts:r.pts};});
  state.total=saved.total; state.practice=false;
  buildDots(cfg.stops); el.score.textContent=saved.total;
  document.getElementById("intro").classList.remove("open");
  setInGame(false);
  draw(); showResults();
}
function openModes(){ clearTimers(); stopLoop(); setInGame(false); document.getElementById("results").classList.remove("open"); document.getElementById("leaderboard").classList.remove("open"); document.getElementById("intro").classList.add("open"); }

/* ---------- back button + leave confirmation ---------- */
var backBtn=document.getElementById("back");
function setInGame(on){ backBtn.style.display = on ? "" : "none"; }
backBtn.onclick=function(e){ ripple(backBtn,e); sfxClick(); document.getElementById("confirm").classList.add("open"); };
document.getElementById("confirm-cancel").onclick=function(e){ ripple(this,e); sfxClick(); document.getElementById("confirm").classList.remove("open"); };
document.getElementById("confirm-leave").onclick=function(e){ ripple(this,e); sfxClick(); leaveGame(); };
function leaveGame(){
  clearTimers(); stopLoop();
  state.active=false; state.revealed=false; state.guess=null;
  hideScorePop(); setInGame(false);
  document.getElementById("confirm").classList.remove("open");
  document.getElementById("results").classList.remove("open");
  document.getElementById("intro").classList.add("open");
}

var params=new URLSearchParams(location.search);
var forcePractice = params.has("free")||params.has("practice");
el.date.textContent=dateKey();

[].forEach.call(document.querySelectorAll(".modebtn"),function(b){
  b.onclick=function(e){ audioResume(); ripple(b,e); sfxClick(); beginGame(b.getAttribute("data-mode"), forcePractice); };
});
document.getElementById("practice").onclick=function(e){ ripple(this,e); sfxClick(); beginGame(state.mode, true); };
document.getElementById("modes").onclick=function(e){ ripple(this,e); sfxClick(); openModes(); };

window.addEventListener("resize",resize);
initGL();
resize();
// first load shows the mode picker (intro overlay is open by default in markup)

})();
