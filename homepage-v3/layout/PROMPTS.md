# Homepage V3 — ImageGen

Дата: 6 октября 2026. Этап: макет для согласования, approval=null.

Источник текста: `../content.md` (предоставленный снимок; цены не перепроверялись в live).
Встроенный ImageGen; не CLI/API. Движения описаны в `../landing.json`, не реализованы.

## Full-page v1

Первый запрос с шестью входами был отклонён до генерации: инструмент принимает максимум пять reference paths. Финальный запрос ниже использует пользовательский ч/б референс и четыре фотографии: океан, водопад, дыхание на закате, портрет с косами. Фотография ZVC05159.JPG остаётся доступным материалом для последующей реализации.

Пути входов:
- `/var/folders/pg/w_499ztj52g76vhbhtds3my40000gn/T/codex-clipboard-da638cfb-4747-4bd9-b6d7-3e9ecbe3517c.png`
- `/Users/daniel/coding/Yogermeisters/homepage-v3/new assets/ZVC05224.JPG`
- `/Users/daniel/coding/Yogermeisters/homepage-v3/new assets/telegram-cloud-photo-size-4-5776394464237653992-y.jpg`
- `/Users/daniel/coding/Yogermeisters/homepage-v3/new assets/telegram-cloud-photo-size-4-5949744970711371031-y.jpg`
- `/Users/daniel/coding/Yogermeisters/homepage-v3/new assets/telegram-cloud-document-4-5983426692197126973.jpg`

