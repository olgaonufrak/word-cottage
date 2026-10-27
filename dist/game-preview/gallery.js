const screens = [
  {
    "title": "Перший вхід",
    "src": "images/01-welcome.jpg",
    "mobile": false
  },
  {
    "title": "Вибір навчальної групи",
    "src": "images/02-home-groups.jpg",
    "mobile": false
  },
  {
    "title": "Мапа всіх зон",
    "src": "images/03-world-map.jpg",
    "mobile": false
  },
  {
    "title": "Основа для початківця",
    "src": "images/04-foundation.jpg",
    "mobile": false
  },
  {
    "title": "Етап 1",
    "src": "images/05-stage-one.jpg",
    "mobile": false
  },
  {
    "title": "Етап 2",
    "src": "images/06-stage-two.jpg",
    "mobile": false
  },
  {
    "title": "Етап 3",
    "src": "images/07-stage-three.jpg",
    "mobile": false
  },
  {
    "title": "Етап 4",
    "src": "images/08-stage-four.jpg",
    "mobile": false
  },
  {
    "title": "Відкрита глава",
    "src": "images/09-chapter-topics.jpg",
    "mobile": false
  },
  {
    "title": "Повний список слів",
    "src": "images/10-section-list.jpg",
    "mobile": false
  },
  {
    "title": "Кількість і відбір",
    "src": "images/11-quantity-swipe.jpg",
    "mobile": false
  },
  {
    "title": "Крок 1. Знайомство",
    "src": "images/12-intro.jpg",
    "mobile": false
  },
  {
    "title": "Знайди пару без підказок",
    "src": "images/13-matching-neutral.jpg",
    "mobile": false
  },
  {
    "title": "Підтверджена пара",
    "src": "images/14-matching-confirmed.jpg",
    "mobile": false
  },
  {
    "title": "Крок 3. Помилка",
    "src": "images/15-spelling-error.jpg",
    "mobile": false
  },
  {
    "title": "Підказка",
    "src": "images/16-spelling-hint.jpg",
    "mobile": false
  },
  {
    "title": "Крок 4. Пропуск",
    "src": "images/17-gap.jpg",
    "mobile": false
  },
  {
    "title": "Крок 5. Складання",
    "src": "images/18-sentence-builder.jpg",
    "mobile": false
  },
  {
    "title": "Крок 6. Власне речення",
    "src": "images/19-own-sentence.jpg",
    "mobile": false
  },
  {
    "title": "Результат заняття",
    "src": "images/20-lesson-result.jpg",
    "mobile": false
  },
  {
    "title": "Сад після заняття",
    "src": "images/21-garden-sprouts.jpg",
    "mobile": false
  },
  {
    "title": "Продовження заняття",
    "src": "images/22-resume-lesson.jpg",
    "mobile": false
  },
  {
    "title": "Наступний день",
    "src": "images/23-daily-review.jpg",
    "mobile": false
  },
  {
    "title": "R1. Аудіювання",
    "src": "images/24-audio-review.jpg",
    "mobile": false
  },
  {
    "title": "Квітка та золотий листок",
    "src": "images/25-review-growth.jpg",
    "mobile": false
  },
  {
    "title": "Сюжетна пригода",
    "src": "images/26-cafe-quest.jpg",
    "mobile": false
  },
  {
    "title": "Особливі типи слів",
    "src": "images/27-special-words.jpg",
    "mobile": false
  },
  {
    "title": "Завершення глави",
    "src": "images/28-chapter-reward.jpg",
    "mobile": false
  },
  {
    "title": "Крамниця прикрас",
    "src": "images/29-shop-inventory.jpg",
    "mobile": false
  },
  {
    "title": "Розміщення предмета",
    "src": "images/30-place-item.jpg",
    "mobile": false
  },
  {
    "title": "Особисте слово",
    "src": "images/31-personal-word.jpg",
    "mobile": false
  },
  {
    "title": "Вивчені слова та фільтри",
    "src": "images/32-learned-words.jpg",
    "mobile": false
  },
  {
    "title": "Телефон. Сад",
    "src": "images/33-mobile-garden.jpg",
    "mobile": true
  },
  {
    "title": "Телефон. Знайди пару",
    "src": "images/34-mobile-matching.jpg",
    "mobile": true
  },
  {
    "title": "Телефон. Введення",
    "src": "images/35-mobile-writing.jpg",
    "mobile": true
  },
  {
    "title": "Телефон. Будиночок",
    "src": "images/36-mobile-cottage.jpg",
    "mobile": true
  }
];

