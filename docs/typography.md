# Типографика и стилистическая карта

Шрифты подключаются через Google Fonts в `client/src/index.css`.

## Подключенные шрифты

| Шрифт | Веса | CSS-переменная | Назначение |
|-------|------|----------------|------------|
| Oswald | 600, 700 | `--font-oswald` | Крупные заголовки (h2), blockquote, ghost-акценты |
| Syne | 400, 500, 600 | `--font-syne` | Бренд, названия карточек (h3) в EN |
| Sora | 400, 500 | `--font-sora` | Описательный текст (p, small, footnote), мета-подписи, аккордеон, названия карточек (h3) в RU |
| Bodoni Moda | - | `--font-bodoni` / `--serif` | Резервный serif, ранее использовался в секциях (устаревший стиль) |
| Manrope | - | `--font-manrope` / `--sans` | Базовый sans-serif для body-текста |

## Цветовая палитра

| hex | Назначение |
|-----|------------|
| `#d35f35` | Терракотовый акцент (орнаменты, titleRule, meta, navButton, hover-бордеры, ghost-числа) |
| `#f5eee7` | Тёплый фон всех секций |
| `#111` | Основной текст/интерактив |
| `#292827` | Body-текст в карточках/описаниях |
| `#1f1f1f` | Цена в карточках занятий |
| `rgba(17,17,17,0.12)` | Бордер карточек/панелей (тонкий, нейтральный) |
| `rgba(255,255,255,0.52)` | Полупрозрачный фон карточек/кнопок (glass-эффект) |

## Где какой шрифт используется (по секциям)

### Hero (HeroSection)

| Элемент | Шрифт | Вес | Примечания |
|---------|-------|-----|------------|
| Poster-заголовок (title) | Oswald | 700 | uppercase, letter-spacing 0.01em |
| Акцентная линия (titleAccent) | Oswald | 700 | цвет `#d35f35` |
| Бренд (heroBrand) | Syne | 500 | letter-spacing -0.055em |
| Poster-line | Sora | 500 | uppercase, letter-spacing 0.12em |

### Retreats (RetreatsSection - вторая секция)

| Элемент | Шрифт | Вес | EN | RU | Примечания |
|---------|-------|-----|----|----|------------|
| Заголовок секции h2 | Oswald | 700 | да | да | uppercase, letter-spacing 0.01em |
| Описание (copy p) | Sora | 400 | да | да | |
| Название карточки h3 | Syne | 600 | да | - | letter-spacing -0.02em |
| Название карточки h3 | Sora | 400 | - | да | только RU: lighter вес для кириллицы |
| Текст карточки p | Sora | 400 | да | да | |

### Classes (ClassesSection - третья секция)

| Элемент | Шрифт | Вес | Примечания |
|---------|-------|-----|------------|
| Заголовок секции h2 | Oswald | 700 | uppercase, letter-spacing 0.01em |
| Метка карточки (cardLabel) | Sora | 500 | uppercase, letter-spacing 0.18em, цвет `#d35f35` |
| Название карточки h3 | Syne | 600 | uppercase, letter-spacing -0.02em |
| Цена p | Sora | 400 | крупный размер |
| Описание small | Sora | 400 | |

### Himalayan (HimalayanSection - четвёртая секция)

| Элемент | Шрифт | Вес | Примечания |
|---------|-------|-----|------------|
| Заголовок секции h2 | Oswald | 700 | uppercase, letter-spacing 0.01em |
| Описание p | Sora | 400 | |
| Аккордеон (button) | Sora | 500 | uppercase, letter-spacing 0.12em |

### PracticeVideo (PracticeVideoSection - пятая секция)

| Элемент | Шрифт | Вес | Примечания |
|---------|-------|-----|------------|
| Заголовок секции h2 | Oswald | 700 | uppercase, letter-spacing 0.01em |
| Описание p | Sora | 400 | |
| Ghost-числа (benefitGhost) | Oswald | 700 | decorative, цвет `rgba(211,95,53,0.075)` |
| Название benefits h3 | Syne | 600 | letter-spacing -0.02em |
| Текст benefits p | Sora | 400 | |

### BodhisattvaCta (BodhisattvaCtaSection - шестая секция)

| Элемент | Шрифт | Вес | Примечания |
|---------|-------|-----|------------|
| Blockquote (цитата) | Oswald | 700 | uppercase, letter-spacing 0.01em |
| Meta (номер практики) | Sora | 500 | uppercase, letter-spacing 0.18em, цвет `#d35f35` |
| CTA-кнопка | (наследует) | 600 | glass-стиль: чёрный текст на полупрозрачном белом |
| Footnote | Sora | 400 | |

## Зачем RU-исключение для h3 в карточках

Syne 600 хорошо смотрится в латинице, но в кириллице выглядит перегруженным. Для RU-версии названий карточек (RetreatsSection) используется Sora 400 - более лёгкий и аккуратный шрифт, который лучше читается на кириллице.

## Где определены токены

- Шрифтовые переменные (`--font-oswald`, `--font-syne`, `--font-sora`, `--serif`, `--sans`): `client/src/index.css`, блок `:root`.
- Цветовые токены (`--ink`, `--paper`, `--sand`, `--gold` и т.д.): `client/src/index.css`, блок `.landing-v2-root`.
- Импорт Google Fonts: `client/src/index.css`, строка 1.