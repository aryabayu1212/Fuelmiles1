const CAT=[
{n:'Oli Mesin',c:'Mesin',i:2000},{n:'Filter Oli',c:'Mesin',i:6000},{n:'Filter Udara',c:'Mesin',i:12000},{n:'Busi',c:'Pengapian',i:8000},
{n:'Kampas Rem Depan',c:'Rem',i:12000},{n:'Kampas Rem Belakang',c:'Rem',i:12000},{n:'Minyak Rem',c:'Rem',i:24000},
{n:'Rantai',c:'Drivetrain',i:15000},{n:'Gear Depan',c:'Drivetrain',i:15000},{n:'Gear Belakang',c:'Drivetrain',i:15000},{n:'Set Rantai & Gear',c:'Drivetrain',i:15000},
{n:'Kampas Kopling',c:'Clutch',i:20000},{n:'Per Kopling',c:'Clutch',i:20000},{n:'Coolant',c:'Pendingin',i:24000},
{n:'V-Belt',c:'CVT',i:20000},{n:'Roller CVT',c:'CVT',i:12000},{n:'Kampas Ganda',c:'CVT',i:20000},
{n:'Ban Depan',c:'Ban',i:15000},{n:'Ban Belakang',c:'Ban',i:12000},{n:'Aki / Battery',c:'Kelistrikan',i:24000}];

const KEY='fuelmiles_v3',OLD='fuelmiles_v2',$=id=>document.getElementById(id);
/* BR[pabrikan]=[[hue,sat,light], 'Model|cc|tipe;...'] tipe: m=matic/CVT, x=manual */
const BR={
Honda:[[352,78,54],'BeAT|110|m;Scoopy|110|m;Genio|110|m;Vario 125|125|m;Vario 160|160|m;PCX 160|160|m;ADV 160|160|m;Forza 250|250|m;Revo|110|x;Supra X 125|125|x;CB150 Verza|150|x;CB150R StreetFire|150|x;CBR150R|150|x;CRF150L|150|x;CBR250RR|250|x'],
Yamaha:[[218,82,60],'Mio M3|125|m;Fazzio|125|m;Gear|125|m;Lexi|125|m;Fino|125|m;Aerox 155|155|m;NMAX 155|155|m;XMAX|250|m;Jupiter Z1|115|x;MX King 150|150|x;Vixion|155|x;MT-15|155|x;R15|155|x;WR155R|155|x;MT-25|250|x;R25|250|x'],
Suzuki:[[200,85,52],'Nex II|115|m;Address|115|m;Avenis|125|m;Burgman Street|125|m;Smash FI|115|x;Satria F150|150|x;GSX-R150|150|x;GSX-S150|150|x;V-Strom 250 SX|250|x;GSX-8S|776|x'],
Kawasaki:[[96,70,50],'KLX 150|150|x;W175|175|x;Ninja 250|249|x;Ninja ZX-25R|249|x;Z250|249|x;Ninja 400|399|x;Versys 650|649|x;Z900|948|x'],
Vespa:[[165,60,46],'LX 125|125|m;Primavera 150|155|m;Sprint 150|155|m;GTS Super 150|155|m'],
TVS:[[255,70,66],'Ntorq 125|125|m;Apache RTR 160 4V|160|x;Apache RR 310|312|x'],
KTM:[[24,95,54],'Duke 200|200|x;Duke 250|248|x;Duke 390|373|x;RC 200|200|x;RC 390|373|x;390 Adventure|373|x'],
Benelli:[[44,85,52],'TNT 135|135|x;Leoncino 250|249|x;TRK 251|249|x;302S|300|x;Imperiale 400|374|x'],
'Royal Enfield':[[140,40,48],'Hunter 350|349|x;Classic 350|349|x;Meteor 350|349|x;Himalayan 450|452|x;Interceptor 650|648|x']};
const modelsOf=b=>(BR[b]?BR[b][1]:'').split(';').filter(Boolean).map(x=>{const[n,c,t]=x.split('|');return{n,cc:+c,cvt:t==='m'}});
/* Color theory: 1 hue brand -> netral bertint (60%), permukaan (30%), aksen (10%),
   analogus (+30deg) untuk glow, komplementer (+180deg) untuk detail kecil */
