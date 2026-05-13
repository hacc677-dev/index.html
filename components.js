(function(){
  function navLabels(lang){
    return lang === 'en'
      ? { home: 'Home', tools: 'Tools', settings: 'Settings', contact: 'Contact' }
      : { home: 'Trang chủ', tools: 'Công cụ', settings: 'Cài đặt', contact: 'Liên hệ' };
  }

  function profileMarkup(base){
    const user = (window.App && window.App.getUser()) || {};
    const lang = (window.App && window.App.getLanguage()) || 'vi';
    const labels = {
      vi: { label: 'Hồ sơ', suffix: 'Mở Settings' },
      en: { label: 'Profile', suffix: 'Open Settings' }
    }[lang];

    return `
      <a class="profile-chip liquid-chip" href="${base}pages/settings.html" aria-label="${labels.suffix}">
        <span class="profile-chip-avatar">${window.App ? window.App.renderAvatarMarkup(user, 'profile-chip-avatar-inner') : '<span>PP</span>'}</span>
        <span class="profile-chip-copy">
          <strong>${window.App ? window.App.escapeHtml(user.fullName || labels.label) : labels.label}</strong>
          <small>${window.App ? window.App.escapeHtml(user.email || labels.suffix) : labels.suffix}</small>
        </span>
      </a>
    `;
  }

  function headerMarkup(){
    const page = document.body.dataset.page || 'home';
    const base = document.body.dataset.base || '';
    const lang = (window.App && window.App.getLanguage()) || 'vi';
    const labels = navLabels(lang);

    const links = [
      { href: `${base}pages/home.html`, key: 'home' },
      { href: `${base}pages/tools.html`, key: 'tools' },
      { href: `${base}pages/settings.html`, key: 'settings' },
      { href: `${base}pages/contact.html`, key: 'contact' }
    ];

    return `
      <header class="site-header">
        <div class="header-inner">
          <a class="logo" href="${base}pages/home.html" aria-label="PromptPilot Home">
            <span class="logo-mark">PP</span>
            <span>PromptPilot</span>
          </a>
          <nav class="nav" aria-label="Main navigation">
            ${links.map(item => `<a href="${item.href}" data-nav-item="${item.key}" ${item.key === page ? 'aria-current="page"' : ''}>${labels[item.key]}</a>`).join('')}
          </nav>
          <div class="header-tools">
            <span class="header-pill">${lang === 'vi' ? 'VI' : 'EN'}</span>
            <button class="ghost-btn small nav-switch liquid-chip" id="headerLangToggle" type="button">${lang === 'vi' ? 'EN' : 'VI'}</button>
            ${profileMarkup(base)}
          </div>
        </div>
      </header>
    `;
  }

  // Shared page footer: keep one unified block so the page end reads as a single band.
  function footerMarkup(){
    const lang = (window.App && window.App.getLanguage()) || 'vi';
    const base = document.body.dataset.base || '';
    const copy = lang === 'vi'
      ? 'PromptPilot là không gian demo học prompt, viết nội dung và quản lý hồ sơ cá nhân theo hướng rõ ràng, dễ dùng.'
      : 'PromptPilot is a demo space for learning prompts, drafting content, and managing personal profile data with clarity.';
    const nav = lang === 'vi' ? 'Điều hướng' : 'Navigation';
    const contact = lang === 'vi' ? 'Liên hệ' : 'Contact';
    const support = lang === 'vi' ? 'Hỗ trợ' : 'Support';
    const links = lang === 'vi'
      ? [
          ['Trang chủ', `${base}pages/home.html`],
          ['Công cụ', `${base}pages/tools.html`],
          ['Cài đặt', `${base}pages/settings.html`],
          ['Liên hệ', `${base}pages/contact.html`]
        ]
      : [
          ['Home', `${base}pages/home.html`],
          ['Tools', `${base}pages/tools.html`],
          ['Settings', `${base}pages/settings.html`],
          ['Contact', `${base}pages/contact.html`]
        ];

    return `
      <footer class="site-footer">
        <div class="footer-inner">
          <div class="footer-panel glass-panel">
            <div class="footer-grid">
                <div class="footer-brand">
                  <a class="logo" href="${base}pages/home.html" aria-label="PromptPilot Home">
                    <span class="logo-mark">PP</span>
                    <span>PromptPilot</span>
                  </a>
                  <p>${copy}</p>
                  <div class="footer-note-row">
                    <span class="pill footer-pill">Liquid glass · SaaS demo</span>
                    <span class="footer-mini">${lang === 'vi' ? 'Thiết kế cho học tập và thử prompt.' : 'Built for study and prompt testing.'}</span>
                  </div>
                </div>

                <div class="footer-links">
                  <h3 class="footer-title">${nav}</h3>
                  ${links.map(([label, href]) => `<a class="footer-link" href="${href}">${label}</a>`).join('')}
                </div>

                <div class="footer-contact">
                  <h3 class="footer-title">${contact}</h3>
                  <div class="footer-contact-item"><span>Email</span><strong>support@promptpilot.app</strong></div>
                  <div class="footer-contact-item"><span>Hotline</span><strong>+84 900 000 000</strong></div>
                  <div class="footer-contact-item"><span>${support}</span><strong>08:00 - 20:00</strong></div>
                </div>
              </div>

              <div class="footer-bottom">
                <span>© ${new Date().getFullYear()} PromptPilot</span>
                <span>${lang === 'vi' ? 'Web demo học tập và làm việc hiệu quả.' : 'A demo for focused study and work.'}</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    `;
  }

  // Lightweight quick-assist widget: a floating bubble on every page, expanded on demand.
  function chatWidgetMarkup(){
    const lang = (window.App && window.App.getLanguage()) || 'vi';
    const qas = lang === 'vi'
      ? [
          ['Tôi đăng nhập bằng cách nào?', 'Bạn nhập email và mật khẩu đã tạo, sau đó nhấn nút Đăng nhập để tiếp tục.'],
          ['Nếu tôi chưa có tài khoản thì làm gì?', 'Hãy chuyển sang mục Đăng ký, điền đầy đủ thông tin và tạo tài khoản mới.'],
          ['Sau khi đăng ký xong thì tôi làm gì tiếp?', 'Hệ thống sẽ tự chuyển bạn về màn hình đăng nhập và điền sẵn email, mật khẩu vừa tạo.'],
          ['Tôi có thể sửa thông tin cá nhân ở đâu?', 'Bạn vào phần Cài đặt để xem và chỉnh sửa thông tin của mình.'],
          ['Tôi đổi ảnh đại diện ở đâu?', 'Bạn vào Cài đặt, tải ảnh lên để đặt làm avatar cá nhân.'],
          ['Tôi đổi ngôn ngữ như thế nào?', 'Vào Cài đặt và chọn giữa tiếng Việt hoặc tiếng Anh.'],
          ['Tôi dùng công cụ tạo prompt như thế nào?', 'Bạn mở mục Công cụ, chọn đúng công cụ cần dùng, nhập thông tin và nhấn tạo prompt.'],
          ['Nếu tôi gặp lỗi thì liên hệ ai?', 'Bạn có thể vào mục Liên hệ để gửi thông tin hoặc liên hệ admin qua các kênh hỗ trợ được hiển thị.'],
          ['Tôi có thể hỏi admin về tài khoản ở đâu?', 'Hãy vào trang Liên hệ để xem các cách liên hệ admin và gửi yêu cầu hỗ trợ.'],
          ['Tôi quên mật khẩu thì làm sao?', 'Bạn chọn Quên mật khẩu trên màn hình đăng nhập để đi đến bước xử lý lại thông tin đăng nhập.']
        ]
      : [
          ['How do I log in?', 'Enter your created email and password, then press the Login button to continue.'],
          ['What if I do not have an account yet?', 'Switch to Register, fill in the details, and create a new account.'],
          ['What should I do after registering?', 'The system will send you back to the login screen and prefill the new email and password.'],
          ['Where can I edit my personal information?', 'Open Settings to view and edit your information.'],
          ['Where do I change my avatar?', 'Open Settings and upload an image to use as your avatar.'],
          ['How do I change the language?', 'Go to Settings and choose Vietnamese or English.'],
          ['How do I use the prompt generator?', 'Open the Tools section, choose the right tool, fill in the fields, and generate a prompt.'],
          ['If I find a problem, who should I contact?', 'Go to Contact to send details or reach the admin through the support links shown there.'],
          ['Where can I ask about my account?', 'Visit Contact to see how to reach the admin and submit a support request.'],
          ['What should I do if I forget my password?', 'Choose Forgot Password on the login screen to start the recovery flow.']
        ];

    return `
      <div class="chat-widget" id="chatWidget">
        <button class="chat-fab liquid-chip" id="chatWidgetToggle" type="button" aria-expanded="false" aria-controls="chatWidgetPanel" aria-label="${lang === 'vi' ? 'Trợ lý nhanh' : 'Quick assist'}">
          <span class="chat-fab-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" role="presentation">
              <path d="M7 18.5 4.5 21v-3.1c-1.2-1-2-2.5-2-4.2V8.8c0-3 2.4-5.3 5.4-5.3h8.2c3 0 5.4 2.4 5.4 5.3v4.9c0 3-2.4 5.3-5.4 5.3H7Z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/>
              <path d="M7.8 8.9h8.5M7.8 12h6.2" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
            </svg>
          </span>
          <span class="chat-fab-indicator" aria-hidden="true"></span>
          <span class="sr-only">${lang === 'vi' ? 'Trợ lý nhanh' : 'Quick assist'}</span>
        </button>
        <section class="chat-panel hidden" id="chatWidgetPanel" aria-label="${lang === 'vi' ? 'Hỏi về website' : 'Ask about the site'}">
          <div class="chat-panel-head">
            <div>
              <p>${lang === 'vi' ? 'Trợ lý nhanh' : 'Quick assist'}</p>
              <strong>PromptPilot</strong>
              <span class="chat-panel-intro">${lang === 'vi' ? 'Chọn một câu hỏi để xem câu trả lời mẫu.' : 'Choose a question to view a sample answer.'}</span>
            </div>
            <button class="chat-close" id="chatWidgetClose" type="button" aria-label="${lang === 'vi' ? 'Đóng' : 'Close'}">×</button>
          </div>
          <div class="chat-qa-list" id="chatQaList" aria-label="Questions">
            ${qas.map(([question], index) => `<button class="qa-btn" type="button" data-qa="q${index + 1}">${question}</button>`).join('')}
          </div>
          <div class="chat-messages" id="chatWindow" aria-live="polite"></div>
        </section>
      </div>
    `;
  }

  function syncLanguagePills(){
    const headerBtn = document.getElementById('headerLangToggle');
    if(headerBtn){
      const lang = window.App ? window.App.getLanguage() : 'vi';
      headerBtn.textContent = lang === 'vi' ? 'EN' : 'VI';
      headerBtn.onclick = () => {
        const next = (window.App && window.App.getLanguage() === 'vi') ? 'en' : 'vi';
        window.App.setLanguage(next);
      };
    }

    const page = document.body.dataset.page || '';
    document.querySelectorAll('.nav a[data-nav-item]').forEach(a => {
      const key = a.getAttribute('data-nav-item');
      const active = key === page;
      a.classList.toggle('active', active);
      if(active) a.setAttribute('aria-current', 'page');
      else a.removeAttribute('aria-current');
    });
  }

  function renderAll(){
    const headerHost = document.getElementById('site-header');
    const footerHost = document.getElementById('site-footer');
    const chatHost = document.getElementById('chatWidgetHost');
    if(headerHost) headerHost.innerHTML = headerMarkup();
    if(footerHost) footerHost.innerHTML = footerMarkup();
    if(chatHost) chatHost.innerHTML = chatWidgetMarkup();
    syncLanguagePills();
    if(window.Chatbot && typeof window.Chatbot.init === 'function'){
      window.Chatbot.init();
    }
  }

  window.Components = { renderAll, syncLanguagePills };

  if(window.App){
    window.App.ready(() => {
      renderAll();
      if(window.App && typeof window.App.setHeaderActiveLinks === 'function'){
        window.App.setHeaderActiveLinks();
      }
    });
  }
})();
