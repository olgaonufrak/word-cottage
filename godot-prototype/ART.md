# Ілюстрації прототипу

`assets/garden.webp` — нова оригінальна фонова ілюстрація, створена 27 жовтня 2026 вбудованим ImageGen. Зображення збережене як WebP для гри; написи, кнопки та рослина не вмальовані у фон. Рослина й анімація її появи — геометрія Godot у `scripts/garden.gd`. Вихідна генерація має розмір 1536 × 1024. Палітра й об’ємний ігровий вигляд продовжують схвалену користувачкою концепцію, з мінімумом фіолетового.

Фінальний запит (built-in ImageGen):

> Use case: stylized-concept. Production game background asset for an actual cozy 2D Godot gardening vocabulary game Word Cottage. Generate a beautiful landscape 1536x1024 isometric miniature garden diorama on a warm cream background. Charming illustrated game-like sculpted 3D volume, soft painted materials, chunky rounded stonework, sunlight and ambient occlusion, richly colorful olive and fresh greens, terracotta orange tiles, warm yellow and white flowers. A small storybook cottage at upper-right with green arched door and orange tiled roof, apple tree upper-left, low wooden fence, a stone path winding from bottom-right toward cottage. ONE LARGE EMPTY DARK SOIL raised garden bed in the LOWER LEFT/CENTER occupying about 35 percent of scene width with rounded chunky sandstone border, its soil surface clearly empty and unobstructed for runtime plant sprites. Keep the empty soil around normalized x0.36 y0.70. Flowers around perimeter, a small blue watering can beside path; very little purple, no lavender fields. Full garden island visible with depth, cream negative space outer corners. Crisp appealing polished casual game art, playful, not a photograph. ABSOLUTELY NO text, letters, numbers, UI panels, signs, labels, buttons, icons, characters, hands, watermarks, existing plants inside the empty soil bed. Do not show gameplay screenshots or presentation boards.

Ілюстрації слів перенесені без перемальовування з поточного сайту:

| Слово | Ресурс | Ділянка |
| --- | --- | --- |
| water | `dist/images/vocabulary-painted/painted-11.webp` | комірка 0, сітка 5 × 5 |
| tea | `dist/images/cottage-2.jpg` | комірка 21, наявне виміряне квадратне кадрування `cottageCrop(1,21)` |
| coffee | `dist/images/vocabulary-painted/painted-05.webp` | комірка 23, сітка 5 × 5 |
| milk | той самий `painted-05.webp` | комірка 1 |

Повні атласи скопійовані у `assets/`; Godot показує потрібні ділянки через `AtlasTexture`. Джерело намальованих словникових атласів описане в `art/vocabulary-collages/`; колаж із чаєм наданий користувачкою раніше. Оливкові позначки правильних пар малюються кодом, тому не залежать від наявності символів у шрифті.
