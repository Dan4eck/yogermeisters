# Homepage V3 — ImageGen revision v2

Дата: 10 октября 2026. Режим: встроенный ImageGen, редактирование PNG.

## Входные изображения

1. `full-page-v1.png` — исходный макет.
2. `hero-scroll-storyboard-v1.png` — финальный правый кадр для секции 01.
3. `../../attached_assets/cirali/cirali-beach-cover.jpeg` — обложка Чиралы.
4. `../../attached_assets/nepal/nepal-boudhanath-close.jpg` — обложка Непала.
5. `../../client/public/assets/landing-v2/retreats/thumb-prague-retreat.png` — обложка Йога и Горы.

## Основная правка

```text
Use case: compositing / ui-mockup edit.
Edit target: input image 1, the complete tall Yogermeisters homepage mockup. Produce a revised FULL PAGE PNG, all seven sections visible, same editorial design, same Russian copy, warm cream / black / muted burgundy palette, same photographic identities and bold neo-grotesk type. Retain a tall approximately 1:3 page format with high detail. This is a precise revision of an existing approved direction, not a redesign. Change ONLY section "01 / О ПОДХОДЕ" and section "03 / РЕТРИТЫ".

Reference image 2 is a storyboard. Only its RIGHTMOST web frame (the final "03 / Разлёт" state) is the composition reference for section 01; do not put the storyboard title, frame captions, or its first two frames in the page.
Supporting photos 3, 4, 5 are respectively the real cover photos for Чиралы, Непал, Йога и Горы.

CHANGE 1 — section "01 / О ПОДХОДЕ":
Match the RIGHTMOST final storyboard frame closely: a cream central opening framed by scattered, slightly rotated black-and-white photographic tiles, like prints spreading outward from the hero. Top edge: black-and-white braided portrait upper left, small sunset breathing portrait above the headline, larger yoga-on-rocks photo upper right; other black-and-white close-ups of hands, rocks and breathing partially crop at outer left/right/bottom edges. Delicate realistic shadows and thin photo edges. Keep these surrounding photographs clear and prominent, not a tiny decorative strip. In the unobstructed center-left place "01 / О ПОДХОДЕ", then the strong black three-line title "Движение." / "Дыхание." / "Тишина." with the small burgundy final dot, credit "Анастасия Пальяччи / Himalayan Yoga", and the two readable text columns "Практика йоги" / "Медитация" beneath. In center-right, the single large FULL-COLOR portrait of the same braided woman from the storyboard, front plane upright, with a slight natural tilt matching the reference. No waterfall/monk photo in this section. No hero heading over section 01. The composition is the exact final scatter state of the storyboard, appearing naturally between the existing hero and the existing classes section, with enough section height and negative space for the type.

CHANGE 2 — section "03 / РЕТРИТЫ":
Keep the burgundy background and cream typography. Convert the old single featured retreat plus two small unavailable text links into a clearly recognizable HORIZONTAL CAROUSEL with exactly THREE PHOTO CARDS. The section label is "03 / РЕТРИТЫ", heading "Дальше от рутины. Ближе к себе.". Put heading above the carousel to give the cards generous horizontal room. Show all 3 cards across a horizontal track, with a thin separator and elegant outlined previous/next arrow buttons plus THREE pagination indicators / a small "01 / 03" counter. These are three slides of one carousel, not three unrelated promotions. Do not create a fourth card.
Card 1: photo from input 3 of beach umbrellas and sea; title "Чиралы Йога Тур", metadata "10–16 октября · Турция · €790", outlined CTA "Посмотреть ретрит ↗".
Card 2: photo from input 4 of Boudhanath golden stupa and prayer flags; title "Непал", subline "Буддийский паломнический тур", muted status "Запись недоступна".
Card 3: photo from input 5 of green forest mountains; title "Йога и Горы", metadata "Крконоше · Чехия", muted status "Запись недоступна".
Use unboxed editorial photo tiles and aligned labels directly on burgundy, no white card boxes, no excessive rounded corners. Exactly three destinations, fully readable.

INVARIANTS: Keep the top black-and-white hero photo grid, brand "Yogermeisters. Himalayan Yoga.", navigation, and hero CTA unchanged in design and content. Keep section 02 classes, section 04 practice with sunset video image, the dark ocean quote section, and the final large Yogermeisters footer unchanged in appearance, copy, order, and relative hierarchy. Do not change the woman's identity, add new people, replace photographs with illustrations, add new sections, drop any section, or invent marketing copy. Output only the polished updated full-page mockup, no explanation, no device frame, no external annotations.
```

## Финальная локальная правка подвала

Вход — результат основной правки. Сохранённый результат: `full-page-v2.png`, 724×2172 px. Промежуточная попытка с двумя входами была отклонена: она вернула старую секцию 01.

```text
Edit only the very bottom cream footer of this image. Below "Вернись к практике." and ABOVE the large "Yogermeisters." wordmark, restore a compact horizontal row of three small navigation links: "01 Личная практика ↗", "02 Ретрит ↗", "03 the yoga method ↗". Make the footer heading and wordmark slightly smaller if needed to fit that row. Keep the small footer social links. IMPORTANT: preserve every pixel of the page above the footer as closely as possible, especially the cream 01 ABOUT section with scattered rotated black-and-white photo prints around its perimeter and the single large full-color braided portrait. No waterfall photo. Keep the burgundy three-retreat carousel unchanged. Do not redesign any section. Output the entire tall page with only the footer link row repaired.
```

Это статичный дизайн карусели из трёх ретритов. Интерактивное поведение и scroll-анимация здесь не реализованы.
