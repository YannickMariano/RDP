(function(){
    const water = document.getElementById('water');
    const sensorHighDot = document.getElementById('sensorHighDot');
    const sensorLowDot = document.getElementById('sensorLowDot');
    const lvlLabel = document.getElementById('lvlLabel');
    const thLow = document.getElementById('thLow');
    const thHigh = document.getElementById('thHigh');
    const thLowVal = document.getElementById('thLowVal');
    const thHighVal = document.getElementById('thHighVal');
    const modeAuto = document.getElementById('modeAuto');
    const btnStart = document.getElementById('btnStart');
    const btnStop = document.getElementById('btnStop');
    const btnReset = document.getElementById('btnReset');
    const pumpState = document.getElementById('pumpState');
    const pumpAnim = document.getElementById('pumpAnim');
    const alarmState = document.getElementById('alarmState');
    const ledPump = document.getElementById('ledPump');
    const flowArrow = document.getElementById('flowArrow');
    const logEl = document.getElementById('log');

    let level = 40; // pourcentage initial
    let remplissage = false;
    let alarm = null;
    let fuite = false;
    let lastLevelChange = Date.now();
    let autoMode = false;

    let niveauEau = 50; // Niveau d'eau initial
    let seuilBas = 20; // Seuil bas initial
    let seuilHaut = 80; // Seuil haut initial
    
function log(s){
    const time = new Date().toLocaleTimeString();
    logEl.innerHTML = `<div style="margin-bottom:6px"><b>[${time}]</b> ${s}</div>` + logEl.innerHTML;
}

function updateVisual(){
    water.style.height = Math.max(3, Math.min(100, level)) + '%';
    lvlLabel.textContent = Math.round(level) + '%';

    // sensors
    const highTh = parseInt(thHigh.value);
    const lowTh = parseInt(thLow.value);
    const sensorHigh = level >= highTh;
    const sensorLow = level <= lowTh;

    sensorHighDot.className = 'dot ' + (sensorHigh ? 'on' : '');
    sensorLowDot.className = 'dot ' + (sensorLow ? 'on' : '');

    // pump visuals
    pumpState.textContent = remplissage ? 'RUN' : 'STOP';
    pumpAnim.className = remplissage ? 'pump-anim pump-on' : 'pump-anim';
    ledPump.className = 'led ' + (remplissage ? 'ok' : 'off');
    flowArrow.style.display = remplissage ? 'inline-block' : 'none';
    alarmState.textContent = alarm ? alarm : 'Aucune';
    alarmState.style.color = alarm ? 'var(--danger)' : '#bbf7d0';
  }

function controlLoop(){
  if(autoMode){
      const highTh = parseInt(thHigh.value);
      const lowTh = parseInt(thLow.value);

      // Start condition: level <= lowTh
      if(!remplissage && level <= lowTh && !alarm){
        remplissage = true;
        lastLevelChange = Date.now();
        log('Auto: Niveau bas détecté → démarrage pompe');
      }

      // Vidange automatique: level >= 0
      if(!remplissage && level < highTh + 1  && !alarm){
        remplissage = false;
        level = Math.max(0, level - 1);
        log('Auto: Utilisation d\'eau détectée');
      }

  } else {

    if(!autoMode){
      // remplissage = false;
    }    
  }

  // During remplissage, check high sensor to stop
  if(remplissage){
    const highTh = parseInt(thHigh.value);

    if(level >= highTh){
      remplissage = false;
      log('Capteur haut détecté → arrêt pompe (plein)');
    } else {
      // simulate water rising (or falling if fuite)
      const delta = fuite ? -0.3 : 0.8; // simulation rates
      level = Math.min(100, level + delta);
      // detect no-change alarm (simulate if level didn't change enough)
      if(Date.now() - lastLevelChange > 8000 && Math.abs(level - parseFloat(lvlLabel.textContent)) < 0.5){
        alarm = 'Possible marche à sec / obstruction';
        remplissage = false;
        log('ALARME: marche à sec détectée');
      } else {
        lastLevelChange = Date.now();
      }
    }
  } else {
    // natural fuite or none
    if(fuite && level>0){
      level = Math.max(0, level - 1);
    }
  }

  // CONTROLE DU NIEAU D'EAU ET REMPLISSAGE
  if(level >= 99){
    remplissage = false;
    alarm = 'Débordement potentiel détecté - pompe stoppée';
    log('ALARME: débordement (niveau critique)');
  }

  else if(level <= 5){
      remplissage = true;
      alarm = 'Niveau trop bas - pompe redémarrage automatique du pompe';
      log('ALARME: niveau trop bas, pompe redémarre');    

  }else{
      alarm = null;
  }
  updateVisual();
}

  // UI events
  thLow.addEventListener('input', ()=>{
    thLowVal.textContent = thLow.value + '%';
  });

  thHigh.addEventListener('input', ()=>{
    thHighVal.textContent = thHigh.value + '%';
  });

  modeAuto.addEventListener('change', ()=>{
      autoMode = modeAuto.checked; 
  log('Mode ' + (autoMode ? 'AUTO' : 'MANUEL'));
  });

  btnStart.addEventListener('click', ()=>{
    if(!alarm){
      remplissage = true; 
      log('Démarrage manuel pompe'); 
      updateVisual();

    } else {
      log('Impossible: alarme active, reset requis');
    }
  });

  btnStop.addEventListener('click', ()=>{
    remplissage = false; 
    log('Arrêt manuel pompe'); 
    updateVisual();
  });

  btnReset.addEventListener('click', ()=>{
    alarm = null; 
    log('Alarme réinitialisée'); 
    updateVisual();
  });

  // COMMMANDE MANUELLE
  document.getElementById('raiseLvl').addEventListener('click', ()=>{ 
    level = Math.min(100, level + 10); 
    log('+ Niveau d\'eau agmenté'); 
    updateVisual();
  });


  document.getElementById('lowerLvl').addEventListener('click', ()=>{ 
    level = Math.max(0, level - 10); 
    log('- Niveau d\'eau diminué'); 
    updateVisual();
  });

  document.getElementById('toggleLeak').addEventListener('click', ()=>{ 
    fuite = !fuite; 
    log('Fuite ' + (fuite ? 'activée' : 'désactivée')); 
  });

  // initial render
  updateVisual();
  setInterval(controlLoop, 700);

})();