import type { PracticeConversation, TelegramFunnelPlan, TelegramInlineButton } from './types';

export const PRACTICE_START_PAYLOAD = 'personal_practice_v1';
export const PRACTICE_FUNNEL_KEY = 'personal_practice';
export const PRACTICE_CALLBACK_PREFIX = 'pp1:';
export const YOGA_LESSON_URL = 'https://yogermeisters.com/login?next=%2Fcabinet%2Ffree-lesson';
export const PRACTICE_INTRO = [
    'Здравствуй, душа! Я рада, что ты здесь.',
    'Давай сначала узнаем, что тебе нужно именно сейчас.',
    'Я задам несколько простых вопросов о твоём состоянии, настроении и о том, чего тебе хочется. А затем' +
    ' подберу для тебя практику, которая будет максимально созвучна тебе сегодня. ✨',
    'Без правильных и неправильных ответов -  просто выбирай то, что тебе ближе сейчас.',
    'Готова? 🌿',
  ].join('\n\n');

export const PRACTICE_STATE_QUESTION = [
    'Для начала - прислушайся к себе.',
    'Как ты себя чувствуешь в последнее время? 🌿',
  ].join('\n\n');

export const PRACTICE_STATES = [
  'Напряжение — хочется движения',
  'Перегружена голова — хочется тишины',
  'Усталость — хочется восстановиться',
  'Хочу лучше чувствовать тело',
];

export const PRACTICE_EXPERIENCE_QUESTION = 'Какие практики тебе уже знакомы? 🌿';

export const PRACTICE_EXPERIENCES = [
  'Только начинаю',
  'В основном занимаюсь йогой',
  'В основном практикую медитацию',
  'Практикую и йогу, и медитацию'
];

