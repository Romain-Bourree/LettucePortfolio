import type { HeaderAudience } from './types';

export const AUDIENCES: readonly HeaderAudience[] = [
  {
    id: 'everyone',
    label: 'everyone',
    text:
      "I'm a product designer who cares about products that actually work: for the people using them, the teams building them, and the business behind them. I also build things on the side, because the best way to stay sharp is to ship.",
  },
  {
    id: 'recruiters',
    label: 'recruiters',
    text:
      "If you're looking for a Principal Designer, working at the Staff or Principal level across early-stage startups and established companies. I build design systems from scratch, lead IC work, and contribute directly to engineering repos. Currently open to the right opportunity. Always happy to talk.",
  },
  {
    id: 'directors',
    label: 'directors',
    text:
      "If you need someone who owns the problem. I work best with clear challenges and room to drive the solution. I've led design teams, shaped product strategy, and navigated the ambiguity of early-stage and scaling environments. I'll tell you what I think, and I'll listen when you push back.",
  },
  {
    id: 'designers',
    label: 'designers',
    text:
      "If you care about the craft. I think in systems, sweat the details, and believe good design is mostly about the decisions you don't show. I've built design systems, mentored ICs, and spent more time than I'd like in component documentation. Always up for a critique — mine or yours.",
  },
  {
    id: 'product',
    label: 'product peeps',
    text:
      "If you want a design partner who actually gets it. I'll push back on the brief when it needs it and back you up when the stakeholders get loud. I think about edge cases, user flows, and business impact — not just how it looks. Give me a problem with real constraints and I'm at my best.",
  },
  {
    id: 'eng',
    label: 'eng peeps',
    text:
      "If you're tired of designers who don't understand state. I know how components work, I use Cursor daily, contribute to repos, and AI has genuinely expanded what I can build — not just design. I also won't ask you to just make it pop.",
  },
];

export const REVEAL_POOL = '01';
export const INTRO_TEXT =
  'I design products, build systems, and write code when the job needs it. 15 years in, most of them in fintech. I still think the best way to understand a problem is to get close to it.';
export const INITIAL_AUDIENCE_TEXT = AUDIENCES[0].text;
export const TITLE_AFTER_LOGO_DELAY_MS = 60;
export const INTRO_STEP_DELAY_MS = 120;
export const AUDIENCE_STEP_DELAY_MS = 240;
export const SCROLL_STEP_DELAY_MS = 240;