(() => {
  'use strict';
  const image = document.getElementById('screen-image');
  const stage = document.getElementById('image-stage');
  const title = document.getElementById('screen-title');
  const counter = document.getElementById('counter');
  const select = document.getElementById('screen-select');
  const previous = document.getElementById('previous');
  const next = document.getElementById('next');
  const zoom = document.getElementById('zoom');
  const openImage = document.getElementById('open-image');
  const status = document.getElementById('load-status');
  const error = document.getElementById('load-error');
  let current = 0;

  screens.forEach((screen, index) => {
    const option = document.createElement('option');
    option.value = String(index);
    option.textContent = `${index + 1}. ${screen.title}`;
    select.append(option);
  });

  function resetZoom() {
    stage.classList.remove('zoomed');
    stage.scrollTop = 0;
    stage.scrollLeft = 0;
    zoom.textContent = 'Збільшити';
    zoom.setAttribute('aria-pressed', 'false');
  }

  function show(index) {
    current = Math.max(0, Math.min(screens.length - 1, index));
    const screen = screens[current];
    resetZoom();
    stage.classList.toggle('portrait', screen.mobile);
    title.textContent = screen.title;
    counter.textContent = `${current + 1} / ${screens.length}`;
    select.value = String(current);
    previous.disabled = current === 0;
    next.disabled = current === screens.length - 1;
    openImage.href = screen.src;
    image.alt = `${screen.title} — екран ${current + 1} візуального плану гри`;
    image.width = screen.mobile ? 768 : 1024;
    image.height = screen.mobile ? 1536 : 683;
    error.hidden = true;
    image.hidden = false;
    status.hidden = true;
    if (image.getAttribute('src') !== screen.src) {
      status.hidden = false;
      image.src = screen.src;
    } else if (image.complete && image.naturalWidth === 0) {
      image.hidden = true;
      error.hidden = false;
    } else {
      status.hidden = image.complete;
    }
  }

  function fromHash() {
    const match = /^#(\d+)$/.exec(location.hash);
    show(match ? Number(match[1]) - 1 : 0);
  }

  function go(index) {
    const safe = Math.max(0, Math.min(screens.length - 1, index));
    location.hash = String(safe + 1);
    window.scrollTo(0, 0);
  }

  image.addEventListener('load', () => { status.hidden = true; error.hidden = true; });
  image.addEventListener('error', () => {
    status.hidden = true;
    image.hidden = true;
    error.hidden = false;
  });
  document.getElementById('retry').addEventListener('click', () => {
    error.hidden = true;
    status.hidden = false;
    image.hidden = false;
    const url = new URL(screens[current].src, location.href);
    url.searchParams.set('retry', String(Date.now()));
    image.src = url.href;
  });
  previous.addEventListener('click', () => go(current - 1));
  next.addEventListener('click', () => go(current + 1));
  select.addEventListener('change', () => go(Number(select.value)));
  zoom.addEventListener('click', () => {
    const active = stage.classList.toggle('zoomed');
    zoom.textContent = active ? 'Зменшити' : 'Збільшити';
    zoom.setAttribute('aria-pressed', String(active));
  });
  window.addEventListener('hashchange', fromHash);
  document.addEventListener('keydown', event => {
    if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey || event.target.closest('select, input, textarea, [contenteditable], .zoomed')) return;
    if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
      event.preventDefault();
      go(current + (event.key === 'ArrowRight' ? 1 : -1));
    }
  });
  fromHash();
  document.getElementById('navigation').hidden = false;
  document.getElementById('image-tools').hidden = false;
})();