const H=(h,s,l,a)=>`hsl(${((h%360)+360)%360} ${s}% ${l}%${a!=null?' / '+a:''})`;
function rgb(h,s,l){h=((h%360)+360)%360;s/=100;l/=100;const k=n=>(n+h/30)%12,a=s*Math.min(l,1-l),f=n=>l-a*Math.max(-1,Math.min(k(n)-3,9-k(n),1));return[f(0),f(8),f(4)].map(x=>Math.round(x*255))}
const lum=c=>{const[r,g,b]=c.map(v=>{v/=255;return v<=.03928?v/12.92:((v+.055)/1.055)**2.4});return .2126*r+.7152*g+.0722*b};
function theme(pv){
  const k=pv!==undefined?pv:data.bike?.brand,[h,s,l]=BR[k]?BR[k][0]:[18,100,58],st=document.documentElement.style,set=(a,v)=>st.setProperty(a,v);
  set('--ink',H(h,16,7));set('--panel',H(h,13,10.5));set('--panel2',H(h,12,14));set('--line',H(h,11,20));set('--muted',H(h,9,62));set('--text',H(h,20,94));
  set('--accent',H(h,s,l));set('--accent2',H(h+30,s,Math.min(l+8,66)));set('--comp',H(h+180,Math.max(s-15,45),64));
  set('--glow',H(h,s,l,.2));set('--glow2',H(h+30,s,l+6,.14));set('--nav',H(h,15,8,.95));
  set('--on',lum(rgb(h,s,l))>.3?H(h,40,8):'#fff');
  document.querySelector('meta[name=theme-color]').content='#'+rgb(h,16,7).map(v=>v.toString(16).padStart(2,'0')).join('');
  $('sw').innerHTML=[['--ink',5],['--panel2',3],['--accent2',1.2],['--accent',1.6],['--comp',1.2]].map(([c,f])=>`<i style="flex:${f};background:var(${c})"></i>`).join('');
  $('swn').textContent=`Netral bertint (60%) dan permukaan (30%) mengikuti hue ${h}°. Aksen (10%) di ${h}°, analogus ${(h+30)%360}° untuk glow, komplementer ${(h+180)%360}° untuk satuan km.`;
}
bikeBrand.innerHTML='<option value="">Lainnya / manual</option>'+Object.keys(BR).map(k=>`<option>${k}</option>`).join('');
function fillModels(){bikeModel.innerHTML='<option value="">Pilih model...</option>'+modelsOf(bikeBrand.value).map(m=>`<option value="${m.n}">${m.n} · ${m.cc} cc</option>`).join('')}
bikeBrand.onchange=()=>{fillModels();theme(bikeBrand.value)};
bikeModel.onchange=()=>{const m=modelsOf(bikeBrand.value).find(x=>x.n===bikeModel.value);if(m)bikeName.value=bikeBrand.value+' '+m.n};
/* DB = banyak motor; `data` = view ke motor aktif, jadi kode lama tetap jalan */
let DB=null,svcEdit=null,bikeEdit=null,pendingPhoto='',skipW=0;
try{DB=JSON.parse(localStorage.getItem(KEY)||'null')}catch(e){}
if(!DB){DB={bikes:[],active:null};let o=null;try{o=JSON.parse(localStorage.getItem(OLD)||'null')}catch(e){}
  if(o&&o.bike){const id='b'+Date.now().toString(36);DB.bikes.push({id,info:o.bike,parts:o.parts||[],services:o.services||[]});DB.active=id}} // migrasi v2
