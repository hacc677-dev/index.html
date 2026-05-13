(function(){
  // Lightweight widget controller: open/close, sample answers and chat bubbles.
  const ANSWERS = {
    vi: {
      q1: 'Bạn nhập email và mật khẩu đã tạo, sau đó nhấn nút Đăng nhập để tiếp tục.',
      q2: 'Hãy chuyển sang mục Đăng ký, điền đầy đủ thông tin và tạo tài khoản mới.',
      q3: 'Hệ thống sẽ tự chuyển bạn về màn hình đăng nhập và điền sẵn email, mật khẩu vừa tạo.',
      q4: 'Bạn vào phần Cài đặt để xem và chỉnh sửa thông tin của mình.',
      q5: 'Bạn vào Cài đặt, tải ảnh lên để đặt làm avatar cá nhân.',
      q6: 'Vào Cài đặt và chọn giữa tiếng Việt hoặc tiếng Anh.',
      q7: 'Bạn mở mục Công cụ, chọn đúng công cụ cần dùng, nhập thông tin và nhấn tạo prompt.',
      q8: 'Bạn có thể vào mục Liên hệ để gửi thông tin hoặc liên hệ admin qua các kênh hỗ trợ được hiển thị.',
      q9: 'Hãy vào trang Liên hệ để xem các cách liên hệ admin và gửi yêu cầu hỗ trợ.',
      q10: 'Bạn chọn Quên mật khẩu trên màn hình đăng nhập để đi đến bước xử lý lại thông tin đăng nhập.'
    },
    en: {
      q1: 'Enter your created email and password, then press the Login button to continue.',
      q2: 'Switch to Register, fill in the details, and create a new account.',
      q3: 'The system will send you back to the login screen and prefill the new email and password.',
      q4: 'Open Settings to view and edit your information.',
      q5: 'Open Settings and upload an image to use as your avatar.',
      q6: 'Go to Settings and choose Vietnamese or English.',
      q7: 'Open the Tools section, choose the right tool, fill in the fields, and generate a prompt.',
      q8: 'Go to Contact to send details or reach the admin through the support links shown there.',
      q9: 'Visit Contact to see how to reach the admin and submit a support request.',
      q10: 'Choose Forgot Password on the login screen to start the recovery flow.'
    }
  };

  let opened = false;
  let seeded = false;

  function lang(){
    return (window.App && window.App.getLanguage()) || 'vi';
  }

  function getElements(){
    return {
      panel: document.getElementById('chatWidgetPanel'),
      toggle: document.getElementById('chatWidgetToggle'),
      close: document.getElementById('chatWidgetClose'),
      windowEl: document.getElementById('chatWindow')
    };
  }

  function addBubble(text, type){
    const { windowEl } = getElements();
    if(!windowEl) return;
    const bubble = document.createElement('div');
    bubble.className = `chat-bubble ${type}`;
    bubble.textContent = text;
    windowEl.appendChild(bubble);
    windowEl.scrollTop = windowEl.scrollHeight;
  }

  function seed(){
    const { windowEl } = getElements();
    if(!windowEl || seeded) return;
    seeded = true;
    addBubble(lang() === 'vi' ? 'Chọn một câu hỏi bên dưới để xem câu trả lời mẫu.' : 'Choose a question below to see a sample answer.', 'bot');
  }

  function open(){
    const { panel, toggle } = getElements();
    if(!panel || !toggle) return;
    panel.classList.remove('hidden');
    toggle.setAttribute('aria-expanded', 'true');
    opened = true;
    seed();
  }

  function close(){
    const { panel, toggle } = getElements();
    if(!panel || !toggle) return;
    panel.classList.add('hidden');
    toggle.setAttribute('aria-expanded', 'false');
    opened = false;
  }

  function answer(key){
    const text = (ANSWERS[lang()] && ANSWERS[lang()][key]) || (ANSWERS.vi && ANSWERS.vi.q1) || '';
    seed();
    addBubble(text, 'bot');
  }

  function bind(){
    const { toggle, close: closeBtn } = getElements();
    if(toggle && !toggle.dataset.bound){
      toggle.dataset.bound = '1';
      toggle.addEventListener('click', () => {
        if(opened) close(); else open();
      });
    }
    if(closeBtn && !closeBtn.dataset.bound){
      closeBtn.dataset.bound = '1';
      closeBtn.addEventListener('click', close);
    }

    document.querySelectorAll('[data-qa]').forEach(btn => {
      if(btn.dataset.bound) return;
      btn.dataset.bound = '1';
      btn.addEventListener('click', () => {
        if(document.getElementById('chatWidgetPanel')?.classList.contains('hidden')) open();
        const label = btn.textContent || '';
        addBubble(label, 'user');
        window.setTimeout(() => answer(btn.dataset.qa), 120);
      });
    });
  }

  function init(){
    opened = false;
    seeded = false;
    bind();
  }

  window.Chatbot = { init, open, close, addBubble };

  if(window.App){
    window.App.ready(init);
  }
})();
