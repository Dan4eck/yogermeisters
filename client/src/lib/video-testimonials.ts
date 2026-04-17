import type { Language } from '@/lib/i18n';

export interface VideoTestimonial {
  readonly id: string;
  readonly name: string;
  readonly role: string;
  readonly location: string;
  readonly program: string;
  readonly duration: string;
  readonly quote: string;
  readonly outcome: string;
  readonly preview: string;
  readonly videoUrl: string;
  readonly posterUrl: string;
  readonly captionsUrl: string;
  readonly tags: readonly string[];
  readonly featured: boolean;
}

const SELECTEL_PUBLIC_BASE = 'https://4c312672-588a-49d9-9475-4f2a2f2b54e4.selstorage.ru';

export const videoTestimonials: Record<Language, readonly VideoTestimonial[]> = {
  en: [
    {
      id: 'retreat-nature-reset',
      name: 'Retreat Guest 01',
      role: 'Deep Slowdown',
      location: 'Cirali',
      program: 'Retreat',
      duration: '00:36',
      quote: 'This retreat gave me a real slowdown and the rare feeling that I did not need to rush anywhere.',
      outcome: 'Rest, spaciousness, and a full-body sense of slowing down',
      preview:
        'A guest talks about finally having space to rest, be lazy for a moment, and enjoy the retreat without the pressure of what comes next.',
      videoUrl: `${SELECTEL_PUBLIC_BASE}/testimonial-04-en.mp4`,
      posterUrl: `${SELECTEL_PUBLIC_BASE}/testimonial-04-en-poster-first-frame.jpg`,
      captionsUrl: '',
      tags: ['Slowdown', 'Rest', 'Space'],
      featured: true,
    },
    {
      id: 'retreat-first-experience',
      name: 'Returning Guest',
      role: 'Gentle Depth',
      location: 'Cirali',
      program: 'Retreat',
      duration: '00:54',
      quote: 'This is my second time here, and I still love the atmosphere, the people, and how naturally the practice deepens.',
      outcome: 'A deeper yoga experience supported by nature, warmth, and gentle guidance',
      preview:
        'A returning participant talks about beautiful mountains, birdsong in the morning, and a style of teaching that helps you go further without pressure.',
      videoUrl: `${SELECTEL_PUBLIC_BASE}/testimonial-02-en.mp4`,
      posterUrl: `${SELECTEL_PUBLIC_BASE}/testimonial-02-en-poster.jpg`,
      captionsUrl: '',
      tags: ['Mountains', 'Atmosphere', 'Yoga'],
      featured: false,
    },
    {
      id: 'retreat-best-so-far',
      name: 'Rob',
      role: 'Favorite Retreat',
      location: 'Cirali',
      program: 'Retreat',
      duration: '00:13',
      quote: 'This was my third retreat here, and honestly my favorite one so far.',
      outcome: 'Strong repeat trust and a clear signal to come back again',
      preview:
        'A short but very convincing testimonial: after three retreats, Rob still calls this one his favorite and encourages others to join.',
      videoUrl: `${SELECTEL_PUBLIC_BASE}/testimonial-03-en.mp4`,
      posterUrl: `${SELECTEL_PUBLIC_BASE}/testimonial-03-en-poster.jpg`,
      captionsUrl: '',
      tags: ['Repeat trust', 'Favorite', 'Retreat'],
      featured: false,
    },
  ],
  ru: [
    {
      id: 'retreat-nature-reset',
      name: 'Арина',
      role: 'Больше, чем отдых',
      location: 'Чиралы',
      program: 'Ретрит',
      duration: '00:57',
      quote: 'Я ехала за природой и отдыхом, а в итоге получила от ретрита намного больше, чем ожидала.',
      outcome: 'Глубокая перезагрузка, хорошие практики и желание обязательно вернуться',
      preview:
        'Гостья рассказывает, что приехала за природой и передышкой, а получила ещё и точные практики, хорошую организацию, уютное жильё и настоящее ощущение заботы.',
      videoUrl: `${SELECTEL_PUBLIC_BASE}/testimonial-01-ru.mp4`,
      posterUrl: `${SELECTEL_PUBLIC_BASE}/testimonial-01-ru-poster.jpg`,
      captionsUrl: '',
      tags: ['Ретрит', 'Перезагрузка', 'Природа'],
      featured: true,
    },
    {
      id: 'retreat-first-experience',
      name: 'Рада',
      role: 'Настоящий рестарт',
      location: 'Чиралы',
      program: 'Ретрит',
      duration: '00:43',
      quote: 'Это был мой первый раз, и мне очень понравилось, насколько профессионально и насыщенно всё было выстроено.',
      outcome: 'Чувство реального восстановления всего за несколько дней',
      preview:
        'В отзыве звучит, что ретрит дал сильную практику, много полезных форматов, вкусную еду, сауну, прогулки и то самое ощущение рестарта, ради которого и едут.',
      videoUrl: `${SELECTEL_PUBLIC_BASE}/testimonial-02-ru.mp4`,
      posterUrl: `${SELECTEL_PUBLIC_BASE}/testimonial-02-ru-poster.jpg`,
      captionsUrl: '',
      tags: ['Первый раз', 'Восстановление', 'Практика'],
      featured: false,
    },
    {
      id: 'retreat-community-trust',
      name: 'Маша',
      role: 'Тёплые люди',
      location: 'Чиралы',
      program: 'Ретрит',
      duration: '01:36',
      quote: 'Я ехала с волнением, а уехала с большой благодарностью к людям, атмосфере и самой идее такого ретрита.',
      outcome: 'Тепло, доверие и ощущение по-настоящему глубокого опыта',
      preview:
        'Самый эмоциональный отзыв в подборке: участница делится, как тревога перед незнакомой группой быстро сменилась теплом, близостью, сильными практиками и благодарностью за решение приехать.',
      videoUrl: `${SELECTEL_PUBLIC_BASE}/testimonial-03-ru.mp4`,
      posterUrl: `${SELECTEL_PUBLIC_BASE}/testimonial-03-ru-poster.jpg`,
      captionsUrl: '',
      tags: ['Люди', 'Доверие', 'Глубина'],
      featured: false,
    },
  ],
};
