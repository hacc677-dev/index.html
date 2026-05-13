(function(){
  // Settings page: profile sync, language/theme toggle, avatar upload and logout.
  function renderAvatar(node, user){
    if(!node) return;
    node.innerHTML = '';
    if(user && user.avatar){
      const img = document.createElement('img');
      img.src = user.avatar;
      img.alt = user.fullName || 'Avatar';
      img.className = 'avatar-image';
      node.appendChild(img);
      node.classList.add('has-image');
      return;
    }
    node.classList.remove('has-image');
    node.textContent = window.App.initials(user?.fullName || 'PP');
  }

  function syncProfile(){
    const user = window.App.getUser();
    const form = document.getElementById('settingsForm');
    if(!form) return;

    form.fullName.value = user.fullName || '';
    form.email.value = user.email || '';
    form.phone.value = user.phone || '';
    form.classLevel.value = user.classLevel || '';
    form.role.value = user.role || '';
    form.purpose.value = user.purpose || '';

    const avatar = document.getElementById('profileAvatar');
    const avatarUpload = document.getElementById('avatarUploadPreview');
    const name = document.getElementById('profileName');
    const role = document.getElementById('profileRole');
    const email = document.getElementById('profileEmail');
    const phone = document.getElementById('profilePhone');
    const classLevel = document.getElementById('profileClass');
    const purpose = document.getElementById('profilePurpose');

    renderAvatar(avatar, user);
    renderAvatar(avatarUpload, user);
    if(name) name.textContent = user.fullName || '—';
    if(role) role.textContent = [user.role || '', user.classLevel || ''].filter(Boolean).join(' · ') || '—';
    if(email) email.textContent = user.email || '—';
    if(phone) phone.textContent = user.phone || '—';
    if(classLevel) classLevel.textContent = user.classLevel || '—';
    if(purpose) purpose.textContent = user.purpose || '—';

    const saveStatus = document.getElementById('saveStatus');
    if(saveStatus) saveStatus.textContent = window.App.getLanguage() === 'vi' ? 'Sẵn sàng' : 'Ready';
  }

  function syncTheme(){
    const theme = window.App.getTheme();
    document.querySelectorAll('.theme-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.theme === theme);
    });
    const status = document.getElementById('themeStatus');
    if(status){
      status.textContent = theme === 'dark'
        ? (window.App.getLanguage() === 'vi' ? 'Đang bật' : 'On')
        : (window.App.getLanguage() === 'vi' ? 'Đang tắt' : 'Off');
    }
  }

  function bindLanguage(){
    document.querySelectorAll('.lang-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        window.App.setLanguage(btn.dataset.lang);
        updateActiveLanguage(btn.dataset.lang);
        syncProfile();
        syncTheme();
        window.Components && window.Components.renderAll && window.Components.renderAll();
        window.App.toast('PromptPilot', window.App.getLanguage() === 'vi' ? 'Đã cập nhật ngôn ngữ.' : 'Language updated.');
      });
    });
    updateActiveLanguage(window.App.getLanguage());
  }

  function updateActiveLanguage(lang){
    document.querySelectorAll('.lang-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.lang === lang);
    });
  }

  function bindTheme(){
    document.querySelectorAll('[data-theme]').forEach(btn => {
      btn.addEventListener('click', () => {
        window.App.setTheme(btn.dataset.theme);
        syncTheme();
        window.Components && window.Components.renderAll && window.Components.renderAll();
        window.App.toast('PromptPilot', window.App.getLanguage() === 'vi' ? 'Đã đổi chế độ hiển thị.' : 'Display mode updated.');
      });
    });
    syncTheme();
  }

  function bindForm(){
    const form = document.getElementById('settingsForm');
    form?.addEventListener('submit', (e) => {
      e.preventDefault();
      const fd = new FormData(form);
      const user = window.App.getUser();
      const next = {
        ...user,
        fullName: String(fd.get('fullName') || '').trim(),
        email: String(fd.get('email') || '').trim(),
        phone: String(fd.get('phone') || '').trim(),
        classLevel: String(fd.get('classLevel') || '').trim(),
        role: String(fd.get('role') || '').trim(),
        purpose: String(fd.get('purpose') || '').trim()
      };
      // Cập nhật account theo email cũ để tránh tạo trùng hồ sơ khi đổi email trong Settings.
      if(window.App.updateAccountByEmail){
        window.App.updateAccountByEmail(user.email, next);
      }else{
        window.App.setUser(next);
      }
      const saveStatus = document.getElementById('saveStatus');
      if(saveStatus) saveStatus.textContent = window.App.getLanguage() === 'vi' ? 'Đã lưu' : 'Saved';
      syncProfile();
      window.Components && window.Components.renderAll && window.Components.renderAll();
      window.App.toast('PromptPilot', window.App.getLanguage() === 'vi' ? 'Đã lưu thông tin cá nhân.' : 'Profile saved successfully.');
      window.setTimeout(() => {
        const status = document.getElementById('saveStatus');
        if(status) status.textContent = window.App.getLanguage() === 'vi' ? 'Sẵn sàng' : 'Ready';
      }, 1600);
    });
  }

  function bindAvatarUpload(){
    const input = document.getElementById('avatarInput');
    const remove = document.getElementById('removeAvatarBtn');

    input?.addEventListener('change', () => {
      const file = input.files && input.files[0];
      if(!file) return;
      if(!file.type.startsWith('image/')){
        window.App.toast('PromptPilot', window.App.getLanguage() === 'vi' ? 'Vui lòng chọn một file ảnh.' : 'Please choose an image file.', 'error');
        input.value = '';
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        const next = { ...window.App.getUser(), avatar: String(reader.result || '') };
        window.App.setUser(next);
        syncProfile();
        window.Components && window.Components.renderAll && window.Components.renderAll();
        window.App.toast('PromptPilot', window.App.getLanguage() === 'vi' ? 'Đã cập nhật avatar.' : 'Avatar updated.');
        input.value = '';
      };
      reader.readAsDataURL(file);
    });

    remove?.addEventListener('click', () => {
      const next = { ...window.App.getUser(), avatar: '' };
      window.App.setUser(next);
      syncProfile();
      window.Components && window.Components.renderAll && window.Components.renderAll();
      window.App.toast('PromptPilot', window.App.getLanguage() === 'vi' ? 'Đã xóa ảnh đại diện.' : 'Avatar removed.');
    });
  }

  function bindLogout(){
    const btn = document.getElementById('logoutBtn');
    btn?.addEventListener('click', () => {
      // Đăng xuất sẽ reset luôn luồng đăng nhập để lần vào sau quay lại trạng thái ban đầu.
      window.App.resetLoginFlow();
      window.App.setAuthed(false);
      window.App.toast('PromptPilot', window.App.getLanguage() === 'vi' ? 'Đã đăng xuất khỏi phiên demo.' : 'You have been signed out.');
      window.setTimeout(() => {
        window.location.href = (document.body.dataset.base || '../') + 'index.html';
      }, 450);
    });
  }

  function init(){
    syncProfile();
    bindLanguage();
    bindTheme();
    bindForm();
    bindAvatarUpload();
    bindLogout();
  }

  window.Settings = { init, syncProfile, syncTheme };

  if(window.App){
    window.App.ready(init);
  }
})();
