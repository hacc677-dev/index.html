
(function(){
  function init(){
    const page = document.body.dataset.page;

    if(page === 'home'){
      const previewName = document.getElementById('previewName');
      const previewEmail = document.getElementById('previewEmail');
      if(previewName || previewEmail){
        window.App.fillProfilePreview({ name: 'previewName', email: 'previewEmail' });
      }
    }

    const footer = document.getElementById('site-footer');
    const header = document.getElementById('site-header');
    if((footer || header) && window.Components){
      window.Components.renderAll();
    }
  }

  window.Router = { init };

  if(window.App){
    window.App.ready(init);
  }
})();