```text
Use case: ui-mockup.
Create ONE exceptionally polished full-page DESKTOP WEBSITE SCREENSHOT, tall 1:3 canvas at 1280x3840 or maximum available resolution, for "Yogermeisters. Himalayan Yoga." Show a single continuous website from top navigation to footer, no browser chrome, no device, no margins around the webpage, no mockup annotations, no storyboard on this image. It must look like a serious experimental editorial yoga website, with carefully typeset real Russian text and photographic art direction, not a wellness template.

REFERENCE INPUTS IN ORDER:
1. Black and white 3-column yoga photo grid with massive white text: HERO COMPOSITION and typographic mood reference only. Do not reuse the brunette subject or words move your body.
2. Nastya bending beside the ocean in tan top and denim shorts: actual personal photo and identity reference, hero photo panel / retreat environment.
3. Nastya with a monk at waterfall, burgundy robe and striped shawl: actual personal photo, preserve both people and context ONLY in the About section; burgundy accent inspiration. Do not invent names for the monk.
4. Nastya doing breathing practice, black yoga outfit against sunset: actual photo, hero tile / free practice.
5. Nastya seated with long blonde braids against concrete wall: actual portrait, hero photo panels / course.
Preserve the recognizability of Nastya and the compositions of these actual photographs. Reuse and crop these photographs intentionally. Do not invent yoga poses or substitute stock models. Only Nastya in hero; both people are permitted in the waterfall About photograph.

DESIGN SYSTEM:
Strong precise Swiss/editorial layout, monumental neo-grotesk sans serif with tight tracking, clear Cyrillic letters, clean smaller body text, large deliberate areas of whitespace. Ink #171918, warm off-white #F2EFE7, deep burgundy #712F43, warm rust #BA653E drawn from supplied shawl and rocks. Photography provides ocean blue and moss green. Square image corners, fine rules, small editorial section numbering, carefully aligned navigation, small pill CTAs only. No generic bento cards, no glassmorphism, no drop shadows, no gradients, no lotus icons, no ornamental mandalas, no fake testimonial statistics. Varied section rhythm and asymmetric photo sizes. Title case and sentence case, not every heading uppercase.

FULL PAGE STRUCTURE AND RELATIVE HEIGHT:
1. HERO, first ~760px: full bleed black and white photographic contact sheet, 5 columns x 3 rows, ~15 rectangular panels with ultra-thin pale grid seams. Vary crops of Nastya using ocean movement, braided meditation portrait, sunset breathing, braided seated portrait; repeat actual photos at different scales; pure photographic grid like reference 1. Grid fills the full first screen, no blank background gaps. Black and white images gently darkened for strong WHITE title contrast. Small top white nav: "yogermeisters." at left; "Практика   Занятия   Ретриты   О проекте" in center; "Шала  ↗    RU / EN" at right.
Huge white headline superimposed across photo tile boundaries, horizontally centered, centered vertical stack:
"Yogermeisters."
"Himalayan"
"Yoga."
Brand line large and unmistakable, the second and third lines absolutely monumental. Strong tightly tracked sans typography. Small white tagline lower left: "Между движением и тишиной рождается практика". At bottom center small outlined/light pills: "Выбрать занятие ↗" and "Ретриты ↗". Tiny scroll arrow lower right. This must strongly resemble reference 1 and dominate the top portion of the layout.

2. ABOUT / AFTER THE COLLAGE, ~540px: calm warm off-white. Small overline "01 / О ПОДХОДЕ". Huge editorial title left: "Движение.
Дыхание.
Тишина." Minimal burgundy dot near last word. Right a color portrait pair in offset rectangles: larger source 5 braided portrait, smaller source 3 waterfall with monk. Under title small credit "Анастасия Пальяччи / Himalayan Yoga". Two short clearly separate columns below title: "Практика йоги" with "Биомеханика, подвижность и внимание к особенностям каждого." and "Медитация" with "Практики метты и безмыслия. Традиция моего ламы Кармы Гюрме." Photographs emerge against spacious editorial layout.

3. CLASSES, ~590px: same cream. Small "02 / ЗАНЯТИЯ". Large black "Начни заниматься
сегодня". Left 40 percent a richly colored full-height photographic crop from source 2, ocean foam and warm-toned rock. Right 60 percent five easy-to-read editorial pricing rows separated by thin fine lines, NOT cards:
"01  Курс по йоге" / "Онлайн · В своём темпе" / "€49 ↗"
"02  Индивидуально" / "Онлайн" / "€45 ↗"
"03  Индивидуально" / "Прага" / "€49 ↗"
"04  Флай, хатха-йога" / "Прага · До 8 человек" / "€25 ↗"
"05  Йога-буст" / "Онлайн · Групповая практика" / "Donation ↗"
At lower left of photograph a small outlined white label "the yoga method". Clear row alignment, very readable prices, quiet generous spacing.

4. RETREATS, ~490px: deeply burgundy #712F43 full width with cream lettering. "03 / РЕТРИТЫ". Title "Дальше от рутины.
Ближе к себе." Left narrow paragraph "Море, горы, тишина и ежедневное возвращение к себе." Right one large ocean / rock photograph inspired directly by source 2 and a small overlapping sunset frame from source 4, squared edges. Under image: "Чиралы Йога Тур" and "10–16 октября · Турция · €790" and cream button "Посмотреть ретрит ↗". Very small subdued text strip at bottom: "Непал — запись недоступна       Йога и Горы — запись недоступна". Do not present old closed events as currently open and do not invent new dates. Avoid generic unrelated landscapes.

5. FREE PRACTICE, ~470px: warm off-white again. Small "04 / ПРАКТИКА". Left giant "Почувствуй
до первого
занятия." Right wide beautiful color photo from source 4 of Nastya breathing at sunset, with understated white circular play button. Small label "25 MIN / ВСЕ УРОВНИ". Small source-based copy "Начни с практики на дыхание, подвижность и устойчивую силу." CTA "Попробовать практику ↗". Fine horizontal labels across lower section "01 Дыхание     02 Движение     03 Интеграция". Do not imply that the sunset photograph is the exact frame from the YouTube video; it is a design poster.

6. PAUSE / PHILOSOPHY, ~370px: almost black #171918 surface, subtle silhouette crop of ocean/rock from source 2 occupying right third, large restrained cream typography: "В тишине меньше
отвлечений: ясность
становится ближе." Small marker "37 ПРАКТИК БОДХИСАТТВЫ / 03". Small attribution: "По мотивам текста Гьялсе Тогме Зангпо". This is a quiet typographic breath between major sections.

7. FINAL CTA + FOOTER, remaining ~620px: warm off-white. Overline "ПРАКТИКА НАЧИНАЕТСЯ С ТЕБЯ". Very large dark text "Вернись
к практике." Three open editorial columns underneath with thin top lines and small arrows: "01 Личная практика ↗", "02 Ретрит ↗", "03 the yoga method ↗". Large brand word "Yogermeisters." across full bottom width. Thin final footer rule and tiny "Прага · Онлайн · Ретриты" left, "Telegram ↗    YouTube ↗    Шала ↗" right.
All seven sections and the very bottom footer must be visible. The hero must be the real photograph grid with monumental WHITE typography, faithful to first reference. Prioritize legible correct hero text, section headings, five class offerings/prices, and clear end-to-end page layout. Do not put any extra design annotations in this full-page screenshot.
```


