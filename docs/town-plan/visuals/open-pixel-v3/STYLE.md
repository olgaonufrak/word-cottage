# Спільний запит для всіх 45 нових сцен

Використати вбудований imagegen: один окремий портретний кадр на кожний ID. Усі 45 перероблюються заново, включно з мапою №4. Публікація тільки після заміни всіх 45 активних записів.

## Обов’язкова стилістична частина кожного запиту

Use case: style-transfer. Generate ONE completely redrawn portrait 9:16 Word Cottage gameplay screenshot. Image 1 is the PRIMARY approved reference for SPACIOUS composition, simple game sprites and CLEARLY VISIBLE LARGE PIXELS. Image 2, when provided, is only the OLD scene CONTENT reference: retain its learning meaning and the exact requested words/counts, but DISCARD its cramped scenery, densely packed buildings, micro-detail and ornamental layout. Rebuild the composition, do not merely apply a pixel filter to the old illustration.

CRITICAL unified art direction: look like a native 240 by 420 pixel game framebuffer enlarged with nearest-neighbor. Consistent coarse square pixel clusters and stair-step outlines, 2–3 flat shades per material, a restrained approximately 32-color palette. Chunky pixel lettering, simple readable sprites. Warm green open meadows, broad tan paths, teal river, orange tiled roofs, cream UI and teal buttons. Brown-haired small player sprite with teal backpack and brown boots. Friendly actual playable game, with simple colored volume. Very little purple and no lavender fields. No photographic texture, painterly fine details, blurred 3D or high-resolution illustration disguised as pixel art.

MAKE SPACE: outdoor scenes have broad calm grass or path clearings BETWEEN every object, about half the visible WORLD area is open walkable ground. Task scenes show ONE small main stall/building only; neighborhood views at most THREE modest separated landmarks; world maps at most FIVE modest separated landmarks. Even a fully developed town must be an open playable place, not tightly packed city blocks. No distant rows of tiny houses used to refill empty space. At most 8–10 simple scattered trees in a full map, fewer in task closeups; at most three tiny flower clusters. Plain grass with very sparse blocky tufts, no decorative confetti. A simple river segment and at most one bridge if required by the scene, no elaborate cliffs, multiple waterfalls or bridge networks. Interiors have ample empty floor and few pieces of furniture. UI panels remain readable with large touch targets and wide gaps; simplify decoration around them.

Keep ONLY the exact scene-specific labels below. Do NOT copy map labels, counters or navigation badges from the style reference into unrelated scenes. Bottom game navigation, when visible, reads exactly "Мапа", "Слова", "Дім". No browser chrome, phone/monitor frame, outside margins, collage, triptych, caption poster or extra screens. The generated artwork itself fills the portrait canvas.

Learning invariants: no manual curriculum-word selection, checkboxes, quantity picker, skip button or unknown-word search. All section words are mandatory. Completion only at N/N. Answer candidate tiles always have identical neutral cream backgrounds, borders, type and size, no preselected answer and no matching colors or position hints. An audio quiz must not print the English answer outside its candidate tiles. A spelling quiz must not print the full answer anywhere; only an exact partial input when specified. Introduction/journal cards may display the word and its real context. Confirmed word totals and the CURRENT CARD INDEX must be explicitly distinguished when stated. Do not invent rewards or double-award construction points during review.

## Технічне збереження

- Сцени та точний зміст — `briefs.json`.
- PNG — у папці візуалізацій `town-plan-open-pixel-v3/<id>.png`.
- JPEG — `dist/town-plan/scenes/images/<id>-open-v3.jpg`, механічне перекодування без обрізання/масштабування, quality=90, optimize=True, subsampling=0.
- Кожний виконавець зберігає власний JSON метаданих після кожної готової сцени. Канонічні попередні записи до завершення всіх 45 не змінюються.
