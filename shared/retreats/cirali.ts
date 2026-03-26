import type { RetreatSeed } from './types';

export const ciraliRetreat: RetreatSeed = {
  id: 1,
  slug: 'cirali-yoga-tour',
  status: 'active',
  title: 'Cirali Yoga Tour',
  location: 'Cirali, Lycian Coast, Turkey',
  startDate: '2026-05-01',
  endDate: '2026-05-08',
  price: '€720 Black Friday / €790',
  bookingUrl: 'https://t.me/AnastasiaPagliacci',
  coverImage: 'cirali-beach-cover.jpeg',
  translations: {
    ru: {
      title: 'Чиралы Йога Тур',
      location: 'Чиралы, Ликийское побережье, Турция',
    },
  },
  blocks: [
    {
      id: 'intro',
      sortOrder: 1,
      type: 'paragraph',
      text: 'An 8-day retreat in Cirali, where mountains, sea, silence, and practice create a rare feeling of inner reset. We travel here to feel the ground under our feet, freedom in the body, and calm steadiness in the mind.',
      translations: {
        ru: {
          text: '8-дневный ретрит в Чиралы, где море, горы, тишина и практика собираются в редкое ощущение глубокой перезагрузки. Мы едем сюда, чтобы почувствовать землю под ногами, свободу в теле и спокойную устойчивость внутри.',
        },
      },
    },
    {
      id: 'morning-in-cirali',
      sortOrder: 2,
      type: 'paragraph',
      text: 'Cirali greets us with quiet mornings among orange trees, the sound of waves, and warm wind. This is a retreat without rush or overplanning: just enough structure to go deep, and enough spaciousness to truly rest.',
      translations: {
        ru: {
          text: 'Чиралы встречает тихими утрами среди апельсиновых деревьев, шумом прибоя и тёплым ветром. Это ретрит без суеты и гиперконтроля: достаточно структуры, чтобы идти в глубину, и достаточно пространства, чтобы по-настоящему выдохнуть.',
        },
      },
    },
    {
      id: 'cirali-stay-image',
      sortOrder: 3,
      type: 'image',
      image: 'cirali-garden-mountains.jpeg',
      alt: 'Garden and mountain atmosphere in Cirali',
      translations: {
        ru: {
          alt: 'Сады и горная атмосфера Чиралы',
        },
      },
    },
    {
      id: 'day-1-heading',
      sortOrder: 4,
      type: 'heading',
      text: 'Day 1 – Arrival and recovery',
      translations: {
        ru: {
          text: 'День 1 – Заселение и восстановление',
        },
      },
    },
    {
      id: 'day-1-text',
      sortOrder: 5,
      type: 'paragraph',
      text: 'We settle into cozy bungalows in orange gardens just steps from the sea. After the road, the body gets a soft landing through gentle evening yoga and deep yoga nidra.',
      translations: {
        ru: {
          text: 'Заселяемся в уютные бунгало в апельсиновых садах всего в двух шагах от моря. После дороги мягко приземляемся в теле через бережную вечернюю йогу и глубокую йога-нидру.',
        },
      },
    },
    {
      id: 'day-1-exterior-image',
      sortOrder: 6,
      type: 'image',
      image: 'cirali-bungalows-exterior.png',
      alt: 'Retreat bungalows with mountain views in Cirali',
      translations: {
        ru: {
          alt: 'Бунгало ретрита с видом на горы в Чиралы',
        },
      },
    },
    {
      id: 'day-1-interior-image',
      sortOrder: 7,
      type: 'image',
      image: 'cirali-bungalows-interior.png',
      alt: 'Spacious wooden bungalow interiors for retreat guests',
      translations: {
        ru: {
          alt: 'Просторные деревянные интерьеры бунгало для гостей ретрита',
        },
      },
    },
    {
      id: 'day-2-heading',
      sortOrder: 8,
      type: 'heading',
      text: 'Day 2 – Bikes, beach, and activation',
      translations: {
        ru: {
          text: 'День 2 – Велосипеды, пляж и активация',
        },
      },
    },
    {
      id: 'day-2-text',
      sortOrder: 9,
      type: 'paragraph',
      text: 'We ride bikes through the village and scenic surroundings, then slow down on the beach and, if we are lucky, meet sea turtles. Morning practice is Himalayan yoga with pranayama for activation. Evening practice moves into meta-breathing and OSHO meditation.',
      translations: {
        ru: {
          text: 'Сегодня катаемся на велосипедах по деревушке и живописным окрестностям, а потом замедляемся на пляже и, если повезёт, встречаем морских черепах. Утром — гималайская йога и пранаяма на активацию энергии. Вечером — мета-дыхание и ОШО-медитация.',
        },
      },
    },
    {
      id: 'cirali-bicycle',
      sortOrder: 10,
      type: 'image',
      image: 'cirali-bicycle.jpg',
      alt: 'cirali-bicycle under the tree',
      translations: {
        ru: {
          alt: 'Групповая прогулка по сосновому лесу Чиралы',
        },
      },
    },
    {
      id: 'day-3-heading',
      sortOrder: 11,
      type: 'heading',
      text: 'Day 3 – SUP and spaciousness',
      translations: {
        ru: {
          text: 'День 3 – SUP по тихим бухтам',
        },
      },
    },
    {
      id: 'day-3-text',
      sortOrder: 12,
      type: 'paragraph',
      text: 'We meet the morning with SUP boarding in quiet bays. After that there is real free time: beach, books, sleep, or complete idleness under the sound of the surf. Morning focus: hand balances. Evening: Buddhist meditation and yoga nidra.',
      translations: {
        ru: {
          text: 'Встречаем утро SUP-бордингом по тихим бухтам. После этого — настоящее свободное время: пляж, книги, сон или честное ничегонеделание под шум прибоя. Утром фокус на балансах на руках, вечером — буддийская медитация и йога-нидра.',
        },
      },
    },
    {
      id: 'sup-image',
      sortOrder: 13,
      type: 'image',
      image: 'cirali-sup-cove.jpeg',
      alt: 'SUP boarding in a calm cove near Cirali',
      translations: {
        ru: {
          alt: 'SUP-бординг в спокойной бухте рядом с Чиралы',
        },
      },
    },
    {
      id: 'day-4-heading',
      sortOrder: 14,
      type: 'heading',
      text: 'Day 4 – Lycian Way and Black Beach',
      translations: {
        ru: {
          text: 'День 4 – Ликийская тропа и Чёрный пляж',
        },
      },
    },
    {
      id: 'day-4-text',
      sortOrder: 15,
      type: 'paragraph',
      text: 'We hike the Lycian Way toward the secluded Black Beach through pines, cliffs, and sea views. The route ends with a swim in clear water and a picnic by the shore. Morning practice opens the hips and supports lymphatic drainage; evening practice combines ecstatic dance and moving meditation.',
      translations: {
        ru: {
          text: 'Выдвигаемся в поход по Ликийской тропе к уединённому Чёрному пляжу через сосны, скалы и виды на море. Финал дня — купание в кристально чистой воде и пикник на берегу. Утром — практика на раскрытие таза и лимфодренаж, вечером — экстатик-дэнс и медитация в движении.',
        },
      },
    },
    {
      id: 'day-4-landscape-image',
      sortOrder: 16,
      type: 'image',
      image: 'cirali-forest-group.jpg',
      alt: 'Forest section of the Lycian Way during the Cirali retreat',
      translations: {
        ru: {
          alt: 'Лесной участок Ликийской тропы во время ретрита в Чиралы',
        },
      },
    },
    {
      id: 'day-5-heading',
      sortOrder: 17,
      type: 'heading',
      text: 'Day 5 – Five bays by boat',
      translations: {
        ru: {
          text: 'День 5 – Пять бухт на лодке',
        },
      },
    },
    {
      id: 'day-5-text',
      sortOrder: 18,
      type: 'paragraph',
      text: 'We spend the day on a boat traveling through five bays, snorkeling in hidden lagoons, eating lunch on board, and letting the body feel sun and salt water. Morning practice is dynamic yoga for energy. Evening: meta-breathing and a silence-of-mind practice.',
      translations: {
        ru: {
          text: 'Отправляемся в лодочное путешествие по пяти бухтам: снорклинг в укромных лагунах, обед на борту и целый день на воде, в котором тело снова вспоминает солнце и соль. Утром — динамическая йога для энергии. Вечером — мета-дыхание и практика «тишины ума».',
        },
      },
    },
    {
      id: 'boat-image',
      sortOrder: 19,
      type: 'image',
      image: 'cirali-five-bays-collage.png',
      alt: 'Collage from the five bays boat day with SUP, sailing, and Black Beach views',
      translations: {
        ru: {
          alt: 'Коллаж дня пяти бухт: SUP, прогулка на яхте и виды на Чёрный пляж',
        },
      },
    },
    {
      id: 'day-6-heading',
      sortOrder: 20,
      type: 'heading',
      text: 'Day 6 – Chimaera and silence',
      translations: {
        ru: {
          text: 'День 6 – Химера и тишина',
        },
      },
    },
    {
      id: 'day-6-text',
      sortOrder: 21,
      type: 'paragraph',
      text: 'We hike toward the eternal flames of Chimaera and sit in meditation under the stars. Morning practice turns toward strength, handstands, and inversions. Evening returns us to candle meditation and yoga nidra.',
      translations: {
        ru: {
          text: 'Впереди ещё один хайк — идём к огненной Химере, где вечером садимся в медитацию под звёздами и в полной тишине. Утром практика уходит в силу, стойки на руках и инверсии. Вечером — медитация на свечу и йога-нидра.',
        },
      },
    },
    {
      id: 'chimaera-image',
      sortOrder: 22,
      type: 'image',
      image: 'cirali-mountain-view.jpeg',
      alt: 'Mountain landscapes along the retreat route',
      translations: {
        ru: {
          alt: 'Горные пейзажи по маршруту ретрита',
        },
      },
    },
    {
      id: 'day-7-heading',
      sortOrder: 23,
      type: 'heading',
      text: 'Day 7 – Olympos and the local market',
      translations: {
        ru: {
          text: 'День 7 – Олимпос и местный рынок',
        },
      },
    },
    {
      id: 'day-7-text',
      sortOrder: 24,
      type: 'paragraph',
      text: 'We explore ancient Olympos, where nature and history are woven together, and then go to the local market for fruit, spices, and Turkish sweets. Morning is integration yoga with pranayama. Evening ends with ecstatic dance and OSHO dynamic meditation.',
      translations: {
        ru: {
          text: 'День начинается с исследования древнего Олимпоса, где природа переплетается с историей. Затем едем на местный рынок за фруктами, специями и турецкими сладостями. Утро — интеграционная йога с пранаямой. Вечер заканчивается экстатик-дэнсом и ОШО динамической медитацией.',
        },
      },
    },
    {
      id: 'olympos-image',
      sortOrder: 25,
      type: 'image',
      image: 'cirali-olympos-group.jpg',
      alt: 'Retreat group at the ancient ruins of Olympos',
      translations: {
        ru: {
          alt: 'Группа ретрита у руин древнего Олимпоса',
        },
      },
    },
    {
      id: 'day-8-heading',
      sortOrder: 26,
      type: 'heading',
      text: 'Day 8 – Soft return',
      translations: {
        ru: {
          text: 'День 8 – Мягкое возвращение',
        },
      },
    },
    {
      id: 'final-day',
      sortOrder: 27,
      type: 'paragraph',
      text: 'The final day is for a slow breakfast, a stop at a natural cosmetics shop for gifts, and a gentle return home. The retreat ends, but the feeling of spaciousness, strength, and inner quiet stays much longer.',
      translations: {
        ru: {
          text: 'Последний день — для неспешного завтрака, заезда в лавку натуральной косметики за сувенирами и мягкого возвращения домой. Сам ретрит заканчивается, но ощущение внутреннего пространства, силы и тишины остаётся с тобой ещё долго.',
        },
      },
    },
    {
      id: 'included-heading',
      sortOrder: 28,
      type: 'heading',
      text: 'Included',
      translations: {
        ru: {
          text: 'Что включено',
        },
      },
    },
    {
      id: 'included',
      sortOrder: 29,
      type: 'paragraph',
      text: 'Full support with flight booking, comfortable accommodation with breakfasts, airport transfers, a yacht trip, yoga and meditation practices, SUP board rental, a custom route created by the KOVER Travel team, photo and video coverage of the brightest moments, and support from an experienced yoga instructor.',
      translations: {
        ru: {
          text: 'Полное сопровождение при покупке авиабилетов, комфортное проживание с завтраками, трансферы из/в аэропорт, прогулка на яхте, практики йоги и медитаций, аренда сап-бордов, авторский маршрут по стране от команды KOVER Travel, фото- и видеосъёмка ярких моментов поездки и сопровождение опытного инструктора йоги.',
        },
      },
    },
    {
      id: 'not-included-and-price',
      sortOrder: 31,
      type: 'paragraph',
      text: 'Flights, meals other than breakfasts, bicycle rental, and personal expenses are not included. Current brochure price: Black Friday offer €720 instead of €790. Deposit to reserve a place: €200.',
      translations: {
        ru: {
          text: 'Не включены в стоимость: перелёты, питание кроме завтраков, аренда велосипедов и прочие личные расходы. Актуальная цена по буклету: Black Friday €720 вместо €790. Залог для брони места — €200.',
        },
      },
    },
  ],
};
