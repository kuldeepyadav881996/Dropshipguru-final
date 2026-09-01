(function(){
  'use strict';
  function removeSocialIcons(){
    ['whatsapp','instagram','facebook'].forEach(function(name){
      document.querySelectorAll('[data-icon="'+name+'"], .brand-icon-wrap[data-icon="'+name+'"], [data-brand="'+name+'"]').forEach(function(el){
        // remove the icon element
        el.parentNode && el.parentNode.removeChild(el);
      });
    });
    // remove links to wa.me or whatsapp, instagram, facebook
    document.querySelectorAll('a[href*="wa.me"], a[href*="whatsapp"], a[href*="instagram.com"], a[href*="facebook.com"]').forEach(function(a){
      // if link solely contains an icon, remove it; otherwise remove href
      if(a.querySelector('.brand-icon-wrap') && a.textContent.trim()===''){
        a.parentNode && a.parentNode.removeChild(a);
      } else {
        a.removeAttribute('href');
      }
    });
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',removeSocialIcons);else removeSocialIcons();
})();