export const PRACTICE_RECOMMENDATIONS = [
  [
      'Ты чувствуешь напряжение в теле и хочешь больше движения — давай начнём знакомство с практиками ' +
      'через йогу. 🌿',
      'Я буду подсказывать, куда направлять внимание. Двигайся в удобном для себя темпе, прислушивайся к ' +
      'дыханию и делай паузы, когда хочется. Не нужно сразу всё уметь: сегодня достаточно дать телу немного' +
      ' движения и заметить, как ты себя чувствуешь. 🤍',
    ].join('\n\n'),
  [
      'Тебе уже знакома работа с телом, а сейчас хочется снять напряжение и почувствовать больше энергии. Я' +
      ' выбрала для тебя йогу. 🌿',
      'Попробуй начать с тех ощущений, с которыми пришла сегодня: где хочется потянуться, где двигаться ' +
      'мягче, а где сделать паузу. Пусть знакомые движения станут возможностью позаботиться о себе без ' +
      'необходимости выполнять привычный объём. 🤍',
    ].join('\n\n'),
  [
      'Ты знакома с медитацией, а сейчас тело просит движения. Я предлагаю тебе йогу — возможность ' +
      'перенести внимание с наблюдения в покое на ощущения в движении. 🌿',
      'Замечай, как меняется дыхание, как ощущаются мышцы, где хочется двигаться свободнее. Твой опыт ' +
      'наблюдения за собой пригодится и здесь. Выбирай комфортный темп и дай себе время освоиться. 🤍',
    ].join('\n\n'),
  [
      'Ты уже практикуешь и йогу, и медитацию, а сегодня хочется движения и энергии. Я выбрала для тебя ' +
      'йогу с вниманием к тому, как тело чувствует себя сейчас. 🌿',
      'Попробуй соединить знакомое движение с наблюдением: замечать напряжение, отклик на каждое положение ' +
      'и моменты, когда хочется замедлиться. Позволь сегодняшнему состоянию подсказать темп и глубину ' +
      'практики. 🤍',
    ].join('\n\n'),
  [
      'Когда в голове слишком много всего, хочется просто выдохнуть. Для твоего знакомства с практиками я ' +
      'выбрала йога-нидру — расслабление под голосовое сопровождение. 🌙',
      'Устройся удобно и слушай мои подсказки. Я буду направлять твоё внимание к ощущениям в теле. Если ' +
      'мысли отвлекают, это нормально: можно мягко вернуться к голосу. Здесь не нужно заранее что-то уметь ' +
      'или специально добиваться тишины внутри. 🤍',
    ].join('\n\n'),
  [
      'Тебе знакомы йога или телесные практики, а сейчас хочется отдохнуть от потока мыслей. Сегодня я ' +
      'предлагаю тебе йога-нидру. 🌙',
      'Мы обратимся к знакомым ощущениям тела в покое. Устройся удобно и следуй за моим голосом: я буду ' +
      'подсказывать, куда направлять внимание. Можно на время отложить дела и позволить себе эту паузу, ' +
      'ничего не решая. 🤍',
    ].join('\n\n'),
  [
      'Ты уже знакома с медитацией, но сейчас в голове много мыслей и хочется покоя. Я выбрала для тебя ' +
      'йога-нидру — практику расслабления, в которой голос будет сопровождать твоё внимание. 🌙',
      'Тебе не нужно удерживать сосредоточенность каждую секунду. Устройся удобно, слушай и замечай ' +
      'ощущения. Если внимание уходит к делам или заботам, возвращайся к моим подсказкам без спешки и ' +
      'требований к себе. 🤍',
    ].join('\n\n'),
  [
      'В твоём опыте уже есть и йога, и медитация. А сегодня, когда голова перегружена, я предлагаю ' +
      'йога-нидру — время, которое можно целиком посвятить отдыху. 🌙',
      'Пусть знакомое внимание к телу станет опорой. Устройся удобно и следуй за моим голосом, разрешая ' +
      'мыслям приходить и уходить. Не нужно сравнивать эту практику с предыдущими или ждать особенного ' +
      'состояния — можно просто побыть здесь. 🤍',
    ].join('\n\n'),
  [
      'Ты чувствуешь усталость — давай начнём знакомство с практиками с возможности отдохнуть. Я выбрала ' +
      'для тебя йога-нидру. 🌙',
      'Это практика расслабления под мой голос. Найди удобное положение, в котором можно спокойно ' +
      'оставаться, и слушай подсказки. Тебе не нужна подготовка: позволь себе эту паузу, без задачи всё ' +
      'сделать правильно. 🤍',
    ].join('\n\n'),
  [
      'Ты уже знакома с телесными практиками и сейчас замечаешь усталость. Сегодня я предлагаю йога-нидру —' +
      ' возможность уделить внимание телу без физической нагрузки. 🌙',
      'Используй своё умение прислушиваться к ощущениям, чтобы устроиться поудобнее. Дальше я буду вести ' +
      'тебя голосом, а ты можешь позволить себе отдых. Сегодня забота о теле может быть такой спокойной. 🤍',
    ].join('\n\n'),
  [
      'Тебе знакома медитация, а сейчас хочется восстановиться после усталости. Я выбрала для тебя ' +
      'йога-нидру — практику, в которой можно дать себе время для отдыха. 🌙',
      'Знакомое наблюдение за ощущениями пригодится и здесь. Устройся так, чтобы телу было удобно, и следуй' +
      ' за моим голосом. Если внимание рассеивается, не нужно себя подгонять: возвращайся к подсказкам, ' +
      'когда заметишь это. 🤍',
    ].join('\n\n'),
  [
      'Ты практикуешь и йогу, и медитацию, а сегодня чувствуешь, что нужен отдых. Я предлагаю тебе ' +
      'йога-нидру — спокойную паузу, в которой можно ничего от себя не требовать. 🌙',
      'Опирайся на знакомое внимание к телу: найди удобное положение и замечай ощущения под мой голос. ' +
      'Позволь этой практике быть такой, какой она получится сегодня, без привычной планки и ожиданий от ' +
      'себя. 🤍',
    ].join('\n\n'),
  [
      'Тебе хочется больше чувствовать своё тело и быть здесь и сейчас. Давай начнём знакомство с ' +
      'практиками через йогу. 🌿',
      'Я буду направлять тебя, а ты попробуй замечать простые вещи: опору под ногами, дыхание, ощущения во ' +
      'время движения. Выбирай комфортную глубину и делай паузы, когда нужно. Для начала достаточно ' +
      'любопытства к себе — никакой идеальной формы не требуется. 🤍',
    ].join('\n\n'),
  [
      'Ты уже знакома с телесными практиками и хочешь больше контакта с собой. Я выбрала для тебя йогу — с ' +
      'приглашением по-новому почувствовать знакомые движения. 🌿',
      'Попробуй замечать детали: как распределяется опора, куда движется дыхание, что меняется при переходе' +
      ' из одного положения в другое. Даже привычное движение можно исследовать заново, возвращая внимание ' +
      'к себе в этом моменте. 🤍',
    ].join('\n\n'),
  [
      'В медитации тебе уже знакомо наблюдение за собой. А чтобы больше почувствовать тело в настоящем ' +
      'моменте, я предлагаю сегодня попробовать йогу. 🌿',
      'Пусть движение станет тем, за чем ты наблюдаешь: замечай опору, дыхание и меняющиеся ощущения. ' +
      'Двигайся в комфортном темпе, оставляя себе время почувствовать каждый переход. Это возможность ' +
      'продолжить знакомство с собой через тело. 🤍',
    ].join('\n\n'),
  [
      'Ты уже знакома и с йогой, и с медитацией, а сейчас хочется глубже почувствовать контакт с телом. ' +
      'Сегодня я выбрала для тебя йогу. 🌿',
      'Соедини движение с вниманием: замечай дыхание, опору и ощущения, которые возникают прямо сейчас. ' +
      'Если ловишь себя на том, что выполняешь знакомую последовательность автоматически, мягко возвращайся' +
      ' к телу. Пусть это будет время живого интереса к себе. 🤍',
    ].join('\n\n')
];

