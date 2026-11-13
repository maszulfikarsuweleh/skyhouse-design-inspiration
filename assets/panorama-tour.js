import * as THREE from './three.module.js';

const $ = selector => document.querySelector(selector);
const clamp = (value, low, high) => Math.max(low, Math.min(high, value));
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const scenes = {
  studio: {name:'Studio', image:'assets/studio-panorama.jpg', u:.5, v:.52, links:[{to:'entry',u:.5,v:.63}]},
  entry: {name:'Pintu masuk & dapur', image:'assets/studio-entry-panorama.jpg', u:.84, v:.52, links:[{to:'studio',u:.52,v:.64},{to:'bathroom',u:.88,v:.61}]},
  bathroom: {name:'Kamar mandi', image:'assets/bathroom-panorama.jpg', u:.5, v:.52, links:[{to:'entry',u:.18,v:.6}]}
};
const order = Object.keys(scenes);
function direction(u, v) {
  const angle = (u - .5) * Math.PI * 2, latitude = (.5 - v) * Math.PI;
  return [Math.sin(angle) * Math.cos(latitude), Math.sin(latitude), -Math.cos(angle) * Math.cos(latitude)];
}
let renderer, camera, world, sphere, frame = 0, lastFrame = 0, current = null;
let yaw = 0, pitch = 0, automatic = false, request = 0, overlayAnimation, toastTimer, hotspots = [];
const canvas = $('#view'), textureCache = new Map();
let roomAnimations = [];
function beginRoomLoad(id) {
  roomAnimations.forEach(animation => animation.cancel()); roomAnimations = [];
  $('#scan-reveal').hidden = true;
  $('#loading').classList.toggle('is-travel', Boolean(current));
  $('#loading').classList.remove('has-error');
  $('#loading').hidden = false;
  $('#load-title').textContent = scenes[id].name;
  $('#load-message').textContent = 'Menyiapkan panorama ruang…';
  $('#load-progress').hidden = false;
  $('#retry').hidden = $('#load-fallback').hidden = true;
}
function revealRoom(selection) {
  $('#load-message').textContent = 'Panorama siap';
  $('#load-progress').hidden = true;
  if (reduced.matches) {$('#loading').hidden = true; return;}
  const loadingFade = $('#loading').animate([{opacity:1},{opacity:0}],{duration:260,easing:'ease-out'});
  loadingFade.onfinish = () => {if (selection === request) $('#loading').hidden = true;};
  $('#scan-room').textContent = scenes[current].name.toUpperCase();
  $('#scan-reveal').hidden = false;
  const scan = $('#scan-reveal').animate([{opacity:0},{opacity:1,offset:.15},{opacity:1,offset:.65},{opacity:0}],{duration:880,easing:'linear'});
  scan.onfinish = () => {if (selection === request) $('#scan-reveal').hidden = true;};
  roomAnimations = [loadingFade, scan,
    $('#scan-line').animate([{transform:'translateY(-12vh)'},{transform:'translateY(100vh)'}],{duration:820,easing:'cubic-bezier(.25,.1,.25,1)'}),
    canvas.animate([{opacity:.72,transform:'scale(1.025)'},{opacity:1,transform:'scale(1)'}],{duration:880,easing:'cubic-bezier(.22,1,.36,1)'})];
}
function message(text, persistent = false) {
  clearTimeout(toastTimer);
  $('#status').textContent = text;
  if (!persistent) toastTimer = setTimeout(() => $('#status').textContent = '', 5000);
}
function schedule() {if (renderer && camera && sphere && !frame && !document.hidden) frame = requestAnimationFrame(render);}
function setAutomatic(value) {
  automatic = value;
  $('#rotate').setAttribute('aria-pressed', String(value));
  $('#rotate').textContent = value ? 'Hentikan putaran' : 'Putar otomatis';
  if (value) schedule();
}
function updateHotspots() {
  camera.updateMatrixWorld();
  const width = canvas.clientWidth, height = canvas.clientHeight;
  for (const {button, point} of hotspots) {
    const local = point.clone().applyMatrix4(camera.matrixWorldInverse);
    const screen = point.clone().project(camera);
    const x = (screen.x + 1) * width / 2, y = (1 - screen.y) * height / 2;
    button.hidden = local.z >= 0 || x < 48 || x > width - 48 || y < 100 || y > height - 160;
    if (!button.hidden) {button.style.left = `${x}px`; button.style.top = `${y}px`;}
  }
}
function render(time) {
  frame = 0;
  const dt = Math.min(time - (lastFrame || time), 50); lastFrame = time;
  let moving = automatic;
  if (automatic) yaw -= dt * .000045;
  if (sensorActive && hasSensor) {
    camera.quaternion.slerp(targetSensor, reduced.matches ? 1 : 1 - Math.exp(-dt / 65));
    moving ||= 1 - Math.abs(camera.quaternion.dot(targetSensor)) > .000001;
  } else camera.rotation.set(pitch, yaw, 0, 'YXZ');
  if (!reduced.matches && Math.abs(lean) > .0001) {camera.rotateZ(lean); lean *= .6; moving = true;}
  renderer.render(world, camera);
  updateHotspots();
  if (moving) schedule();
}
function zoom(amount) {
  if (!camera) return;
  camera.fov = clamp(camera.fov + amount, 40, 110);
  camera.updateProjectionMatrix(); $('#fov').textContent = `${Math.round(camera.fov)}°`; schedule();
}
function textureFor(id) {
  if (!textureCache.has(id)) {
    const promise = new Promise((resolve, reject) => {
      new THREE.TextureLoader().load(scenes[id].image, texture => {
        texture.colorSpace = THREE.SRGBColorSpace; resolve(texture);
      }, undefined, reject);
    });
    textureCache.set(id, promise);
    promise.catch(() => textureCache.delete(id));
  }
  return textureCache.get(id);
}
function makeHotspots(id) {
  $('#hotspots').replaceChildren(); hotspots = [];
  for (const link of scenes[id].links) {
    const button = document.createElement('button');
    button.className = 'hotspot'; button.setAttribute('aria-label', `Pergi ke ${scenes[link.to].name}`);
    button.innerHTML = '<svg viewBox="0 0 56 44" fill="none" aria-hidden="true"><path d="M7 26L28 9L49 26M7 37L28 20L49 37" stroke="white" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/></svg><span></span>';
    button.querySelector('span').textContent = scenes[link.to].name;
    button.onclick = () => selectScene(link.to);
    $('#hotspots').append(button);
    hotspots.push({button, point:new THREE.Vector3(...direction(link.u,link.v)).multiplyScalar(10)});
  }
}
async function selectScene(id) {
  if (!scenes[id] || !renderer || current === id) return;
  const selection = ++request;
  setAutomatic(false);
  $('#tour').setAttribute('aria-busy','true');
  message(`Memuat ${scenes[id].name}…`,true);
  beginRoomLoad(id);
  try {
    const texture = await textureFor(id);
    if (selection !== request) return;
    overlayAnimation?.cancel(); $('#transition').hidden = true;
    if (current && !reduced.matches) {
      renderer.render(world,camera);
      $('#transition').src = canvas.toDataURL('image/jpeg',.88);
      $('#transition').hidden = false;
    }
    current = id; sphere.material.map = texture; sphere.material.needsUpdate = true;
    yaw = -(scenes[id].u - .5) * Math.PI * 2; pitch = (.5 - scenes[id].v) * Math.PI;
    camera.rotation.set(pitch,yaw,0,'YXZ'); camera.fov = 90; camera.updateProjectionMatrix();
    sensorOffset = null; lean = 0;
    if (sensorActive && hasSensor) targetSensor.copy(camera.quaternion);
    $('#fov').textContent = '90°'; $('#scene-name').textContent = scenes[id].name;
    document.querySelectorAll('[data-scene]').forEach(button => button.setAttribute('aria-pressed',String(button.dataset.scene === id)));
    makeHotspots(id); renderer.render(world,camera); updateHotspots();
    revealRoom(selection);
    if (!$('#transition').hidden) {
      overlayAnimation = $('#transition').animate([{opacity:1},{opacity:0}],{duration:320,easing:'ease-out'});
      overlayAnimation.onfinish = () => $('#transition').hidden = true;
    }
    if (matchMedia('(max-width:600px)').matches) setMenu(false);
    message(`${scenes[id].name} · geser untuk melihat sekeliling`); schedule();
  } catch (error) {
    if (selection !== request) return;
    message('Panorama gagal dimuat. Pilih titik lain atau coba lagi.',true);
    $('#loading').classList.add('has-error');
    $('#load-progress').hidden = true;
    if (current) $('#loading').hidden = true;
    if (!current) {
      $('#load-message').textContent = 'Panorama belum dapat dibuka. Periksa koneksi lalu coba lagi.';
      $('#retry').hidden = false; $('#load-fallback').hidden = false;
    }
    console.error('Panorama load failed',error);
  } finally {if (selection === request) $('#tour').setAttribute('aria-busy','false');}
}
function setMenu(open) {$('#scenes').hidden = !open; $('#menu').setAttribute('aria-expanded',String(open));}
function setMap(open) {$('#minimap').hidden = !open; $('#map-toggle').setAttribute('aria-expanded',String(open));}
$('#menu').onclick = () => setMenu($('#scenes').hidden);
$('#close-map').onclick = () => {setMap(false); $('#map-toggle').focus();};
$('#map-toggle').onclick = () => setMap($('#minimap').hidden);
document.querySelectorAll('[data-scene]').forEach(button => button.onclick = () => selectScene(button.dataset.scene));
$('#previous').onclick = () => selectScene(order[(order.indexOf(current) + order.length - 1) % order.length]);
$('#next').onclick = () => selectScene(order[(order.indexOf(current) + 1) % order.length]);
$('#zoom-out').onclick = () => zoom(7); $('#zoom-in').onclick = () => zoom(-7);
$('#retry').onclick = () => selectScene('studio');
$('#rotate').onclick = () => {if (sensorActive || sensorPending) stopSensors(); setAutomatic(!automatic);};
$('#help').onclick = () => {setAutomatic(false); if (sensorActive || sensorPending) stopSensors(); $('#guide').showModal();};
$('#close-guide').onclick = () => $('#guide').close();
$('#full').onclick = async () => {
  try {if (document.fullscreenElement) await document.exitFullscreen(); else await $('#tour').requestFullscreen();}
  catch {message('Layar penuh tidak tersedia. Buka tur langsung melalui browser.');}
};
if (!document.fullscreenEnabled) $('#full').disabled = true;
document.addEventListener('fullscreenchange',() => $('#full').setAttribute('aria-label',document.fullscreenElement ? 'Keluar layar penuh' : 'Layar penuh'));