const cur=()=>DB.bikes.find(x=>x.id===DB.active)||null;
const data={get bike(){return cur()?cur().info:null},get parts(){return cur()?cur().parts:[]},set parts(v){if(cur())cur().parts=v},get services(){return cur()?cur().services:[]},set services(v){if(cur())cur().services=v}};
const uid=()=>(crypto.randomUUID?crypto.randomUUID():Date.now().toString(36)+Math.random().toString(36).slice(2));
const nf=x=>Number(x||0).toLocaleString('id-ID');
const rp=x=>new Intl.NumberFormat('id-ID',{style:'currency',currency:'IDR',maximumFractionDigits:0}).format(x||0);
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
const dt=d=>new Date(d+'T00:00:00').toLocaleDateString('id-ID',{day:'numeric',month:'short',year:'numeric'});
const save=()=>{localStorage.setItem(KEY,JSON.stringify(DB));render()};

function show(id){
  document.querySelectorAll('.screen').forEach(x=>x.classList.toggle('on',x.id===id));
  document.querySelectorAll('nav button').forEach(x=>x.classList.toggle('on',x.dataset.s===id));
  $('app').querySelector('main').scrollTop=0;render();
}
/* sheets share the Android back button via history */
function openModal(id){
  if(id==='partModal'){fillCat();if(data.bike)$('partKm').value=data.bike.km}
  if(id==='bikeModal'&&bikeEdit){const b=bikeEdit.info;bikeBrand.value=b.brand||'';fillModels();bikeModel.value=b.model||'';$('bikeName').value=b.name||'';$('bikeYear').value=b.year||'';$('bikePlate').value=b.plate||'';$('bikeKm').value=b.km??'';$('bikeDaily').value=b.dailyKm??''}
  if(id==='serviceModal'){svcEdit=null;$('svcTitle').textContent='Catat servis';$('svcDate').value=new Date().toISOString().slice(0,10);if(data.bike)$('svcKm').value=data.bike.km}
  $(id).classList.add('show');history.pushState({m:id},'');
}
function closeModal(){if(document.querySelector('.modal.show'))history.back()}
window.addEventListener('popstate',()=>{document.querySelectorAll('.modal.show').forEach(m=>m.classList.remove('show'));theme()});
document.querySelectorAll('.modal').forEach(m=>m.addEventListener('click',e=>{if(e.target===m)closeModal()}));
let tt;function toast(t){const e=$('toast');e.textContent=t;e.classList.add('show');clearTimeout(tt);tt=setTimeout(()=>e.classList.remove('show'),2200)}

function saveBike(e){e.preventDefault();
  const mm=modelsOf(bikeBrand.value).find(x=>x.n===bikeModel.value);
  const info={photo:pendingPhoto,name:bikeName.value.trim(),brand:bikeBrand.value,model:mm?mm.n:'',cc:mm?mm.cc:0,cvt:mm?mm.cvt:null,year:bikeYear.value,plate:bikePlate.value.trim(),km:Number(bikeKm.value),dailyKm:Number(bikeDaily.value)||0};
  if(bikeEdit)bikeEdit.info=info;else{const id='b'+uid();DB.bikes.push({id,info,parts:[],services:[]});DB.active=id}
  save();closeModal();toast('Data motor disimpan')}
function fillCat(){const s=$('partCat'),v=data.bike?.cvt,ok=c=>v==null?true:v?!['Clutch','Drivetrain'].includes(c):c!=='CVT'; // matic: tanpa rantai/kopling manual; manual: tanpa CVT
  s.innerHTML='<option value="">Pilih sparepart...</option>'+CAT.map((p,i)=>ok(p.c)?`<option value="${i}">${esc(p.n)} · ${esc(p.c)}</option>`:'').join('')}
$('partCat').addEventListener('change',()=>{const p=CAT[Number($('partCat').value)];
  $('catInfo').textContent=p?`Interval bawaan: ${nf(p.i)} km. Boleh kamu sesuaikan.`:'';if(p)$('partInt').value=p.i});