export const PRACTICE_FOLLOW_UP = [
    'Знаешь, я верю, что практика — это только начало. 🌿',
    'Дальше можно пойти разными путями.',
    'Если тебе хочется глубже и регулярнее заниматься собой, я могу рассказать про моё ' +
    'онлайн-пространство с практиками.',
    'А если хочется выйти за пределы привычного, путешествовать, встретить близких по духу людей и ' +
    'прожить новый опыт — у меня есть кое-что особенное. 🌊',
    'Что тебе сейчас ближе?',
  ].join('\n\n');

export const PRACTICE_YOGA_CAPTION = [
  'Вот, держи твоё видео. Желаю тебе глубокой практики.',
  'Если готова пойти дальше, нажми кнопку ниже.',
].join(' ');

export const PRACTICE_NIDRA_CAPTION = [
  'Вот, держи твою запись. Желаю тебе глубокой практики.',
  'Если готова пойти дальше, нажми кнопку ниже.',
].join(' ');

export interface PracticeMedia {
  readonly nidraAudio?: string;
}

export function practiceKind(state: number): 'yoga' | 'nidra' {
  return state === 0 || state === 3 ? 'yoga' : 'nidra';
}

function button(text: string, action: string): readonly (readonly TelegramInlineButton[])[] {
  return [[{ text, callback_data: `${PRACTICE_CALLBACK_PREFIX}${action}` }]];
}

