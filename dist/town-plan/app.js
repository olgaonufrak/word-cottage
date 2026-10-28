(() => {
  'use strict';
  const input = document.getElementById('catalog-search');
  const stage = document.getElementById('stage-filter');
  const status = document.getElementById('catalog-status');
  const preview = document.getElementById('exercise-preview');
  const previewContent = document.getElementById('preview-content');
  const fold = value => String(value).normalize('NFKC').toLocaleLowerCase('uk');
  const plural = (number, forms) => `${number} ${forms[new Intl.PluralRules('uk').select(number)] || forms.other}`;
  const projects = [...document.querySelectorAll('.project')].map(element => ({
    element,
    district: element.closest('.district'),
    stage: element.dataset.stage,
    search: fold(element.dataset.search),
    rows: [...element.querySelectorAll('tr[data-word-id]')].map(row => ({row, search:fold(row.textContent)}))
  }));
  let debounce;
  function filter() {
    const query = fold(input.value.trim());
    let cards = 0, sections = 0;
    for (const item of projects) {
      const allowed = stage.value === 'all' || item.stage === stage.value;
      const wholeSection = query && item.search.includes(query);
      let matches = 0;
      for (const {row, search} of item.rows) {
        const show = allowed && (!query || wholeSection || search.includes(query));
        row.hidden = !show;
        if (show) matches++;
      }
      item.element.hidden = !matches;
      if (matches) {
        cards += matches;
        sections++;
        if (query) { item.element.open = true; item.district.open = true; }
      }
    }
    for (const district of document.querySelectorAll('.district')) {
      district.hidden = ![...district.querySelectorAll('.project')].some(project => !project.hidden);
    }
    status.textContent = `${plural(sections,{one:'розділ',few:'розділи',other:'розділів'})} · ${plural(cards,{one:'картка',few:'картки',other:'карток'})}`;
    document.getElementById('no-results').hidden = cards !== 0;
  }
  input.addEventListener('input', () => { clearTimeout(debounce); debounce = setTimeout(filter, 180); });
  stage.addEventListener('change', filter);
  document.getElementById('reset-filter').addEventListener('click', () => {
    clearTimeout(debounce); input.value = ''; stage.value = 'all'; filter(); input.focus();
  });
  const pending = new Map();
  function loadExercises(category) {
    if (window.TOWN_EXERCISES_BY_SECTION?.[category]) return Promise.resolve(window.TOWN_EXERCISES_BY_SECTION[category]);
    if (!pending.has(category)) pending.set(category, new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = `exercises/${encodeURIComponent(category)}.js`;
      script.onload = () => {
        if (window.TOWN_EXERCISES_BY_SECTION?.[category]) resolve(window.TOWN_EXERCISES_BY_SECTION[category]);
        else { pending.delete(category); script.remove(); reject(new Error('empty')); }
      };
      script.onerror = () => { script.remove(); pending.delete(category); reject(new Error('load')); };
      document.head.append(script);
    }));
    return pending.get(category);
  }
  const escape = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  function showStep(step) {
    let body = '';
    if (step.type === 'introduction') {
      body = `<p><b>${escape(step.en)}</b> — ${escape(step.uk)}</p><p>${escape(step.example.sentence)}<br>${escape(step.example.translation)}</p>`;
      body += (step.extraExamples || []).map(item => `<p>${escape(item.sentence)}<br>${escape(item.translation)}</p>`).join('');
      body += '<p>Озвучення слова й прикладу; звичайний і повільний темп. Перегляд не видає позначку «вивчено».</p>';
    } else if (step.type === 'recognition') {
      body = `<p>Завдання: ${escape(step.promptUk)}</p><p>Варіанти: ${step.options.map(item => escape(item.en)).join(' · ')}</p><p>Відповідь у специфікації: <b>${escape(step.correctEn)}</b></p>`;
    } else if (step.type === 'spelling') {
      body = `<p>Завдання: ${escape(step.promptUk)}</p><p>Потрібно самостійно написати: <b>${escape(step.expectedEn)}</b>. Регістр і зайві пробіли нормалізуються.</p>`;
    } else if (step.type === 'context-gap') {
      body = `<p>${escape(step.before)}<b>___</b>${escape(step.after)}<br>${escape(step.translation)}</p><p>Фактична форма для пропуску: <b>${escape(step.target)}</b>.</p>`;
      body += (step.extraGapExercises || []).map(item => `<p>Додатковий контекст пари: ${escape((item.pattern || item.expectedSentence || '').replaceAll('{word}','___'))} · ${escape(item.target)}</p>`).join('');
    } else if (step.type === 'sentence-builder') {
      body = `<p>Завдання: ${escape(step.promptUk)}</p><p>Перемішані плитки: ${step.tokensShuffled.map(escape).join(' · ')}</p><p>Повне речення у специфікації: <b>${escape(step.expectedSentence)}</b></p><p>Усі плитки потрібні; зайвих слів у базовому режимі немає.</p>`;
      body += (step.extraBuilders || []).map(item => `<p><b>Додаткове речення пари:</b> ${escape(item.translation)}<br>Плитки: ${item.tokensShuffled.map(escape).join(' · ')}<br>Відповідь: ${escape(item.expectedSentence)}</p>`).join('');
      if (!step.shuffleChangePossible) body += '<p>Цей наявний контекст має лише один токен: перемішування неможливе. Це окремий короткий випадок, який не слід маскувати під багатослівний пазл.</p>';
    } else if (step.type === 'own-sentence') {
      body = `<p>${escape(step.promptUk)}</p><p>Приклад: ${escape(step.reference.sentence)}<br>${escape(step.reference.translation)}</p><p>Доступні відомі конструкції: ${(step.referenceVariants || []).map(escape).join(' · ')}</p><p>Перевірка залежить від фактично обраного набору й знайомої лексики. Довільне нове речення не має загальної автоматичної перевірки. Самоперевірка залишає картку для повторення й не видає автоматично позначку «вивчено».</p>`;
    }
    return `<section class="exercise-step"><strong>${step.step}. ${escape(step.prompt)}</strong>${body}</section>`;
  }
  let request = 0;
  let lastButton;
  document.addEventListener('click', async event => {
    const button = event.target.closest('[data-open-word]');
    if (!button) return;
    const token = ++request;
    lastButton = button;
    preview.hidden = false;
    previewContent.innerHTML = '<p role="status">Завантаження послівного плану вправ…</p>';
    preview.scrollIntoView({block:'start'});
    try {
      const data = await loadExercises(button.closest('.project').id);
      if (token !== request) return;
      const card = data.cards.find(item => item.id === button.dataset.openWord);
      if (!card) throw new Error('missing');
      previewContent.innerHTML = `<h3>${escape(card.en)} — ${escape(card.uk)}</h3><p><code>${escape(card.id)}</code></p><p class="notice">Це план вправ із відповідями. Це не запущений тест.</p>${card.steps.map(showStep).join('')}<details><summary>Технічний запис для реалізації</summary><pre>${escape(JSON.stringify(card.steps, null, 2))}</pre></details>`;
      document.getElementById('preview-heading').focus();
    } catch {
      if (token === request) previewContent.innerHTML = '<p role="alert">Не вдалося завантажити вправи. Натисніть кнопку картки ще раз або відкрийте повний JSON за посиланням вище.</p>';
    }
  });
  document.getElementById('close-preview').addEventListener('click', () => { request++; preview.hidden = true; lastButton?.focus(); });
  function revealHash() {
    let id;
    try { id = decodeURIComponent(location.hash.slice(1)); } catch { return; }
    const target = document.getElementById(id);
    if (!target) return;
    if (target.tagName === 'DETAILS') target.open = true;
    let parent = target.parentElement;
    while (parent) { if (parent.tagName === 'DETAILS') parent.open = true; parent = parent.parentElement; }
  }
  window.addEventListener('hashchange', revealHash);
  filter();
  revealHash();
})();
