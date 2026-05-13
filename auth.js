(function(){
  // Auth UI: fake login/register with validation, demo account storage and loading states.
  const COPY = {
    vi: {
      gateMessage: 'Tài khoản này chưa được đăng kí , vui lòng đăng kí để tiếp tục',
      emptyLogin: 'Vui lòng nhập email và mật khẩu.',
      wrongPassword: 'Mật khẩu chưa đúng.',
      emptyFields: 'Vui lòng điền đầy đủ thông tin.',
      classRequired: 'Vui lòng chọn lớp cho vai trò Học sinh.',
      passwordShort: 'Mật khẩu cần ít nhất 8 ký tự.',
      passwordMismatch: 'Mật khẩu xác nhận không khớp.',
      accountCreated: 'Tạo tài khoản thành công.',
      loginSuccess: 'Đăng nhập thành công.',
      socialError: 'Tính năng đang được bảo trì, vui lòng thử lại sau.',
      recoveryEmpty: 'Vui lòng nhập email.',
      recoverySent: email => `Đã gửi mô phỏng khôi phục tới ${email}`,
      recoverTitle: 'Khôi phục mật khẩu',
      recoverDesc: 'Nhập email demo để nhận thông báo giả lập. Không có email thật được gửi đi.'
    },
    en: {
      gateMessage: 'This account has not been registered yet, please register to continue',
      emptyLogin: 'Please enter email and password.',
      wrongPassword: 'Password is incorrect.',
      emptyFields: 'Please complete all required fields.',
      classRequired: 'Please select a class for Student.',
      passwordShort: 'Password must be at least 8 characters.',
      passwordMismatch: 'Password confirmation does not match.',
      accountCreated: 'Account created successfully.',
      loginSuccess: 'Login successful.',
      socialError: 'The feature is under maintenance, please try again later.',
      recoveryEmpty: 'Please enter an email.',
      recoverySent: email => `Recovery flow simulated for ${email}.`,
      recoverTitle: 'Password recovery',
      recoverDesc: 'Enter the demo email to see a simulated reset flow. No real email will be sent.'
    }
  };

  function lang(){
    return window.App.getLanguage() === 'en' ? 'en' : 'vi';
  }

  function t(key, ...args){
    const entry = COPY[lang()][key];
    return typeof entry === 'function' ? entry(...args) : entry;
  }

  function setTab(tab){
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.authTab === tab);
    });
    document.querySelectorAll('.auth-form').forEach(form => {
      form.classList.toggle('active', form.id === `${tab}Form`);
    });
  }

  function showError(message){
    window.App.toast('PromptPilot', message, 'error');
  }

  function roleLabel(roleKey){
    const current = lang();
    const map = {
      student: current === 'vi' ? 'Học sinh' : 'Student',
      teacher: current === 'vi' ? 'Giáo viên' : 'Teacher',
      self: current === 'vi' ? 'Tự học' : 'Self-learning'
    };
    return map[roleKey] || '';
  }

  function setLoginDefaults(email, password){
    const loginForm = document.getElementById('loginForm');
    if(!loginForm) return;
    loginForm.elements.email.value = email || '';
    loginForm.elements.password.value = password || '';
    loginForm.elements.remember.checked = false;
  }

  function restoreLoginDefaults(){
    const prefill = window.App.getLoginPrefill();
    if(prefill?.email || prefill?.password){
      setLoginDefaults(prefill.email, prefill.password);
    }
  }

  function updateRegisterRules(){
    const form = document.getElementById('registerForm');
    if(!form) return;
    const roleSelect = form.elements.role;
    const classSelect = form.elements.classLevel;
    const sync = () => {
      const isStudent = roleSelect.value === 'student';
      classSelect.required = isStudent;
      if(!isStudent) classSelect.value = '';
    };
    if(!roleSelect.dataset.bound){
      roleSelect.dataset.bound = '1';
      roleSelect.addEventListener('change', sync);
    }
    sync();
  }

  function submitLogin(form){
    const fd = new FormData(form);
    const email = String(fd.get('email') || '').trim();
    const password = String(fd.get('password') || '').trim();

    // Lần bấm đăng nhập đầu tiên luôn dẫn người dùng sang đăng ký.
    if(!window.App.canAttemptLogin()){
      showError(t('gateMessage'));
      setTab('register');
      return;
    }

    if(!email || !password){
      showError(t('emptyLogin'));
      return;
    }

    const account = window.App.findAccountByEmail(email);
    if(!account){
      showError(t('gateMessage'));
      setTab('register');
      return;
    }

    if(String(account.password || '') !== password){
      showError(t('wrongPassword'));
      return;
    }

    window.App.setUser(account);
    if(fd.get('remember')){
      window.App.writeStorage('local', 'promptpilot_remember', '1');
    }else{
      window.App.removeStorage('local', 'promptpilot_remember');
    }

    window.App.setAuthed(true);
    window.App.showLoading(true);
    window.App.toast('PromptPilot', t('loginSuccess'));
    window.setTimeout(() => {
      window.location.href = 'pages/home.html';
    }, 1000);
  }

  function submitRegister(form){
    const fd = new FormData(form);
    const fullName = String(fd.get('fullName') || '').trim();
    const email = String(fd.get('email') || '').trim();
    const phone = String(fd.get('phone') || '').trim();
    const roleKey = String(fd.get('role') || '').trim();
    const classLevel = String(fd.get('classLevel') || '').trim();
    const purpose = String(fd.get('purpose') || '').trim();
    const password = String(fd.get('password') || '').trim();
    const confirmPassword = String(fd.get('confirmPassword') || '').trim();
    const accept = fd.get('accept');

    if(!fullName || !email || !phone || !roleKey || !password || !confirmPassword || !accept){
      showError(t('emptyFields'));
      return;
    }

    if(roleKey === 'student' && !classLevel){
      showError(t('classRequired'));
      return;
    }

    if(password.length < 8){
      showError(t('passwordShort'));
      return;
    }

    if(password !== confirmPassword){
      showError(t('passwordMismatch'));
      return;
    }

    const nextUser = {
      ...window.App.EMPTY_USER,
      fullName,
      email,
      phone,
      roleKey,
      role: roleLabel(roleKey),
      classLevel: roleKey === 'student' ? classLevel : '',
      purpose,
      password,
      avatar: ''
    };

    window.App.setUser(nextUser);
    window.App.setLoginGate(true);
    window.App.setLoginPrefill({ email, password });
    window.App.toast('PromptPilot', t('accountCreated'));
    setLoginDefaults(email, password);
    setTab('login');
    form.reset();
    updateRegisterRules();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function bindSocialButtons(){
    document.querySelectorAll('[data-social]').forEach(btn => {
      btn.addEventListener('click', () => {
        window.App.toast('PromptPilot', t('socialError'), 'error');
      });
    });
  }

  function bindForgotPassword(){
    const openBtn = document.getElementById('forgotPasswordBtn');
    const modal = document.getElementById('forgotModal');
    const closeButtons = document.querySelectorAll('[data-close-modal]');
    const sendBtn = document.getElementById('sendResetBtn');
    const emailInput = document.getElementById('forgotEmail');
    const title = modal?.querySelector('[data-i18n="forgot_title"]');
    const desc = modal?.querySelector('[data-i18n="forgot_desc"]');

    openBtn?.addEventListener('click', () => {
      if(emailInput){
        emailInput.value = '';
        emailInput.defaultValue = '';
        emailInput.setAttribute('value', '');
      }
      if(title) title.textContent = t('recoverTitle');
      if(desc) desc.textContent = t('recoverDesc');
      modal.classList.remove('hidden');
      emailInput?.focus();
    });

    closeButtons.forEach(btn => btn.addEventListener('click', () => modal.classList.add('hidden')));
    modal?.addEventListener('click', (e) => {
      if(e.target === modal) modal.classList.add('hidden');
    });

    sendBtn?.addEventListener('click', () => {
      const email = String(emailInput?.value || '').trim();
      if(!email){
        showError(t('recoveryEmpty'));
        return;
      }
      window.App.toast('PromptPilot', t('recoverySent', email));
      modal.classList.add('hidden');
    });
  }

  function bindTabs(){
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', () => setTab(btn.dataset.authTab));
    });
  }

  function clearForms(){
    document.querySelectorAll('.auth-form').forEach(form => {
      form.reset();
      form.querySelectorAll('input, textarea, select').forEach(el => {
        if(el.type === 'checkbox' || el.type === 'radio') el.checked = false;
        else el.value = '';
      });
    });
  }

  function init(){
    bindTabs();
    bindSocialButtons();
    bindForgotPassword();
    clearForms();
    updateRegisterRules();
    restoreLoginDefaults();

    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const registerRole = registerForm?.elements.role;
    if(registerRole){
      registerRole.addEventListener('change', updateRegisterRules);
    }

    loginForm?.addEventListener('submit', (e) => {
      e.preventDefault();
      submitLogin(e.currentTarget);
    });

    registerForm?.addEventListener('submit', (e) => {
      e.preventDefault();
      submitRegister(e.currentTarget);
    });

    window.App.showLoading(false);
  }

  window.Auth = { init, setTab };

  if(window.App){
    window.App.ready(init);
  }
})();