function savePart(e){e.preventDefault();
  if(!data.bike){closeModal();setTimeout(openBike,60);toast('Tambahkan motor dulu');return}
  const p=CAT[Number($('partCat').value)];if(!p){toast('Pilih sparepart dulu');return}
  data.parts.push({id:uid(),name:p.n,category:p.c,installKm:Number(partKm.value),interval:Number(partInt.value||p.i),cost:Number(partCost.value||0),note:partNote.value.trim()});
  save();e.target.reset();$('catInfo').textContent='';closeModal();toast(p.n+' ditambahkan')}
function saveService(e){e.preventDefault();
  if(!data.bike){closeModal();toast('Tambahkan motor dulu');return}
  const rec={name:svcName.value.trim(),km:Number(svcKm.value),cost:Number(svcCost.value||0),date:svcDate.value,note:svcNote.value.trim()};
  if(svcEdit)Object.assign(data.services.find(x=>x.id===svcEdit)||{},rec);else data.services.push({id:uid(),...rec});
  if(data.bike&&Number(svcKm.value)>data.bike.km)data.bike.km=Number(svcKm.value);
  save();e.target.reset();closeModal();toast(svcEdit?'Servis diperbarui':'Servis dicatat');svcEdit=null}
/* hapus butuh dua kali tap, tanpa confirm() */
let armed=null;
function del(btn,kind,id){
  if(armed!==id){armed=id;btn.textContent='Tap lagi untuk hapus';btn.classList.add('armed');setTimeout(()=>{if(armed===id){armed=null;render()}},2500);return}
  armed=null;if(kind==='bikes'){DB.bikes=DB.bikes.filter(x=>x.id!==id);if(DB.active===id)DB.active=DB.bikes[0]?.id||null}else data[kind]=data[kind].filter(x=>x.id!==id);save();toast('Dihapus')}

function pState(p){const km=data.bike?.km??0,used=Math.max(0,km-p.installKm),rem=p.interval-used,pct=Math.min(100,used/p.interval*100);
  const cls=rem<=0?'crit':rem<=p.interval*.2?'warn':'ok';
  return{rem,pct,cls,label:rem<=0?'Lewat jadwal':nf(Math.round(rem))+' km lagi',col:`var(--${cls})`}}
const dep=p=>p.cost>0&&p.interval>0?p.cost/p.interval:0; // D_k = harga / umur km
function sf(){const d=data.bike?.dailyKm||0,pr=data.parts.filter(p=>p.cost>0),b=pr.map(p=>({n:p.name,dk:dep(p)})).sort((x,y)=>y.dk-x.dk),s=b.reduce((a,x)=>a+x.dk,0);
  return{d,sumD:s,sf:d*s,b,ready:d>0&&pr.length>0}} // SF = d · ΣD_k
function partHTML(p,full){const s=pState(p);
  return`<div class="part"><div class="ph"><div><div class="pn">${esc(p.name)}</div><div class="pm">Pasang ${nf(p.installKm)} km · tiap ${nf(p.interval)} km${p.note?' · '+esc(p.note):''}</div></div><span class="badge ${s.cls}">${s.label}</span></div>
  <div class="gauge"><u style="width:${s.pct}%;background:${s.col}"></u></div>
  ${(p.cost||full)?`<div class="pf"><span>${p.cost?rp(p.cost)+' · '+rp(dep(p))+'/km':''}</span>${full?`<button class="del" onclick="del(this,'parts','${p.id}')">Hapus</button>`:''}</div>`:''}</div>`}
const svcRow=(s,full)=>`<div class="card"><div class="svc"><div><b>${esc(s.name)}</b><div class="hist">${dt(s.date)} · ${nf(s.km)} km${s.note?' · '+esc(s.note):''}</div></div><div class="p">${rp(s.cost)}</div></div>${full?`<div class="acts"><button class="del" onclick="editSvc('${s.id}')">Edit</button><button class="del" onclick="del(this,'services','${s.id}')">Hapus</button></div>`:''}</div>`;

