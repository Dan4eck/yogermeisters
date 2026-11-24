import { eq } from 'drizzle-orm';

import type { CmsScenarioInput, CmsScenarioStepInput } from '@shared/cms';

import {
  DAY_ONE_MESSAGE,
  DAY_ONE_REMINDER_MESSAGE,
  DAY_TWO_MESSAGE,
  FOLLOW_UP_MESSAGE,
  MEDITATION_AUDIO_CAPTION,
} from '../telegram-bot/content';
import {
  PRACTICE_EXPERIENCE_QUESTION,
  PRACTICE_EXPERIENCES,
  PRACTICE_FOLLOW_UP,
  PRACTICE_INTRO,
  PRACTICE_NIDRA_CAPTION,
  PRACTICE_RECOMMENDATIONS,
  PRACTICE_STATE_QUESTION,
  PRACTICE_STATES,
  PRACTICE_YOGA_CAPTION,
  practiceKind,
} from '../telegram-bot/practice-content';
import type { Database } from './db/client';
import { telegramScenarios, telegramScenarioSteps } from './db/schema';

export function buildMigratedLegacyScenarios(): readonly CmsScenarioInput[] {
  const meditationScenario: CmsScenarioInput = {
    title: 'Приветственная медитация (непостоянство)',
    description: 'Перенесена из базовой воронки на отдельный диплинк. 5 шагов на 48 часов с аудиомедитацией.',
    startPayload: 'welcome_meditation',
    status: 'active',
    isDefault: false,
    restartOnStart: false,
    steps: [
      {
        stepKey: 'meditation_audio',
        triggerType: 'delay',
        delayMinutes: 0,
        messageText: MEDITATION_AUDIO_CAPTION,
        parseMode: 'plain',
        mediaUrl: 'env:MEDITATION_AUDIO',
        mediaType: 'audio',
        buttons: [],
      },
      {
        stepKey: 'meditation_follow_up',
        triggerType: 'delay',
        delayMinutes: 30,
        messageText: FOLLOW_UP_MESSAGE,
        parseMode: 'plain',
        buttons: [],
      },
      {
        stepKey: 'meditation_day_1',
        triggerType: 'delay',
        delayMinutes: 24 * 60,
        messageText: DAY_ONE_MESSAGE,
        parseMode: 'plain',
        buttons: [[{ text: 'Посмотреть Урок', url: 'https://yogermeisters.com/login?next=%2Fcabinet%2Ffree-lesson' }]],
      },
      {
        stepKey: 'meditation_day_1_reminder',
        triggerType: 'delay',
        delayMinutes: 24 * 60 + 50,
        messageText: DAY_ONE_REMINDER_MESSAGE,
        parseMode: 'plain',
        buttons: [],
      },
      {
        stepKey: 'meditation_day_2',
        triggerType: 'delay',
        delayMinutes: 48 * 60,
        messageText: DAY_TWO_MESSAGE,
        parseMode: 'plain',
        buttons: [
          [{ text: '🧘 The Yoga Method', url: 'https://yogermeisters.com/the-yoga-method' }],
          [{ text: '🌿 Чиралы', url: 'https://yogermeisters.com/retreats/cirali-yoga-tour' }],
        ],
      },
    ],
  };

  const practiceSteps: CmsScenarioStepInput[] = [
    {
      stepKey: 'pp_intro',
      triggerType: 'delay',
      delayMinutes: 0,
      messageText: PRACTICE_INTRO,
      parseMode: 'plain',
      buttons: [[{ text: 'Подобрать мою практику', nextStepKey: 'pp_state' }]],
    },
    {
      stepKey: 'pp_state',
      triggerType: 'button',
      delayMinutes: 0,
      messageText: PRACTICE_STATE_QUESTION,
      parseMode: 'plain',
      buttons: PRACTICE_STATES.map((text, stateIndex) => [{ text, nextStepKey: `pp_exp_${stateIndex}` }]),
    },
    ...PRACTICE_STATES.map((_, stateIndex): CmsScenarioStepInput => ({
      stepKey: `pp_exp_${stateIndex}`,
      triggerType: 'button',
      delayMinutes: 0,
      messageText: PRACTICE_EXPERIENCE_QUESTION,
      parseMode: 'plain',
      buttons: PRACTICE_EXPERIENCES.map((text, expIndex) => [
        { text, nextStepKey: `pp_rec_${stateIndex * 4 + expIndex}` },
      ]),
    })),
    ...PRACTICE_RECOMMENDATIONS.map((text, recIndex): CmsScenarioStepInput => {
      const kind = practiceKind(Math.floor(recIndex / 4));
      return {
        stepKey: `pp_rec_${recIndex}`,
        triggerType: 'button',
        delayMinutes: 0,
        messageText: text,
        parseMode: 'plain',
        buttons: [
          [
            {
              text: kind === 'yoga' ? '🧘 Перейти к практике йоги' : '🌙 Перейти к йога-нидре',
              nextStepKey: kind === 'yoga' ? 'pp_yoga' : 'pp_nidra',
            },
          ],
        ],
      };
    }),
    {
      stepKey: 'pp_yoga',
      triggerType: 'button',
      delayMinutes: 0,
      messageText: PRACTICE_YOGA_CAPTION,
      parseMode: 'plain',
      buttons: [[{ text: 'Хочу практиковать', nextStepKey: 'pp_interest' }]],
    },
    {
      stepKey: 'pp_nidra',
      triggerType: 'button',
      delayMinutes: 0,
      messageText: PRACTICE_NIDRA_CAPTION,
      parseMode: 'plain',
      mediaUrl: 'env:PERSONAL_PRACTICE_NIDRA_AUDIO',
      mediaType: 'audio',
      buttons: [[{ text: 'Хочу практиковать', nextStepKey: 'pp_interest' }]],
    },
    {
      stepKey: 'pp_interest',
      triggerType: 'button',
      delayMinutes: 0,
      messageText: PRACTICE_FOLLOW_UP,
      parseMode: 'plain',
      buttons: [
        [{ text: '🧘 Практика и развитие', nextStepKey: 'pp_dest_practice' }],
        [{ text: '🌊 Путешествие и новый опыт', nextStepKey: 'pp_dest_travel' }],
      ],
    },
    {
      stepKey: 'pp_dest_practice',
      triggerType: 'button',
      delayMinutes: 0,
      messageText: [
        'The Yoga Method — это онлайн-курс для самостоятельной, регулярной практики дома. 🌿',
        'Внутри — полноценные занятия йогой, короткие практики на каждый день, дыхательные техники, медитации и йога-нидра. '
          + 'Материалы помогают мягко развивать силу, гибкость и внимание к себе в удобном темпе.',
        'Познакомиться с программой и выбрать формат можно на сайте.',
      ].join('\n\n'),
      parseMode: 'plain',
      buttons: [[{ text: '🧘 The Yoga Method', url: 'https://yogermeisters.com/the-yoga-method' }]],
    },
    {
      stepKey: 'pp_dest_travel',
      triggerType: 'button',
      delayMinutes: 0,
      messageText: [
        'Чиралы Йога Тур — семь дней в уютных бунгало среди апельсиновых садов, в двух шагах от моря и гор. 🌊',
        'Утром практикуем гималайскую йогу и пранаяму, а вечером — мета-дыхание, ОШО- и буддийские медитации, йога-нидру. '
          + 'Между практиками — велосипеды по Чиралы, SUP в тихих бухтах, поход по Ликийской тропе к Чёрному пляжу, день на яхте со снорклингом, '
          + 'древний Олимпос и медитация под звёздами у огненной Химеры.',
        'Все детали путешествия — на сайте.',
      ].join('\n\n'),
      parseMode: 'plain',
      buttons: [[{ text: '🌊 Путешествие в Чиралы', url: 'https://yogermeisters.com/retreats/cirali-yoga-tour' }]],
    },
  ];

  const practiceScenario: CmsScenarioInput = {
    title: 'Персональный подбор практики (квиз)',
    description: 'Перенесён из встроенного квиза в CMS. 16 персональных рекомендаций с выдачей йоги или йога-нидры.',
    startPayload: 'personal_practice_v1',
    status: 'active',
    isDefault: false,
    restartOnStart: true,
    steps: practiceSteps,
  };

  return [meditationScenario, practiceScenario];
}

