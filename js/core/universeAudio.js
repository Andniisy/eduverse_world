// Audio universal EDUVERSE: music and button feedback persist across screens.
class UniverseAudio {
  constructor(){this.ctx=null;this.timer=null;this.musicOn=false;this.step=0;this.button=null;this.bound=false;}
  context(){if(!this.ctx){const AC=window.AudioContext||window.webkitAudioContext;if(AC)this.ctx=new AC();}if(this.ctx?.state==='suspended')this.ctx.resume().catch(()=>{});return this.ctx;}
  tone(freq=520,duration=.07,wave='sine',volume=.018){const c=this.context();if(!c)return;const o=c.createOscillator(),g=c.createGain();o.type=wave;o.frequency.setValueAtTime(freq,c.currentTime);g.gain.setValueAtTime(volume,c.currentTime);g.gain.exponentialRampToValueAtTime(.0001,c.currentTime+duration);o.connect(g);g.connect(c.destination);o.start();o.stop(c.currentTime+duration);}
  click(){this.tone(620,.045,'triangle',.012);setTimeout(()=>this.tone(790,.035,'sine',.008),25);}
  start(){const c=this.context();if(!c||this.musicOn)return;this.musicOn=true;this.step=0;const melody=[523.25,659.25,783.99,659.25,587.33,698.46,880,698.46,523.25,587.33,659.25,523.25];this.timer=setInterval(()=>{if(!this.musicOn||!this.ctx)return;const i=this.step++,n=melody[i%melody.length];this.tone(n,.24,'triangle',.012);if(i%2===0)this.tone(n/2,.28,'sine',.006);},420);this.updateButton();}
  stop(){this.musicOn=false;if(this.timer)clearInterval(this.timer);this.timer=null;this.updateButton();}
  toggle(){this.musicOn?this.stop():this.start();}
  updateButton(){if(!this.button)return;this.button.textContent=this.musicOn?'♫ Musik: aktif':'♫ Musik: mati';this.button.setAttribute('aria-pressed',String(this.musicOn));}
  mount(){if(this.bound)return;this.bound=true;const add=()=>{if(!this.button){this.button=document.createElement('button');this.button.type='button';this.button.className='ev-universe-audio';this.button.setAttribute('aria-label','Nyalakan atau matikan musik latar EDUVERSE');this.button.addEventListener('click',e=>{e.stopPropagation();this.click();this.toggle();});document.body.appendChild(this.button);this.updateButton();}};add();document.addEventListener('pointerdown',e=>{if(e.target.closest('.ev-universe-audio'))return;if(this.ctx?.state==='suspended')this.ctx.resume().catch(()=>{});if(!this.ctx)this.context();},{passive:true});document.addEventListener('click',e=>{if(e.target.closest('button')&&!e.target.closest('.ev-universe-audio'))this.click();},true);}
}
export const universeAudio=new UniverseAudio();