function render(){
  theme();
  $('switch').innerHTML=DB.bikes.length>1?DB.bikes.map(x=>`<button class="${x.id===DB.active?'on':''}" onclick="pick('${x.id}')">${esc(x.info.name)}</button>`).join(''):'';
  $('welcome').classList.toggle('on',!DB.bikes.length&&!skipW);
  const b=data.bike,S=sf();
  const digits=String(Math.floor(b?b.km:0)).padStart(6,'0').slice(-6);
  const lead=digits.length-String(Math.floor(b?b.km:0)).length;
  const odo=digits.split('').map((c,i)=>`<i class="${!b||i<6-String(Math.floor(b.km)).length?'dim':''}">${c}</i>`).join('')+'<b>km</b>';
  hero.innerHTML=b?`<div class="cluster${b.photo?' ph':''}"${b.photo?` style="background-image:linear-gradient(180deg,#0000 10%,var(--ink) 100%),url('${b.photo}')"`:''}><div class="cl-name">${esc(b.name)}</div><div class="cl-sub">${[b.brand,b.cc?b.cc+' cc':'',b.plate,b.year].filter(Boolean).map(esc).join(' · ')||'Motor aktif'}</div><div class="odo">${odo}</div></div>`
    :`<div class="empty"><b style="color:var(--text);font-size:16px">Belum ada motor</b><br>Isi model dan odometer untuk mulai.<button class="btn" onclick="openBike()">＋ Tambah motor</button></div>`;
  hParts.textContent=data.parts.length;hSvc.textContent=data.services.length;
  const why=!b?'Tambahkan motor dulu.':!S.d?'Isi jarak harian di data motor.':'Tambahkan sparepart beserta harganya di Garasi.';
  if(S.ready){hSF.textContent=rp(S.sf)+' / hari';hSFn.textContent=`Dari ${nf(S.d)} km/hari dan depresiasi ${S.b.length} sparepart berbiaya.`}
  else{hSF.textContent='Belum ada data';hSFn.textContent=why}
  const pr=data.parts.filter(p=>pState(p).rem<=p.interval*.2).sort((x,y)=>pState(x).rem-pState(y).rem);
  prio.innerHTML=pr.length?pr.slice(0,3).map(p=>partHTML(p,false)).join(''):`<div class="empty">${b?'Belum ada sparepart yang mendekati jadwal ganti.':'Tambahkan motor dan sparepart dulu.'}</div>`;
  const sv=data.services.slice().sort((x,y)=>y.km-x.km);
  recent.innerHTML=sv.length?sv.slice(0,3).map(s=>svcRow(s,false)).join(''):'<div class="empty">Belum ada riwayat servis.</div>';
  gVeh.innerHTML=DB.bikes.length?DB.bikes.map(x=>{const i=x.info;return`<div class="card bk${x.id===DB.active?' act':''}" onclick="pick('${x.id}')"><div class="th"${i.photo?` style="background-image:url('${i.photo}')"`:''}>${i.photo?'':'🏍'}</div><div style="flex:1;min-width:0"><div class="pn">${esc(i.name)}</div><div class="pm num">${nf(i.km)} km${i.plate?' · '+esc(i.plate):''}${x.id===DB.active?' · aktif':''}</div><div class="acts" onclick="event.stopPropagation()"><button class="del" onclick="openBike('${x.id}')">Edit</button><button class="del" onclick="del(this,'bikes','${x.id}')">Hapus</button></div></div></div>`}).join(''):'<div class="empty" style="margin-bottom:10px">Belum ada motor.</div>';
  parts.innerHTML=data.parts.length?data.parts.map(p=>partHTML(p,true)).join(''):'<div class="empty">Belum ada sparepart. Tambahkan satu untuk mulai memantau umurnya.</div>';
  const tot=data.services.reduce((a,s)=>a+s.cost,0);
  sN.textContent=data.services.length;sC.textContent=rp(tot);
  if(b&&data.services.length){const dist=Math.max(0,b.km-Math.min(b.km,...data.services.map(s=>s.km)));sK.textContent=dist?rp(tot/dist)+' / km':'Belum cukup data'}else sK.textContent='Belum ada data';
  if(S.ready){sSF.textContent=rp(S.sf)+' / hari';sSFn.textContent=`SF = d · ΣD_k, dengan d = ${nf(S.d)} km/hari, ΣD_k = ${rp(S.sumD)}/km, D_k = harga ÷ umur km.`;sSFb.innerHTML=S.b.map(x=>`${esc(x.n)}: ${rp(x.dk)}/km`).join('<br>')}
  else{sSF.textContent='Belum ada data';sSFn.textContent=why;sSFb.innerHTML=''}
  svcList.innerHTML=data.services.length?data.services.slice().sort((x,y)=>new Date(y.date)-new Date(x.date)).map(s=>svcRow(s,true)).join(''):'<div class="empty">Belum ada servis yang dicatat.</div>';
}