export async function seedLegacyScenariosIntoCms(db: Database): Promise<void> {
  const templates = buildMigratedLegacyScenarios();
  for (const input of templates) {
    const slug = input.startPayload.toLowerCase();
    const [existing] = await db
      .select({ id: telegramScenarios.id })
      .from(telegramScenarios)
      .where(eq(telegramScenarios.slug, slug))
      .limit(1);

    if (existing) {
      continue;
    }

    await db.transaction(async (tx) => {
      const [created] = await tx
        .insert(telegramScenarios)
        .values({
          slug,
          title: input.title,
          description: input.description ?? '',
          startPayload: input.startPayload,
          status: input.status ?? 'active',
          isDefault: input.isDefault ?? false,
          restartOnStart: input.restartOnStart ?? true,
        })
        .returning({ id: telegramScenarios.id });

      if (!created) return;

      await tx.insert(telegramScenarioSteps).values(
        input.steps.map((step, index) => ({
          scenarioId: created.id,
          stepOrder: index,
          stepKey: step.stepKey,
          triggerType: step.triggerType,
          delayMinutes: step.delayMinutes,
          messageText: step.messageText,
          parseMode: step.parseMode ?? 'plain',
          mediaAssetId: step.mediaAssetId ?? null,
          mediaUrl: step.mediaUrl ?? null,
          mediaType: step.mediaType ?? null,
          buttons: step.buttons ?? [],
        })),
      );
    });
  }
}