export function createPracticeFunnelPlan(media: PracticeMedia): TelegramFunnelPlan {
  return {
    key: PRACTICE_FUNNEL_KEY,
    version: 'v1',
    restartOnStart: true,
    initialContentKeys: ['pp_intro'],
    initialConversation: { step: 'intro' },
    steps: [
      { contentKey: 'pp_intro', delayMs: 0, content: {
        type: 'text', text: PRACTICE_INTRO, buttons: button('Подобрать мою практику', 'begin'),
      } },
      { contentKey: 'pp_state', delayMs: 0, content: {
        type: 'text', text: PRACTICE_STATE_QUESTION,
        buttons: PRACTICE_STATES.map((text, index) => [{ text, callback_data: `pp1:state:${index}` }]),
      } },
      { contentKey: 'pp_experience', delayMs: 0, content: {
        type: 'text', text: PRACTICE_EXPERIENCE_QUESTION,
        buttons: PRACTICE_EXPERIENCES.map((text, index) => [{ text, callback_data: `pp1:experience:${index}` }]),
      } },
      ...PRACTICE_RECOMMENDATIONS.map((text, index) => ({
        contentKey: `pp_recommendation_${index}`, delayMs: 0,
        content: { type: 'text' as const, text, buttons: button(
          practiceKind(Math.floor(index / 4)) === 'yoga' ? '🧘 Перейти к практике йоги' : '🌙 Перейти к йога-нидре',
          'practice',
        ) },
      })),
      { contentKey: 'pp_yoga', delayMs: 0, content: {
        type: 'text',
        text: PRACTICE_YOGA_CAPTION,
        buttons: [
          [{ text: '🧘 Перейти к уроку', url: YOGA_LESSON_URL }],
          [{ text: 'Хочу практиковать', callback_data: 'pp1:continue' }],
        ],
      } },
      ...(media.nidraAudio ? [{ contentKey: 'pp_nidra', delayMs: 0,
        content: {
          type: 'audio' as const,
          audio: media.nidraAudio,
          caption: PRACTICE_NIDRA_CAPTION,
          title: 'Йога-нидра',
          buttons: button('Хочу практиковать', 'continue'),
        } }] : []),
      { contentKey: 'pp_unavailable', delayMs: 0, content: {
        type: 'text',
        text: 'Запись йога-нидры пока не добавлена в бот. 🤍 Можно вернуться к этой кнопке позже. ' +
          'А пока — выбрать, что тебе интересно дальше.',
        buttons: button('Проверить доступность практики', 'practice'),
      } },
      { contentKey: 'pp_interest', delayMs: 0, content: {
        type: 'text', text: PRACTICE_FOLLOW_UP,
        buttons: [
          [{ text: '🧘 Практика и развитие', callback_data: 'pp1:interest:practice' }],
          [{ text: '🌊 Путешествие и новый опыт', callback_data: 'pp1:interest:travel' }],
        ],
      } },
      { contentKey: 'pp_destination_practice', delayMs: 0, content: {
        type: 'text', text: 'Познакомиться с моим онлайн-курсом The Yoga Method можно на сайте. 🌿',
        buttons: [[{ text: '🧘 The Yoga Method', url: 'https://yogermeisters.com/the-yoga-method' }]],
      } },
      { contentKey: 'pp_destination_travel', delayMs: 0, content: {
        type: 'text', text: 'О нашем путешествии в Чиралы можно узнать на сайте. 🌊',
        buttons: [[{ text: '🌊 Путешествие в Чиралы', url: 'https://yogermeisters.com/retreats/cirali-yoga-tour' }]],
      } },
    ],
  };
}

export interface PracticeTransition {
  readonly conversation: PracticeConversation;
  readonly contentKeys: readonly string[];
}

export function transitionPractice(
  conversation: PracticeConversation,
  action: string,
  media: PracticeMedia,
): PracticeTransition | undefined {
  if (action === 'pp1:begin' && conversation.step === 'intro') {
    return { conversation: { step: 'state' }, contentKeys: ['pp_state'] };
  }
  const state = action.match(/^pp1:state:([0-3])$/);
  if (state && conversation.step === 'state') {
    return { conversation: { step: 'experience', state: Number(state[1]) }, contentKeys: ['pp_experience'] };
  }
  const experience = action.match(/^pp1:experience:([0-3])$/);
  if (experience && conversation.step === 'experience' && conversation.state !== undefined) {
    return {
      conversation: { ...conversation, step: 'recommendation', experience: Number(experience[1]) },
      contentKeys: [`pp_recommendation_${conversation.state * 4 + Number(experience[1])}`],
    };
  }
  if (action === 'pp1:practice' && conversation.step === 'recommendation' && conversation.state !== undefined) {
    const kind = practiceKind(conversation.state);
    const available = kind === 'yoga' || Boolean(media.nidraAudio);
    return {
      conversation: { ...conversation, step: available ? 'practice' : 'recommendation' },
      contentKeys: [available ? `pp_${kind}` : 'pp_unavailable'],
    };
  }
  if (action === 'pp1:continue' && conversation.step === 'practice') {
    return { conversation: { ...conversation, step: 'interest' }, contentKeys: ['pp_interest'] };
  }
  const interest = action.match(/^pp1:interest:(practice|travel)$/);
  if (interest && conversation.step === 'interest') {
    const choice = interest[1] as 'practice' | 'travel';
    return {
      conversation: { ...conversation, interest: choice }, contentKeys: [`pp_destination_${choice}`],
    };
  }
  return undefined;
}
