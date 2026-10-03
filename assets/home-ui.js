const menu = document.querySelector('.mobile-nav');
menu?.addEventListener('keydown', event => {
  if (event.key === 'Escape' && menu.open) { menu.open = false; menu.querySelector('summary').focus(); }
});
menu?.querySelectorAll('a').forEach(link => link.addEventListener('click', () => { menu.open = false; }));

const galleries = {
  recall: {title:'Recall', slides:[['recall.png','Original Recall artwork: a blue butterfly in a cabinet of curiosities','Original game artwork · Coming soon']]},
  critter: {title:'Critter Clutter', slides:[['critter-native-home.png','Critter Clutter iPhone home screen','Home screen · Submitted for App Store review'],['critter-native-game.png','Critter Clutter Orchard Relay farm puzzle','Orchard Relay gameplay · Submitted for App Store review']]},
  night: {title:'Night Shift', slides:[['night-native-home.png','Night Shift iPhone home screen','Home screen · Submitted for App Store review'],['night-native-game.png','Night Shift Deep Storage freight puzzle','Deep Storage gameplay · Submitted for App Store review']]}
};
const dialog = document.querySelector('.image-dialog');
const image = document.querySelector('#gallery-image');
const caption = document.querySelector('#gallery-caption');
const original = document.querySelector('#gallery-original');
const closeButton = document.querySelector('.gallery-close');
const previous = document.querySelector('.gallery-prev');
const next = document.querySelector('.gallery-next');
let activeGallery, slideIndex = 0, opener;
function renderSlide() {
  const [file,alt,label] = activeGallery.slides[slideIndex];
  image.src = `/assets/showcase/${file}`; image.alt = alt; original.href = image.src;
  caption.textContent = `${slideIndex + 1} / ${activeGallery.slides.length} · ${label}`;
  previous.disabled = next.disabled = activeGallery.slides.length === 1;
}
function moveSlide(direction) {
  slideIndex = (slideIndex + direction + activeGallery.slides.length) % activeGallery.slides.length;
  renderSlide();
}
function dismiss() {
  if (!dialog.open) return;
  if (history.state?.hnGallery) history.back();
  else dialog.close();
}
document.querySelectorAll('[data-gallery]').forEach(button => button.addEventListener('click', () => {
  activeGallery = galleries[button.dataset.gallery];
  slideIndex = Number(button.dataset.slide || 0); opener = button;
  document.querySelector('#gallery-title').textContent = activeGallery.title;
  renderSlide();
  history.pushState({...history.state,hnGallery:true},'',`#preview-${button.dataset.gallery}`);
  dialog.showModal(); closeButton.focus();
}));
closeButton.addEventListener('click',dismiss);
previous.addEventListener('click',()=>moveSlide(-1));
next.addEventListener('click',()=>moveSlide(1));
dialog.addEventListener('cancel',event=>{event.preventDefault();dismiss();});
dialog.addEventListener('click',event=>{if(event.target===dialog)dismiss();});
dialog.addEventListener('keydown',event=>{
  if(event.key==='Tab'){
    const controls=[...dialog.querySelectorAll('button:not(:disabled),a[href]')];
    const first=controls[0],last=controls.at(-1);
    if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}
    else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}
  }
  if(event.key==='ArrowLeft'||event.key==='ArrowRight'){event.preventDefault();moveSlide(event.key==='ArrowRight'?1:-1);}
});
dialog.addEventListener('close',()=>opener?.focus({preventScroll:true}));
window.addEventListener('popstate',()=>{if(dialog.open)dialog.close();});
