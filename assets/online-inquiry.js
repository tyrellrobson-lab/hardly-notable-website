const openButton=document.querySelector('#open-online-inquiry');
const onlineStatus=document.querySelector('#online-inquiry-status');
let loading=false;const es=document.documentElement.lang==='es';
const structured=!!document.querySelector('#project-form');
openButton?.addEventListener('click',()=>{
 if(loading)return;
 loading=true;openButton.disabled=true;
 onlineStatus.textContent=structured?(es?'Cargando la ventana de consultas…':'Loading the inquiry window…'):es?'Cargando la ventana de consultas. Si no aparece, use el formulario de correo de abajo.':'Loading the inquiry window. If it does not appear, use the email form below.';
 window.BrevoConversationsSetup={disableGaTracking:true};
 window.BrevoConversationsID='6ae2384f06c779068700936e';
 window.BrevoConversations=window.BrevoConversations||function(){(window.BrevoConversations.q=window.BrevoConversations.q||[]).push(arguments);};
 const script=document.createElement('script');script.async=true;
 script.src='https://conversations-widget.brevo.com/brevo-conversations.js';
 script.onload=()=>{onlineStatus.textContent=structured?(es?'Use el botón de consultas de Brevo para dejar su mensaje.':'Use the Brevo inquiry control to leave your message.'):es?'Use el botón de consultas de Brevo para dejar su mensaje. El formulario de correo de abajo sigue disponible.':'Use the Brevo inquiry control to leave your message. The email form below remains available.';};
 script.onerror=()=>{script.remove();loading=false;openButton.disabled=false;onlineStatus.textContent=structured?(es?'La ventana no se pudo cargar. Inténtelo de nuevo o use el correo de esta página.':'The window could not load. Try again or use the email address on this page.'):es?'La ventana de consultas no se pudo cargar. Inténtelo de nuevo o use el formulario de correo de abajo.':'The inquiry window could not load. Try again or use the email form below.';};
 document.head.appendChild(script);
});
