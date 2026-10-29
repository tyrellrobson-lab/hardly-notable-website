const openButton=document.querySelector('#open-online-inquiry');
const onlineStatus=document.querySelector('#online-inquiry-status');
let loading=false;
openButton?.addEventListener('click',()=>{
 if(loading)return;
 loading=true;openButton.disabled=true;
 onlineStatus.textContent='Loading the inquiry window. If it does not appear, use the email form below.';
 window.BrevoConversationsSetup={disableGaTracking:true};
 window.BrevoConversationsID='6ae2384f06c779068700936e';
 window.BrevoConversations=window.BrevoConversations||function(){(window.BrevoConversations.q=window.BrevoConversations.q||[]).push(arguments);};
 const script=document.createElement('script');script.async=true;
 script.src='https://conversations-widget.brevo.com/brevo-conversations.js';
 script.onload=()=>{onlineStatus.textContent='Use the Brevo inquiry control to leave your message. The email form below remains available.';};
 script.onerror=()=>{script.remove();loading=false;openButton.disabled=false;onlineStatus.textContent='The inquiry window could not load. Try again or use the email form below.';};
 document.head.appendChild(script);
});
