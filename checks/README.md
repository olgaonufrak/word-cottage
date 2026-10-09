# Перевірки Word Cottage

Потрібен Node.js; додаткові пакети не потрібні. Запускайте команди з кореня папки Word Cottage:

```text
node checks/verify-stage-one.cjs
node checks/verify-stage-two.cjs
node checks/verify-stage-three.cjs
node checks/verify-section-list.cjs
node checks/verify-swipe-selection.cjs
node checks/verify-natural-voice.cjs
```

Перевірки охоплюють словники, навігацію, повні списки й ручний вибір слів, обмеження кількості, свайпи, навчання, відновлення прогресу та підбір голосів. Це перевірка логіки через імітацію DOM і браузерних API, а не перевірка зовнішнього вигляду чи реального звучання аудіо.

`verify-section-list.cjs` також перевіряє порожні теми Етапу 4: відкриття й повернення до свого етапу, відсутність запуску навчання без слів та збереження прогресу.

`fixture.cjs` — спільна модель браузера для цих перевірок; окремо її запускати не потрібно.