## Hero scroll storyboard v1

Статичная раскадровка движения. Опора на full-page-v1.png; четыре колонки и три ряда в фактическом макете.

```text
Use case: ui-mockup, motion storyboard.
Create ONE precise premium art-director storyboard board showing THREE SEQUENTIAL STATES of the HERO SCROLL ANIMATION for the Yogermeisters website. Wide landscape 3:1 aspect ratio at high resolution. Three equal rectangular website screenshots arranged in ONE HORIZONTAL ROW with modest cream gutters and cream caption strips below them. Three frames must show the SAME website and same photography at different scroll positions. This is a storyboard, not a full-page site design.
INPUT 1 is the freshly generated full-page website design. Use ONLY its first two sections as the exact reference for composition, colors, typography, grid and the destination About layout. Match them closely. INPUT 2 actual photograph of Nastya bending at the ocean. INPUT 3 actual portrait with blonde braids. INPUT 4 actual sunset breathing photograph. INPUT 5 original black and white yoga grid reference, for the tight-grid visual principle only; do not use the different woman's appearance from input5.
Do not redraw a different person, invent different clothing, or invent different poses. Use repeated crops of the supplied Nastya photographs.

Global board style: warm off-white #F2EFE7, crisp black neo-grotesk sans-serif captions, a tiny burgundy #712F43 dot after frame number. Frame screenshots ~4:3, the images big and dominant, captions outside screenshots only. Large clear text on board top edge: "HERO / SCROLL STORYBOARD" with small "Yogermeisters. Himalayan Yoga." at the right.
Frame 1: scroll progress 00%. A tightly packed full-bleed monochrome contact sheet of 12 photo panels, roughly 4 columns x 3 rows. White hairline grid borders. Multiple Nastya portraits, ocean pose, breathing silhouette, crops of hands. Overlaid monumental white three-line exact text "Yogermeisters." / "Himalayan" / "Yoga." crossing tile boundaries. Same arrangement and typography as top of input1. Small nav line at top. Caption below frame in BLACK: "01 / Сетка" and next smaller line "Пауза для чтения".
Frame 2: scroll progress 45%. Camera has pushed deeply into the EXACT SAME mosaic by scale ~1.8. Tile rectangles themselves are much bigger and outer ones crop beyond the viewport. The center close-up of Nastya braided portrait and her hands dominate. The giant title has enlarged and begun fading but is faintly still visible, partially extending past the screenshot edges. The board should clearly show a continuous camera push IN rather than moving to a new arbitrary layout. Caption "02 / Наезд" and smaller "Камера приближается к фотографиям".
Frame 3: scroll progress 90%. The grid breaks into SEPARATE RECTANGULAR PHOTO PRINTS. They fly radially outward to edges in 3D, with subtle distinct angles up to 12 degrees and different sizes; two or three foreground tiles are cropped by the frame. Centre is opened up. All tiles retain realistic recognizable photo content and no body warping. Beneath those departing black-and-white photographs, reveal the serene warm cream About section from input1: left black headline "Движение. Дыхание. Тишина." stacked three lines, right the now-full-color recognizable portrait of Nastya with braids. The central photo visibly lands into this portrait position while surrounding cards scatter. Large clear centre opening. No remnants of hero title here. Caption "03 / Разлёт" and smaller "Фотографии расходятся — появляется следующий раздел".
Tiny bottom line across board: "Сценарий движения · статичная раскадровка". The screenshots are visual states only; no numbered progress percentages inside the actual webpage, no arrows across faces, no wireframe placeholders, no duplicate full-page website. Intelligible correct Cyrillic, all three stages visibly different yet continuous.
```


## Сохранённые результаты

- full-page-v1.png: 724×2172 px.
- hero-scroll-storyboard-v1.png: 2172×724 px.
- Просмотр: index.html; оба файла созданы встроенным ImageGen.
- Макет и раскадровка просмотрены; approval остаётся null до подтверждения пользователя.