/* WebView tidak mendukung download blob; pakai share sheet / clipboard */
async function exportData(){
  const txt=JSON.stringify(DB,null,2);
  try{
    const f=new File([txt],'fuelmiles-data.json',{type:'application/json'});
    if(navigator.canShare&&navigator.canShare({files:[f]})){await navigator.share({files:[f],title:'FuelMiles'});return}
    if(navigator.share){await navigator.share({title:'FuelMiles',text:txt});return}
  }catch(e){if(e.name==='AbortError')return}
  try{await navigator.clipboard.writeText(txt);toast('JSON disalin ke clipboard')}
  catch(e){const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([txt],{type:'application/json'}));a.download='fuelmiles-data.json';a.click()}
}
function resetData(){
  const b=$('resetBtn');
  if(b.dataset.arm!=='1'){b.dataset.arm='1';b.textContent='Tap lagi untuk hapus semua';setTimeout(()=>{b.dataset.arm='';b.textContent='Hapus semua data'},3000);return}
  b.dataset.arm='';b.textContent='Hapus semua data';
  localStorage.removeItem(KEY);localStorage.removeItem(OLD);DB={bikes:[],active:null};render();toast('Semua data dihapus');
}
/* motor: tambah/edit, foto, ganti aktif; servis: edit */
function openBike(id){bikeEdit=id?DB.bikes.find(x=>x.id===id):null;$('bikeModal').querySelector('form').reset();bikeBrand.value='';fillModels();pendingPhoto=bikeEdit?bikeEdit.info.photo||'':'';paintPic();$('bikeTitle').textContent=bikeEdit?'Edit motor':'Tambah motor';openModal('bikeModal')}
const pick=id=>{DB.active=id;save();show('home')};
function editSvc(id){const s=data.services.find(x=>x.id===id);if(!s)return;openModal('serviceModal');svcEdit=id;$('svcTitle').textContent='Edit servis';svcName.value=s.name;svcKm.value=s.km;svcCost.value=s.cost;svcDate.value=s.date;svcNote.value=s.note||''}
function paintPic(){const p=$('pic');p.style.backgroundImage=pendingPhoto?`url(${pendingPhoto})`:'';p.classList.toggle('has',!!pendingPhoto)}
bikePhoto.onchange=()=>{const f=bikePhoto.files[0];if(!f)return;const r=new FileReader();r.onload=()=>{const im=new Image();im.onload=()=>{const k=Math.min(1,800/Math.max(im.width,im.height)),c=document.createElement('canvas');c.width=im.width*k;c.height=im.height*k;c.getContext('2d').drawImage(im,0,0,c.width,c.height);pendingPhoto=c.toDataURL('image/jpeg',.75);paintPic()};im.src=r.result};r.readAsDataURL(f);bikePhoto.value=''};
(()=>{let t=0;const e=$('wOdo'),f=n=>String(n).padStart(6,'0').split('').map(c=>`<i>${c}</i>`).join('')+'<b>km</b>',id=setInterval(()=>{t+=Math.ceil((123456-t)/8);e.innerHTML=f(t);if(t>=123456)clearInterval(id)},45)})();
render();