let sensorActive = false, sensorPending = false, hasSensor = false, sensorOffset = null, sensorEpoch = 0, sensorTimer = 0, lastAbsolute = -Infinity, screenAngle = 0, lean = 0;
const targetSensor = new THREE.Quaternion(), sensorQuaternion = new THREE.Quaternion();
const tilt = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1,0,0),-Math.PI/2), screenRotation = new THREE.Quaternion(), zAxis = new THREE.Vector3(0,0,1);
function stopSensors(note = 'Phone look nonaktif · geser untuk menoleh') {
  sensorEpoch++; clearTimeout(sensorTimer);
  window.removeEventListener('deviceorientationabsolute',onOrientation); window.removeEventListener('deviceorientation',onOrientation); window.removeEventListener('devicemotion',onMotion);
  if (camera) {const angles = new THREE.Euler().setFromQuaternion(camera.quaternion,'YXZ'); yaw = angles.y; pitch = angles.x;}
  sensorActive = sensorPending = hasSensor = false; sensorOffset = null; lean = 0;
  $('#sensors').setAttribute('aria-pressed','false'); $('#sensors').textContent = 'Phone look'; $('#sensors').disabled = false; $('#recenter').hidden = true;
  if (note) message(note); if (renderer) schedule();
}
function onOrientation(event) {
  if (!sensorActive || ![event.alpha,event.beta,event.gamma].every(Number.isFinite)) return;
  const now = performance.now();
  if (event.type === 'deviceorientationabsolute') lastAbsolute = now;
  else if (now - lastAbsolute < 500) return;
  const angle = screen.orientation?.angle ?? window.orientation ?? 0;
  if (angle !== screenAngle) {sensorOffset = null; screenAngle = angle;}
  sensorQuaternion.setFromEuler(new THREE.Euler(event.beta*Math.PI/180,event.alpha*Math.PI/180,-event.gamma*Math.PI/180,'YXZ')).multiply(tilt).multiply(screenRotation.setFromAxisAngle(zAxis,-angle*Math.PI/180));
  if (!sensorOffset) sensorOffset = camera.quaternion.clone().multiply(sensorQuaternion.clone().invert());
  targetSensor.copy(sensorOffset).multiply(sensorQuaternion).normalize();
  if (!hasSensor) message('Phone look aktif · buka panduan untuk recenter');
  hasSensor = true; sensorPending = false; clearTimeout(sensorTimer); schedule();
}
function onMotion(event) {
  if (!sensorActive || reduced.matches) return;
  const acceleration = event.acceleration;
  if (!acceleration || ![acceleration.x,acceleration.y].every(Number.isFinite)) return;
  const angle = (screen.orientation?.angle ?? 0) * Math.PI / 180;
  lean = clamp((acceleration.x*Math.cos(angle)-acceleration.y*Math.sin(angle))*.002,-.008,.008); schedule();
}
$('#sensors').onclick = async () => {
  if (sensorActive || sensorPending) {stopSensors(); return;}
  if (!camera || !current) return;
  if (!isSecureContext) {message('Phone look memerlukan HTTPS. Buka deployment Vercel secara langsung.'); return;}
  if (!('DeviceOrientationEvent' in window)) {message('Sensor orientasi tidak tersedia. Kontrol geser tetap dapat digunakan.'); return;}
  setAutomatic(false); sensorPending = true; const epoch = ++sensorEpoch; $('#sensors').disabled = true;
  try {
    const permissions = [];
    if (typeof DeviceOrientationEvent.requestPermission === 'function') permissions.push(DeviceOrientationEvent.requestPermission(true));
    if (typeof window.DeviceMotionEvent?.requestPermission === 'function') permissions.push(DeviceMotionEvent.requestPermission().catch(() => 'optional-denied'));
    const results = await Promise.all(permissions);
    if (epoch !== sensorEpoch) return;
    if (typeof DeviceOrientationEvent.requestPermission === 'function' && results[0] !== 'granted') {stopSensors('Izin orientasi ditolak. Gunakan kontrol geser.'); return;}
    if (document.hidden) {stopSensors(); return;}
    sensorActive = true; sensorOffset = null; lastAbsolute = -Infinity;
    $('#sensors').setAttribute('aria-pressed','true'); $('#sensors').textContent = 'Stop phone look'; $('#recenter').hidden = false;
    window.addEventListener('deviceorientationabsolute',onOrientation); window.addEventListener('deviceorientation',onOrientation); window.addEventListener('devicemotion',onMotion);
    message('Menunggu sensor ponsel…',true);
    sensorTimer = setTimeout(() => {if (!hasSensor) stopSensors('Data sensor belum tersedia. Buka alamat HTTPS langsung di Chrome Android dan periksa izin gerakan.');},6500);
  } catch {if (epoch === sensorEpoch) stopSensors('Phone look belum dapat diaktifkan. Gunakan kontrol geser.');}
  finally {if (epoch === sensorEpoch) $('#sensors').disabled = false;}
};
$('#recenter').onclick = () => {
  if (!current || !camera) return;
  yaw = -(scenes[current].u-.5)*Math.PI*2; pitch = (.5-scenes[current].v)*Math.PI;
  camera.rotation.set(pitch,yaw,0,'YXZ'); targetSensor.copy(camera.quaternion); sensorOffset = null; lean = 0;
  $('#guide').close(); message('Pandangan diselaraskan kembali'); schedule();
};
const pointers = new Map(); let span = 0;
function pointerSpan() {const values = [...pointers.values()]; return values.length === 2 ? Math.hypot(values[0].x-values[1].x,values[0].y-values[1].y) : 0;}
canvas.onpointerdown = event => {
  if (!camera) return;
  setAutomatic(false); if (sensorActive || sensorPending) stopSensors();
  canvas.focus(); canvas.setPointerCapture(event.pointerId); pointers.set(event.pointerId,{x:event.clientX,y:event.clientY}); span = pointerSpan();
};
canvas.onpointermove = event => {
  const previous = pointers.get(event.pointerId); if (!previous) return;
  pointers.set(event.pointerId,{x:event.clientX,y:event.clientY});
  if (pointers.size === 1) {yaw += (event.clientX-previous.x)*.004; pitch = clamp(pitch+(event.clientY-previous.y)*.004,-1.4,1.4);}
  else {const distance = pointerSpan(); if (span && distance) zoom(camera.fov*(span/distance-1)); span = distance;}
  schedule();
};
function release(event) {pointers.delete(event.pointerId); span = pointerSpan();}
canvas.onpointerup = canvas.onpointercancel = canvas.onlostpointercapture = release;
canvas.addEventListener('wheel',event => {event.preventDefault(); zoom(event.deltaY*.035);},{passive:false});
canvas.addEventListener('keydown',event => {
  if (event.metaKey || event.ctrlKey || event.altKey || !camera) return;
  if (!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','+','=','-'].includes(event.key)) return;
  event.preventDefault(); setAutomatic(false); if (sensorActive || sensorPending) stopSensors();
  if (event.key === 'ArrowLeft') yaw += .1; if (event.key === 'ArrowRight') yaw -= .1;
  if (event.key === 'ArrowUp') pitch = clamp(pitch+.1,-1.4,1.4); if (event.key === 'ArrowDown') pitch = clamp(pitch-.1,-1.4,1.4);
  if (event.key === '+' || event.key === '=') zoom(-5); if (event.key === '-') zoom(5); schedule();
});
function pause() {setAutomatic(false); if (sensorActive || sensorPending) stopSensors('Phone look dijeda. Aktifkan kembali saat Anda siap.'); pointers.clear();}
document.addEventListener('visibilitychange',() => {if (document.hidden) pause(); else schedule();});
window.addEventListener('pagehide',pause);
reduced.addEventListener('change',event => {if (event.matches) {setAutomatic(false); overlayAnimation?.cancel(); roomAnimations.forEach(animation => animation.cancel()); $('#scan-reveal').hidden = true; if (current && $('#tour').getAttribute('aria-busy') !== 'true') $('#loading').hidden = true; $('#transition').hidden = true; lean = 0;}});
const compact = matchMedia('(max-width:600px)');
function compactPanels() {if (compact.matches) {setMenu(false); setMap(false);}}
compact.addEventListener('change',compactPanels); compactPanels();
try {
  renderer = new THREE.WebGLRenderer({canvas,antialias:true,preserveDrawingBuffer:true});
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1,matchMedia('(pointer:coarse)').matches ? 1.5 : 2));
  world = new THREE.Scene(); world.background = new THREE.Color('#142847');
  camera = new THREE.PerspectiveCamera(90,1,.1,100); camera.rotation.order = 'YXZ';
  const geometry = new THREE.SphereGeometry(30,64,32); geometry.scale(-1,1,1);
  sphere = new THREE.Mesh(geometry,new THREE.MeshBasicMaterial()); sphere.rotation.y = -Math.PI/2; world.add(sphere);
  function resize() {renderer.setSize(canvas.clientWidth,canvas.clientHeight,false); camera.aspect = canvas.clientWidth/canvas.clientHeight; camera.updateProjectionMatrix(); schedule();}
  new ResizeObserver(resize).observe(canvas); resize(); selectScene('studio');
  canvas.addEventListener('webglcontextlost',event => {event.preventDefault(); pause(); $('#loading').hidden = false; $('#loading').classList.add('has-error'); $('#load-progress').hidden = true; $('#load-message').textContent = 'Tampilan grafis terputus. Muat ulang halaman untuk melanjutkan.'; $('#load-fallback').hidden = false;});
} catch (error) {
  $('#loading').classList.add('has-error'); $('#load-progress').hidden = true;
  $('#load-message').textContent = 'Tur memerlukan browser dengan WebGL aktif. Anda masih dapat membuka halaman sewa.';
  $('#load-fallback').hidden = false; $('#load-fallback').href = 'index.html'; $('#load-fallback').textContent = 'Kembali ke halaman sewa'; console.error(error);
}
