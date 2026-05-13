(function(){
  // Prompt generators are deterministic on purpose so the UI stays stable and predictable.
  function makeStudyPrompt(data){
    const lang = window.App.getLanguage();
    const subject = data.subject || (lang === 'vi' ? 'môn học' : 'the subject');
    const classLevel = data.classLevel || (lang === 'vi' ? 'lớp học' : 'grade');
    const question = data.question || (lang === 'vi' ? 'câu hỏi của tôi' : 'my question');
    const output = data.output || (lang === 'vi' ? 'đầu ra mong muốn' : 'desired output');

    return lang === 'vi'
      ? `Bạn là một gia sư ${subject} chuyên nghiệp cho học sinh ${classLevel}.\n\nNhiệm vụ: trả lời câu hỏi sau một cách chính xác, dễ hiểu và có cấu trúc.\nCâu hỏi: ${question}\n\nYêu cầu đầu ra: ${output}.\n\nHãy trình bày theo các phần rõ ràng, dùng ví dụ ngắn nếu cần, và kết thúc bằng một tóm tắt 3 ý chính.`
      : `You are a professional ${subject} tutor for ${classLevel}.\n\nTask: answer the following question accurately, clearly, and in a structured way.\nQuestion: ${question}\n\nDesired output: ${output}.\n\nOrganize the response into clear sections, add short examples when useful, and finish with a 3-point summary.`;
  }

  function makeCodePrompt(data){
    const lang = window.App.getLanguage();
    const language = data.language || (lang === 'vi' ? 'ngôn ngữ phù hợp' : 'the most suitable language');
    const projectType = data.projectType || (lang === 'vi' ? 'project phù hợp' : 'suitable project');
    const goal = data.goal || (lang === 'vi' ? 'mục tiêu code' : 'code goal');
    const special = data.special || (lang === 'vi' ? 'yêu cầu bổ sung' : 'additional requirements');

    return lang === 'vi'
      ? `Hãy đóng vai một senior front-end engineer.\n\nNgôn ngữ: ${language}\nKiểu project: ${projectType}\nMục tiêu: ${goal}\nYêu cầu đặc biệt: ${special}\n\nHãy đề xuất kiến trúc tốt nhất, viết code sạch, chú thích ngắn gọn nếu cần, và ưu tiên tính ổn định trước rồi mới tối ưu giao diện.`
      : `Act as a senior front-end engineer.\n\nLanguage: ${language}\nProject type: ${projectType}\nGoal: ${goal}\nSpecial requirements: ${special}\n\nSuggest the best architecture, keep the code clean, add only brief comments when useful, and prioritize stability before visual polish.`;
  }

  function makeWorkPrompt(data){
    const lang = window.App.getLanguage();
    const task = data.task || (lang === 'vi' ? 'nhiệm vụ của tôi' : 'my task');
    const deadline = data.deadline || (lang === 'vi' ? 'không rõ deadline' : 'no fixed deadline');
    const outputType = data.outputType || (lang === 'vi' ? 'đầu ra phù hợp' : 'a suitable output format');

    return lang === 'vi'
      ? `Bạn là trợ lý năng suất làm việc.\n\nNhiệm vụ: ${task}\nThời gian / deadline: ${deadline}\nKiểu đầu ra mong muốn: ${outputType}\n\nHãy giúp tôi phân tích nhiệm vụ, chia thành các bước nhỏ, gợi ý ưu tiên và đưa ra một checklist ngắn gọn, thực dụng.`
      : `You are a productivity assistant.\n\nTask: ${task}\nTime / deadline: ${deadline}\nDesired output format: ${outputType}\n\nHelp me analyze the task, break it into smaller steps, suggest priorities, and provide a concise practical checklist.`;
  }

  // Copy buttons use the shared clipboard helper and keep the result panel read-only.
  function bindCopyButtons(){
    document.querySelectorAll('[data-copy-target]').forEach(btn => {
      btn.addEventListener('click', async () => {
        const target = document.getElementById(btn.dataset.copyTarget);
        if(!target) return;
        try{
          await window.App.copyText(target.textContent || '');
          window.App.toast('PromptPilot', window.App.getLanguage() === 'vi' ? 'Đã copy prompt.' : 'Prompt copied.');
        }catch{
          window.App.toast('PromptPilot', window.App.getLanguage() === 'vi' ? 'Không thể copy lúc này.' : 'Could not copy right now.', 'error');
        }
      });
    });
  }

  function setResult(id, value){
    const el = document.getElementById(id);
    if(el) el.textContent = value;
  }

  function initStudy(){
    const form = document.getElementById('studyToolForm');
    if(!form) return;
    setResult('studyResult', makeStudyPrompt({
      subject: 'Toán',
      classLevel: 'Lớp 10',
      question: 'Giải thích hàm số bậc hai',
      output: 'Giải thích dễ hiểu, có ví dụ'
    }));
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const fd = new FormData(form);
      setResult('studyResult', makeStudyPrompt(Object.fromEntries(fd.entries())));
    });
  }

  function initCode(){
    const form = document.getElementById('codeToolForm');
    if(!form) return;
    setResult('codeResult', makeCodePrompt({
      language: 'JavaScript',
      projectType: 'Responsive landing page',
      goal: 'Xây dựng giao diện login có fake auth logic',
      special: 'Clean code, component hóa, mobile-first'
    }));
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const fd = new FormData(form);
      setResult('codeResult', makeCodePrompt(Object.fromEntries(fd.entries())));
    });
  }

  function initWork(){
    const form = document.getElementById('workToolForm');
    if(!form) return;
    setResult('workResult', makeWorkPrompt({
      task: 'Lên kế hoạch học tuần này theo từng môn',
      deadline: 'Cuối tuần',
      outputType: 'Checklist ngắn gọn'
    }));
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const fd = new FormData(form);
      setResult('workResult', makeWorkPrompt(Object.fromEntries(fd.entries())));
    });
  }

  function init(){
    bindCopyButtons();
    initStudy();
    initCode();
    initWork();
  }

  window.Tools = { init, makeStudyPrompt, makeCodePrompt, makeWorkPrompt };

  if(window.App){
    window.App.ready(init);
  }
})();
