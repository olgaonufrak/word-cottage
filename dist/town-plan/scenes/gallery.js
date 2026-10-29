'use strict';
(() => {
  const data = window.TOWN_PLAN_SCENES;
  if (!data?.images?.length) return;
  const $ = id => document.getElementById(id);
  const image = $('scene-image');
  const stage = $('image-stage');
  const chapterSelect = $('chapter-select');
  const sceneSelect = $('scene-select');
  const ids = new Map(data.images.map((scene,index) => [scene.id,index]));
  let current = -1;
  let retry = 0;
  const clearZoom = () => {
    stage.classList.remove('zoomed');
    $('zoom').setAttribute('aria-pressed','false');
    $('zoom').textContent = 'Збільшити';
  };
  function render(index, changeHash = true) {
    index = Math.min(data.images.length-1, Math.max(0,index));
    if (index === current) return;
    current = index;
    const scene = data.images[index];
    const chapter = data.chapters.find(chapter => chapter.chapter === scene.chapter);
    chapterSelect.value = String(scene.chapter);
    sceneSelect.replaceChildren(...data.images.filter(item => item.chapter === scene.chapter).map(item => new Option(`${item.number}. ${item.title}`,item.id)));
    sceneSelect.value = scene.id;
    $('scene-title').textContent = scene.title;
    $('chapter-label').textContent = `${scene.chapter}. ${chapter.title} · сцена ${scene.number} / 3`;
    $('caption').textContent = scene.caption;
    $('counter').textContent = $('short-counter').textContent = `${index+1} / ${data.images.length}`;
    $('previous').disabled = index === 0;
    $('next').disabled = index === data.images.length-1;
    $('open-image').href = scene.file;
    $('text-link').href = `../#design-${scene.chapter+1}`;
    clearZoom();
    $('load-error').hidden = true;
    $('loading').hidden = false;
    image.hidden = true;
    image.alt = scene.caption;
    image.width = scene.width;
    image.height = scene.height;
    stage.setAttribute('aria-busy','true');
    image.src = scene.file;
    if (changeHash) history.replaceState(null,'',`#${scene.id}`);
    document.title = `${scene.chapter}.${scene.number} ${scene.title} — Word Cottage`;
    if (image.complete && image.naturalWidth) loaded();
  }
  function loaded() {
    $('loading').hidden = true;
    $('load-error').hidden = true;
    image.hidden = false;
    stage.setAttribute('aria-busy','false');
  }
  image.addEventListener('load',loaded);
  image.addEventListener('error',() => {
    $('loading').hidden = true;
    $('load-error').hidden = false;
    image.hidden = true;
    stage.setAttribute('aria-busy','false');
  });
  chapterSelect.replaceChildren(...data.chapters.map(chapter => new Option(`${chapter.chapter}. ${chapter.title}`,String(chapter.chapter))));
  chapterSelect.addEventListener('change',() => render(data.images.findIndex(scene => scene.chapter === Number(chapterSelect.value))));
  sceneSelect.addEventListener('change',() => render(ids.get(sceneSelect.value)));
  $('previous').addEventListener('click',() => render(current-1));
  $('next').addEventListener('click',() => render(current+1));
  $('retry').addEventListener('click',() => {
    $('load-error').hidden = true;
    $('loading').hidden = false;
    stage.setAttribute('aria-busy','true');
    image.src = data.images[current].file+'?retry='+(++retry);
  });
  $('zoom').addEventListener('click',() => {
    const zoomed = stage.classList.toggle('zoomed');
    $('zoom').setAttribute('aria-pressed',String(zoomed));
    $('zoom').textContent = zoomed ? 'Умістити на екрані' : 'Збільшити';
    if (!zoomed) { stage.scrollLeft=0; stage.scrollTop=0; }
  });
  document.addEventListener('click',event => {
    const link = event.target.closest('[data-scene-link]');
    if (!link || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || event.button !== 0) return;
    event.preventDefault();
    render(ids.get(link.dataset.sceneLink));
    $('scene-title').scrollIntoView({block:'start'});
  });
  document.addEventListener('keydown',event => {
    if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey || /^(SELECT|INPUT|TEXTAREA)$/.test(event.target.tagName) || event.target.isContentEditable) return;
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      render(current+(event.key === 'ArrowLeft' ? -1 : 1));
    }
  });
  const fromHash = () => render(ids.get(location.hash.slice(1)) ?? 0,false);
  window.addEventListener('hashchange',fromHash);
  $('pickers').hidden = $('navigation').hidden = $('zoom').hidden = false;
  fromHash();
})();
