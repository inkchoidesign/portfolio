// Portfolio Site v8 - Preview
import { CASE_ASSET_DIMS } from './caseAssets.js';
import { useState, useEffect, useRef, useLayoutEffect, useCallback, createContext, useContext } from 'react';
import { MetaballAnimation } from './MetaballAnimation';
import { ProcessMetaball } from './ProcessMetaball';
import { WorkAnimation } from './WorkAnimation';
import { PortraitAnimation } from './PortraitAnimation';
const monoStyle = {
  fontFamily: "'SF Mono', 'Fira Code', monospace",
  letterSpacing: '0.02em'
};

const titleStyle = {
  fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  fontWeight: 600,
  letterSpacing: '0em'
};

/** Light headlines / primary text on dark backgrounds: soft off-white */
const TEXT_LIGHT_ON_DARK = '#ebe8e4';

/** Site colour: everything is greyscale except one coral red (CTA_CORAL below).
 *  Nothing inside the II case uses it (gold/green/red there are that product's
 *  own colours). */
/** Coral red, the site's one colour. Used for: the home hero's circle CTA, the
 *  nav's current/hover square (NavMark), every CTA arrow (.cta-arrow in
 *  index.css, as --coral), and the closing statement's full stop.
 *  Never for body text or large lines. */
const CTA_CORAL = '#F2483A';
if (typeof document !== 'undefined') document.documentElement.style.setProperty('--coral', CTA_CORAL);

/** The nav's "you are here / about to go here" mark: a small solid coral square.
 *  Same coral as the hero circle CTA, and like it only ever a solid shape. */
function NavMark() {
  return (
    <span
      aria-hidden="true"
      className="mr-1.5 inline-block align-middle"
      style={{ width: 6, height: 6, backgroundColor: CTA_CORAL, marginTop: -2 }}
    />
  );
}

/** Shared outer styles for all `[ Label ]` text CTAs (mono brackets) */
const CTA_BRACKET_CLASS =
  'group tap-target inline-flex w-fit max-w-full cursor-pointer touch-manipulation items-center border-0 bg-transparent p-0 text-left no-underline transition-opacity hover:no-underline hover:opacity-60 visited:text-inherit focus:outline-none';
/** Link-style CTA text on dark UI: one step darker than primary text. */
const CTA_TEXT_ON_DARK = '#9a9a9a';
/** The `[ ]` characters only: one step darker still, so the label reads as
 *  the actual link and the brackets recede to punctuation. */
const CTA_BRACKET_ON_DARK = '#6e6e6e';

/** Single source for contact: avoids OS mail client defaulting to another account (e.g. work). */
const CONTACT_EMAIL = 'inkchoidesign@gmail.com';
const CONTACT_MAILTO = `mailto:${CONTACT_EMAIL}`;
const CONTACT_GMAIL_COMPOSE = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(CONTACT_EMAIL)}`;

/** Light surface tokens for project detail overlay (off-white background) */
const DETAIL_UI = {
  overlayBg: '#f5f3ef',
  title: '#141414',
  body: '#3d3d3d',
  meta: '#6b6b6b',
  border: '#d9d4c9',
  imageWell: '#eae7e0',
  placeholderText: '#8a8680',
  /** One step lighter than placeholderText: section kicker lines */
  kickerMuted: '#a8a8a8'
};

/** Autosync brief + stacked images: design max width (px); display uses 70% of that. */
const AUTOSYNC_BRIEF_MEDIA_MAX_PX = 760;
const AUTOSYNC_BRIEF_MEDIA_DISPLAY_PX = Math.round(AUTOSYNC_BRIEF_MEDIA_MAX_PX * 0.7);

/** What Got Built: 2-column grid (1 col on small screens), caption under each frame. */
const AUTOSYNC_BUILT_CATALOG = [
  { caption: 'G-1', aspect: 'aspect-[3/4]' },
  { caption: 'V-1', aspect: 'aspect-[5/4]' },
  { caption: 'I-3', aspect: 'aspect-square' },
  { caption: 'Z-1', aspect: 'aspect-[4/5]' },
  { caption: 'M-2', aspect: 'aspect-[4/3]' },
  { caption: 'N-4', aspect: 'aspect-[2/3]' }
];

const AUTOSYNC_PRESENTATION_CATALOG = [
  { caption: 'P-1', aspect: 'aspect-[16/9]' },
  { caption: 'P-2', aspect: 'aspect-[4/3]' },
  { caption: 'P-3', aspect: 'aspect-[16/9]' },
  { caption: 'P-4', aspect: 'aspect-[4/3]' },
  { caption: 'P-5', aspect: 'aspect-[16/9]' }
];

/** Shared CTA: `[ Label ]` monospace link/button */
function CtaBracket({
  label,
  href,
  onClick,
  external = false,
  className = '',
  style,
  monoStyle: m,
  textColor = CTA_TEXT_ON_DARK,
  bracketColor = CTA_BRACKET_ON_DARK
}) {
  const inner = (
    <span className="whitespace-nowrap text-xs" style={{ ...m }}>
      <span style={{ color: bracketColor }}>[ </span>
      <span style={{ color: textColor }}>{label}</span>
      <svg
        aria-hidden="true"
        width="9"
        height="9"
        viewBox="0 0 12 12"
        fill="none"
        className="cta-arrow inline-block shrink-0 transition-transform duration-200 group-hover:translate-x-px group-hover:-translate-y-px"
        style={{ color: textColor, marginLeft: '0.4em', marginBottom: '0.05em' }}
      >
        {/* Shaft stays short; the head (the two arms meeting the tip) is drawn
            long on purpose so it reads as the dominant shape, not the line. */}
        <path
          d="M3 9 L9 3 M3.5 3 H9 V8.5"
          stroke="currentColor"
          strokeWidth="1.3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span style={{ color: bracketColor }}> ]</span>
    </span>
  );
  const base = `${CTA_BRACKET_CLASS} ${className}`.trim();
  const mergedStyle = { textDecoration: 'none', ...(style || {}) };
  if (href) {
    return (
      <a
        href={href}
        className={base}
        style={mergedStyle}
        {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      >
        {inner}
      </a>
    );
  }
  return (
    <button type="button" onClick={onClick} className={base} style={mergedStyle}>
      {inner}
    </button>
  );
}

const INITIAL_ABOUT_SECTIONS = ['aboutLeft', 'aboutRight', 'aboutFooter'];

/** About / resume: full entries (right column) */
const ABOUT_EXPERIENCE = [
  {
    role: 'Brand Designer',
    org: 'Orion Digital',
    period: 'Apr 2025 · Present',
    summary: 'Shaping the company across product, brand, web, and communication as the business evolved.',
    bullets: [
      'Contributed to UI/UX direction across digital touchpoints',
      'Aligned brand, product, and marketing experiences',
      'Explored AI workflows to accelerate concepting'
    ],
    ko: {
      role: '브랜드 디자이너',
      period: '2025.04 · 현재',
      summary: '사업이 변화하는 동안 제품, 브랜드, 웹, 커뮤니케이션 전반에서 회사의 모습을 만들었다.',
      bullets: [
        '디지털 접점 전반의 UI/UX 방향에 기여',
        '브랜드, 제품, 마케팅 경험을 일치시킴',
        '컨셉 도출을 앞당기기 위해 AI 워크플로를 탐색'
      ]
    }
  },
  {
    role: 'Visual Designer',
    org: 'TRADER (AutoSync)',
    period: '2022 · 2025',
    summary: 'Building structure and a visual system for a product ecosystem that was still taking shape.',
    bullets: [
      'Delivered landing and campaign experiences',
      'Strengthened consistency across touchpoints',
      'Built scalable assets and systems'
    ],
    ko: {
      role: '비주얼 디자이너',
      summary: '아직 형태를 갖춰 가던 제품 생태계를 위해 구조와 비주얼 시스템을 구축했다.',
      bullets: ['랜딩 및 캠페인 경험 제작', '접점 전반의 일관성 강화', '확장 가능한 에셋과 시스템 구축']
    }
  },
  {
    role: 'Visual Designer',
    org: 'Motoinsight',
    period: '2018 · 2021',
    summary: 'Bringing brand, marketing, and digital experiences into one coherent system across touchpoints.',
    bullets: [
      'Produced branded assets across web and campaigns',
      'Supported multi-channel communication'
    ],
    ko: {
      role: '비주얼 디자이너',
      summary: '브랜드, 마케팅, 디지털 경험을 접점 전반에 걸쳐 하나의 일관된 시스템으로 묶었다.',
      bullets: ['웹과 캠페인 전반의 브랜드 에셋 제작', '멀티 채널 커뮤니케이션 지원']
    }
  },
  {
    role: 'Senior Graphic Designer',
    org: 'Synergy Network',
    period: '2015 · 2018',
    summary: 'Carrying one direction across brand, web, and presentation work from concept through production.',
    bullets: [
      'Designed brand, web, and presentation materials',
      'Delivered projects from concept to production'
    ],
    ko: {
      role: '시니어 그래픽 디자이너',
      summary: '브랜드, 웹, 프레젠테이션 작업 전반에 하나의 방향을 컨셉부터 제작까지 이어갔다.',
      bullets: ['브랜드, 웹, 프레젠테이션 자료 디자인', '컨셉부터 제작까지 프로젝트 완수']
    }
  },
  {
    role: 'Graphic Designer',
    org: 'Arbor Memorial Inc.',
    period: '2013 · 2015',
    summary: 'Learning how print and communication decisions hold up once they reach production and delivery.',
    bullets: [
      'Produced print and communication materials',
      'Managed production and delivery'
    ],
    ko: {
      role: '그래픽 디자이너',
      summary: '인쇄와 커뮤니케이션 결정이 제작과 납품 단계에서 어떻게 유지되는지 배웠다.',
      bullets: ['인쇄 및 커뮤니케이션 자료 제작', '제작과 납품 관리']
    }
  }
];

/** Why experience matters: range and judgment, not seniority. */
const ABOUT_JUDGMENT_COPY = [
  'I have designed for car dealers and carmakers, for six software companies becoming one division, for a memorial company in print, and now for an investing app. Each needed a different form: a guideline, a hexagon, a trade show booth, a dashboard. What carried over was the first question. What does this brand stand for?',
  'So experience, to me, is range. I have met the same problem on paper, on a website and inside a product, and I recognize it sooner each time.'
];

const ABOUT_JUDGMENT_KO = [
  '자동차 딜러와 제조사, 하나의 디비전으로 합쳐지는 소프트웨어 회사 여섯 곳, 인쇄물을 만드는 메모리얼 회사, 그리고 지금은 투자 앱. 필요한 형태는 매번 달랐다. 가이드라인, 헥사곤, 전시 부스, 대시보드. 그대로 이어진 것은 첫 질문이었다. 이 브랜드는 무엇을 위한 것인가?',
  '그래서 내게 경험은 범위다. 같은 문제를 종이 위에서, 웹사이트에서, 제품 안에서 만나 봤고, 그래서 매번 더 빨리 알아본다.'
];

/** Capabilities: large categories, not a discipline checklist. */
const ABOUT_CAPABILITIES = [
  {
    label: 'Brand',
    copy: 'Logos and identity systems, from the AutoSync hexagon to the Intelligent Investing symbol, and guidelines teams use on their own',
    ko: { label: '브랜드', copy: 'AutoSync의 헥사곤부터 Intelligent Investing의 심볼까지, 로고와 아이덴티티 시스템, 그리고 팀이 스스로 쓰는 가이드라인' }
  },
  {
    label: 'Product and web',
    copy: 'Product UI and design systems, websites built in code, and white-label work in each carmaker’s brand',
    ko: { label: '제품과 웹', copy: '프로덕트 UI와 디자인 시스템, 코드로 만든 웹사이트, 그리고 각 자동차 제조사 브랜드에 맞춘 화이트라벨 작업' }
  },
  {
    label: 'Communication',
    copy: 'Campaigns, reels and carousels, sales materials, trade shows and the office',
    ko: { label: '커뮤니케이션', copy: '캠페인, 릴스와 캐러셀, 영업 자료, 전시회, 그리고 사무실' }
  }
];

/** Tools framed as evolving method, not a separate "AI-first" positioning. */
const ABOUT_TOOLS_COPY = [
  'I started in print, moved to the web and to product, and now work in code and with AI. When the numbers matter, I prototype in code on real data and hand engineering working HTML. AI produces the options quickly. I make the call.'
];
const ABOUT_TOOLS_KO = [
  '인쇄에서 시작해 웹과 제품으로 옮겨 왔고, 지금은 코드와 AI로 일한다. 숫자가 중요할 때는 실제 데이터로 코드 프로토타입을 만들고, 엔지니어링에는 작동하는 HTML을 넘긴다. AI는 안을 빠르게 만든다. 결정은 내가 한다.'
];

/** Case study overlay / full-width card captions: fluid horizontal gutters */
const WORK_PAGE_GUTTER_X = 'px-5 sm:px-8 md:px-12 lg:px-16 xl:px-20';

const fadeUpStyle = (isVisible) => ({
  transform: isVisible ? 'translateY(0)' : 'translateY(60px)',
  opacity: isVisible ? 1 : 0,
  transition: 'transform 0.8s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.8s cubic-bezier(0.4, 0, 0.2, 1)'
});

/** Approach strip: solid, slightly darker than main shell (not pure black) */
/** Two grounds only, alternating down the page so sections part without a third
 *  tone: dark #1a1a1a (hero, Process) and cream #ebe8e4 (Selected Work, Statement). */
const APPROACH_SURFACE = '#1a1a1a';
const STATEMENT_SURFACE = '#ebe8e4';

/** Home [Selected Work]: full index on Work page */
const FEATURED_WORK_IDS = ['investing', 'autosync', 'mi'];

/** Shared frame for every section and the fixed nav. Below 1440 this is a no-op and
 *  the page stays full-bleed; above it everything centres together, so the layout
 *  can't drift apart the way it did when only one section was constrained. */
const PAGE_FRAME = 'mx-auto w-full max-w-[1680px] [container-type:inline-size]';

/** Width of N columns of the frame's 12-col grid (the same grid the `g` overlay
 *  draws: gap-4 / sm:gap-6, --col-gap set in index.css). 100cqi is the frame's
 *  content box, so this is exact at every viewport and every page. Use it wherever
 *  a text block should sit on the grid instead of an arbitrary max-w-*. */
const frameCols = (n) => `calc((100cqi_-_11*var(--col-gap))/12*${n}_+_${n - 1}*var(--col-gap))`;
/* ^ underscores, not spaces: this goes inside a Tailwind arbitrary value
   (`md:w-[...]`), which turns `_` into the spaces calc() needs around + and -. */
/** Hero text column on Home and Work: exactly 6 of 12. The animation takes the
 *  other 6, and both canvases are 770x440, so the two hero boxes are identical. */
const HERO_TEXT_COL = `md:w-[${frameCols(6)}] md:flex-none`;
/** Hero metaballs: exactly cols 8-12, pushed to the frame's right edge; col 7 is
 *  the air between headline and form. */
const HERO_ART_COL = `md:w-[${frameCols(5)}] md:flex-none md:ml-auto`;
/** Index rows (Selected Work, About experience): number + title take cols 1-4 so
 *  the description column starts exactly on col 5. The row's own gap is the grid
 *  gap (md:gap-6) for the same reason. 27rem floor keeps titles on one line at md. */
const ROW_LEAD_COL = `md:w-[max(27rem,${frameCols(4)})] md:flex-none`;

/** Muted labels on dark UI (mono tags, years, section markers, approach subheads).
 *  4.72:1 on #1a1a1a — these render at 11-12px, so they need the AA 4.5 floor. */
const MUTED_ON_DARK = '#858585';
/** Body copy on dark UI (one step brighter, keeps the muted/body hierarchy readable) */
const BODY_ON_DARK = '#9a9a9a';
/** Selected Work row title, resting state (one step brighter than BODY_ON_DARK,
 *  still leaves room for the hover crossfade up to TEXT_LIGHT_ON_DARK). */
const ROW_TITLE_ON_DARK = '#b3b0ab';

/** Selected Work sits on a light band: the hero headline colour turned into the
 *  ground, so the two read as one palette inverted rather than two unrelated ones.
 *  Every text tone is checked against #ebe8e4 (muted needs the 4.5 AA floor). */
const LIGHT_BAND_BG = '#ebe8e4';
const DARK_ROW_UI = {
  imageWell: '#0a0a0a',
  border: '#2a2a2a',
  label: MUTED_ON_DARK,
  num: MUTED_ON_DARK,
  titleRest: ROW_TITLE_ON_DARK,
  titleHover: TEXT_LIGHT_ON_DARK,
  body: BODY_ON_DARK,
  muted: MUTED_ON_DARK
};
const LIGHT_ROW_UI = {
  imageWell: '#e2ded5',
  border: '#cdc8bd',
  label: '#66625c', // 4.96:1
  num: '#66625c',
  titleRest: '#5b5853', // 5.80:1, dimmed at rest so hover has somewhere to go
  titleHover: '#141414', // 15.08:1
  body: '#4a4844', // 7.47:1
  muted: '#66625c'
};

function ProjectListRow({
  project,
  index,
  isVisible,
  isHovered,
  monoStyle,
  titleStyle,
  onOpen,
  onHoverStart,
  onHoverEnd,
  onHoverMove,
  ui = DARK_ROW_UI
}) {
  const ko = useKo();
  const pk = ko && project.ko ? project.ko : project;
  return (
    <button
      type="button"
      data-project-index={index}
      onClick={onOpen}
      onMouseEnter={(e) => onHoverStart(e)}
      onMouseLeave={onHoverEnd}
      onMouseMove={onHoverMove}
      className="w-full text-left block py-8 md:py-10 transition-all duration-300"
      style={{
        borderTop: `1px solid ${ui.border}`,
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
        transition: 'opacity 0.8s ease, transform 0.8s ease'
      }}
    >
      {/* The work is visible without hovering: on top below md, cols 10-12 from md and 9-12 from 1360px (narrower, a fourth column squeezes the sentence to three lines)
          (in the row, after the year). Hover only lifts it slightly. */}
      <div className="mb-6 aspect-[16/10] w-full overflow-hidden md:hidden" style={{ backgroundColor: DARK_ROW_UI.imageWell }}>
        {project.thumb}
      </div>
      <div className="flex justify-between items-start gap-8 md:items-center md:gap-6">
        <div className={`flex min-w-0 flex-1 flex-col items-stretch gap-2 md:flex-row md:items-center md:gap-8 ${ROW_LEAD_COL}`}>
          {/* the period in place of an index number: real information, and every
              row's value differs; fixed width so the titles share one start line */}
          <span
            className="w-16 text-xs shrink-0 tabular-nums pt-1 md:pt-0"
            style={{ ...monoStyle, color: ui.num, lineHeight: 1 }}
          >
            {ko && project.period ? project.period.replace('Now', '현재') : project.period || project.num}
          </span>
          {/* the title column is a size container: on screens where cols 1-4 are
              narrower than the longest title at 36px, the title steps down just
              enough to stay whole instead of being clipped */}
          <div className="min-w-0 flex-1" style={{ containerType: 'inline-size' }}>
            <span
              className="text-2xl md:hidden block"
              style={{ ...titleStyle, color: ui.titleHover, lineHeight: '1.3' }}
            >
              {project.title}
            </span>
            <div
              className="hidden md:block min-w-0 text-4xl"
              style={{ position: 'relative', height: '1.3em', overflow: 'hidden', fontSize: 'min(2.25rem, calc(100cqi / 10.8))' }}
            >
              <span
                className="block whitespace-nowrap transition-transform duration-300"
                style={{
                  ...titleStyle,
                  color: ui.titleRest,
                  transform: isHovered ? 'translateY(-100%)' : 'translateY(0)',
                  lineHeight: '1.3'
                }}
              >
                {project.title}
              </span>
              <span
                className="block absolute whitespace-nowrap transition-transform duration-300"
                style={{
                  ...titleStyle,
                  color: ui.titleHover,
                  top: '100%',
                  left: 0,
                  transform: isHovered ? 'translateY(-100%)' : 'translateY(0)',
                  lineHeight: '1.3'
                }}
              >
                {project.title}
              </span>
            </div>
            <p
              className="md:hidden mt-3 text-xs md:text-sm leading-relaxed max-w-xl"
              style={{ ...monoStyle, letterSpacing: '0em', color: ui.body }}
            >
              {pk.subtext}
            </p>
          </div>
        </div>
        {/* Description column. md:flex-1
            (not mr-auto alone) so every row's column is the same width regardless
            of how long that row's sentence is; without it each row sized to its own
            content and the column edge drifted a few px row to row. */}
        <div className="hidden min-w-0 md:block md:flex-1">
          {/* One step above the 12px labels (number, year) so the sentence reads
              as content, not as another label. */}
          {/* capped so every row's sentence breaks to two lines */}
          <p
            className="max-w-[58ch] text-sm leading-snug"
            style={{ ...monoStyle, letterSpacing: '0em', color: ui.body, textWrap: 'balance' }}
          >
            {pk.subtext}
          </p>
        </div>
        <div
          className={`hidden aspect-[16/10] shrink-0 overflow-hidden md:block md:w-[${frameCols(3)}] min-[1360px]:w-[${frameCols(4)}]`}
          style={{ backgroundColor: DARK_ROW_UI.imageWell }}
        >
          <div
            className="h-full w-full"
            style={{ transform: isHovered ? 'scale(1.04)' : 'scale(1)', transition: 'transform 0.6s cubic-bezier(0.22, 1, 0.36, 1)' }}
          >
            {project.thumb}
          </div>
        </div>
      </div>
    </button>
  );
}

/** Matches WorkGalleryCard widths: w-[min(92vw,560px)] md:w-[min(90vw,720px)], gap-6 / md:gap-10 */
/* Fallback for the pin height before the track can be measured. From md up the row is
   sized to fit, so there is nothing to scroll; below md it is still a swipeable strip. */
const WORK_GALLERY_CARD_W = (1680 - 64 - 80) / 3; // 512

function estimateWorkGalleryMaxShift(viewportW, cardCount) {
  const md = viewportW >= 768;
  /* md card = a third of the 1680 page frame less its 32px gutters and two 40px
     gaps, so at >=1680 the three sit exactly on the 12-col frame and below that
     the strip overflows and scrolls. Keep in step with WorkGalleryCard. */
  const cardW = md ? WORK_GALLERY_CARD_W : Math.min(viewportW * 0.92, 560);
  const gap = md ? 40 : 24;
  const rowW = cardCount * cardW + Math.max(0, cardCount - 1) * gap;
  return Math.max(0, Math.round(rowW - viewportW));
}

function WorkGalleryCard({ project, monoStyle, titleStyle, onOpen, variant = 'gallery', ui = DARK_ROW_UI }) {
  const [imgHover, setImgHover] = useState(false);
  const ko = useKo();
  const pk = ko && project.ko ? project.ko : project;
  const widthClass =
    variant === 'full'
      ? 'w-full max-w-none shrink-0'
      : 'shrink-0 w-[min(92vw,560px)] md:w-[512px]';

  const caption = (
    <>
      {project.framing && (
        <p
          className="mt-12 w-full min-w-0 text-left text-xs md:mt-16"
          style={{ ...monoStyle, letterSpacing: '0em', color: ui.muted }}
        >
          {project.num} · {pk.framing}
        </p>
      )}
      {/* Title and tag on their own lines so the three captions align across the
          row regardless of title length. */}
      <p
        className={`w-full min-w-0 text-left text-lg leading-snug md:text-xl ${project.framing ? 'mt-3' : 'mt-12 md:mt-16'}`}
        style={{ ...titleStyle, color: ui.titleHover }}
      >
        {project.title}
      </p>
      {/* fontWeight inline: titleStyle carries 600 as an inline style, which beats
          a font-normal class. */}
      <p
        className="w-full min-w-0 text-left text-lg leading-snug md:text-xl"
        style={{ ...titleStyle, fontWeight: 400, color: ui.body }}
      >
        {pk.tag.trim()}
      </p>
      {/* `blurb` is written to the same length for every card so the three
          captions run the same number of lines. `subtext` stays a one-liner for
          the index rows. */}
      <p
        className="mt-3 text-xs md:text-sm leading-relaxed"
        style={{ ...monoStyle, letterSpacing: '0em', color: ui.body }}
      >
        {pk.blurb ?? pk.subtext}
      </p>
    </>
  );

  return (
    <button
      type="button"
      onClick={() => onOpen(project.id)}
      onMouseEnter={() => setImgHover(true)}
      onMouseLeave={() => setImgHover(false)}
      className={`${widthClass} block text-left`}
    >
      <div
        style={{ backgroundColor: ui.imageWell }}
        className={`relative aspect-[16/10] w-full overflow-hidden md:aspect-[2/1] transition-[filter] duration-300 ease-out ${
          imgHover
            ? 'brightness-100'
            : project.id === 'autosync'
              ? 'brightness-[0.8]'
              : 'brightness-[0.7]'
        }`}
      >
        <img
          src={project.gallerySrc}
          alt=""
          className="absolute inset-0 h-full w-full object-cover transition-opacity duration-[850ms] ease-[cubic-bezier(0.33,1,0.68,1)]"
          style={{ opacity: imgHover ? 0 : 1 }}
        />
        <img
          src={project.galleryHoverSrc}
          alt=""
          className="absolute inset-0 h-full w-full object-cover transition-opacity duration-[850ms] ease-[cubic-bezier(0.33,1,0.68,1)]"
          style={{ opacity: imgHover ? 1 : 0 }}
        />
      </div>
      {variant === 'full' ? <div className={WORK_PAGE_GUTTER_X}>{caption}</div> : caption}
    </button>
  );
}

/** Korean reading copy, for the owner only. Press "k" (or open with ?ko) to swap
 *  the copy to Korean; nothing in the UI advertises it, so visitors only ever see
 *  English. Translations mirror the English line for line, for checking meaning. */
const LangContext = createContext('en');
const useKo = () => useContext(LangContext) === 'ko';
/** Inline swap for JSX text: <L en="..." ko="..." /> */
function L({ en, ko }) {
  return useKo() && ko != null ? ko : en;
}

/** "The ___ changes." — the medium keeps changing while the second line holds
 *  still, which is the sentence's whole point. Same grammar as the Selected Work
 *  title roll: the outgoing word lifts and fades, the next rises in from below,
 *  and the slot's width eases to the new word so "changes." glides instead of
 *  jumping. Every word is no wider than "medium", so the line never outgrows the
 *  width .hero-title is sized for. */
const HERO_MEDIA = ['medium', 'logo', 'app', 'screen', 'deck', 'brand'];
/** Korean reading copy: [word, particle]. Particle follows 받침 (은 after a final
 *  consonant, 는 otherwise). */
const HERO_MEDIA_KO = [['매체', '는'], ['로고', '는'], ['앱', '은'], ['화면', '은'], ['덱', '은'], ['브랜드', '는']];
const HERO_WORD_HOLD_MS = 2600;
const HERO_WORD_EASE = '0.7s cubic-bezier(0.22, 1, 0.36, 1)';

function HeroMediumWord({ ko = false, onIndex }) {
  const words = ko ? HERO_MEDIA_KO.map(([w]) => w) : HERO_MEDIA;
  // same face as the rest of the headline; the selection box alone sets it apart
  const font = undefined;
  const [i, setI] = useState(0);
  const [prev, setPrev] = useState(null);
  const [widths, setWidths] = useState(null);
  const sizerRef = useRef(null);

  // measure every word in the headline's own font, again whenever the size changes
  useEffect(() => {
    const el = sizerRef.current;
    if (!el) return undefined;
    const measure = () => setWidths([...el.children].map((c) => c.getBoundingClientRect().width));
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el.parentElement);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return undefined;
    const id = setTimeout(() => {
      setPrev(i);
      setI((i + 1) % words.length);
    }, HERO_WORD_HOLD_MS);
    return () => clearTimeout(id);
  }, [i]);

  useEffect(() => {
    onIndex?.(i);
  }, [i]);

  // after the swap renders, clear the outgoing word once its exit has played
  useEffect(() => {
    if (prev == null) return undefined;
    const id = setTimeout(() => setPrev(null), 750);
    return () => clearTimeout(id);
  }, [prev]);

  const word = (k, state) => (
    <span
      key={`${k}-${state}`}
      className={state === 'in' ? 'hero-word-in' : 'hero-word-out'}
      style={{
        position: state === 'in' ? 'relative' : 'absolute',
        left: 0,
        top: 0,
        whiteSpace: 'nowrap',
        color: '#1a1a1a', // reversed out of the light selection field
        ...font
      }}
    >
      {words[k]}
    </span>
  );

  // A design-tool selection box around the changing word: 1px frame and four
  // corner handles, easing with the slot as the word swaps.

  return (
    <span aria-hidden="true" className="whitespace-nowrap">
      <span
        className={`hero-slot relative inline-block align-baseline${ko ? ' ko' : ''}`}
        style={{ width: widths ? widths[i] : undefined, margin: '0 0.16em', transition: `width ${HERO_WORD_EASE}`, isolation: 'isolate' }}
      >
        {prev != null && word(prev, 'out')}
        {word(i, 'in')}
        <span aria-hidden="true" className={`hero-sel${ko ? ' ko' : ''}`}>
        </span>
        <span ref={sizerRef} aria-hidden="true" className="pointer-events-none invisible absolute left-0 top-0 whitespace-nowrap" style={font}>
          {words.map((w) => (
            <span key={w} className="absolute left-0 top-0">{w}</span>
          ))}
        </span>
      </span>
      {/* Korean particle follows the word's final consonant (는/은) */}
      {ko && HERO_MEDIA_KO[i][1]}
    </span>
  );
}

/** Home hero background: one still frame of the paint swirl (Pixabay 22908,
 *  grayscale, mirrored), kept faint. The moving version made the first screen
 *  the heaviest on the page; the still keeps the material without the motion. */
function HeroVideo() {
  return <img src="video/hero-bg-poster.jpg" alt="" className="h-full w-full object-cover" style={{ opacity: 0.3 }} />;
}

/** Film grain over the hero video, drawn as an overlay rather than baked into the
 *  encode (the codec smoothed baked grain away). One random tile is generated once,
 *  then the layer jumps to a new offset ~12 times a second so the grain flickers
 *  like film instead of sliding. Reduced motion keeps a still grain. */
function HeroGrain() {
  const [tile, setTile] = useState(null);
  useEffect(() => {
    const c = document.createElement('canvas');
    const n = 160;
    c.width = n;
    c.height = n;
    const ctx = c.getContext('2d');
    const img = ctx.createImageData(n, n);
    for (let i = 0; i < img.data.length; i += 4) {
      const v = (Math.random() * 255) | 0;
      img.data[i] = v;
      img.data[i + 1] = v;
      img.data[i + 2] = v;
      img.data[i + 3] = 255;
    }
    ctx.putImageData(img, 0, 0);
    setTile(c.toDataURL());
  }, []);
  if (!tile) return null;
  return (
    <div
      className="hero-grain absolute"
      style={{ inset: '-160px', backgroundImage: `url(${tile})`, backgroundSize: '160px 160px', opacity: 0.07, mixBlendMode: 'screen' }}
    />
  );
}

const PROCESS_STEPS = [
  { n: '01', label: 'Context', copy: 'Understand what actually matters', ko: { label: '맥락', copy: '무엇이 실제로 중요한지 이해한다' } },
  { n: '02', label: 'Position', copy: 'Decide what it should become', ko: { label: '포지션', copy: '무엇이 되어야 하는지 정한다' } },
  { n: '03', label: 'Expression', copy: 'Make it visible, usable, and coherent', ko: { label: '표현', copy: '눈에 보이고, 쓸 수 있고, 일관되게 만든다' } }
];
const PROCESS_STEP_MS = 5600; // Position's gather, grow and trade take ~3s, then it holds

/** Process on the frame's 12 columns: the lead, then the three steps on cols
 *  1-5, the hero's former metaballs on 8-12 centred on both. Steps cycle on their own;
 *  hovering, focusing or tapping one holds it. The step's rule doubles as the
 *  timer. (Compared 10-27 and dropped: stacked, mirrored + orbit, type only,
 *  scroll-pinned, text on the visual, cursor scrub.) */
function ProcessTimer({ on, held, i }) {
  if (!on) return null;
  return (
    <span key={`${i}-${held}`} className="process-timer absolute inset-y-0 left-0 block">
      <span
        className="process-timer-fill absolute inset-y-0 left-0 block"
        style={{ background: TEXT_LIGHT_ON_DARK, ...(held ? { animation: 'none', width: '100%' } : { animationDuration: `${PROCESS_STEP_MS}ms` }) }}
      />
    </span>
  );
}

function ProcessSteps({ monoStyle, titleStyle, ko, label, lead }) {
  const [active, setActive] = useState(0);
  const [held, setHeld] = useState(false);

  useEffect(() => {
    if (held) return undefined;
    const id = setTimeout(() => setActive((a) => (a + 1) % PROCESS_STEPS.length), PROCESS_STEP_MS);
    return () => clearTimeout(id);
  }, [active, held]);

  const hold = (i) => {
    setActive(i);
    setHeld(true);
  };
  const rule = { backgroundColor: DARK_ROW_UI.border };

  return (
    <div className="relative grid w-full grid-cols-12 gap-x-4 text-left sm:gap-x-6">
      <div className="col-span-12 lg:col-start-1 lg:col-end-6 lg:row-start-1">
        {label}
        {lead}
      </div>
      <div className="relative z-10 col-span-12 mx-auto mt-10 w-3/4 sm:w-1/2 lg:col-start-8 lg:col-end-13 lg:row-start-1 lg:row-end-3 lg:mx-0 lg:mt-0 lg:w-auto lg:self-center">
        {/* the hero's metaballs (swapped with the orbit); each step reshapes them:
            apart, one mass, the orbit again */}
        <MetaballAnimation
          bgHex={APPROACH_SURFACE}
          stage={active}
          mode="animation2"
          scale={1.3}
          transparentBg
          intro
          orbitWidth={1.4}
          blobScale={1.3}
        />
      </div>
      <div className="col-span-12 mt-8 lg:col-start-1 lg:col-end-6 lg:row-start-2 lg:mt-20" onMouseLeave={() => setHeld(false)}>
        {PROCESS_STEPS.map((step, i) => {
          const on = active === i;
          return (
            <button
              key={step.n}
              type="button"
              aria-pressed={on}
              onMouseEnter={() => hold(i)}
              onFocus={() => hold(i)}
              onBlur={() => setHeld(false)}
              onClick={() => hold(i)}
              className="relative block w-full cursor-pointer border-0 bg-transparent py-5 text-left"
            >
              {/* the rule doubles as the timer */}
              <span className="absolute inset-x-0 top-0 h-px" style={rule}>
                <ProcessTimer on={on} held={held} i={i} />
              </span>
              <span className="flex items-baseline gap-6" style={{ opacity: on ? 1 : 0.4, transition: 'opacity 0.4s ease' }}>
                <span className="w-6 shrink-0 text-xs tabular-nums" style={{ ...monoStyle, color: MUTED_ON_DARK }}>{step.n}</span>
                <span className="min-w-0">
                  <span className="block text-lg md:text-xl" style={{ ...titleStyle, fontWeight: 600, color: TEXT_LIGHT_ON_DARK }}>
                    {ko ? step.ko.label : step.label}
                  </span>
                  <span className="mt-1 block text-base leading-[1.6] md:text-lg" style={{ ...titleStyle, fontWeight: 400, color: BODY_ON_DARK }}>
                    {ko ? step.ko.copy : step.copy}
                  </span>
                </span>
              </span>
            </button>
          );
        })}
        <div className="h-px w-full" style={rule} />
      </div>
    </div>
  );
}

export default function Portfolio() {
  const [scrollY, setScrollY] = useState(0);
  const [hoveredProject, setHoveredProject] = useState(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [thumbTransition, setThumbTransition] = useState({ current: null, prev: null, isAnimating: false });
  const [hoveredMenu, setHoveredMenu] = useState(null);
  const [logoHovered, setLogoHovered] = useState(false);
  const [blinking, setBlinking] = useState(false);
  const [view, setView] = useState('home');
  const [detailProject, setDetailProject] = useState(null);
  /* No separate Work or About pages: Work is the list on home; the full About
     opens in the detail sheet like a case (from Process). */
  const openAbout = () => setDetailProject('about');
  const [heroWord, setHeroWord] = useState(0);
  /* Phone nav: the vertical stack stays, but once the page scrolls it folds to the
     one line for the section in view (with the coral mark); tapping that line
     unfolds the stack again, and scrolling on folds it back. sm and up are unchanged. */
  const [isNarrow, setIsNarrow] = useState(false);
  const [navOpen, setNavOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);
  const [navCurrent, setNavCurrent] = useState(null);
  const navOpenYRef = useRef(0);
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 639px)');
    const sync = () => setIsNarrow(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);
  useEffect(() => {
    const probe = 120; // just under the folded nav line
    const inView = (el) => {
      if (!el) return false;
      const r = el.getBoundingClientRect();
      return r.top <= probe && r.bottom > probe;
    };
    const update = () => {
      const work = document.querySelector('[data-light-band]');
      const about = document.querySelector('[data-anchor="about"]');
      const process = about?.previousElementSibling;
      setNavCurrent(inView(work) ? 'work' : inView(about) || inView(process) ? 'about' : null);
      if (Math.abs(window.scrollY - navOpenYRef.current) > 80) setNavOpen(false);
    };
    update();
    window.addEventListener('scroll', update, { passive: true });
    return () => window.removeEventListener('scroll', update);
  }, [view, detailProject]);
  const navFolded = isNarrow && view === 'home' && navCurrent != null && !navOpen;
  /* Nav items scroll to their section on home: Work = the list, About = the
     Statement (name + paragraph). */
  const goToSection = (selector) => {
    setDetailProject(null);
    setDetailSheetOpen(false);
    if (view !== 'home') setView('home');
    requestAnimationFrame(() => document.querySelector(selector)?.scrollIntoView({ behavior: 'smooth' }));
  };
  const [detailSheetOpen, setDetailSheetOpen] = useState(false);
  const detailOverlayRef = useRef(null);
  const detailSheetOpenRef = useRef(false);
  const prevDetailIdRef = useRef(null);

  /* Press "g" to toggle a 12-column grid overlay for checking alignment across
     the page (skip while typing in a form field). */
  const [gridVisible, setGridVisible] = useState(false);
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key !== 'g' && e.key !== 'G') return;
      const tag = e.target?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || e.target?.isContentEditable) return;
      setGridVisible((v) => !v);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  /* Press "k" to swap to Korean reading copy (see LangContext). */
  const [lang, setLang] = useState(() =>
    typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('ko') ? 'ko' : 'en'
  );
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key !== 'k' && e.key !== 'K') return;
      const tag = e.target?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || e.target?.isContentEditable) return;
      setLang((l) => (l === 'ko' ? 'en' : 'ko'));
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  useEffect(() => {
    detailSheetOpenRef.current = detailSheetOpen;
  }, [detailSheetOpen]);

  const closeProjectDetail = useCallback(() => {
    setDetailSheetOpen(false);
  }, []);

  const handleDetailTransitionEnd = useCallback((e) => {
    if (e.target !== detailOverlayRef.current) return;
    if (e.propertyName !== 'transform') return;
    if (!detailSheetOpenRef.current) {
      setDetailProject(null);
    }
  }, []);

  const openProjectDetail = useCallback((id) => {
    setDetailProject(id);
  }, []);

  useEffect(() => {
    if (!detailProject) {
      setDetailSheetOpen(false);
      prevDetailIdRef.current = null;
      return;
    }
    const prev = prevDetailIdRef.current;
    const isSwapBetweenProjects = prev != null && prev !== detailProject;
    prevDetailIdRef.current = detailProject;
    if (isSwapBetweenProjects) {
      return;
    }
    setDetailSheetOpen(false);
    const t = window.setTimeout(() => setDetailSheetOpen(true), 10);
    return () => clearTimeout(t);
  }, [detailProject]);

  useEffect(() => {
    if (!detailProject) return undefined;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [detailProject]);

  useEffect(() => {
    if (!detailProject) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') closeProjectDetail();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [detailProject, closeProjectDetail]);
  const [visibleSections, setVisibleSections] = useState({});
  const [homeLoaded, setHomeLoaded] = useState(false);
  const [projectsVisible, setProjectsVisible] = useState(false);
  const [visibleProjectIndices, setVisibleProjectIndices] = useState([]);
  const [workPageLoaded, setWorkPageLoaded] = useState(false);
  const [expandedAboutJobs, setExpandedAboutJobs] = useState({});
  const projectsSectionRef = useRef(null);
  const workHeroParallaxRef = useRef(null);
  const workPageLoadedRef = useRef(false);
  const workHeroParallaxTargetYRef = useRef(0);
  const workHeroParallaxDisplayYRef = useRef(0);
  const workGalleryPinRef = useRef(null);
  const workGalleryTrackRef = useRef(null);
  const workFooterRef = useRef(null);
  const workGalleryMaxShiftRef = useRef(0);
  const workGalleryScrollSpanRef = useRef(0);
  const workGalleryTargetXRef = useRef(0);
  const workGalleryDisplayXRef = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      if (view === 'work') return;
      setScrollY(window.scrollY);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [view]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    setScrollY(0);
    setVisibleSections({});
    setHomeLoaded(false);
    setProjectsVisible(false);
    setVisibleProjectIndices([]);
    setWorkPageLoaded(false);
    setExpandedAboutJobs({});
    setHoveredProject(null);
    setThumbTransition({ current: null, prev: null, isAnimating: false });
    workHeroParallaxTargetYRef.current = 0;
    workHeroParallaxDisplayYRef.current = 0;
    workGalleryTargetXRef.current = 0;
    workGalleryDisplayXRef.current = 0;
    if (workGalleryTrackRef.current) {
      workGalleryTrackRef.current.style.setProperty('--wg-tx', '0px');
    }
    if (view === 'about') {
      const delays = [80, 180, 300];
      INITIAL_ABOUT_SECTIONS.forEach((section, i) => {
        setTimeout(() => {
          setVisibleSections(prev => ({ ...prev, [section]: true }));
        }, delays[i]);
      });
    } else if (view === 'home') {
      // Animate home page elements on load
      setTimeout(() => setHomeLoaded(true), 100);
    } else if (view === 'work') {
      setTimeout(() => setWorkPageLoaded(true), 100);
    }
  }, [view]);

  useEffect(() => {
    workPageLoadedRef.current = workPageLoaded;
  }, [workPageLoaded]);

  useLayoutEffect(() => {
    if (view !== 'work') return undefined;

    let galleryAnimRaf = null;

    const setTrackX = (track, px) => {
      track.style.setProperty('--wg-tx', `${px}px`);
    };

    const setHeroY = (heroEl, px) => {
      heroEl.style.setProperty('--wh-py', `${px}px`);
    };

    const viewportH = () => window.innerHeight;

    const smoothstep01 = (u) => {
      const x = Math.min(1, Math.max(0, u));
      return x * x * (3 - 2 * x);
    };

    const updateWorkFooter = (t, maxShift) => {
      const footer = workFooterRef.current;
      if (!footer) return;
      if (maxShift <= 0) {
        footer.style.opacity = '1';
        footer.style.visibility = 'visible';
        footer.style.pointerEvents = 'auto';
        footer.style.transform = 'translateY(0)';
        return;
      }
      const revealStart = 0.72;
      const u = Math.min(1, Math.max(0, (t - revealStart) / (1 - revealStart)));
      const s = smoothstep01(u);
      footer.style.opacity = String(s);
      footer.style.visibility = s > 0.03 ? 'visible' : 'hidden';
      footer.style.pointerEvents = s > 0.9 ? 'auto' : 'none';
      footer.style.transform = `translateY(${(1 - s) * 32}px)`;
    };

    const syncPinAndMetrics = (pin, track) => {
      const vh = viewportH();
      const iw = window.innerWidth;
      const measured = Math.max(0, track.scrollWidth - iw);
      const fallback = estimateWorkGalleryMaxShift(iw, projects.length);
      const liveMax = Math.max(measured, fallback);
      workGalleryMaxShiftRef.current = liveMax;
      workGalleryScrollSpanRef.current = liveMax;
      pin.style.height = `${Math.round(vh + liveMax)}px`;
      return liveMax;
    };

    const recomputeTarget = () => {
      const pin = workGalleryPinRef.current;
      const track = workGalleryTrackRef.current;
      if (!pin || !track) return;

      const vh = viewportH();
      const liveMaxShift = workGalleryMaxShiftRef.current;
      const span = workGalleryScrollSpanRef.current;
      const rect = pin.getBoundingClientRect();
      const layoutMaxInto = Math.max(0, pin.offsetHeight - vh);
      const maxInto = span > 0 ? Math.min(layoutMaxInto, span) : layoutMaxInto;
      let S = 0;
      if (rect.top <= 0 && maxInto > 0) {
        S = Math.min(maxInto, -rect.top);
      }

      let t = 0;
      if (liveMaxShift > 0) {
        t = Math.min(1, S / liveMaxShift);
      } else {
        t = maxInto > 0 ? Math.min(1, S / maxInto) : 1;
      }

      if (liveMaxShift <= 0) {
        workGalleryTargetXRef.current = 0;
        workGalleryDisplayXRef.current = 0;
        setTrackX(track, 0);
        updateWorkFooter(1, 0);
        return;
      }

      const x = -t * liveMaxShift;
      workGalleryTargetXRef.current = x;
      updateWorkFooter(t, liveMaxShift);
    };

    const tickWorkMotion = () => {
      if (!workPageLoadedRef.current) {
        galleryAnimRaf = null;
        return;
      }

      const heroEl = workHeroParallaxRef.current;
      const track = workGalleryTrackRef.current;

      let heroNeedsFrame = false;
      if (heroEl) {
        const ty = workHeroParallaxTargetYRef.current;
        let dy = workHeroParallaxDisplayYRef.current;
        const yDiff = ty - dy;
        const yAlpha = 0.18;
        if (Math.abs(yDiff) < 0.25) {
          dy = ty;
        } else {
          dy += yDiff * yAlpha;
        }
        workHeroParallaxDisplayYRef.current = dy;
        setHeroY(heroEl, dy);
        heroNeedsFrame = Math.abs(ty - dy) > 0.3;
      }

      let galleryNeedsFrame = false;
      if (track) {
        const tx = workGalleryTargetXRef.current;
        let dx = workGalleryDisplayXRef.current;
        const xDiff = tx - dx;
        const xAlpha = 0.11;
        if (Math.abs(xDiff) < 0.5) {
          dx = tx;
        } else {
          dx += xDiff * xAlpha;
        }
        workGalleryDisplayXRef.current = dx;
        setTrackX(track, dx);
        galleryNeedsFrame = Math.abs(tx - dx) > 0.6;
      }

      if (heroNeedsFrame || galleryNeedsFrame) {
        galleryAnimRaf = requestAnimationFrame(tickWorkMotion);
      } else {
        galleryAnimRaf = null;
      }
    };

    const onScroll = () => {
      workHeroParallaxTargetYRef.current = window.scrollY * -0.22;
      recomputeTarget();
      if (workPageLoadedRef.current && galleryAnimRaf == null) {
        galleryAnimRaf = requestAnimationFrame(tickWorkMotion);
      }
    };

    const measure = () => {
      const pin = workGalleryPinRef.current;
      const track = workGalleryTrackRef.current;
      const footer = workFooterRef.current;
      if (!pin || !track) return;
      if (footer) {
        footer.style.opacity = '0';
        footer.style.visibility = 'hidden';
        footer.style.pointerEvents = 'none';
        footer.style.transform = 'translateY(32px)';
      }
      syncPinAndMetrics(pin, track);
      recomputeTarget();
      workGalleryDisplayXRef.current = workGalleryTargetXRef.current;
      setTrackX(track, workGalleryDisplayXRef.current);
      workHeroParallaxTargetYRef.current = window.scrollY * -0.22;
      workHeroParallaxDisplayYRef.current = workHeroParallaxTargetYRef.current;
      const heroEl = workHeroParallaxRef.current;
      if (heroEl && workPageLoadedRef.current) {
        setHeroY(heroEl, workHeroParallaxDisplayYRef.current);
      }
    };

    measure();
    requestAnimationFrame(measure);
    requestAnimationFrame(() => requestAnimationFrame(measure));

    const ro = new ResizeObserver(measure);
    if (workGalleryTrackRef.current) ro.observe(workGalleryTrackRef.current);
    if (workGalleryPinRef.current) ro.observe(workGalleryPinRef.current);

    window.addEventListener('resize', measure, { passive: true });
    window.addEventListener('scroll', onScroll, { passive: true });

    const imgs = workGalleryTrackRef.current?.querySelectorAll('img') ?? [];
    imgs.forEach((img) => {
      if (!img.complete) img.addEventListener('load', measure, { once: true });
    });

    return () => {
      if (galleryAnimRaf != null) cancelAnimationFrame(galleryAnimRaf);
      ro.disconnect();
      window.removeEventListener('resize', measure);
      window.removeEventListener('scroll', onScroll);
    };
  }, [view]);

  // Intersection Observer for projects section
  useEffect(() => {
    if (view !== 'home') return;

    const sectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.target.dataset.section === 'projects') {
            setProjectsVisible(true);
          }
        });
      },
      { threshold: 0.1 }
    );

    const projectObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = parseInt(entry.target.dataset.projectIndex);
            if (!isNaN(index) && !visibleProjectIndices.includes(index)) {
              setVisibleProjectIndices(prev => [...prev, index]);
            }
          }
        });
      },
      { threshold: 0.3 }
    );

    const projectsSection = document.querySelector('[data-section="projects"]');
    if (projectsSection) {
      sectionObserver.observe(projectsSection);
    }

    const projectElements = document.querySelectorAll('[data-project-index]');
    projectElements.forEach(el => projectObserver.observe(el));

    return () => {
      sectionObserver.disconnect();
      projectObserver.disconnect();
    };
  }, [view, visibleProjectIndices]);

  useEffect(() => {
    if (detailProject !== 'about') return undefined;
    const timers = [120, 240].map((d, i) =>
      setTimeout(() => setVisibleSections((prev) => ({ ...prev, [['aboutRight', 'aboutFooter'][i]]: true })), d)
    );

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const section = entry.target.dataset.section;
          if (!INITIAL_ABOUT_SECTIONS.includes(section)) {
            setVisibleSections(prev => ({ ...prev, [section]: entry.isIntersecting }));
          }
        });
      },
      { threshold: 0.2 }
    );

    document.querySelectorAll('[data-section]').forEach(el => observer.observe(el));
    return () => {
      timers.forEach(clearTimeout);
      observer.disconnect();
    };
  }, [detailProject]);

  useEffect(() => {
    /* Hovered: the eyes squeeze shut and flutter. */
    if (logoHovered) {
      const interval = setInterval(() => setBlinking((prev) => !prev), 150);
      return () => {
        clearInterval(interval);
        setBlinking(false);
      };
    }

    const reduced =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reduced) {
      setBlinking(false);
      return undefined;
    }

    /* Idle: an occasional blink so the mark feels alive between hovers. A real blink
       is short and irregular, and often comes in pairs, so the gap is randomised and
       roughly a quarter of blinks are doubles. Only ever one timer pending. */
    let timer = null;
    const blink = () => {
      setBlinking(true);
      timer = setTimeout(() => {
        setBlinking(false);
        const double = Math.random() < 0.28;
        timer = setTimeout(blink, double ? 180 : 2600 + Math.random() * 4200);
      }, 120);
    };
    timer = setTimeout(blink, 1400 + Math.random() * 2600);
    return () => {
      clearTimeout(timer);
      setBlinking(false);
    };
  }, [logoHovered]);

  const handleProjectHover = (projectId) => {
    const { current } = thumbTransition;

    if (current && current !== projectId) {
      setThumbTransition({ current: projectId, prev: current, isAnimating: false });
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setThumbTransition((prev) => ({ ...prev, isAnimating: true }));
        });
      });
      setTimeout(() => setThumbTransition((prev) => ({ ...prev, prev: null })), 600);
    } else {
      setThumbTransition({ current: projectId, prev: null, isAnimating: false });
    }

    setHoveredProject(projectId);
  };

  const allProjects = [
    {
      id: 'investing',
      period: '2025–Now', // matches the About experience entry
      num: '01',
      title: 'Intelligent Investing',
      gallerySrc: 'images/investing-work-thumb3.png',
      galleryHoverSrc: 'images/investing-home-thumb3.png',
      framing: 'Company as a system',
      subtext:
        'Making an investing app measure people against the market, not against zero.',
      demonstrates: 'Defining direction across an entire company experience.',
      blurb:
        'Making an investing app measure people against the market, not against zero.',
      tag: 'Identity · Product · Web · Communication',
      ko: {
        framing: '시스템으로서의 회사',
        subtext: '투자 앱이 사람을 0이 아닌 시장과 비교해 측정하도록 만드는 일.',
        blurb: '투자 앱이 사람을 0이 아닌 시장과 비교해 측정하도록 만드는 일.',
        tag: '아이덴티티 · 제품 · 웹 · 커뮤니케이션'
      },
      year: '2025',
      thumb: (
        <img
          src="images/investing-home-thumb3.png"
          alt=""
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      )
    },
    {
      id: 'autosync',
      period: '2022–25', // matches the About experience entry
      num: '02',
      title: 'AutoSync Branding',
      gallerySrc: 'images/autosync-work-thumbnail.png',
      galleryHoverSrc: 'images/autosync-home-thumbnail.png',
      framing: 'Designing for uncertainty',
      subtext:
        'Giving a growing product ecosystem a structure, not a fixed identity.',
      demonstrates: 'Creating systems when the final form is not yet known.',
      blurb:
        'Giving an evolving product ecosystem enough structure to grow without locking it into a fixed identity, so the system holds before the final form exists.',
      tag: 'Identity · System · Digital',
      ko: {
        framing: '불확실성을 위한 디자인',
        subtext: '진화하는 제품 생태계에 하나의 아이덴티티에 묶이지 않는 구조를 주는 일.',
        blurb: '진화하는 제품 생태계가 고정된 아이덴티티에 묶이지 않고 성장할 수 있을 만큼의 구조를 주는 일. 최종 형태가 생기기 전에도 시스템이 유지되도록 한다.',
        tag: '아이덴티티 · 시스템 · 디지털'
      },
      year: '2023',
      thumb: (
        <img
          src="images/autosync-home-thumbnail.png"
          alt=""
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      )
    },
    {
      id: 'mi',
      period: '2018–21', // matches the About experience entry
      num: '03',
      title: 'MotoInsight',
      gallerySrc: 'images/motoinsight-work-thumbnail.png',
      galleryHoverSrc: 'images/motoinsight-home-thumbnail.png',
      framing: 'Creating coherence',
      subtext:
        'Pulling brand, product, and communication into one system as the company scaled.',
      demonstrates: 'Aligning multiple channels and teams around a common visual and strategic direction.',
      blurb:
        'Bringing fragmented brand, product, and communication into one coherent system as the company scaled, aligning channels and teams around a single direction.',
      tag: 'Brand · Product · Marketing',
      ko: {
        framing: '일관성 만들기',
        subtext: '회사가 커지는 동안 브랜드, 제품, 커뮤니케이션을 하나의 시스템으로 묶는 일.',
        blurb: '회사가 성장하면서 흩어진 브랜드, 제품, 커뮤니케이션을 하나의 일관된 시스템으로 묶고, 채널과 팀을 하나의 방향으로 정렬하는 일.',
        tag: '브랜드 · 제품 · 마케팅'
      },
      year: '2023',
      thumb: (
        <img
          src="images/motoinsight-home-thumbnail.png"
          alt=""
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      )
    }
  ];

  /* Only the featured case studies are published; anything else in allProjects is
     excluded from the work gallery and the "next project" link. */
  const projects = allProjects.filter((p) => FEATURED_WORK_IDS.includes(p.id));

  const featuredProjects = FEATURED_WORK_IDS.map((id) =>
    projects.find((p) => p.id === id)
  ).filter(Boolean);

  /* The fixed nav floats over both the dark ground and the light Selected Work band,
     and each nav piece sits at a different height, so one on/off switch would leave
     something unreadable while the band edge passes under it. Instead every piece
     checks its own centre against the band and picks its own colours. */
  useEffect(() => {
    // menu items brighter on dark since the hero gained video + grain; the site
    // name keeps its original muted tone
    const NAV_DARK = { '--nav-strong': TEXT_LIGHT_ON_DARK, '--nav-ink': '#cfccc7', '--nav-muted': MUTED_ON_DARK, '--nav-dot': '#1a1a1a', '--nav-bg': '#1a1a1a' };
    const NAV_LIGHT = { '--nav-strong': '#141414', '--nav-ink': '#66625c', '--nav-muted': '#66625c', '--nav-dot': LIGHT_BAND_BG, '--nav-bg': LIGHT_BAND_BG };
    /* phones: the nav steps aside while you read down, and comes back on a
       ground of its own when you scroll up, so it never sits on the text */
    let lastY = window.scrollY;
    const direction = () => {
      const y = window.scrollY;
      const root = document.documentElement;
      const narrow = window.innerWidth < 768;
      if (!narrow || y < 80) { delete root.dataset.navHidden; delete root.dataset.navScrolled; }
      else {
        root.dataset.navScrolled = '1';
        if (y > lastY + 4) root.dataset.navHidden = '1';
        else if (y < lastY - 4) delete root.dataset.navHidden;
      }
      lastY = y;
    };
    const update = () => {
      /* Every light-ground band on the page, whichever view is showing. */
      const bands = [...document.querySelectorAll('[data-light-band]')].map((b) => b.getBoundingClientRect());
      document.querySelectorAll('[data-nav-tone]').forEach((el) => {
        const r = el.getBoundingClientRect();
        const cy = r.top + r.height / 2;
        const onLight = bands.some((b) => b.top <= cy && b.bottom >= cy);
        const tone = onLight ? NAV_LIGHT : NAV_DARK;
        Object.keys(tone).forEach((k) => el.style.setProperty(k, tone[k]));
      });
    };
    /* Synchronous on purpose: six elements and one rect read per scroll is cheap, and
       waiting on requestAnimationFrame meant nothing updated whenever the page wasn't
       actively painting (background tab, occluded window). */
    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('scroll', direction, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('scroll', direction);
      window.removeEventListener('resize', update);
      delete document.documentElement.dataset.navHidden;
      delete document.documentElement.dataset.navScrolled;
    };
  }, [view, detailProject]);

  return (
    <LangContext.Provider value={lang}>
    <div className="relative min-w-0 w-full" style={{ backgroundColor: '#1a1a1a', wordBreak: lang === 'ko' ? 'keep-all' : undefined }}>
      {gridVisible && (
        <div className="pointer-events-none fixed inset-0 z-[100]">
          <div className={`${PAGE_FRAME} grid h-full grid-cols-12 gap-4 px-4 sm:gap-6 sm:px-8`}>
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} style={{ backgroundColor: 'rgba(255,0,0,0.12)' }} />
            ))}
          </div>
        </div>
      )}
      {!detailProject && (
      <>
      {/* phones only: the ground under the nav once you have scrolled */}
      <div aria-hidden="true" className="nav-scrim pointer-events-none fixed inset-x-0 top-0 z-40 h-16 md:hidden" data-nav-tone style={{ backgroundColor: 'var(--nav-bg, #1a1a1a)' }} />
      {/* Nav - 좌측 로고 */}
      <nav className="pointer-events-none fixed inset-x-0 top-0 z-50">
        <div className={`${PAGE_FRAME} p-4 sm:p-8`}>
        <button
          type="button"
          onClick={() => setView('home')}
          onMouseEnter={() => setLogoHovered(true)}
          onMouseLeave={() => setLogoHovered(false)}
          className="pointer-events-auto flex min-h-[44px] min-w-[44px] touch-manipulation items-center gap-1 sm:min-h-0 sm:min-w-0"
        >
          <div className="rounded-full" data-nav-tone style={{ backgroundColor: `var(--nav-strong, ${TEXT_LIGHT_ON_DARK})`, width: '18px', height: '18px' }} />
          <div className="rounded-full flex items-center justify-center gap-0.5" data-nav-tone style={{ backgroundColor: `var(--nav-strong, ${TEXT_LIGHT_ON_DARK})`, width: '18px', height: '18px' }}>
            <div
              className="rounded-full transition-all duration-100"
              style={{
                backgroundColor: 'var(--nav-dot, #1a1a1a)',
                width: '3px',
                height: '3px',
                opacity: blinking ? 0.35 : 1
              }}
            />
            <div
              className="rounded-full transition-all duration-100"
              style={{
                backgroundColor: 'var(--nav-dot, #1a1a1a)',
                width: '3px',
                height: '3px',
                opacity: blinking ? 0.35 : 1
              }}
            />
          </div>
        </button>
        </div>
      </nav>

      {/* Nav - 메뉴 */}
      <nav className="pointer-events-none fixed inset-x-0 top-0 z-50">
        <div className={`${PAGE_FRAME} p-4 sm:p-8`}>
        <div
          className="nav-stack pointer-events-auto ml-[52%] hidden max-w-[calc(100vw-7rem)] text-xs sm:ml-[55%] sm:max-w-none md:block"
          style={monoStyle}
        >
          {[
            { key: 'work', label: 'Work', ko: '작업', action: 'work' },
            { key: 'about', label: 'About', ko: '소개', action: 'about' },
            {
              key: 'contact',
              label: 'Contact',
              ko: '연락',
              href: CONTACT_GMAIL_COMPOSE,
              openInNewTab: true
            }
          ].map((item) => {
            const isActive = navFolded && item.key === navCurrent;
            const isFoldedAway = navFolded && !isActive;
            const isHovered = hoveredMenu === item.key;
            const displayText = lang === 'ko' && item.ko ? item.ko : item.label;
            const hoverText = displayText;

            const navLinePx = 18;
            /* Outer element carries no overflow clip: it would also clip the
               .tap-target hit area down to 18px on touch devices. */
            const navItemStyle = {
              position: 'relative',
              height: isFoldedAway ? 0 : `${navLinePx}px`,
              whiteSpace: 'nowrap',
              textDecoration: 'none',
              color: 'inherit',
              ...(isNarrow
                ? {
                    transition: 'height 0.35s ease, margin 0.35s ease, opacity 0.25s ease, visibility 0s linear ' + (isFoldedAway ? '0.35s' : '0s'),
                    ...(navFolded ? { marginTop: 0 } : {}),
                    opacity: isFoldedAway ? 0 : 1,
                    visibility: isFoldedAway ? 'hidden' : 'visible',
                    overflow: isFoldedAway ? 'hidden' : undefined,
                    pointerEvents: isFoldedAway ? 'none' : undefined
                  }
                : {})
            };
            /* Inner box does the roll-up clipping and anchors the second line. */
            const navClipStyle = {
              display: 'block',
              position: 'relative',
              height: `${navLinePx}px`,
              overflow: 'hidden'
            };

            const navLineStyle = {
              display: 'block',
              height: `${navLinePx}px`,
              lineHeight: `${navLinePx}px`,
              fontSize: '12px',
              transition: 'transform 0.3s ease'
            };

            const navItemBody = (
              <span style={navClipStyle}>
                <span
                  style={{
                    ...navLineStyle,
                    transform: isHovered ? 'translateY(-100%)' : 'translateY(0)',
                    color: isActive ? `var(--nav-strong, ${TEXT_LIGHT_ON_DARK})` : 'var(--nav-ink, #9a9a9a)'
                  }}
                >
                  {(isActive || isHovered) && <NavMark />}
                  {displayText}
                </span>
                <span
                  style={{
                    ...navLineStyle,
                    position: 'absolute',
                    top: `${navLinePx}px`,
                    left: 0,
                    transform: isHovered ? 'translateY(-100%)' : 'translateY(0)',
                    fontStyle: 'italic',
                    color: `var(--nav-strong, ${TEXT_LIGHT_ON_DARK})`
                  }}
                >
                  {(isActive || isHovered) && <NavMark />}
                  {hoverText}
                </span>
              </span>
            );

            if (item.href) {
              return (
                <a
                  key={item.key}
                  href={item.href}
                  {...(item.openInNewTab
                    ? { target: '_blank', rel: 'noopener noreferrer' }
                    : {})}
                  onMouseEnter={() => setHoveredMenu(item.key)}
                  onMouseLeave={() => setHoveredMenu(null)}
                  data-nav-tone className="tap-target block min-w-0 max-w-full cursor-pointer touch-manipulation text-left no-underline transition-opacity hover:opacity-100 sm:min-w-[120px]"
                  style={navItemStyle}
                >
                  {navItemBody}
                </a>
              );
            }

            return (
              <button
                key={item.key}
                type="button"
                aria-expanded={isNarrow && view === 'home' ? !navFolded : undefined}
                onClick={() => {
                  if (navFolded) {
                    navOpenYRef.current = window.scrollY;
                    setNavOpen(true);
                    return;
                  }
                  setNavOpen(false);
                  if (item.action === 'about') goToSection('[data-anchor="about"]');
                  else if (item.action === 'work') goToSection('[data-light-band]');
                }}
                onMouseEnter={() => setHoveredMenu(item.key)}
                onMouseLeave={() => setHoveredMenu(null)}
                data-nav-tone className="tap-target block min-w-0 max-w-full touch-manipulation text-left sm:min-w-[120px]"
                style={navItemStyle}
              >
                {navItemBody}
              </button>
            );
          })}
        </div>
        </div>
      </nav>

      {/* Phones: one menu button, top right; the menu opens over the whole screen */}
      <nav className="pointer-events-none fixed inset-x-0 top-0 z-50 md:hidden">
        <div className={`${PAGE_FRAME} flex justify-end p-4`}>
          <button
            type="button"
            aria-label={lang === 'ko' ? '메뉴 열기' : 'Open menu'}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(true)}
            data-nav-tone
            className="pointer-events-auto -mr-2 flex h-11 w-11 cursor-pointer touch-manipulation flex-col items-center justify-center gap-[6px] border-0 bg-transparent p-0"
          >
            <span className="block h-px w-6" style={{ backgroundColor: `var(--nav-strong, ${TEXT_LIGHT_ON_DARK})` }} />
            <span className="block h-px w-6" style={{ backgroundColor: `var(--nav-strong, ${TEXT_LIGHT_ON_DARK})` }} />
          </button>
        </div>
      </nav>
      {menuOpen && (
        <div className="fixed inset-0 z-[60] flex flex-col md:hidden" style={{ backgroundColor: '#1a1a1a' }} role="dialog" aria-modal="true">
          <div className="flex items-start justify-between p-4">
            <span className="pt-3 text-xs" style={{ ...monoStyle, color: MUTED_ON_DARK }}>Ink Choi</span>
            <button
              type="button"
              aria-label={lang === 'ko' ? '메뉴 닫기' : 'Close menu'}
              onClick={() => setMenuOpen(false)}
              className="relative -mr-2 h-11 w-11 cursor-pointer border-0 bg-transparent p-0"
            >
              <span className="absolute left-1/2 top-1/2 block h-px w-6 -translate-x-1/2 rotate-45" style={{ backgroundColor: TEXT_LIGHT_ON_DARK }} />
              <span className="absolute left-1/2 top-1/2 block h-px w-6 -translate-x-1/2 -rotate-45" style={{ backgroundColor: TEXT_LIGHT_ON_DARK }} />
            </button>
          </div>
          <div className="flex flex-1 flex-col justify-center gap-6 px-4">
            {[
              ['work', lang === 'ko' ? '작업' : 'Work'],
              ['about', lang === 'ko' ? '소개' : 'About'],
              ['contact', lang === 'ko' ? '연락' : 'Contact']
            ].map(([key, label]) => (key === 'contact'
              ? <a key={key} href={CONTACT_GMAIL_COMPOSE} target="_blank" rel="noopener noreferrer" onClick={() => setMenuOpen(false)} className="text-4xl no-underline" style={{ ...titleStyle, fontWeight: 500, color: TEXT_LIGHT_ON_DARK }}>{label}</a>
              : <button key={key} type="button" onClick={() => { setMenuOpen(false); goToSection(key === 'work' ? '[data-light-band]' : '[data-anchor="about"]'); }} className="cursor-pointer border-0 bg-transparent p-0 text-left text-4xl" style={{ ...titleStyle, fontWeight: 500, color: TEXT_LIGHT_ON_DARK }}>{label}</button>))}
          </div>
          <p className="p-4 text-xs" style={{ ...monoStyle, color: MUTED_ON_DARK }}>Toronto, CA</p>
        </div>
      )}

      {/* Top-right meta: year on other views; site name on home */}
      <div className="pointer-events-none fixed inset-x-0 top-0 z-50">
        <div className={`${PAGE_FRAME} p-4 sm:p-8`}>
          <div
            className="nav-meta mt-[14px] text-center text-[11px] sm:text-xs md:mt-0 md:text-right"
            data-nav-tone
            style={{ ...monoStyle, color: `var(--nav-muted, ${MUTED_ON_DARK})` }}
          >
            {view === 'home' ? 'Ink Choi' : '2026'}
          </div>
        </div>
      </div>
      </>
      )}

      {view === 'home' && (
        <>
          {/* Hero Section. The video sits full-bleed behind the frame: grayscale,
              highlights pressed to half (encoded that way in public/video), then
              dimmed again here so the type and the metaballs stay on top. Reduced
              motion gets the still poster only. */}
          <div className="relative">
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
            <HeroVideo />
            <HeroGrain />
          </div>
          {/* Below md the text and the metaballs stack, so the headline sits at the top of
              the screen; pt-28 keeps it clear of the fixed nav (76px tall) with a mouse
              too, not only on touch where index.css already pads it. From md up the same
              pt-28 (112px) matches the bottom row (80px CTA + 32px padding), so the
              text and the orbit sit on the screen's true vertical centre. */}
          <section className={`relative hero-section ${PAGE_FRAME} flex min-h-[100svh] flex-col justify-between overflow-x-clip px-4 py-6 pt-28 sm:px-8 sm:py-8 sm:pt-28`}>
            <div
              className="flex-1 flex flex-col md:flex-row md:items-center gap-10"
              style={{
                transform: `translateY(${scrollY * -0.3}px)`,
                transition: 'transform 0.1s ease-out'
              }}
            >
              {/* Exactly 6 of the frame's 12 columns. */}
              <div className={`min-w-0 ${HERO_TEXT_COL}`}>
                {/* Size scales with the 6-col text column so the headline always sets on
                    two lines (see .hero-title in index.css). */}
                <h1
                  aria-label={lang === 'ko' ? '매체는 바뀐다. 문제는 그대로다.' : "The medium changes. The problem doesn't."}
                  className="hero-title text-3xl leading-tight max-w-5xl"
                  style={{
                    ...titleStyle,
                    color: TEXT_LIGHT_ON_DARK,
                    textWrap: 'balance',
                    opacity: homeLoaded ? 1 : 0,
                    transform: homeLoaded ? 'translateY(0)' : 'translateY(30px)',
                    transition: 'opacity 0.8s ease 0.15s, transform 0.8s ease 0.15s'
                  }}
                >
                  <span className="block">
                    {lang === 'ko' ? <><HeroMediumWord ko onIndex={setHeroWord} /> 바뀐다.</> : <>The <HeroMediumWord onIndex={setHeroWord} /> changes.</>}
                  </span>
                  <span className="mt-2 block"><L en={<>The problem doesn&apos;t.</>} ko="문제는 그대로다." /></span>
                </h1>
                <p
                  className="text-lg md:text-xl leading-relaxed mt-6"
                  style={{
                    ...titleStyle,
                    fontWeight: 400,
                    color: BODY_ON_DARK,
                    textWrap: 'balance',
                    opacity: homeLoaded ? 1 : 0,
                    transform: homeLoaded ? 'translateY(0)' : 'translateY(30px)',
                    transition: 'opacity 0.8s ease 0.22s, transform 0.8s ease 0.22s'
                  }}
                >
                  <span className="md:hidden">
                    <L
                      en="I'm Ink Choi, a brand designer. I decide what a brand stands for, then build it into the product and the communication."
                      ko="브랜드 디자이너 Ink Choi. 브랜드가 무엇을 위한 것인지 정하고, 그것을 제품과 커뮤니케이션에 담는다."
                    />
                  </span>
                  <span className="hidden md:inline">
                    <L
                      en={<>I&apos;m Ink Choi, a brand designer. I decide what a brand stands for,<br />then build it into the product and the communication.</>}
                      ko={<>브랜드 디자이너 Ink Choi. 브랜드가 무엇을 위한 것인지 정하고,<br />그것을 제품과 커뮤니케이션에 담는다.</>}
                    />
                  </span>
                </p>
              </div>
              <div
                /* Cols 8-12 on the frame grid (see HERO_ART_COL). */
                className={`mt-2 ml-[calc((100%_-_min(125%,calc(100svh_-_450px)))/2)] w-[min(125%,calc(100svh-450px))] min-w-0 max-[379px]:ml-[calc((100%_-_min(100%,calc(100svh_-_500px)))/2)] max-[379px]:w-[min(100%,calc(100svh-500px))] md:mt-0 ${HERO_ART_COL}`}
                style={{
                  opacity: homeLoaded ? 1 : 0,
                  transform: homeLoaded ? 'translateY(0)' : 'translateY(30px)',
                  transition: 'opacity 1s ease 0.35s, transform 1s ease 0.35s'
                }}
              >
                {/* The headline drawn: the body in the middle is the problem and never
                    moves; the orbits are the medium. Each time the word changes the
                    rings take a new arrangement and the target ring moves to the next
                    planet. Fades out over the first ~80% of a screen of scroll. */}
                <div style={{ opacity: typeof window !== 'undefined' ? 1 - Math.min(1, scrollY / (window.innerHeight * 0.8)) : 1 }}>
                  <WorkAnimation
                    bgHex="#1a1a1a"
                    transparentBg
                    pose={[2, 0, 1][heroWord % 3]}
                    focus={heroWord % 5}
                    ringAlways
                  />
                </div>
              </div>
            </div>
            <div
              className="flex justify-between items-end"
              style={{
                opacity: homeLoaded ? 1 : 0,
                transition: 'opacity 0.8s ease 0.3s'
              }}
            >
              <div className="text-xs" style={{ ...monoStyle, color: MUTED_ON_DARK }}>Toronto, CA</div>
              {/* The page's one solid colour: a filled coral circle that takes the
                  visitor to the work. Everything around it stays greyscale. */}
              <button
                type="button"
                aria-label={lang === 'ko' ? '작업 보기' : 'See the work'}
                onClick={() => document.querySelector('[data-light-band]')?.scrollIntoView({ behavior: 'smooth' })}
                className="cta-circle group flex h-16 w-16 shrink-0 cursor-pointer items-center justify-center rounded-full border-0 md:h-20 md:w-20"
                style={{ backgroundColor: CTA_CORAL }}
              >
                <svg aria-hidden="true" width="12" height="30" viewBox="0 0 12 30" fill="none" className="cta-circle-arrow">
                  <path d="M6 0 V28 M1 23 L6 28 L11 23" stroke="#141414" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          </section>
          </div>

          {/* Projects Section: a full-bleed light band, frame kept inside it */}
          <div data-light-band className="relative z-10 flex min-h-[100svh] w-full items-center" style={{ backgroundColor: LIGHT_BAND_BG }}>
          <section
            ref={projectsSectionRef}
            data-section="projects"
            className={`relative z-10 ${PAGE_FRAME} px-4 py-24 sm:px-8 sm:py-28`}
          >
            <div
              className="mb-16"
              style={{
                opacity: projectsVisible ? 1 : 0,
                transform: projectsVisible ? 'translateY(0)' : 'translateY(20px)',
                transition: 'opacity 0.8s ease, transform 0.8s ease'
              }}
            >
              <h2 className="text-xs" style={{ ...monoStyle, color: LIGHT_ROW_UI.label }}><L en="Selected Work" ko="선별된 작업" /></h2>
            </div>
            
            <div>
              {featuredProjects.map((project, index) => (
                <ProjectListRow
                  key={project.id}
                  project={project}
                  index={index}
                  isVisible={visibleProjectIndices.includes(index)}
                  isHovered={hoveredProject === project.id}
                  monoStyle={monoStyle}
                  titleStyle={titleStyle}
                  ui={LIGHT_ROW_UI}
                  onOpen={() => openProjectDetail(project.id)}
                  onHoverStart={(e) => {
                    setMousePos({ x: e.clientX, y: e.clientY });
                    handleProjectHover(project.id);
                  }}
                  onHoverEnd={() => setHoveredProject(null)}
                  onHoverMove={(e) => setMousePos({ x: e.clientX, y: e.clientY })}
                />
              ))}
              <div style={{ borderTop: `1px solid ${LIGHT_ROW_UI.border}` }} />
            </div>
          </section>
          </div>

          <div data-section="approach" className="relative z-0 px-4 sm:px-8">
            {/* Process: the metaballs run large in the middle
                on their own (the last-stage orbit, no steps), and the text starts at the
                frame's middle (cols 7-12) over them, reference-style: one large regular
                paragraph with an underlined phrase, then the site's [ About ] CTA. */}
            <div
              data-anchor="process-b"
              className="relative z-0 -mx-4 flex min-h-[100svh] items-center overflow-hidden sm:-mx-8"
              style={{ backgroundColor: APPROACH_SURFACE }}
            >
              <div aria-hidden="true" className="pointer-events-none absolute inset-0 flex items-center justify-center">
                {/* half strength: a ground for the paragraph, not a second subject */}
                <div className={`w-[126%] opacity-[0.18] md:w-[calc(${frameCols(10)}*0.9)] md:opacity-40`}>
                  <MetaballAnimation
                    bgHex={APPROACH_SURFACE}
                    mode="animation2"
                    scale={1.3}
                    transparentBg
                    intro
                    orbitWidth={1.4}
                    blobScale={1.3}
                  />
                </div>
              </div>
              <section className={`relative z-10 ${PAGE_FRAME} px-4 py-24 sm:px-8 md:py-28`}>
                <div className="grid grid-cols-12 gap-x-4 sm:gap-x-6">
                  <div className="col-span-12 md:col-span-6 md:col-start-7">
                    <p className="mb-8 text-xs" style={{ ...monoStyle, color: MUTED_ON_DARK }}>
                      <L en="Process" ko="프로세스" />
                    </p>
                    <p
                      className="text-2xl leading-[1.22] md:text-[34px] md:leading-[1.2]"
                      style={{ ...titleStyle, fontWeight: 400, color: TEXT_LIGHT_ON_DARK, letterSpacing: '-0.01em' }}
                    >
                      <L
                        en={<>Before I design anything, I decide <span className="underline decoration-1 underline-offset-[0.14em]">what it stands for</span>. I learn what matters, choose a direction, then make it work, whatever the medium.</>}
                        ko={<>무엇을 디자인하든 먼저 <span className="underline decoration-1 underline-offset-[0.14em]">그것이 무엇을 위한 것인지</span> 정한다. 무엇이 중요한지 알아내고, 방향을 정한 다음, 제대로 작동하게 만든다. 매체가 무엇이든.</>}
                      />
                    </p>
                    <div className="mt-12">
                      <CtaBracket label={<L en="About" ko="소개" />} onClick={openAbout} monoStyle={monoStyle} className="text-left" />
                    </div>
                  </div>
                </div>
              </section>
            </div>

            {/* Statement: the last section. Portrait, name, one centred paragraph, then
                Contact, so the page ends on the one action that matters. */}
            <div
              data-anchor="about"
              data-light-band
              className="relative z-0 -mx-4 flex min-h-[100svh] items-center sm:-mx-8"
              style={{ backgroundColor: STATEMENT_SURFACE }}
            >
              <section className={`${PAGE_FRAME} px-4 py-24 text-center sm:px-8 md:py-28`}>
                {/* Portrait first, then name and paragraph: one column, centred. A short
                    clip in black and white (Kling, cropped from 16:9 to the 3:4 frame);
                    3:4, 70% of 3 columns from lg. */}
                <video
                  src="images/ink-portrait-v2.mp4"
                  poster="images/ink-portrait-v2-poster.jpg"
                  aria-label="Ink Choi"
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="metadata"
                  className={`mx-auto mb-10 block aspect-[3/4] w-1/2 object-cover sm:w-1/3 lg:w-[calc(${frameCols(3)}*0.7)]`}
                />
                <h2 className="mb-6 text-xs" style={{ ...monoStyle, color: LIGHT_ROW_UI.label }}>
                  Ink Choi · <L en="Brand Designer" ko="브랜드 디자이너" />
                </h2>
                <p
                  className={`mx-auto text-lg leading-[1.6] md:text-xl lg:max-w-[${frameCols(4)}]`}
                  style={{ ...titleStyle, fontWeight: 400, color: LIGHT_ROW_UI.titleHover, textWrap: 'balance' }}
                >
                  {/* the last full stop is the one coral mark here, same role as the nav square */}
                  <L
                    en="I'm a brand designer in Toronto. I decide what a brand stands for, then carry it through the logo, the product and the campaigns, working across product and marketing teams. If you're building something that has to mean one thing everywhere, let's talk"
                    ko="토론토의 브랜드 디자이너입니다. 브랜드가 무엇을 지킬지 정하고, 제품팀과 마케팅팀을 오가며 그것을 로고와 제품, 캠페인까지 끌고 갑니다. 어디서나 하나의 의미를 가져야 하는 무언가를 만들고 있다면, 이야기해요"
                  />
                  <span style={{ color: CTA_CORAL }}>.</span>
                </p>
                <div className="mt-10 flex justify-center">
                  <CtaBracket label={<L en="Contact" ko="연락" />} href={CONTACT_MAILTO} monoStyle={monoStyle} textColor="#141414" bracketColor="#8a867f" className="text-center" />
                </div>
              </section>
            </div>

          </div>
        </>
      )}



      {detailProject && (
        <div
          ref={detailOverlayRef}
          role="dialog"
          aria-modal="true"
          aria-label={detailProject === 'about' ? 'About' : 'Project'}
          onTransitionEnd={handleDetailTransitionEnd}
          className={`fixed inset-0 z-[120] flex flex-col transition-transform duration-[480ms] ease-[cubic-bezier(0.32,0.72,0,1)] ${
            detailSheetOpen ? 'translate-y-0' : 'translate-y-full'
          }`}
          style={{ backgroundColor: DETAIL_UI.overlayBg, willChange: 'transform' }}
        >
          {/* the II case opens on a white field; the close bar joins it */}
          <div
            className={`flex shrink-0 justify-end pb-8 pt-6 sm:pb-10 sm:pt-8 ${WORK_PAGE_GUTTER_X}`}
            style={['investing', 'autosync', 'mi'].includes(detailProject) ? { backgroundColor: '#ffffff' } : undefined}
          >
            <button
              type="button"
              onClick={closeProjectDetail}
              className="border-0 bg-transparent py-2 text-left text-xs transition-opacity hover:opacity-60 sm:py-0"
              style={{ ...monoStyle, color: DETAIL_UI.meta }}
            >
              [ Close ]
            </button>
          </div>
          <div className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-y-contain">
            {/* "g" grid inside the sheet: sticky at the top of its scroll area so it
                spans the content width (not the scrollbar), on the case frame's own
                gutters, above the case (the page overlay sits under the sheet). */}
            {gridVisible && (
              <div className="pointer-events-none sticky top-0 z-[50] h-0">
                <div className="absolute inset-x-0 top-0 h-[100svh]">
                  <div className={`${PAGE_FRAME} ${WORK_PAGE_GUTTER_X} grid h-full grid-cols-12 gap-4 sm:gap-6`}>
                    {Array.from({ length: 12 }).map((_, i) => (
                      <div key={i} style={{ backgroundColor: 'rgba(255,0,0,0.12)' }} />
                    ))}
                  </div>
                </div>
              </div>
            )}
            {detailProject === 'about' ? (
              /* About opens like a case: the experience rows and the prose. The
                 intro paragraph lives on the home Statement, so it is not repeated. */
              <div style={{ backgroundColor: DETAIL_UI.overlayBg }}>

          <section
            data-light-band
            className="flex min-h-[100svh] w-full flex-col justify-center"
            style={{ backgroundColor: LIGHT_BAND_BG }}
          >
            <div
              className={`${PAGE_FRAME} px-4 py-24 sm:px-8`}
              data-section="aboutRight"
              style={fadeUpStyle(visibleSections.aboutRight)}
            >
              {ABOUT_EXPERIENCE.map((job, index) => {
                const open = !!expandedAboutJobs[index];
                const jt = lang === 'ko' && job.ko ? { ...job, ...job.ko } : job;
                return (
                  <button
                    key={`${job.org}-${jt.period}`}
                    type="button"
                    onClick={() => setExpandedAboutJobs((prev) => ({ ...prev, [index]: !prev[index] }))}
                    aria-expanded={open}
                    className="group block w-full py-8 text-left last:border-b md:py-10"
                    style={{ borderTop: `1px solid ${LIGHT_ROW_UI.border}`, borderBottomColor: LIGHT_ROW_UI.border }}
                  >
                    <div className="flex items-start justify-between gap-8 md:items-center md:gap-6">
                      <div className={`flex min-w-0 flex-1 items-start gap-8 md:items-center ${ROW_LEAD_COL}`}>
                        <span
                          className="shrink-0 pt-1 text-xs tabular-nums md:pt-0"
                          style={{ ...monoStyle, color: LIGHT_ROW_UI.num, lineHeight: 1 }}
                        >
                          {String(index + 1).padStart(3, '0')}
                        </span>
                        <div className="min-w-0 flex-1">
                          {/* Title block copied from ProjectListRow: 36px, roll-up on hover. */}
                          <span
                            className="text-2xl md:hidden block"
                            style={{ ...titleStyle, color: LIGHT_ROW_UI.titleHover, lineHeight: '1.3' }}
                          >
                            {job.org}
                          </span>
                          <div
                            className="hidden md:block min-w-0 text-4xl"
                            style={{ position: 'relative', height: '1.3em', overflow: 'hidden' }}
                          >
                            <span
                              className="text-4xl block whitespace-nowrap transition-transform duration-300 group-hover:-translate-y-full"
                              style={{ ...titleStyle, color: LIGHT_ROW_UI.titleRest, lineHeight: '1.3' }}
                            >
                              {job.org}
                            </span>
                            <span
                              className="text-4xl block absolute whitespace-nowrap transition-transform duration-300 group-hover:-translate-y-full"
                              style={{ ...titleStyle, color: LIGHT_ROW_UI.titleHover, top: '100%', left: 0, lineHeight: '1.3' }}
                            >
                              {job.org}
                            </span>
                          </div>
                          <p className="mt-3 text-sm leading-relaxed md:hidden" style={{ ...monoStyle, letterSpacing: '0.04em', color: LIGHT_ROW_UI.titleHover }}>
                            {jt.role}
                          </p>
                          <p className="mt-2 text-xs leading-relaxed md:hidden" style={{ ...monoStyle, letterSpacing: '0em', color: LIGHT_ROW_UI.body }}>
                            {jt.summary}
                          </p>
                          <p className="mt-1 text-xs md:hidden" style={{ ...monoStyle, color: LIGHT_ROW_UI.muted }}>
                            {jt.period}
                          </p>
                        </div>
                      </div>
                      {/* md:flex-1 so every row's column is the same width (see
                          ProjectListRow). */}
                      <div className="hidden min-w-0 md:block md:flex-1">
                        <p className="text-sm leading-snug" style={{ ...monoStyle, letterSpacing: '0.04em', color: LIGHT_ROW_UI.titleHover }}>
                          {jt.role}
                        </p>
                        <p className="mt-2 text-sm leading-snug" style={{ ...monoStyle, letterSpacing: '0em', color: LIGHT_ROW_UI.body }}>
                          {jt.summary}
                        </p>
                        {jt.bullets.length > 0 && (
                          <div
                            className="grid transition-[grid-template-rows,opacity,margin-top] duration-300 ease-out"
                            style={{
                              gridTemplateRows: open ? '1fr' : '0fr',
                              opacity: open ? 1 : 0,
                              marginTop: open ? '1rem' : '0'
                            }}
                          >
                            <ul className="m-0 list-none space-y-1 overflow-hidden p-0">
                              {jt.bullets.map((b) => (
                                <li
                                  key={b}
                                  className="text-xs leading-relaxed"
                                  style={{ ...monoStyle, letterSpacing: '0em', color: LIGHT_ROW_UI.body }}
                                >
                                  {b}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                      <div className="flex shrink-0 items-center gap-8 pt-1 md:pt-0">
                        {/* Fixed width: "2024 · Present" is wider than "2022 · 2024" and
                            was narrowing that row's description column by 52px. */}
                        <span className="hidden min-w-[8.5rem] text-right text-xs tabular-nums md:block" style={{ ...monoStyle, color: LIGHT_ROW_UI.muted }}>
                          {jt.period}
                        </span>
                        <span className="text-xs leading-none" style={{ ...monoStyle, color: LIGHT_ROW_UI.muted }}>
                          {open ? '[-]' : '[+]'}
                        </span>
                      </div>
                    </div>
                    {/* Bullets below md, where the description column is hidden. */}
                    {jt.bullets.length > 0 && (
                      <div
                        className="grid transition-[grid-template-rows,opacity,margin-top] duration-300 ease-out md:hidden"
                        style={{
                          gridTemplateRows: open ? '1fr' : '0fr',
                          opacity: open ? 1 : 0,
                          marginTop: open ? '1rem' : '0'
                        }}
                      >
                        <ul className="m-0 list-none space-y-1 overflow-hidden p-0">
                          {jt.bullets.map((b) => (
                            <li key={b} className="text-xs leading-relaxed" style={{ ...monoStyle, letterSpacing: '0em', color: LIGHT_ROW_UI.body }}>
                              {b}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </section>

          <section
            data-light-band
            className="flex min-h-[100svh] w-full flex-col justify-center"
            style={{ backgroundColor: DETAIL_UI.overlayBg }}
          >
            <div
              className={`${PAGE_FRAME} px-4 py-24 sm:px-8`}
              data-section="aboutFooter"
              style={fadeUpStyle(visibleSections.aboutFooter)}
            >
              <div className="grid w-full min-w-0 grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-6">
                <div className="min-w-0 space-y-4 lg:col-span-6">
                  {ABOUT_JUDGMENT_COPY.map((p, i) => (
                    <p
                      key={p}
                      className="text-lg leading-relaxed md:text-xl"
                      style={{ ...titleStyle, fontWeight: 400, color: DETAIL_UI.body }}
                    >
                      <L en={p} ko={ABOUT_JUDGMENT_KO[i]} />
                    </p>
                  ))}
                  <p
                    className="text-lg leading-relaxed md:text-xl"
                    style={{ ...titleStyle, color: DETAIL_UI.title }}
                  >
                    <L en={<>The question stays. The tools change.</>} ko="질문은 그대로다. 도구는 바뀐다." />
                  </p>
                  {ABOUT_TOOLS_COPY.map((p, i) => (
                    <p
                      key={p}
                      className="text-lg leading-relaxed md:text-xl"
                      style={{ ...titleStyle, fontWeight: 400, color: DETAIL_UI.body }}
                    >
                      <L en={p} ko={ABOUT_TOOLS_KO[i]} />
                    </p>
                  ))}
                </div>
                <div className="min-w-0 space-y-8 lg:col-span-5 lg:col-start-8">
                  {ABOUT_CAPABILITIES.map((c) => (
                    <div key={c.label}>
                      <p className="text-lg md:text-xl" style={{ ...titleStyle, color: DETAIL_UI.title }}>
                        {lang === 'ko' ? c.ko.label : c.label}
                      </p>
                      <p
                        className="mt-2 text-lg leading-relaxed md:text-xl"
                        style={{ ...titleStyle, fontWeight: 400, color: DETAIL_UI.body }}
                      >
                        {lang === 'ko' ? c.ko.copy : c.copy}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-24">
                <CtaBracket
                  label="LinkedIn"
                  href="https://www.linkedin.com/"
                  external
                  monoStyle={monoStyle}
                  textColor={LIGHT_ROW_UI.body}
                  bracketColor={LIGHT_ROW_UI.muted}
                  className="text-left"
                />
              </div>
            </div>
          </section>
              </div>
            ) : (
              <CaseStudy
                project={detailProject}
                projects={projects}
                monoStyle={monoStyle}
                titleStyle={titleStyle}
                onOpenProject={(id) => setDetailProject(id)}
              />
            )}
          </div>
        </div>
      )}
    </div>
    </LangContext.Provider>
  );
}

function PlaceholderFrame({
  label,
  src,
  alt = '',
  monoStyle,
  className = '',
  aspectClass = 'aspect-[4/3]',
  borderless = false,
  style: styleProp
}) {
  return (
    <div
      className={`flex w-full items-center justify-center overflow-hidden rounded ${borderless ? '' : 'border'} ${aspectClass} ${className}`}
      style={{
        backgroundColor: DETAIL_UI.imageWell,
        ...(borderless ? {} : { borderColor: DETAIL_UI.border }),
        ...styleProp
      }}
    >
      {src ? (
        <img src={src} alt={alt} className="h-full w-full object-cover" />
      ) : (
        <span className="text-center px-4 text-[11px]" style={{ ...monoStyle, color: DETAIL_UI.placeholderText }}>
          {label}
        </span>
      )}
    </div>
  );
}

const CASE_STUDIES = {
  investing: {
    title: 'Intelligent Investing',
    titleLine2: 'Built around decisions, not activity.',
    subtitle:
      'A discipline-first system for investors who want to be measured, not flattered.',
    tag: 'Product · Platform',
    num: '01',
    company: 'Orion Digital Corp.',
    scope: 'Brand · Product · Design System · App architecture',
    deliverables:
      'Native app on iOS and Android. Severe-mode design system. The Manual. Onboarding signature.',
    heroImage: 'images/investing-work-thumb3.png'
  },
  autosync: {
    title: 'AutoSync Branding',
    titleLine2: 'Multiple products. One thread.',
    subtitle: 'Not just a logo, but a system that could hold products that didn\'t fully exist yet.',
    tag: 'Brand System',
    num: '02',
    situation: 'AutoSync needed a brand identity conveying innovation and reliability to enterprise clients.',
    task: 'Create a complete brand system including logo, visual identity, and guidelines.',
    action: [
      'Led discovery workshops for brand positioning',
      'Explored 30+ logo concepts',
      'Developed flexible visual system',
      'Created comprehensive brand guidelines'
    ],
    result: ''
  },
  mi: {
    title: 'MotoInsight',
    subtitle: 'Corporate website redesign',
    tag: 'Brand · Marketing',
    num: '03',
    situation: 'MotoInsight\'s website was outdated and didn\'t reflect their market position.',
    task: 'Redesign the corporate website to improve UX and brand perception.',
    action: [
      'Conducted stakeholder interviews',
      'Restructured information architecture',
      'Designed responsive layouts',
      'Collaborated on interactive elements'
    ],
    result: ''
  }
};

function Lightbox({ items, index, onClose, onPrev, onNext, monoStyle }) {
  const [localIndex, setLocalIndex] = useState(index);
  const [opacity, setOpacity] = useState(1);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    const fn = (e) => {
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowLeft') onPrev();
      else if (e.key === 'ArrowRight') onNext();
    };
    window.addEventListener('keydown', fn);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', fn);
    };
  }, [onClose, onPrev, onNext]);

  useEffect(() => {
    if (index === localIndex) return;
    setOpacity(0.6);
    const t = setTimeout(() => {
      setLocalIndex(index);
      setOpacity(1);
    }, 120);
    return () => clearTimeout(t);
  }, [index, localIndex]);

  const item = items[localIndex];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: 'rgba(20,18,16,0.92)' }}
      onClick={onClose}
    >
      <button
        className="absolute right-5 top-5 z-10 flex h-10 w-10 items-center justify-center text-xl text-white/40 transition-colors hover:text-white/90"
        onClick={onClose}
        aria-label="Close"
      >
        ✕
      </button>

      {items.length > 1 && (
        <button
          className="absolute left-4 z-10 flex h-12 w-12 items-center justify-center text-4xl leading-none text-white/40 transition-colors hover:text-white/90"
          onClick={(e) => { e.stopPropagation(); onPrev(); }}
          aria-label="Previous"
        >
          ‹
        </button>
      )}

      {items.length > 1 && (
        <button
          className="absolute right-4 z-10 flex h-12 w-12 items-center justify-center text-4xl leading-none text-white/40 transition-colors hover:text-white/90"
          onClick={(e) => { e.stopPropagation(); onNext(); }}
          aria-label="Next"
        >
          ›
        </button>
      )}

      <div
        className="flex w-full max-w-[min(88vw,52rem)] flex-col items-center px-14"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            opacity,
            transition: 'opacity 0.18s ease',
            width: '100%'
          }}
        >
          <PlaceholderFrame
            label="[ Image ]"
            src={item.src}
            monoStyle={monoStyle}
            borderless
            aspectClass={item.aspect}
            className="w-full rounded"
          />
        </div>
        <p
          className="mt-4 text-[11px] text-white/35"
          style={{ ...monoStyle, opacity, transition: 'opacity 0.18s ease' }}
        >
          {item.caption} &nbsp;&middot;&nbsp; {localIndex + 1} / {items.length}
        </p>
      </div>
    </div>
  );
}

/** Intelligent Investing case study: specimen tiles reuse the product's own surface
 *  (DARK_ROW_UI ground, TEXT_LIGHT_ON_DARK / MUTED_ON_DARK text) so the rules read in context. */
const INV_GOLD = '#c9a24a'; // S&P 500 only
const INV_UP = '#288752';
const INV_DOWN = '#be3c36';
const INV_APP_GREEN = '#30d158'; // "typical app" profit green: the before state of rules 01 and 02 only

/** Hero instrument: portfolio vs S&P since inception, drawn once on first view.
 *  End values are the V20 prototype's (+39.4 / +45.2); the paths in between are
 *  illustrative. The portfolio leads early and trails at the end on purpose:
 *  "you went up, the index went up more" is the whole message. */
const INV_HERO_END = { pf: 39.4, sp: 45.2 };
const INV_HERO_SERIES = (() => {
  const n = 96;
  const pf = [];
  const sp = [];
  for (let i = 0; i < n; i++) {
    const t = i / (n - 1);
    const bump = 4 * t * (1 - t); // 0 at both ends, so the end values stay exact
    sp.push(INV_HERO_END.sp * Math.pow(t, 1.15) + bump * (2.6 * Math.sin(t * 11) + 1.2 * Math.sin(t * 29)));
    pf.push(INV_HERO_END.pf * Math.pow(t, 0.8) + bump * (3.4 * Math.sin(t * 8 + 0.6) + 1.4 * Math.sin(t * 23 + 1)));
  }
  return { pf, sp };
})();

/** The chart's draw progress, shared with the headline so "Up 39%." counts up
 *  with the lines and "Still behind." lands when the gap appears. A tiny module
 *  store keeps the 60fps updates out of the rest of the case study's renders. */
const invHeroProgress = {
  v: 0,
  subs: new Set(),
  set(v) {
    this.v = v;
    this.subs.forEach((fn) => fn(v));
  }
};

function InvestingHeroHeadline({ ko, className, style }) {
  const [p, setP] = useState(invHeroProgress.v);
  useEffect(() => {
    invHeroProgress.subs.add(setP);
    return () => invHeroProgress.subs.delete(setP);
  }, []);
  const n = Math.round(INV_HERO_END.pf * p);
  const done = p >= 0.999;
  const second = {
    display: 'inline-block',
    opacity: done ? 1 : 0,
    transform: done ? 'translateY(0)' : 'translateY(0.25em)',
    transition: 'opacity 0.6s ease 0.15s, transform 0.6s ease 0.15s'
  };
  return (
    <h1 className={className} style={style} aria-label={ko ? '39% 올랐다. 그래도 졌다.' : 'Up 39%. Still behind.'}>
      <span aria-hidden="true">
        {ko ? <><span className="tabular-nums">{n}%</span> 올랐다.</> : <>Up <span className="tabular-nums">{n}%</span>.</>}
        <br />
        <span style={second}>{ko ? '그래도 졌다.' : 'Still behind.'}</span>
      </span>
    </h1>
  );
}

function InvestingHeroChart({ monoStyle }) {
  const ref = useRef(null);
  const [p, setP] = useState(0);

  const W = 1000;
  const H = 360;
  const PAD_R = 200; // room for the gap readout at the line ends, down to 375 wide
  const y = (v) => H - 24 - ((v + 6) / 56) * (H - 48);
  const x = (i, n) => (i / (n - 1)) * (W - PAD_R);
  const toPath = (arr) => arr.map((v, i) => `${i ? 'L' : 'M'}${x(i, arr.length).toFixed(1)} ${y(v).toFixed(1)}`).join(' ');
  const pfPath = toPath(INV_HERO_SERIES.pf);
  const spPath = toPath(INV_HERO_SERIES.sp);
  const endX = W - PAD_R;
  const yPf = y(INV_HERO_END.pf);
  const ySp = y(INV_HERO_END.sp);

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    invHeroProgress.set(0); // a reopened case starts the count from zero again
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setP(1);
      invHeroProgress.set(1);
      return undefined;
    }
    let raf = 0;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        const start = performance.now();
        const dur = 1800;
        const tick = (now) => {
          const k = Math.min(1, (now - start) / dur);
          const e = 1 - Math.pow(1 - k, 3);
          setP(e);
          invHeroProgress.set(e);
          if (k < 1) raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
      },
      { threshold: 0.35 }
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, []);

  // Solid line draws by dash offset (pathLength="1"); the dashed S&P line can't,
  // since its own dash pattern would be overwritten, so it reveals by clipping.
  // Both run off the same progress, so they finish together.
  const done = p >= 0.999;
  const gap = (INV_HERO_END.pf - INV_HERO_END.sp).toFixed(1).replace('-', '−');

  return (
    <div ref={ref} className="rounded px-5 pb-6 pt-6 sm:px-8 sm:pt-8 md:px-10 md:pb-8 md:pt-10" style={{ backgroundColor: DARK_ROW_UI.imageWell }}>
      <div className="flex flex-wrap items-end justify-between gap-x-10 gap-y-4">
        <div className="flex gap-8 sm:gap-12">
          <div>
            <p className="mb-2 text-[11px]" style={{ ...monoStyle, color: MUTED_ON_DARK }}>Portfolio</p>
            <p className="text-[28px] tabular-nums leading-none md:text-[40px]" style={{ color: TEXT_LIGHT_ON_DARK }}>
              +{(INV_HERO_END.pf * p).toFixed(1)}%
            </p>
          </div>
          <div>
            <p className="mb-2 text-[11px]" style={{ ...monoStyle, color: INV_GOLD }}>S&amp;P 500</p>
            <p className="text-[28px] tabular-nums leading-none md:text-[40px]" style={{ color: TEXT_LIGHT_ON_DARK }}>
              +{(INV_HERO_END.sp * p).toFixed(1)}%
            </p>
          </div>
        </div>
        <p className="text-[11px]" style={{ ...monoStyle, color: MUTED_ON_DARK }}>Same deposits · same dates · since inception</p>
      </div>

      {/* The gap readout is HTML over the SVG, so it keeps its type size at every
          width instead of scaling down with the viewBox. */}
      <div className="relative mt-8">
        <svg viewBox={`0 0 ${W} ${H}`} className="block h-auto w-full" role="img" aria-label="Portfolio up 39.4 percent, S&P 500 up 45.2 percent over the same period">
          <line x1="0" x2={endX} y1={y(0)} y2={y(0)} stroke={DARK_ROW_UI.border} strokeWidth="1" vectorEffect="non-scaling-stroke" />
          <path d={spPath} fill="none" stroke={INV_GOLD} strokeWidth="1.75" strokeDasharray="4 5" vectorEffect="non-scaling-stroke" style={{ clipPath: `inset(0 ${(1 - p) * 100}% 0 0)` }} />
          <path d={pfPath} pathLength="1" fill="none" stroke={TEXT_LIGHT_ON_DARK} strokeWidth="2" strokeLinejoin="round" strokeDasharray="1" strokeDashoffset={1 - p} />
          <g style={{ opacity: done ? 1 : 0, transition: 'opacity 0.5s ease' }}>
            <circle cx={endX} cy={ySp} r="4" fill={INV_GOLD} />
            <circle cx={endX} cy={yPf} r="4" fill={TEXT_LIGHT_ON_DARK} />
            <line x1={endX + 14} x2={endX + 14} y1={ySp} y2={yPf} stroke={MUTED_ON_DARK} strokeWidth="1" vectorEffect="non-scaling-stroke" />
          </g>
        </svg>
        <div
          className="absolute right-0 -translate-y-1/2 whitespace-nowrap text-right"
          style={{
            top: `${(((ySp + yPf) / 2) / H) * 100}%`,
            opacity: done ? 1 : 0,
            transition: 'opacity 0.5s ease 0.1s'
          }}
        >
          <p className="text-[13px] tabular-nums leading-none md:text-[17px]" style={{ color: TEXT_LIGHT_ON_DARK }}>{gap} pp</p>
          <p className="mt-1.5 hidden text-[11px] leading-none sm:block" style={{ ...monoStyle, color: INV_DOWN }}>▼ trailed</p>
        </div>
      </div>

      <div className="mt-3 flex justify-between text-[11px]" style={{ ...monoStyle, color: MUTED_ON_DARK, paddingRight: `${(PAD_R / W) * 100}%` }}>
        <span>Mar 2023</span>
        <span>3 years 4 months · preliminary</span>
      </div>
    </div>
  );
}

/** True once the element has been on screen. Never flips back. */
function useSeenOnce(ref, threshold = 0.4) {
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setSeen(true);
          io.disconnect();
        }
      },
      { threshold }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [ref, threshold]);
  return seen;
}

/** Before/after specimen for a rule. It opens on the "typical app" state and flips
 *  to the II state once, shortly after it comes into view, so a reader who never
 *  touches it still sees the change. Any click hands control to the reader. */
function useRuleFlip(ref) {
  const seen = useSeenOnce(ref);
  const [mode, setMode] = useState('before');
  const touched = useRef(false);
  useEffect(() => {
    if (!seen || touched.current) return undefined;
    const id = setTimeout(() => {
      if (!touched.current) setMode('after');
    }, 1400);
    return () => clearTimeout(id);
  }, [seen]);
  const choose = (m) => {
    touched.current = true;
    setMode(m);
  };
  return [mode, choose];
}

const INV_INK = {
  ground: DARK_ROW_UI.imageWell,
  line: DARK_ROW_UI.border,
  text: TEXT_LIGHT_ON_DARK,
  muted: MUTED_ON_DARK
};

function InvSpecHeader({ monoStyle, caption, options, value, onChange }) {
  return (
    <div className="mb-6 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-3">
      <p className="text-[11px]" style={{ ...monoStyle, color: INV_INK.muted }}>{caption}</p>
      {options && (
        <div role="group" aria-label="Compare" className="flex gap-4">
          {options.map(([key, label]) => {
            const on = value === key;
            return (
              <button
                key={key}
                type="button"
                aria-pressed={on}
                onClick={() => onChange(key)}
                className="tap-target cursor-pointer border-0 bg-transparent p-0 pb-1 text-[11px] transition-colors duration-200"
                style={{ ...monoStyle, color: on ? INV_INK.text : INV_INK.muted, borderBottom: `1px solid ${on ? INV_INK.text : 'transparent'}` }}
              >
                {label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

/** Both states sit in one grid cell, so the tile keeps the taller one's height
 *  and the swap is a crossfade with no layout jump. */
function InvCrossfade({ mode, before, after }) {
  const layer = (on) => ({ gridArea: '1 / 1', opacity: on ? 1 : 0, transition: 'opacity 0.45s ease', pointerEvents: on ? 'auto' : 'none' });
  return (
    <div className="grid">
      <div style={layer(mode === 'before')} aria-hidden={mode !== 'before'}>{before}</div>
      <div style={layer(mode === 'after')} aria-hidden={mode !== 'after'}>{after}</div>
    </div>
  );
}

const InvArrow = ({ up }) => (
  <i className="inline-block w-[10px] text-[11px] not-italic" style={{ color: up ? INV_UP : INV_DOWN }}>{up ? '▲' : '▼'}</i>
);

/** Rule 01: the same +39.4%, measured from zero and then from the S&P. */
function InvSpecBaseline({ monoStyle }) {
  const ref = useRef(null);
  const [mode, choose] = useRuleFlip(ref);
  const label = (t, color = INV_INK.muted) => <small className="mb-2 block text-xs" style={{ color }}>{t}</small>;
  const num = 'text-2xl font-normal sm:text-[28px]';
  return (
    <div ref={ref}>
      <InvSpecHeader
        monoStyle={monoStyle}
        caption="Since inception"
        options={[['before', 'From zero'], ['after', 'From the S&P']]}
        value={mode}
        onChange={choose}
      />
      <InvCrossfade
        mode={mode}
        before={
          <div>
            {label('Portfolio')}
            <b className={num} style={{ color: INV_APP_GREEN }}>+39.4%</b>
            <p className="mt-3 text-[13px]" style={{ color: INV_INK.muted }}><L en="Green. You made money. You feel right." ko="초록. 돈을 벌었다. 내가 옳다고 느낀다." /></p>
          </div>
        }
        after={
          <div>
            <div className="grid grid-cols-3 gap-3">
              <div>{label('Portfolio')}<b className={num}>+39.4%</b></div>
              <div>{label('S&P', INV_GOLD)}<b className={num}>+45.2%</b></div>
              <div className="text-right">{label('Alpha')}<b className={num}>−5.8 pp <InvArrow up={false} /></b></div>
            </div>
            <p className="mt-3 text-[13px]" style={{ color: INV_INK.muted }}><L en="Same deposits, same dates. You made money, and the index made more." ko="같은 입금, 같은 날짜. 돈을 벌었고, 지수는 더 벌었다." /></p>
          </div>
        }
      />
    </div>
  );
}

/** Rule 02: profit colour on every number, then white numbers with a verdict arrow.
 *  All three trades made money, so the "before" is a wall of green that hides two losses to the index. */
function InvSpecColor({ monoStyle, rows }) {
  const ref = useRef(null);
  const [mode, choose] = useRuleFlip(ref);
  const list = (colored) =>
    rows.map(([sym, tag, ret, bench, up], r) => (
      <div
        key={sym}
        className="flex items-baseline justify-between py-3 text-[15px]"
        style={r === 0 ? undefined : { borderTop: `1px solid ${INV_INK.line}` }}
      >
        <span>
          {sym}
          {!colored && tag && <em className="ml-2 text-[11px] not-italic" style={{ color: INV_INK.muted }}>{tag}</em>}
        </span>
        <span className="flex items-baseline gap-4">
          <span style={colored ? { color: INV_APP_GREEN } : undefined}>{ret}</span>
          <span className="text-[13px]" style={{ color: colored ? INV_APP_GREEN : INV_INK.muted }}>{bench}</span>
          {colored ? <i className="inline-block w-[10px]" /> : <InvArrow up={up} />}
        </span>
      </div>
    ));
  return (
    <div ref={ref}>
      <InvSpecHeader
        monoStyle={monoStyle}
        caption="Closed positions · return vs S&P, same window"
        options={[['before', 'Color every number'], ['after', 'Arrow only']]}
        value={mode}
        onChange={choose}
      />
      <InvCrossfade mode={mode} before={<div>{list(true)}</div>} after={<div>{list(false)}</div>} />
    </div>
  );
}

/** Rule 04: the bar fills to 3y 4m of the five-year record on first view. */
function InvSpecProgress({ monoStyle }) {
  const ref = useRef(null);
  const seen = useSeenOnce(ref);
  const reduce = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const pct = 66.7; // 3 years 4 months of 5
  const w = seen || reduce ? pct : 0;
  const ease = reduce ? 'none' : '1.4s cubic-bezier(0.22, 1, 0.36, 1) 0.2s';
  return (
    <div ref={ref}>
      <div className="flex items-baseline justify-between text-[13px]" style={{ color: INV_INK.muted }}>
        <span>Tracked since Mar 14, 2023</span>
        <b className="text-[22px] font-normal" style={{ color: INV_INK.text }}>3 years 4 months</b>
      </div>
      <div className="relative mt-2 h-[34px]">
        <div className="absolute inset-x-0 top-[10px] h-px" style={{ backgroundColor: INV_INK.line }} />
        <div className="absolute left-0 top-[9.5px] h-0.5" style={{ width: `${w}%`, backgroundColor: INV_INK.text, transition: `width ${ease}` }} />
        <div
          className="absolute top-[5px] h-[11px] w-[11px] rounded-full"
          style={{ left: `${w}%`, marginLeft: -5, backgroundColor: INV_INK.text, transition: `left ${ease}` }}
        />
        <div className="absolute inset-x-0 top-[22px] flex justify-between text-[11px]" style={{ color: INV_INK.muted }}>
          <span /><span>1Y</span><span>2Y</span><span>3Y</span><span>4Y</span><span>5Y</span>
        </div>
      </div>
      <p className="mt-4 text-[11px]" style={{ ...monoStyle, color: INV_INK.muted }}>Preliminary until 5Y</p>
    </div>
  );
}

/** The Product, md and up: steps scroll on the left while one phone stays pinned on
 *  the right and swaps to the step crossing the middle of the viewport. Below md
 *  the same steps stack as cards (rendered by InvestingCase), since a pinned phone
 *  would cover the text on a narrow screen. */
function InvProductScroll({ steps, monoStyle, titleStyle }) {
  const u = DETAIL_UI;
  const [active, setActive] = useState(0);
  const stepRefs = useRef([]);

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(Number(entry.target.dataset.step));
        });
      },
      { rootMargin: '-50% 0px -50% 0px' }
    );
    stepRefs.current.forEach((el) => el && io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <div className="mt-16 hidden grid-cols-9 gap-6 md:grid">
      <div className="col-span-3">
        {steps.map(([, , step, title, line, voice], i) => (
          <div
            key={step}
            ref={(el) => (stepRefs.current[i] = el)}
            data-step={i}
            className="flex min-h-[80vh] flex-col justify-center"
            style={{ opacity: active === i ? 1 : 0.25, transition: 'opacity 0.4s ease' }}
          >
            <p className="text-xs" style={{ ...monoStyle, color: u.meta }}>{step}</p>
            <h3 className="mt-3 text-xl leading-[1.3]" style={{ ...titleStyle, color: u.title }}>{title}</h3>
            <p className="mt-4 max-w-[38ch] text-lg leading-[1.6]" style={{ color: u.body }}>{line}</p>
            <p className="mt-6 text-lg italic" style={{ color: u.title }}>{voice}</p>
          </div>
        ))}
      </div>
      <div className="col-span-5 col-start-5">
        {/* top/height leave room for the overlay's own close bar above the scroll area */}
        <div className="sticky flex h-[72vh] flex-col rounded px-8 pb-6 pt-8" style={{ top: '8vh', backgroundColor: INV_INK.ground }}>
          <div className="relative min-h-0 flex-1">
            {steps.map(([src, alt], i) => (
              <img
                key={src}
                src={src}
                alt={alt}
                aria-hidden={active !== i}
                className="absolute inset-0 m-auto h-full w-auto max-w-full rounded-[24px] object-contain"
                style={{ opacity: active === i ? 1 : 0, transition: 'opacity 0.5s ease', border: `1px solid ${INV_INK.line}` }}
              />
            ))}
          </div>
          <div className="mt-6 flex items-center justify-between">
            <p className="text-[11px] tabular-nums" style={{ ...monoStyle, color: INV_INK.muted }}>
              {String(active + 1).padStart(2, '0')} / {String(steps.length).padStart(2, '0')}
            </p>
            <div className="flex gap-1.5">
              {steps.map(([src], i) => (
                <span
                  key={src}
                  className="block h-0.5 w-6"
                  style={{ backgroundColor: i <= active ? INV_INK.text : INV_INK.line, transition: 'background-color 0.4s ease' }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- II case motion: reveal, scroll-lit text, parallax, stepper ---------- */
const prefersReduced = () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Calls fn on every scroll (the detail sheet scrolls inside its own box, so
 *  listen in the capture phase) and on resize, once per frame. */
function useScrollFrame(fn) {
  const fnRef = useRef(fn);
  fnRef.current = fn;
  useEffect(() => {
    let raf = 0;
    const run = () => { raf = 0; fnRef.current(); };
    const on = () => { if (!raf) raf = requestAnimationFrame(run); };
    document.addEventListener('scroll', on, true);
    window.addEventListener('resize', on);
    on();
    return () => { document.removeEventListener('scroll', on, true); window.removeEventListener('resize', on); cancelAnimationFrame(raf); };
  }, []);
}

/** Fades and lifts its children in the first time they come into view. */
function Reveal({ children, delay = 0, className = '', as: Tag = 'div', y = 20 }) {
  const ref = useRef(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    if (prefersReduced()) { setShown(true); return undefined; }
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setShown(true); io.disconnect(); } }, { threshold: 0, rootMargin: '0px 0px -12% 0px' });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <Tag
      ref={ref}
      className={className}
      style={{
        opacity: shown ? 1 : 0,
        transform: shown ? 'none' : `translateY(${y}px)`,
        transition: `opacity 1.2s cubic-bezier(.16,1,.3,1) ${delay}ms, transform 1.4s cubic-bezier(.16,1,.3,1) ${delay}ms`
      }}
    >
      {children}
    </Tag>
  );
}

/** A statement that lights up word by word as it is read on the way down.
 *  parts: [[text, bold?], ...]. No re-render: one CSS variable drives it. */
function ScrollLitText({ parts, className, style }) {
  const ref = useRef(null);
  const words = [];
  parts.forEach(([text, bold]) => text.split(/(\s+)/).forEach((w) => { if (w) words.push([w, bold]); }));
  const n = words.filter(([w]) => w.trim()).length;
  useScrollFrame(() => {
    const el = ref.current;
    if (!el) return;
    if (prefersReduced()) { el.style.setProperty('--p', n); return; }
    const r = el.getBoundingClientRect();
    const vh = window.innerHeight;
    const p = Math.min(1, Math.max(0, (vh * 0.85 - r.top) / (r.height + vh * 0.3)));
    el.style.setProperty('--p', (p * (n + 2)).toFixed(2));
  });
  let k = 0;
  return (
    <p ref={ref} className={className} style={{ ...style, '--p': 0 }}>
      {words.map(([w, bold], i) => {
        if (!w.trim()) return w;
        const idx = k++;
        return (
          <span
            key={i}
            style={{
              opacity: `clamp(0.18, calc(var(--p) - ${idx}), 1)`,
              fontWeight: bold ? 600 : undefined,
              transition: 'opacity 0.15s linear'
            }}
          >
            {w}
          </span>
        );
      })}
    </p>
  );
}

/** Drifts its child a little against the scroll: speed 0.06 = 6% of the
 *  distance from the viewport's middle. */
function Parallax({ children, speed = 0.06, className = '' }) {
  const ref = useRef(null);
  const inner = useRef(null);
  useScrollFrame(() => {
    const el = ref.current;
    if (!el || !inner.current || prefersReduced()) return;
    const r = el.getBoundingClientRect();
    const off = (r.top + r.height / 2 - window.innerHeight / 2) * -speed;
    inner.current.style.transform = `translate3d(0, ${off.toFixed(1)}px, 0)`;
  });
  return <div ref={ref} className={className}><div ref={inner} style={{ willChange: 'transform' }}>{children}</div></div>;
}

/** Editorial image entrances. Every picture lands where it always sat; the
 *  way in varies with what it is, so the page never repeats one trick:
 *   wipe    – the frame cuts open from below while it travels in on a diagonal
 *   slide   – the whole picture slides in from its own side of the page
 *   rise    – it rises from well below; used in rows that come in one by one
 *   curtain – the frame opens sideways like a curtain, the picture settling
 *   settle  – the frame is there; the picture inside drifts back from close up */
const WIPE_EASE = 'cubic-bezier(.77,0,.18,1)';
const SLIDE_EASE = 'cubic-bezier(.16,1,.3,1)';
function ImageReveal({ children, delay = 0, fx = 'auto', dir, ordered = true, className = '', style, head = null, foot = null }) {
  const ref = useRef(null);
  const [on, setOn] = useState(false);
  const [lag, setLag] = useState(0);
  const [side, setSide] = useState(-1);
  // the wipe is kept for the case covers only; elsewhere pictures rise or slide
  const kind = fx === 'auto' ? (side > 0 ? 'slide' : 'rise') : (dir === 'left' && fx === 'wipe' ? 'curtain' : fx);
  // each picture knows its side of the page before it starts
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    setSide(r.left + r.width / 2 > window.innerWidth / 2 ? 1 : -1);
  }, []);
  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    if (prefersReduced()) { setOn(true); return undefined; }
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      // pictures side by side come in left to right, a beat apart
      if (ordered) setLag(Math.round(Math.max(0, e.boundingClientRect.left / window.innerWidth) * 220));
      setOn(true);
      io.disconnect();
    }, { threshold: 0, rootMargin: '0px 0px -12% 0px' });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  const d = delay + lag;
  const scrub = useRef(null);
  useScrollFrame(() => {
    const el = ref.current;
    const m = scrub.current;
    if (!el || !m || kind === 'wipe' || kind === 'settle' || prefersReduced()) return;
    const r = el.getBoundingClientRect();
    const vh = window.innerHeight;
    // 0 when the top edge enters at the bottom, 1 once it reaches 35% from the top
    const p = Math.min(1, Math.max(0, (vh - r.top) / (vh * 0.65)));
    const k = 1 - p * p * (3 - 2 * p); // smoothstep, so it eases into place
    const y = k * (kind === 'slide' ? 90 : 130) + (delay % 7) * k * 6; // a little depth difference
    const x = kind === 'slide' ? k * side * 70 : 0;
    m.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
  });
  // Quiet on purpose: short travel, long soft easing, the picture inside
  // settling a few percent. Variety comes from timing and side, not tricks.
  const off = {
    wipe: { move: 'translate3d(0, 32px, 0)', clip: 'inset(100% 0 0 0)', inner: 'scale(1.06)', fade: false },
    slide: { move: 'none', clip: null, inner: 'scale(1.04)', fade: true },
    rise: { move: 'none', clip: null, inner: 'scale(1.04)', fade: true },
    curtain: { move: 'none', clip: null, inner: 'scale(1.04)', fade: true },
    settle: { move: 'none', clip: null, inner: 'scale(1.08)', fade: true }
  }[kind] || {};
  const dur = { wipe: 1.6, slide: 1.6, rise: 1.5, curtain: 1.5, settle: 2.2 }[kind] || 1.5;
  const ease = kind === 'wipe' ? WIPE_EASE : SLIDE_EASE;
  const shut = off.clip || 'inset(0 0 0 0)';
  return (
    <div ref={ref} className={className} style={style}>
      <div ref={scrub} className="h-full w-full" style={{ borderRadius: 'inherit', willChange: 'transform' }}>
      {head}
      <div
        className="h-full w-full overflow-hidden"
        style={{
          borderRadius: 'inherit',
          opacity: on || !off.fade ? 1 : 0,
          transform: on ? 'none' : off.move,
          clipPath: on ? 'inset(0 0 0 0)' : shut,
          WebkitClipPath: on ? 'inset(0 0 0 0)' : shut,
          transition: `transform ${dur}s ${ease} ${d}ms, opacity ${dur * 0.8}s ease ${d}ms, clip-path ${dur * 0.85}s ${WIPE_EASE} ${d}ms, -webkit-clip-path ${dur * 0.85}s ${WIPE_EASE} ${d}ms`
        }}
      >
        <div
          className="h-full w-full"
          style={{ transform: on ? 'none' : off.inner, transition: `transform ${dur + 0.6}s ${SLIDE_EASE} ${d}ms` }}
        >
          {children}
        </div>
      </div>
      {foot}
      </div>
    </div>
  );
}

/** A caption that waits for its picture. */
function LateCaption({ children, delay = 0, className = '', style }) {
  const ref = useRef(null);
  const [on, setOn] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    if (prefersReduced()) { setOn(true); return undefined; }
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setOn(true); io.disconnect(); } }, { threshold: 0.2 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <figcaption ref={ref} className={className} style={{ ...style, opacity: on ? 1 : 0, transform: 'none', transition: `opacity 1s ease ${delay}ms` }}>
      {children}
    </figcaption>
  );
}

/** Screens that change in place. On wide screens the block pins while you
 *  scroll and each stretch of scroll brings the next screen; the numbered
 *  list is the index (it follows along, and a click scrolls to that screen).
 *  On phones the list becomes a row of chips above one screen. */
function scrollParentOf(el) {
  let n = el && el.parentElement;
  while (n) {
    const o = getComputedStyle(n).overflowY;
    if ((o === 'auto' || o === 'scroll') && n.scrollHeight > n.clientHeight) return n;
    n = n.parentElement;
  }
  return document.scrollingElement;
}
function InvStepper({ items, monoStyle, titleStyle, numbered = false, ratio = [2, 3], screens = false }) {
  const u = DETAIL_UI;
  /* A step can hold several pictures (it.frames: [[name or null, label], ...]).
     The pinned stretch is cut into one beat per picture, so scrolling walks
     through a step's pictures in the same frame before the next step. */
  const units = items.flatMap((it, k) => (it.frames && it.frames.length ? it.frames : [null]).map((_, j) => [k, j]));
  const n = units.length;
  // a new step gets a full beat, each further picture in the same step a short one
  const weights = units.map(([, j]) => (j === 0 ? 1 : 0.4));
  const cum = weights.reduce((acc, w) => [...acc, acc[acc.length - 1] + w], [0]);
  const totalW = cum[n];
  const [pos, setPos] = useState(0);
  const [i, f] = units[Math.min(pos, n - 1)];
  const [wide, setWide] = useState(() => typeof window !== 'undefined' && window.matchMedia('(min-width: 768px)').matches);
  const track = useRef(null);
  const blockRef = useRef(null);
  const [geo, setGeo] = useState({ h: 0, avail: 0 });
  useLayoutEffect(() => {
    const measure = () => {
      const el = blockRef.current;
      if (!el) return;
      const sc = scrollParentOf(el);
      const top = sc === document.scrollingElement ? 0 : sc.getBoundingClientRect().top;
      setGeo({ h: el.offsetHeight, avail: window.innerHeight - top, top });
    };
    measure();
    window.addEventListener('resize', measure);
    const ro = new ResizeObserver(measure);
    if (blockRef.current) ro.observe(blockRef.current);
    // the sheet slides in when it opens; measure again once it has settled
    const t1 = setTimeout(measure, 900);
    return () => { window.removeEventListener('resize', measure); ro.disconnect(); clearTimeout(t1); };
  }, [wide]);
  const stickTop = Math.max(0, (geo.avail - geo.h) / 2);
  const step = Math.round(geo.avail * 0.6);
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)');
    const on = () => setWide(mq.matches);
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);
  // how far through the pinned stretch we are decides the screen
  useScrollFrame(() => {
    const el = track.current;
    if (!el || !wide) return;
    const r = el.getBoundingClientRect();
    const run = r.height - geo.h;
    if (run <= 0) return;
    const p = Math.min(0.999, Math.max(0, ((geo.top || 0) + stickTop - r.top) / run));
    const at = p * totalW;
    let k = 0;
    while (k < n - 1 && cum[k + 1] <= at) k += 1;
    setPos((prev) => (prev === k ? prev : k));
  });
  const go = (k, j = 0) => {
    const at = Math.max(0, units.findIndex(([a, b]) => a === k && b === j));
    if (!wide) { setPos(at); return; }
    const el = track.current;
    const sc = scrollParentOf(el);
    const r = el.getBoundingClientRect();
    const run = r.height - geo.h;
    const target = r.top - (geo.top || 0) - stickTop + ((cum[at] + weights[at] / 2) / totalW) * run;
    sc.scrollTo({ top: sc.scrollTop + target, behavior: prefersReduced() ? 'auto' : 'smooth' });
  };
  const ink = DARK_ROW_UI.imageWell;
  const land = ratio[0] > ratio[1];
  // a picture that can't take the section's ratio without losing too much
  // (a long banner, a flow chart, a square card, a page) gets a frame of its
  // own ratio instead, at most its own size: no crop, and no empty band
  const curSrc = (items[i].frames && items[i].frames[f] && items[i].frames[f][2]) || items[i].media;
  const cd = curSrc && CASE_ASSET_DIMS[curSrc];
  // (small pictures too, which the section frame would have to blow up);
  // a tall page keeps a 4:5 window at its own width and glides inside it
  const ownOf = (d) => {
    if (!d || screens) return false;
    if (d[1] / d[0] > 1.6) return true;
    const k = (ratio[0] / ratio[1]) / (d[0] / d[1]);
    return k >= 1.5 || k <= 1 / 1.5 || d[0] < 720;
  };
  const ownR = ownOf(cd);
  const ownH = cd ? Math.min(cd[1], Math.round(cd[0] * 1.25)) : 0;
  // one stage for the whole stepper, at the section's ratio, so the names
  // above it and the text beside it never move; a frame of another ratio
  // fits inside it, centred, at most the stage's height
  const stageR = units.reduce((m, [k, j]) => {
    const it = items[k];
    const src = (it.frames && it.frames[j] && it.frames[j][2]) || it.media;
    const d = src && CASE_ASSET_DIMS[src];
    if (!ownOf(d)) return m;
    return Math.min(m, d[0] / Math.min(d[1], Math.round(d[0] * 1.25)));
  }, ratio[0] / ratio[1]);
  const semi = { ...titleStyle, fontWeight: 600 };
  const fadeIn = (on) => ({
    opacity: on ? 1 : 0,
    transform: on ? 'none' : 'translateY(10px)',
    transition: on
      ? 'opacity 0.55s ease 0.22s, transform 0.8s cubic-bezier(.16,1,.3,1) 0.22s'
      : 'opacity 0.2s ease, transform 0.2s ease'
  });

  const block = (
    <div ref={blockRef} className="grid grid-cols-12 items-center gap-x-4 gap-y-6 sm:gap-x-6">
      <div className="col-span-12 md:col-span-3">
        {wide ? (
          <ol className="m-0 list-none p-0">
            {items.map((it, k) => (
              <li key={it.title}>
                <button type="button" onClick={() => go(k, 0)} className="block w-full cursor-pointer border-0 bg-transparent py-4 text-left" aria-current={k === i}>
                  <span className="flex items-baseline gap-6" style={{ opacity: k === i ? 1 : 0.4, transition: 'opacity 0.4s ease' }}>
                    {numbered && <span className="w-6 shrink-0 text-xs tabular-nums" style={{ ...monoStyle, color: u.meta }}>{String(k + 1).padStart(2, '0')}</span>}
                    <span className="min-w-0 text-lg leading-[1.3]" style={{ ...semi, color: u.title }}>{it.nav || it.kicker || it.title}</span>
                  </span>
                </button>
              </li>
            ))}
          </ol>
        ) : (
          <div className="flex flex-wrap gap-2">
            {items.map((it, k) => (
              <button
                key={it.title}
                type="button"
                onClick={() => go(k)}
                className="shrink-0 cursor-pointer rounded-full px-4 py-2 text-sm"
                style={{ ...semi, fontSize: 14, border: `1px solid ${k === i ? u.title : u.border}`, backgroundColor: k === i ? u.title : 'transparent', color: k === i ? '#fff' : u.body, transition: 'all 0.3s ease' }}
              >
                {it.nav || it.kicker || it.title}
              </button>
            ))}
          </div>
        )}
      </div>
      <div className={`col-span-12 sm:col-span-6 md:col-start-4 ${land ? 'md:col-span-5' : 'md:col-span-4'}`}>
        {/* the step's pictures, all named up front so a reader knows there is
            more than one: names when each shows a different thing, dots when not */}
        <div className="mx-auto mb-3 flex min-h-[16px] flex-wrap items-center gap-x-2 gap-y-1 text-xs" style={wide ? { width: `min(100%, calc((100vh - 88px - 96px - 28px) * ${ratio[0]} / ${ratio[1]}))` } : undefined}>
          {(items[i].frames || []).length > 1 && (items[i].frames.some(([nm]) => nm)
            ? items[i].frames.map(([nm], j) => [nm, j]).filter(([nm], j, all) => j === 0 || all[j - 1][0] !== nm).map(([nm, j], g) => (
              <button key={j} type="button" onClick={() => go(i, j)} className="cursor-pointer border-0 bg-transparent p-0 text-xs" style={{ color: items[i].frames[f][0] === nm ? u.title : u.placeholderText, transition: 'color 0.3s ease' }}>
                {g > 0 && '→ '}{nm}
              </button>
            ))
            : items[i].frames.length > 8
            ? <span className="text-xs tabular-nums" style={{ ...monoStyle, color: u.meta }}><span style={{ color: u.title }}>{String(f + 1).padStart(2, '0')}</span> / {String(items[i].frames.length).padStart(2, '0')}</span>
            : items[i].frames.map((_, j) => (
              <button key={j} type="button" aria-label={`${j + 1}`} onClick={() => go(i, j)} className="h-1.5 w-1.5 cursor-pointer rounded-full border-0 p-0" style={{ backgroundColor: j === f ? u.title : u.border, transition: 'background-color 0.3s ease' }} />
            )))}
        </div>
        <ImageReveal className="mx-auto rounded" fx="rise" style={wide ? { width: `min(100%, calc((100vh - 88px - 96px - 28px) * ${ratio[0]} / ${ratio[1]}))` } : undefined}>
          <div className="flex items-center justify-center" style={{ aspectRatio: `${ratio[0]} / ${ratio[1]}`, containerType: 'size' }}>
          <div className="relative overflow-hidden" style={ownR
            ? { aspectRatio: `${cd[0]} / ${ownH}`, width: `min(100%, ${cd[0]}px, calc(100cqh * ${cd[0]} / ${ownH}))`, borderRadius: 'inherit' }
            : { aspectRatio: `${ratio[0]} / ${ratio[1]}`, width: '100%', backgroundColor: items[i].src ? ink : u.imageWell }}>
            {items.map((it, k) => (
              <div
                key={it.title}
                aria-hidden={k !== i}
                className="absolute inset-0"
                style={{
                  opacity: k === i ? 1 : 0,
                  transform: k === i ? 'none' : (k < i ? 'translateY(-3%)' : 'translateY(3%)'),
                  transition: 'opacity 0.6s ease, transform 0.9s cubic-bezier(.16,1,.3,1)'
                }}
              >
                {it.src
                  ? (
                    screens
                      ? <div className="relative h-full" style={{ backgroundColor: ink }}><PhoneScreen src={it.src} alt={it.alt} /></div>
                      : (
                    <div className="flex h-full items-end justify-center px-[12%] pt-[12%]" style={{ backgroundColor: ink }}>
                      <img src={it.src} alt={it.alt} className="h-full w-full rounded-t-[22px] object-cover object-top" />
                    </div>
                      )
                  )
                  : it.frames && it.frames.length
                    ? it.frames.map(([, label], j) => (
                      <div
                        key={j}
                        aria-hidden={!(k === i && j === f)}
                        className="absolute inset-0 flex items-center justify-center p-6 text-center text-xs"
                        style={{
                          ...monoStyle, backgroundColor: screens && it.frames[j][2] ? ink : u.imageWell, color: u.placeholderText,
                          opacity: k !== i || j === f ? 1 : 0,
                          transform: k !== i || j === f ? 'none' : (j < f ? 'translateX(-4%)' : 'translateX(4%)'),
                          transition: 'opacity 0.5s ease, transform 0.8s cubic-bezier(.16,1,.3,1)'
                        }}
                      >
                        {it.frames[j][2] ? (screens ? <PhoneScreen src={it.frames[j][2]} alt={label} /> : <CaseMedia src={it.frames[j][2]} alt={label} />) : <>📷 {label}</>}
                      </div>
                    )).filter((_, j) => k !== i ? j === 0 : true)
                    : (
                      <div className="relative flex h-full items-center justify-center p-6 text-center text-xs" style={{ ...monoStyle, backgroundColor: u.imageWell, color: u.placeholderText }}>
                        {it.media ? (screens ? <PhoneScreen src={it.media} alt={it.title} /> : <CaseMedia src={it.media} alt={it.title} />) : <>📷 {it.slot}</>}
                      </div>
                    )}
              </div>
            ))}
          </div>
          </div>
        </ImageReveal>
      </div>
      {/* one text at a time: the old one leaves before the new one arrives */}
      <div className={`relative col-span-12 ${land ? 'md:col-span-3 md:col-start-10' : 'md:col-span-4 md:col-start-9'}`}>
        {!wide && <p className="m-0 mb-2 text-lg leading-[1.3]" style={{ ...semi, color: u.title }}>{items[i].title}</p>}
        {items.map((it, k) => (
          <p
            key={it.title}
            aria-hidden={k !== i}
            className={`m-0 text-lg leading-[1.6] ${k === i ? 'relative' : 'absolute inset-x-0 top-0'}`}
            style={{ color: u.body, pointerEvents: k === i ? 'auto' : 'none', ...fadeIn(k === i) }}
          >
            {it.line}
          </p>
        ))}
      </div>
    </div>
  );

  if (!wide) return block;
  return (
    <div ref={track} style={{ height: geo.h ? geo.h + Math.max(0, totalW - 1) * step : undefined }}>
      <div className="sticky" style={{ top: stickTop }}>{block}</div>
    </div>
  );
}

/** The II mark as the cover's play/pause control. It draws itself in, one
 *  stroke after the other; paused, the two slanted I's stand upright into a
 *  pause sign, and lean back when it plays again. */
function InvHeroMark({ paused, color, className = '' }) {
  const [drawn, setDrawn] = useState(prefersReduced());
  useEffect(() => {
    if (drawn) return undefined;
    const id = setTimeout(() => setDrawn(true), 250);
    return () => clearTimeout(id);
  }, []);
  // the brand file's symbol: each stroke leans 19.6° (65.34 across over 183.07 up); skewing it back stands it up
  const stroke = (d, k) => (
    <path
      d={d}
      fill={color}
      style={{
        transformBox: 'fill-box',
        transformOrigin: '50% 50%',
        transform: 'none',
        clipPath: drawn ? 'inset(0 0 0 0)' : 'inset(100% 0 0 0)',
        transition: `clip-path 1.2s ${WIPE_EASE} ${k * 180}ms, transform 0.8s ${SLIDE_EASE} ${k * 70}ms`
      }}
    />
  );
  return (
    <svg viewBox="0 0 176 184" className={className} fill="none" aria-hidden="true" style={{ overflow: 'visible' }}>
      {stroke(II_SYMBOL[0], 0)}
      {stroke(II_SYMBOL[1], 1)}
    </svg>
  );
}

/* Intelligent Investing logo, from the brand files: the symbol (two slashes)
   and the wordmark. Used as-is, never redrawn. */
const II_SYMBOL = ['M65.3391 6.67572e-06H90.9437L25.6047 183.071H0L65.3391 6.67572e-06Z', 'M149.441 6.67572e-06H175.045L109.706 183.071H84.1016L149.441 6.67572e-06Z'];
const II_WORDMARK = 'M7.10058 0.565786V41.7549H-6.67572e-06V0.565786H7.10058ZM51.4977 0.565786V41.7549H44.3971L25.9242 12.2492V41.7549H18.8236V0.565786H25.9242L44.4536 30.128V0.565786H51.4977ZM78.9495 0.565786V41.7549H71.9055V0.565786H78.9495ZM91.8777 0.565786V6.22363H59.0905V0.565786H91.8777ZM127.166 36.1253V41.7549H105.298V36.1253H127.166ZM107.307 0.565786V41.7549H100.206V0.565786H107.307ZM124.308 17.7656V23.3103H105.298V17.7656H124.308ZM127.024 0.565786V6.22363H105.298V0.565786H127.024ZM161.661 36.1253V41.7549H140.982V36.1253H161.661ZM142.962 0.565786V41.7549H135.862V0.565786H142.962ZM195.846 36.1253V41.7549H175.167V36.1253H195.846ZM177.147 0.565786V41.7549H170.046V0.565786H177.147ZM211.813 0.565786V41.7549H204.712V0.565786H211.813ZM255.163 20.7077V36.4365C254.578 37.2097 253.664 38.0584 252.419 38.9825C251.193 39.8878 249.562 40.6704 247.525 41.3305C245.488 41.9906 242.951 42.3206 239.915 42.3206C236.483 42.3206 233.437 41.5474 230.778 40.0009C228.137 38.4545 226.072 36.2102 224.582 33.2681C223.111 30.3072 222.376 26.7427 222.376 22.5748V19.7176C222.376 15.5685 223.055 12.0229 224.413 9.08084C225.789 6.13876 227.741 3.89448 230.268 2.34801C232.814 0.78267 235.841 2.38419e-06 239.349 2.38419e-06C242.725 2.38419e-06 245.516 0.565786 247.723 1.69735C249.948 2.81006 251.664 4.35654 252.871 6.33678C254.078 8.31703 254.842 10.5802 255.163 13.1262H248.204C247.977 11.6929 247.534 10.4104 246.874 9.27886C246.233 8.14729 245.309 7.2609 244.102 6.61967C242.914 5.95959 241.367 5.62955 239.462 5.62955C237.275 5.62955 235.445 6.18591 233.974 7.29862C232.503 8.39246 231.4 9.98609 230.664 12.0795C229.929 14.154 229.561 16.6812 229.561 19.661V22.5748C229.561 25.5923 229.986 28.1572 230.834 30.2694C231.683 32.3628 232.899 33.9565 234.484 35.0503C236.068 36.1442 237.973 36.6911 240.198 36.6911C241.82 36.6911 243.149 36.5591 244.187 36.295C245.224 36.0122 246.044 35.6821 246.648 35.3049C247.27 34.9089 247.751 34.5317 248.091 34.1734V25.9978H239.519V20.7077H255.163ZM292.884 36.1253V41.7549H271.016V36.1253H292.884ZM273.025 0.565786V41.7549H265.924V0.565786H273.025ZM290.026 17.7656V23.3103H271.016V17.7656H290.026ZM292.742 0.565786V6.22363H271.016V0.565786H292.742ZM334.254 0.565786V41.7549H327.153L308.68 12.2492V41.7549H301.58V0.565786H308.68L327.21 30.128V0.565786H334.254ZM361.706 0.565786V41.7549H354.662V0.565786H361.706ZM374.634 0.565786V6.22363H341.847V0.565786H374.634ZM388.818 0.565786V41.7549H384.348V0.565786H388.818ZM433.187 0.565786V41.7549H429.679L406.029 6.59139V41.7549H402.493V0.565786H406.029L429.707 35.7293V0.565786H433.187ZM459.479 36.6062L472.464 0.565786H476.254L460.95 41.7549H458.093L459.479 36.6062ZM446.07 0.565786L458.998 36.6062L460.412 41.7549H457.583L442.279 0.565786H446.07ZM510.863 38.7562V41.7549H487.694V38.7562H510.863ZM488.741 0.565786V41.7549H485.233V0.565786H488.741ZM507.978 19.0386V22.0373H487.694V19.0386H507.978ZM510.722 0.565786V3.56444H487.694V0.565786H510.722ZM544.426 31.599C544.426 30.1091 544.086 28.8267 543.407 27.7517C542.728 26.6767 541.568 25.7243 539.928 24.8945C538.287 24.0458 536.043 23.216 533.195 22.405C530.441 21.6318 528.056 20.7548 526.038 19.7742C524.02 18.7746 522.464 17.5487 521.37 16.0966C520.276 14.6255 519.729 12.8056 519.729 10.6367C519.729 8.52448 520.314 6.67625 521.483 5.09206C522.671 3.489 524.303 2.24428 526.377 1.35788C528.471 0.45263 530.866 2.38419e-06 533.563 2.38419e-06C536.448 2.38419e-06 538.947 0.556356 541.059 1.66906C543.171 2.76291 544.803 4.24338 545.953 6.11047C547.104 7.9587 547.679 10.0238 547.679 12.3058H544.199C544.199 10.5142 543.775 8.92053 542.926 7.52493C542.096 6.12933 540.889 5.02605 539.305 4.21509C537.721 3.40414 535.807 2.99866 533.563 2.99866C531.299 2.99866 529.395 3.34756 527.848 4.04536C526.32 4.7243 525.17 5.63898 524.397 6.78941C523.624 7.93984 523.237 9.20342 523.237 10.5802C523.237 11.8815 523.576 13.0508 524.255 14.088C524.953 15.1253 526.104 16.0683 527.707 16.9169C529.329 17.7656 531.526 18.5577 534.298 19.2932C537.202 20.0853 539.673 21.0094 541.71 22.0656C543.747 23.1217 545.293 24.4136 546.349 25.9412C547.424 27.45 547.962 29.317 547.962 31.5425C547.962 33.7867 547.349 35.7198 546.123 37.3417C544.897 38.9448 543.219 40.1801 541.087 41.0476C538.956 41.8963 536.523 42.3206 533.789 42.3206C531.959 42.3206 530.13 42.0849 528.301 41.6134C526.49 41.1419 524.84 40.4064 523.35 39.4069C521.86 38.4073 520.663 37.1343 519.757 35.5878C518.852 34.0225 518.4 32.146 518.4 29.9583H521.907C521.907 31.6933 522.256 33.1644 522.954 34.3714C523.652 35.5595 524.576 36.5214 525.726 37.2569C526.896 37.9735 528.178 38.5016 529.574 38.8411C530.988 39.1617 532.393 39.322 533.789 39.322C535.939 39.322 537.806 39.0014 539.39 38.3602C540.993 37.7189 542.228 36.8231 543.096 35.6727C543.982 34.5034 544.426 33.1455 544.426 31.599ZM572.189 0.565786V41.7549H568.737V0.565786H572.189ZM586.305 0.565786V3.56444H554.621V0.565786H586.305ZM600.15 0.565786V41.7549H596.642V0.565786H600.15ZM644.914 0.565786V41.7549H641.407L617.757 6.59139V41.7549H614.221V0.565786H617.757L641.435 35.7293V0.565786H644.914ZM688.067 22.1504V36.8325C687.595 37.5115 686.775 38.2847 685.606 39.1523C684.455 40.0009 682.909 40.7459 680.966 41.3871C679.024 42.0095 676.619 42.3206 673.753 42.3206C670.509 42.3206 667.642 41.5568 665.153 40.0292C662.663 38.4827 660.711 36.3045 659.297 33.4944C657.901 30.6655 657.203 27.3274 657.203 23.48V18.5294C657.203 14.7387 657.845 11.4666 659.127 8.71308C660.428 5.94073 662.276 3.80019 664.672 2.29143C667.067 0.763811 669.905 2.38419e-06 673.187 2.38419e-06C676.261 2.38419e-06 678.835 0.537497 680.91 1.61249C683.003 2.66862 684.634 4.11137 685.804 5.94073C686.992 7.7701 687.737 9.84464 688.039 12.1644H684.531C684.267 10.5236 683.71 9.01483 682.862 7.63809C682.032 6.24249 680.834 5.12035 679.269 4.27167C677.704 3.423 675.676 2.99866 673.187 2.99866C670.528 2.99866 668.264 3.64931 666.397 4.95061C664.549 6.23306 663.135 8.03413 662.154 10.3538C661.192 12.6736 660.711 15.3799 660.711 18.4728V23.48C660.711 26.6673 661.249 29.4491 662.324 31.8254C663.417 34.2016 664.936 36.0499 666.878 37.37C668.84 38.6713 671.131 39.322 673.753 39.322C675.846 39.322 677.619 39.124 679.071 38.7279C680.542 38.3319 681.73 37.8604 682.635 37.3135C683.541 36.7477 684.182 36.229 684.559 35.7575V25.1491H673.498V22.1504H688.067Z';
function IILogoSheet() {
  return (
    <svg viewBox="0 0 2000 1000" className="block h-full w-full" role="img" aria-label="Intelligent Investing symbol and wordmark">
      <g transform="translate(327.0 320) scale(1.9665)" fill="currentColor">{II_SYMBOL.map((d) => <path key={d.slice(0, 12)} d={d} />)}</g>
      <g transform="translate(327.0 320) scale(1.9665)" fill="none" stroke="currentColor" strokeOpacity="0.32" strokeWidth="0.763" strokeDasharray="3.05 3.05">
        <rect x="32.7" y="0" width="25.6" height="183.07" />
        <rect x="116.8" y="0" width="25.6" height="183.07" />
        <line x1="-60" y1="0" x2="236" y2="0" /><line x1="-60" y1="183.07" x2="236" y2="183.07" />
      </g>
      <line x1="1000" y1="0" x2="1000" y2="1000" stroke="currentColor" strokeOpacity="0.12" strokeWidth="2" />
      <g transform="translate(1150 477.7) scale(0.2439)" fill="currentColor">{II_SYMBOL.map((d) => <path key={d.slice(0, 12)} d={d} />)}</g>
      <g transform="translate(1227.9 480.6) scale(0.903)" fill="currentColor"><path d={II_WORDMARK} /></g>
    </svg>
  );
}

function InvestingCase({ monoStyle, titleStyle }) {
  const u = DETAIL_UI;
  const ko = useKo();
  const t = (en, kr) => (ko ? kr : en);
  const frame = `${PAGE_FRAME} ${WORK_PAGE_GUTTER_X}`;
  const grid = 'grid grid-cols-12 gap-x-4 sm:gap-x-6';
  /* One rhythm for the whole page (follows the Figma layout, 2073:404):
     section 160 top and bottom, title to body 32, text to media 64,
     one block to the next 96, rows 24 apart. Type: titles 36 semibold,
     body 18, small copy 16, captions 12, labels 12 mono. */
  const sectionCls = 'py-16 md:py-40';
  const bodyP = `mt-8 text-lg leading-[1.6] md:w-[${frameCols(6)}]`;
  const smallCls = 'text-base leading-[1.6]';
  const ink = DARK_ROW_UI.imageWell;
  const inkText = TEXT_LIGHT_ON_DARK;
  const inkMuted = MUTED_ON_DARK;
  const specStyle = { backgroundColor: ink, color: inkText };
  const strongStyle = { fontWeight: 600, color: u.title };
  const semi = { ...titleStyle, fontWeight: 600, color: u.title };
  const labelCls = 'text-xs';
  const labelStyle = { ...monoStyle, color: u.meta };

  /* Grounds: the opening and 01 read as one white page, the case then settles
     on the sheet's off-white, and Communication and 04 step back to white. */
  const WHITE = '#ffffff';
  /* A section: label on columns 1–3, title and body on 4–12. `wide` runs on
     the full 12 columns under it, for rows that use the label column too. */
  const sec = (label, lead, body, ground = u.overlayBg, wide = null) => (
    <section className={sectionCls} style={{ backgroundColor: ground }}>
      <div className={`${frame} ${grid}`}>
        <p className={`col-span-12 mb-6 md:col-span-3 md:mb-0 md:pt-3 ${labelCls}`} style={labelStyle}>{label}</p>
        <div className="col-span-12 md:col-span-9 md:col-start-4">
          <Reveal>
            <h2 className="m-0 text-2xl leading-[1.2] md:text-[36px] md:leading-[1.15]" style={{ ...semi, letterSpacing: '-0.01em' }}>{lead}</h2>
          </Reveal>
          <Reveal delay={120}>{body}</Reveal>
        </div>
      </div>
      {wide && <div className={frame}>{wide}</div>}
    </section>
  );
  const Cap = useCallback(({ children }) => (
    <p className="mb-5 text-xs" style={{ ...monoStyle, color: inkMuted }}>{children}</p>
  ), [ko]);
  /* An image still to come: a quiet well at the layout's ratio, caption above. */
  const Slot = useCallback(({ label = '', caption, kind = '📷', ratio = 'aspect-[4/5]', ground = u.imageWell, className = '', delay = 0, dir = 'up', fx = 'auto', ordered = true, src, phone = true, full = false, round = !full }) => (
    <figure className={`m-0 ${className}`}>
      <ImageReveal delay={delay} dir={dir} fx={fx} ordered={ordered} className={round ? 'rounded' : ''} head={caption && <LateCaption delay={delay + 650} className="mb-3 text-xs" style={{ color: u.meta }}>{caption}</LateCaption>}>
        <div
          className={`relative flex ${ratio} ${round ? 'rounded' : ''} items-center justify-center overflow-hidden ${src ? '' : 'p-6'} text-center text-xs`}
          style={{ ...monoStyle, backgroundColor: src ? INV_INK.ground : ground, color: u.placeholderText }}
        >
          {src && full
            ? <><img src={src} alt={label} loading="lazy" className="absolute inset-0 h-full w-full object-cover object-top" /><span aria-hidden className="pointer-events-none absolute inset-0" style={{ boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.09)' }} /></>
            : src ? (phone ? <PhoneScreen src={src} alt={label} /> : <CaseMedia src={src} alt={label} fit="cover" />) : <>{kind} {label}</>}
        </div>
      </ImageReveal>
    </figure>
  ), [ko]);
  /* A text row on the content field's 9 columns: title 3, copy 6. */
  const Row = useCallback(({ title, copy }) => (
    <div className="grid grid-cols-9 gap-x-4 gap-y-3 sm:gap-x-6">
      <h3 className="col-span-9 m-0 text-lg leading-[1.4] md:col-span-3" style={semi}>{title}</h3>
      <p className="col-span-9 m-0 text-lg leading-[1.6] md:col-span-6 md:col-start-4" style={{ color: u.body }}>{copy}</p>
    </div>
  ), [ko]);
  /* A screen row on the full 12 columns: label and title 1–3, screen 4–7,
     what it says 9–12, centred on the screen. */
  const StepRow = useCallback(({ src, alt, kicker, title, line, slot }) => (
    <div className={`${grid} items-center gap-y-6`}>
      <div className="col-span-12 md:col-span-3">
        {kicker && <p className={`mb-2 ${labelCls}`} style={labelStyle}>{kicker}</p>}
        <h3 className="m-0 text-lg leading-[1.4]" style={semi}>{title}</h3>
      </div>
      <div className={`col-span-12 sm:col-span-6 md:col-start-4 ${land ? 'md:col-span-5' : 'md:col-span-4'}`}>
        {src
          ? (
            <div className="flex aspect-[2/3] items-end justify-center overflow-hidden rounded px-[12%] pt-[12%]" style={{ backgroundColor: ink }}>
              <img src={src} alt={alt} className="h-full w-full rounded-t-[22px] object-cover object-top" />
            </div>
          )
          : <Slot ratio="aspect-[2/3]" label={slot} />}
      </div>
      <p className="col-span-12 m-0 text-lg leading-[1.6] md:col-span-4 md:col-start-9" style={{ color: u.body }}>{line}</p>
    </div>
  ), [ko]);

  const metaItems = [
    [t('Company', '회사'), t('An investing app for active investors', '액티브 투자자를 위한 투자 앱')],
    [t('Role', '역할'), t('Lead Designer: brand, marketing, product UI', '리드 디자이너: 브랜드, 마케팅, 프로덕트 UI')],
    [t('Scope', '범위'), t('Brand · Product · Marketing, one experience', '브랜드 · 제품 · 마케팅, 하나의 경험')],
    [t('Team', '팀'), t('CEO, two designers, engineering', 'CEO, 디자이너 2명, 엔지니어링')]
  ];

  const rules = [
    [t('The baseline is the S&P 500, not zero.', '기준선은 0이 아니라 S&P 500이다.'), t('Your performance always sits next to the S&P’s, on the same chart.', '내 성과는 항상 같은 그래프 위에서 S&P의 성과 옆에 놓인다.'), 'aspect-[304/313]'],
    [t('Green and red mean one thing.', '초록과 빨강에는 한 가지 뜻만 있다.'), t('In performance, they only say ahead of or behind the S&P. Signs and triangles say it too, for anyone who can’t tell the colors apart.', '성과 안에서는 S&P보다 앞섰는지 뒤처졌는지만 말한다. 색을 구분하기 어려운 사람을 위해 부호와 삼각형이 같은 뜻을 함께 전한다.'), 'aspect-[304/406]'],
    [t('Gold belongs to the S&P.', '골드는 S&P의 색이다.'), t('Wherever the S&P appears, it is gold, and nothing else is.', 'S&P가 나오는 곳은 언제나 골드이고, 다른 것은 골드가 아니다.'), 'aspect-[304/481]'],
    [t('Five years before a verdict.', '판정까지 5년.'), t('The performance page tracks how close the account is to a five-year record, and marks every result preliminary until it gets there.', '성과 페이지는 계좌가 5년 기록에 얼마나 가까워졌는지 보여주고, 그 전까지의 결과는 모두 잠정으로 표시한다.'), 'aspect-[304/353]']
  ];

  const steps = [
    ['images/investing-p1-entrance.jpg', 'Main dashboard performance chart', t('Entrance', '진입'), t('Two lines, one gap.', '두 개의 선, 하나의 격차.'), t('The performance chart on the main dashboard: your line against the S&P, with the S&P in gold. Both lines start at your first deposit, so the distance between them is the whole answer.', '메인 대시보드의 성과 그래프. 내 선과 S&P의 선이 나란히 놓이고, S&P는 골드다. 두 선은 첫 입금일에서 함께 출발하니, 둘 사이의 거리가 곧 답이다.')],
    ['images/investing-p2-perf.jpg', 'Performance page', t('Performance', '성과'), t('The full record.', '전체 기록.'), t('Portfolio, S&P, and the difference, since the first deposit. Green and red only say whether you beat or trailed. Until the account has a five-year record, results are marked preliminary.', '첫 입금 이후의 포트폴리오, S&P, 그리고 그 차이. 초록과 빨강은 이겼는지 뒤처졌는지만 말한다. 계좌가 5년 기록을 채우기 전까지 결과는 잠정으로 표시된다.')],
    ['images/investing-p3-closed.jpg', 'Closed positions', t('Positions', '포지션'), t('Every decision, scored.', '모든 결정에 점수를.'), t('Each closed position against the S&P over its own holding window. Every line starts at zero on the day it was entered, and how far it runs is how long it was held. Beat and trailed are counted apart from profit and loss.', '매도한 포지션마다 그 보유 기간 동안의 S&P와 비교한다. 모든 선은 매수한 날 0에서 시작하고, 선의 길이가 곧 보유 기간이다. 지수를 이겼는지 뒤처졌는지는 수익·손실과 따로 센다.')],
    ['images/investing-p4-detail.jpg', 'Closed position detail', t('Detail', '상세'), t('If you had held.', '계속 보유했다면.'), t('One sale: what it earned, what the S&P earned over the same window, and the value given up. It also shows how wide that gap got while you held.', '매도 한 건. 그 거래가 번 것, 같은 기간 S&P가 번 것, 그리고 놓친 가치. 보유하는 동안 그 차이가 가장 크게 벌어졌던 순간도 보여준다.')],
    ['images/work/ii/calibration-p.jpg', 'Calibration', t('Calibration', '캘리브레이션'), t('Where the allocation went wrong.', '배분이 어긋난 곳.'), t('Calibration shows where your allocation went wrong against the S&P. Had you put the same amount in every position, here is what you would have earned. Tap through for the analysis, position by position.', '캘리브레이션은 내 배분이 어디서 어긋났는지 S&P와 비교해 보여준다. 예를 들면, 모든 종목에 같은 금액을 넣었다면 얼마를 더 벌었을지. 누르면 종목별 분석이 열린다.'), t('Calibration', '캘리브레이션')]
  ];

  const noteRows = [
    [null, '', t('Before the trade', '거래 전'), t('Out of the buy flow.', '매수 흐름에서 빼다.'), t('Notes left the buy flow. They live on the stock page now, there when you want them.', '메모는 매수 흐름에서 빠졌다. 이제 종목 페이지에 있고, 필요할 때 거기 있다.'), t('Notes on the stock page', '종목 페이지의 메모'), [[t('Stock page', '종목 페이지'), t('Notes on the stock page', '종목 페이지의 메모'), 'images/work/ii/memo-stock.png']]],
    [null, '', t('After the trade', '거래 후'), t('Then the notes do the work.', '대신 메모는 일을 한다.'), t('Write down when you would sell, and the app watches for it. When a position crosses that line, an alert shows up in its row on the dashboard. You write when you want. The app keeps watch.', '언제 팔지 적어두면, 앱이 그 선을 지켜본다. 포지션이 그 선을 넘으면 대시보드의 해당 종목 행에 알림이 뜬다. 쓰는 건 원할 때, 지켜보는 건 앱이.'), t('Dashboard alerts', '대시보드 알람'), [[t('Dashboard', '대시보드'), t('Kill criteria on the dashboard', '대시보드의 킬 크라이테리아'), 'images/work/ii/memo-alert2.png']]]
  ];

  const aiRows = [
    [t('Pick the tool for the work.', '작업에 맞는 도구를 고른다.'), t('Some work starts in Figma, some in code. When the numbers matter, I prototype in code on real data, so reviews can check them, not just the layout.', '어떤 작업은 Figma에서, 어떤 작업은 코드에서 시작한다. 숫자가 중요할 때는 실제 데이터로 코드 프로토타입을 만들어, 리뷰에서 레이아웃만이 아니라 숫자까지 검증한다.')],
    [t('Hand off what engineering can use.', '엔지니어링이 쓸 수 있는 것을 넘긴다.'), t('Sometimes that is working HTML to build from, sometimes Figma files. Either way, it goes through the same framework before launch.', '작동하는 HTML일 때도, Figma 파일일 때도 있다. 어느 쪽이든 출시 전에는 같은 큰 틀을 거친다.')],
    [t('AI for speed, people for the call.', 'AI로 빠르게, 결정은 사람이.'), t('AI produces options and connects the tools: Figma, CapCut and Claude through MCP, with voice from ElevenLabs. People do the final review, in Figma and page by page.', 'AI로 안을 빠르게 만들고 도구를 연결한다. Figma, CapCut, Claude를 MCP로 잇고, 보이스는 ElevenLabs로 입힌다. 마지막 검수는 사람이 Figma와 페이지 단위로 한다.')]
  ];

  const outcomes = [
    [t('Shipped', '출시'), t('Launched after beta.', '베타를 거쳐 출시.')],
    [t('Product speed', '제품 속도'), t('A feature that took a month from idea to release now takes a week.', '아이디어에서 출시까지 한 달 걸리던 기능 하나가 한 주로 줄었다.')],
    [t('Marketing speed', '마케팅 속도'), t('Pieces go out as each campaign needs them, and the response numbers decide the next one.', '캠페인 상황에 맞춰 내보내고, 반응 숫자를 보고 다음 편을 정한다.')],
    [t('Handoff', '인계'), t('Fewer rounds between design and engineering, and the build matches the design’s intent.', '디자인과 개발 사이 수정 왕복이 줄었고, 디자인 의도대로 구현된다.')]
  ];

  const symbol = (fill, cls) => (
    <svg viewBox="0 0 15 18" className={cls} fill="none" aria-hidden="true">
      <path d="M5.59903 0H7.79315L2.19412 17.6523H0L5.59903 0Z" fill={fill} />
      <path d="M12.8061 0H15.0002L9.40115 17.6523H7.20703L12.8061 0Z" fill={fill} />
    </svg>
  );

  const lanes = [
    [t('Speed', '속도'), [t('Idea', '아이디어'), 'UX', 'UI', t('Beta test', '베타 테스트'), t('Polish', '폴리싱'), t('Release', '출시'), t('Feedback ↺', '피드백 ↺')], t('A month, now a week', '한 달에서 한 주로'), t('Beta tests run with an internal group, and steps get skipped when the work doesn’t need them. Marketing runs as a weekly batch: visuals start once the copy is approved.', '베타 테스트는 사내 그룹과 하고, 필요 없는 단계는 건너뛴다. 마케팅은 주 단위 배치로 돌고, 카피가 승인되면 비주얼을 시작한다.')],
    [t('Efficiency', '효율'), [t('One design system', '디자인 시스템 하나'), t('One direction document', '디렉션 문서 하나'), t('Figma and HTML, one to one', 'Figma와 HTML, 1:1')], t('Never explained twice', '두 번 설명하지 않는다'), t('The design system is the team’s shared standard; other designers build on it. One document holds the direction for brand, marketing and product, so no one starts from scratch.', '디자인 시스템은 팀의 공통 기준이고, 다른 디자이너도 그 위에서 만든다. 브랜드·마케팅·제품의 방향을 문서 하나에 모아, 누구도 처음부터 다시 시작하지 않는다.')],
    [t('Quality', '품질'), [t('Direction, section by section', '섹션별 디렉션'), t('Refine in Figma', 'Figma에서 다듬기'), t('Rules checked on every edit', '편집마다 규칙 검사'), t('Final review by people', '최종 검수는 사람')], t('AI gets close. Taste finishes it.', 'AI는 가까이 데려가고, 마무리는 감각이 한다.'), t('I direct Claude section by section, with references, refine in Figma and send it back. Token and casing errors are caught before anyone reviews, and marketing copy goes through a compliance pre-check.', '섹션마다 Claude에 디렉션과 레퍼런스를 주고, Figma에서 다듬어 다시 넘긴다. 토큰·케이싱 오류는 사람이 보기 전에 걸리고, 마케팅 카피는 컴플라이언스 사전 체크를 거친다.')]
  ];

  /* Cover: the user's path plays in one screen (ad, website, sign-up,
     performance); the II symbol top right is its pause button. Once the
     screen leaves view it stops on Performance. */
  const screens = [
    [t('Website', '웹사이트'), t('📷 Landing page', '📷 랜딩 페이지'), 'images/work/ii/cover-website.jpg'],
    [t('Sign-up', '가입'), t('📷 Sign-up intro', '📷 가입 인트로'), 'images/work/ii/signup-intro.mp4'],
    [t('Performance', '성과'), t('📷 Performance', '📷 성과'), 'images/work/ii/cover-dash-perf.jpg']
  ];
  const lastScreen = screens.length - 1;
  const [screen, setScreen] = useState(0);
  const [playing, setPlaying] = useState(true);
  const coverRef = useRef(null);
  const coverVids = useRef([]);
  const isVid = (k) => /\.mp4$/i.test(screens[k][2] || '');
  // a still holds for a beat; a video plays to its end, then the next screen
  useEffect(() => {
    coverVids.current.forEach((v, k) => {
      if (!v) return;
      if (k === screen) { v.currentTime = 0; const pr = v.play(); if (pr && pr.catch) pr.catch(() => {}); } else v.pause();
    });
    if (!playing || isVid(screen)) return undefined;
    const id = setTimeout(() => setScreen((n) => (n + 1) % screens.length), 2400);
    return () => clearTimeout(id);
  }, [screen, playing]);
  useEffect(() => {
    const el = coverRef.current;
    if (!el) return undefined;
    // stop on Performance only once the cover has been seen and then left
    let seen = false;
    const io = new IntersectionObserver(([e]) => {
      if (e.intersectionRatio >= 0.5) seen = true;
      else if (seen) { setPlaying(false); setScreen(lastScreen); }
    }, { threshold: [0.5] });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  /* The headline counts up to 39% once it is in view (the hero chart that
     used to drive it is no longer on the page). */
  const headRef = useRef(null);
  useEffect(() => {
    const el = headRef.current;
    if (!el) return undefined;
    invHeroProgress.set(0);
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { invHeroProgress.set(1); return undefined; }
    let raf = 0;
    const io = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      io.disconnect();
      const start = performance.now();
      const tick = (now) => {
        const k = Math.min(1, (now - start) / 1800);
        invHeroProgress.set(1 - Math.pow(1 - k, 3));
        if (k < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    }, { threshold: 0.6 });
    io.observe(el);
    return () => { io.disconnect(); cancelAnimationFrame(raf); };
  }, []);

  return (
    // body copy in the home face too (it fell back to the system font)
    <div style={{ color: u.title, fontFamily: titleStyle.fontFamily, overflowX: 'clip' }}>
      {/* 0 · Hero and 01, one white page */}
      <header className="pt-12 md:pt-32" style={{ backgroundColor: WHITE }}>
        <div className={`${frame} flex flex-col md:block`}>
          <div className="mt-12 flex items-start justify-between gap-8 md:mt-0">
            <dl className="m-0">
              {metaItems.map(([k, v]) => (
                <div key={k} className="grid grid-cols-[88px_minmax(0,1fr)] gap-x-3 py-0.5">
                  <dt className={labelCls} style={labelStyle}>{k}</dt>
                  <dd className="m-0 text-[13px] leading-[1.5]" style={{ color: u.body }}>{v}</dd>
                </div>
              ))}
            </dl>
            <button
              type="button"
              onClick={() => setPlaying((p) => !p)}
              aria-label={playing ? t('Pause', '일시정지') : t('Play', '재생')}
              className="-mr-2 hidden shrink-0 cursor-pointer border-0 bg-transparent p-2 md:block"
            >
              <InvHeroMark paused={!playing} color={u.title} className="h-9 w-auto md:h-12" />
            </button>
          </div>
          <div className="order-first md:order-none md:mt-32">
            <button
              type="button"
              onClick={() => setPlaying((p) => !p)}
              aria-label={playing ? t('Pause', '일시정지') : t('Play', '재생')}
              className="-ml-1 mb-4 block cursor-pointer border-0 bg-transparent p-1 md:hidden"
            >
              <InvHeroMark paused={!playing} color={u.title} className="h-8 w-auto" />
            </button>
          <p className="m-0 text-left text-3xl leading-[1.2] md:text-right md:text-[48px]" style={{ ...titleStyle, color: u.title }}>
            <span style={{ fontWeight: 400 }}>{t('2025–Now', '2025–현재')}</span>
            <br />
            <span style={{ fontWeight: 600 }}>Intelligent Investing</span>
          </p>
          </div>
        </div>

        <div className={`${frame} mt-20 md:mt-64`}>
          <div className={grid}>
            <p className={`col-span-12 mb-6 md:col-span-3 md:mb-0 md:pt-4 ${labelCls}`} style={labelStyle}>
              {t('2025–Now', '2025–현재')} · Intelligent Investing
            </p>
            <div className="col-span-12 md:col-span-9 md:col-start-4">
              <div ref={headRef}>
              <InvestingHeroHeadline
                ko={ko}
                className="m-0 text-4xl leading-[1.2] md:text-[48px]"
                style={{ ...semi, letterSpacing: '-0.01em' }}
              />
              </div>
              <Reveal delay={200}>
              <p className={bodyP} style={{ color: u.body }}>
                {t('Most investing apps make you trade more. This one makes you stop and think. I keep it one brand, from the first post to the dashboard.', '대부분의 투자 앱은 더 많이 거래하게 만든다. 이 앱은 멈추고 생각하게 만든다. 나는 그것을 첫 게시물부터 대시보드까지 하나의 브랜드로 이어간다.')}
              </p>
              <div className="mt-10 md:mt-16 grid grid-cols-9 gap-x-4 gap-y-8 sm:gap-x-6">
                <figure ref={coverRef} className="col-span-9 m-0 md:col-span-6">
                  <figcaption className="mb-3 flex gap-2 text-xs" style={{ color: u.meta }}>
                    {screens.map(([name], k) => (
                      <button type="button" key={name} onClick={() => { setPlaying(false); setScreen(k); }} aria-pressed={k === screen} className="cursor-pointer border-0 bg-transparent p-0 text-xs transition-colors hover:opacity-70" style={{ color: k === screen ? u.title : u.placeholderText, font: 'inherit' }}>{k > 0 && '→ '}{name}</button>
                    ))}
                  </figcaption>
                  <ImageReveal className="rounded" fx="wipe">
                  <div className="relative aspect-[3/5] overflow-hidden md:aspect-[630/809]" style={{ backgroundColor: INV_INK.ground }}>
                    {screens.map(([name, label, src], k) => (
                      <div key={name} aria-hidden={k !== screen} className="absolute inset-0 flex items-center justify-center p-6 text-center" style={{ opacity: k === screen ? 1 : 0, transition: 'opacity 0.5s ease' }}>
                        {src && /\.mp4$/i.test(src)
                          ? <PhoneScreen src={src} alt={name} videoRef={(v) => { coverVids.current[k] = v; }} onEnded={() => { if (playing) setScreen((n) => (n + 1) % screens.length); else { const v = coverVids.current[k]; if (v) { v.currentTime = 0; v.play().catch(() => {}); } } }} />
                          : src ? <PhoneScreen src={src} alt={name} /> : <span className="text-xs" style={{ ...monoStyle, color: INV_INK.muted }}>{label}</span>}
                      </div>
                    ))}
                  </div>
                  </ImageReveal>
                </figure>
                <Slot className="col-span-9 md:col-span-3" ratio="aspect-[900/1948]" caption={'\u00a0'} delay={420} fx="wipe" src="images/work/ii/appstore-1.jpg" full round label={t('App Store', '앱스토어')} />
              </div>
              </Reveal>
            </div>
          </div>
        </div>

        <CaseSummary monoStyle={monoStyle} titleStyle={titleStyle} rows={[
            [t('Problem', '문제'), t('The idea behind this app is not intuitive. It doesn’t help you trade more. It shows whether your decisions did better than simply buying the S&P. Competitors talk about features, and no one talks about performance. An idea this unfamiliar only lands if every place says it the same way.', '이 앱의 생각은 직관적이지 않다. 더 많이 거래하게 돕는 대신, 내 결정이 그냥 S&P를 산 것보다 나았는지를 보여준다. 경쟁사들은 기능을 말하고, 성과를 말하는 곳은 없다. 이렇게 낯선 생각은 광고에서도, 웹사이트에서도, 대시보드에서도 같은 방식으로 말해야 비로소 전달된다.')],
            [t('Direction', '디렉션'), t('I gave it one sentence, said one way: pause, and see your performance next to the S&P 500. That sentence is the logo, the message of the campaigns, and the second line on the dashboard chart. I don’t design brand, product and marketing separately. All three start from the same rules and the same design system.', '그 생각을 한 문장으로, 한 방식으로 말하게 했다. 멈추고, 성과를 S&P 500 옆에서 볼 것. 그 문장이 로고가 되고, 캠페인의 메시지가 되고, 대시보드 차트의 두 번째 선이 된다. 나는 브랜드와 제품, 마케팅을 따로 디자인하지 않는다. 셋 다 같은 규칙과 같은 디자인 시스템에서 시작한다.')],
            [t('Result', '결과'), t('From the first post to the dashboard, the app says the same thing: how you did against the market, even when you trailed. It launched after beta, and my design system became the product team’s standard.', '첫 게시물부터 대시보드까지, 앱은 같은 말을 한다. 시장과 비교해 당신이 어땠는지, 졌을 때도. 앱은 베타를 거쳐 출시됐고, 내 디자인 시스템은 제품 팀의 기준이 됐다.')]
          ]} />

        {/* 01 · the question, one statement on the same white page */}
        <section className="pb-16 pt-16 md:pb-40 md:pt-40">
          <div className={`${frame} ${grid}`}>
            <p className={`col-span-12 mb-6 md:col-span-3 md:mb-0 md:pt-3 ${labelCls}`} style={labelStyle}>{t('01 · Learn what matters', '01 · 중요한 것을 알아낸다')}</p>
            <ScrollLitText
              className="col-span-12 m-0 text-2xl leading-[1.25] md:col-span-6 md:col-start-4 md:text-[36px] md:leading-[1.2]"
              style={{ ...titleStyle, fontWeight: 400, color: u.title, letterSpacing: '-0.01em' }}
              parts={ko
                ? [['투자 앱은 거래가 많을수록 돈을 번다. 그래서 매수까지의 단계를 줄여 몇 번의 탭이면 거래가 끝나고, 오르내림은 초록과 빨강으로 크게 보여준다. 거래가 쉬울수록 생각할 틈은 줄어든다. 이 회사는 반대를 원했다. 액티브 투자자가 덜 거래하고 더 좋은 결정을 내리게 하는 것. 그렇다면 앱이 답해야 할 질문은 “돈을 벌었는가?”가 아니다.'], [' 그냥 S&P를 샀다면 내 돈은 더 많았을까, 적었을까?', true]]
                : [['Investing apps earn more when you trade more. So buying takes a few taps, and every move flashes green or red. The easier the trade, the less room to think. This company wanted the opposite: active investors who trade less and decide better. So the question the app had to answer was not “did I make money?”'], [' It was: would I have more or less money if I had simply bought the S&P?', true]]}
            />
          </div>
        </section>
      </header>

      {sec(t('02 · Choose a direction', '02 · 방향을 정한다'),
        t('The brand started with one word. Pause.', '브랜드는 한 단어에서 시작했다. 멈춤.'),
        <>
          <p className={bodyP} style={{ color: u.body }}>
            {t('The CEO wanted an app without the dopamine, one that helps active investors decide better and allocate with care. I started with the logo. The symbol is the two I’s of Intelligent Investing, set side by side so they also read as a pause sign. It works on its own or with the wordmark. The visual language avoids the usual fintech polish. It is a little raw, a little empty, a little unfamiliar: enough edge to make people look twice, never enough to get in their way.', 'CEO는 도파민을 덜어낸 앱을 원했다. 액티브 투자자가 더 나은 결정을 내리고 신중하게 배분하도록 돕는 앱. 나는 로고부터 시작했다. 심볼은 Intelligent Investing의 두 I를 나란히 세운 것이고, 그대로 일시정지 기호로도 읽힌다. 심볼만으로도, 워드마크와 함께도 쓴다. 비주얼 언어는 흔한 핀테크의 매끈함을 피했다. 조금은 날것이고, 조금은 비어 있고, 조금은 낯설다. 다시 보게 만들 만큼의 엣지, 하지만 쓰는 데 걸리적거리지 않을 만큼만.')}
          </p>
          {/* symbol construction: two I's, the mark, a pause */}
          <ImageReveal className="mt-10 md:mt-16 rounded" dir="left">
          <div className="aspect-[2/1]" style={specStyle}>
            <IILogoSheet />
          </div>
          </ImageReveal>
          <p className={`mt-12 md:mt-24 ${smallCls} md:w-[${frameCols(6)}]`} style={{ color: u.body }}>
            {t('We agreed on four rules for performance. They hold on every screen.', '성과에는 네 가지 규칙을 정했다. 모든 화면에서 지켜진다.')}
          </p>
        </>,
        u.overlayBg,
        <div className={`${grid} mt-10 md:mt-16 items-start gap-y-8 md:gap-y-12`}>
          {/* out of order on purpose: first, third, fourth, then second */}
          {rules.map(([title, copy, ratio], k) => (
            <div key={title} className="col-span-12 sm:col-span-6 md:col-span-3">
              <Slot ratio={ratio} ground={WHITE} delay={[0, 460, 170, 310][k]} fx="rise" ordered={false} full src={`images/work/ii/rulet-${k + 1}.png`} />
              <Reveal delay={[0, 460, 170, 310][k] + 500} y={8}>
                <p className={`mt-4 md:mt-6 ${smallCls}`} style={{ color: u.body }}><b style={strongStyle}>{title}</b> {copy}</p>
              </Reveal>
            </div>
          ))}
        </div>
      )}

      {sec(t('03 · Communication', '03 · 커뮤니케이션'),
        t('Before the app opens.', '앱을 열기 전부터.'),
        <>
          <p className={bodyP} style={{ color: u.body }}>
            {t('Most people meet the brand before they meet the app: an ad, then the website, then the app store, then sign-up. I set the tone and structure for marketing and made the first reels in a new format, and the team built on them. Campaigns start from the CEO’s concept. I shape the direction and copy, review it with him, then make the carousels, reels and ads.', '대부분의 사람은 앱보다 브랜드를 먼저 만난다. 광고, 웹사이트, 앱스토어, 그리고 가입. 나는 마케팅의 톤과 구조를 정하고, 새로운 형식으로 첫 릴스들을 만들어 기준을 세웠고, 팀은 그 위에서 이어갔다. 캠페인은 CEO의 콘셉트에서 시작한다. 내가 방향과 카피를 다듬고 CEO와 함께 검토한 뒤, 캐러셀과 릴스, 광고를 만든다.')}
          </p>
          <ul className="m-0 mt-10 list-none p-0 text-sm leading-[1.7]" style={{ color: u.title }}>
            {[t('Reels', '릴스'), t('Sign-up intro', '가입 인트로'), t('Instagram carousels', '인스타그램 캐러셀'), t('App Store', '앱스토어')].map((x) => <li key={x}>{x}</li>)}
          </ul>
        </>,
        WHITE,
        <Reveal className="mt-24 md:mt-32">
          <CaseStrip monoStyle={monoStyle} label={t('Selected work', '작업')} items={[['images/work/ii/reel.mp4', 'Reel'], ['images/work/ii/signup-intro.mp4', 'Sign-up intro'], ['images/work/ii/carousel-1.jpg', 'Instagram carousel'], ['images/work/ii/carousel-2.jpg', 'Instagram carousel'], ['images/work/ii/carousel-3.jpg', 'Instagram carousel'], ['images/work/ii/carousel-4.jpg', 'Instagram carousel'], ['images/work/ii/carousel-5.jpg', 'Instagram carousel'], ['images/work/ii/carousel-6.jpg', 'Instagram carousel'], ['images/work/ii/appstore-2.jpg', 'App Store'], ['images/work/ii/appstore-3.jpg', 'App Store'], ['images/work/ii/appstore-4.jpg', 'App Store'], ['images/work/ii/appstore-5.jpg', 'App Store'], ['images/work/ii/appstore-6.jpg', 'App Store'], ['images/work/ii/appstore-7.jpg', 'App Store'], ['images/work/ii/appstore-8.jpg', 'App Store'], ['images/work/ii/appstore-9.jpg', 'App Store'], ['images/work/ii/appstore-10.jpg', 'App Store']]} />
        </Reveal>
      )}

      {sec(t('04 · Product', '04 · 제품'),
        t('A report card and a mistake log. It scores what you bought, and how much you put behind it.', '성적표이자 오답 노트. 무엇을 샀는지, 그리고 얼마를 걸었는지를 채점한다.'),
        <>
          <p className={bodyP} style={{ color: u.body }}>
            {t('The dashboard has two sides: a Managed portfolio run for you, and Self-directed, where you invest yourself. This case is about Self-directed, where every screen measures your decisions against the S&P. The CEO prototypes the product logic. I turn it into the interface and the design system the team builds on.', '대시보드는 두 부분으로 나뉜다. 대신 운용해 주는 Managed 포트폴리오, 그리고 직접 투자하는 Self-directed. 이 케이스는 Self-directed에 관한 것이고, 여기서는 모든 화면이 내 결정을 S&P와 비교한다. 제품의 로직은 CEO가 프로토타입으로 잡고, 나는 그것을 인터페이스와 팀이 쓰는 디자인 시스템으로 완성한다.')}
          </p>
        </>,
        u.overlayBg,
        <Reveal className="mt-10 md:mt-16">
          <InvStepper ko={ko} numbered screens monoStyle={monoStyle} titleStyle={titleStyle} items={steps.map(([src, alt, kicker, title, line, slot]) => ({ src, alt, kicker, title, line, slot }))} />
        </Reveal>
      )}

      {sec(t('05 · Notes', '05 · 메모'),
        t('A pause you are forced into is homework.', '멈춤도 강요하면 숙제가 된다.'),
        <>
          <p className={bodyP} style={{ color: u.body }}>
            {t('The company wanted investors to write down why they buy, and the CEO wanted it inside the buy and sell flow. We refined a five-screen version for a long time. The feedback never changed: it feels like homework. I took it to three people outside the company and brought their answers back to the team.', '회사는 투자자가 왜 사는지 적어두기를 원했고, CEO는 그걸 매수·매도 흐름 안에 넣고 싶어 했다. 5장짜리 흐름을 오래 다듬었다. 피드백은 한 번도 바뀌지 않았다. 숙제 같다는 것. 나는 회사 밖 세 사람에게 직접 보여주고, 그 답을 팀에 가져왔다.')}
          </p>
          <div className="mt-10 md:mt-16 hidden md:block">
            <Slot ratio="aspect-[960/465]" fx="settle" src="images/work/ii/memo-old-flow.jpg" full round label={t('Five-screen notes flow inside buy and sell', '매수·매도 안의 5장짜리 메모 흐름')} caption={t('The old flow: five screens between you and the trade.', '이전 흐름: 거래 앞에 놓인 다섯 장.')} />
          </div>
          <div className="mt-8 md:mt-12 md:hidden">
            <CaseStrip phoneTall monoStyle={monoStyle} label={t('The old flow: five screens between you and the trade.', '이전 흐름: 거래 앞에 놓인 다섯 장.')} items={[1, 2, 3, 4, 5].map((n) => [`images/work/ii/memo-flow-${n}.jpg`, t('Old notes flow', '이전 메모 흐름')])} />
          </div>
        </>,
        u.overlayBg,
        <Reveal className="mt-16 md:mt-24">
          <InvStepper ko={ko} screens monoStyle={monoStyle} titleStyle={titleStyle} items={noteRows.map(([src, alt, kicker, title, line, slot, frames]) => ({ src, alt, kicker, title, line, slot, frames }))} />
        </Reveal>
      )}

      {sec(t('06 · How I work with AI', '06 · AI로 일하는 방식'),
        t('AI for speed, for less waste, and for a higher bar. The final call stays human.', 'AI로 빠르게, 덜 낭비하게, 기준은 더 높게. 마지막 판단은 사람이 한다.'),
        <>
          {/* Three lanes, one column each: speed, efficiency, quality. Label,
              a wide breath, the line in bold, the steps one per line, then a note. */}
          <div className="mt-10 md:mt-16 grid grid-cols-9 gap-x-4 gap-y-10 md:gap-y-16 sm:gap-x-6">
            {lanes.map(([lane, flow, note, detail], k) => (
              <Reveal key={lane} delay={k * 120} className="col-span-9 md:col-span-3">
                <p className={`m-0 ${labelCls}`} style={labelStyle}>{lane}</p>
                <div className="mt-6 md:mt-10">
                  <div>
                    <p className="m-0 text-base leading-[1.6]" style={strongStyle}>{note}</p>
                    <ol className="m-0 mt-3 list-none p-0 text-base leading-[1.6]" style={{ color: u.body }}>
                      {flow.map((st) => <li key={st}>{st}</li>)}
                    </ol>
                  </div>
                  {detail && <p className="m-0 mt-6 text-base leading-[1.6]" style={{ color: u.body }}>{detail}</p>}
                </div>
              </Reveal>
            ))}
          </div>
        </>,
        WHITE
      )}

      {/* Outcome, set like 01: one statement that lights up as it is read,
          the results in plain sentences and the verdict last, in bold. */}
      <section className={sectionCls} style={{ backgroundColor: u.overlayBg }}>
        <div className={`${frame} ${grid}`}>
          <p className={`col-span-12 mb-6 md:col-span-3 md:mb-0 md:pt-3 ${labelCls}`} style={labelStyle}>{t('Outcome', '결과')}</p>
          <ScrollLitText
            className="col-span-12 m-0 text-2xl leading-[1.25] md:col-span-6 md:col-start-4 md:text-[36px] md:leading-[1.2]"
            style={{ ...titleStyle, fontWeight: 400, color: u.title, letterSpacing: '-0.01em' }}
            parts={ko
              ? [['한 단어, 멈춤에서 시작했다. 그 단어가 로고가 되고, 모든 화면의 규칙이 되고, 캠페인의 톤이 됐다.'], [' 졌을 때도 졌다고 말하는 앱.', true]]
              : [['It began with one word, pause, and that word became the logo, the rules on every screen and the tone of the campaigns.'], [' An app willing to say you trailed.', true]]}
          />
        </div>
      </section>
    </div>
  );
}

/* ---------- Case kit: the II case's layout, shared by AutoSync and MotoInsight ----------
   Same grid, spacing and type as InvestingCase: section 160 top/bottom, title to
   body 32, text to media 64, block to block 96; titles 36 semibold, statements
   36 regular, body 18, small 16, labels 12 mono. */
function useCaseKit(monoStyle, titleStyle) {
  const u = DETAIL_UI;
  const ko = useKo();
  const t = (en, kr) => (ko ? kr : en);
  const frame = `${PAGE_FRAME} ${WORK_PAGE_GUTTER_X}`;
  const grid = 'grid grid-cols-12 gap-x-4 sm:gap-x-6';
  const sectionCls = 'py-16 md:py-40';
  const bodyP = `mt-8 text-lg leading-[1.6] md:w-[${frameCols(6)}]`;
  const labelCls = 'text-xs';
  const labelStyle = { ...monoStyle, color: u.meta };
  const semi = { ...titleStyle, fontWeight: 600, color: u.title };
  const strongStyle = { fontWeight: 600, color: u.title };
  const WHITE = '#ffffff';
  const sec = (label, lead, body, ground = u.overlayBg, wide = null) => (
    <section className={sectionCls} style={{ backgroundColor: ground }}>
      <div className={`${frame} ${grid}`}>
        <p className={`col-span-12 mb-6 md:col-span-3 md:mb-0 md:pt-3 ${labelCls}`} style={labelStyle}>{label}</p>
        <div className="col-span-12 md:col-span-9 md:col-start-4">
          <Reveal>
            <h2 className="m-0 text-2xl leading-[1.2] md:text-[36px] md:leading-[1.15]" style={{ ...semi, letterSpacing: '-0.01em' }}>{lead}</h2>
          </Reveal>
          {body && <Reveal delay={120}>{body}</Reveal>}
        </div>
      </div>
      {wide && <div className={frame}>{wide}</div>}
    </section>
  );
  /* a statement section, like II's 01 and Outcome: lights up as it is read */
  const statement = (label, parts, ground = u.overlayBg, after = null, inHeader = false) => {
    const Tag = inHeader ? 'div' : 'section';
    return (
      <Tag className={inHeader ? 'pb-16 pt-16 md:pb-40 md:pt-40' : sectionCls} style={inHeader ? undefined : { backgroundColor: ground }}>
        <div className={`${frame} ${grid}`}>
          <p className={`col-span-12 mb-6 md:col-span-3 md:mb-0 md:pt-3 ${labelCls}`} style={labelStyle}>{label}</p>
          <ScrollLitText
            className="col-span-12 m-0 text-2xl leading-[1.25] md:col-span-6 md:col-start-4 md:text-[36px] md:leading-[1.2]"
            style={{ ...titleStyle, fontWeight: 400, color: u.title, letterSpacing: '-0.01em' }}
            parts={parts}
          />
          {after && <div className="col-span-12 mt-10 md:mt-16 md:col-span-9 md:col-start-4">{after}</div>}
        </div>
      </Tag>
    );
  };
  return { u, ko, t, frame, grid, bodyP, labelCls, labelStyle, semi, strongStyle, WHITE, sec, statement };
}

/** A picture or a short film in a frame: video plays silently on a loop,
 *  anything else is an image. `fit` is contain (the whole piece, matted on
 *  the well) unless a frame asks to be filled. */
/** The pictures a step keeps, by their number in the full set (1-based). */
const keep = (all, nums) => nums.map((n) => all[n - 1]);

/** Where a cropped picture keeps its weight: pages and screens hold their top
 *  (the header, the first fold), everything else its centre. Art-directed
 *  per picture where the centre would miss the point. */
const CASE_FOCUS = [
  [/autosync\/ga4-(0[89]|1[0-2])\.|motoinsight\/(web-|block-|banner-|genesis-(book|kit|trim)|honda-[1-5]|ds-|sales-3|campaign-[23]|cover-3)/, 'center top']
];
const caseFocus = (src) => (CASE_FOCUS.find(([re]) => re.test(src)) || [, 'center'])[1];

/** A phone screen shown whole: never cropped to its frame, always the same
    shape, centred on the frame's ground at the same share of its height, so
    every screen on the page reads at one size. */
function PhoneScreen({ src, alt = '', pad = '8%', videoRef, onEnded, loop = true }) {
  const isVideo = /\.mp4$/i.test(src);
  const style = { height: '100%', width: 'auto', maxWidth: '100%', aspectRatio: '390 / 844', objectFit: 'cover', objectPosition: 'top', borderRadius: 10, display: 'block', boxShadow: '0 0 0 1px rgba(255,255,255,0.14)' };
  return (
    <div className={`absolute inset-0 flex items-center justify-center ${pad === '8%' ? 'py-[5%] md:py-[8%]' : ''}`} style={pad === '8%' ? undefined : { padding: `${pad} 0` }}>
      {isVideo
        ? <video ref={videoRef} src={src} style={style} autoPlay={!videoRef} muted loop={!onEnded && loop} playsInline preload="auto" aria-label={alt} onEnded={onEnded} />
        : <img src={src} alt={alt} loading="lazy" style={style} />}
    </div>
  );
}

function CaseMedia({ src, alt = '', fit = 'contain', className = '' }) {
  const d = CASE_ASSET_DIMS[src];
  const isVideo = /\.mp4$/i.test(src);
  const tall = d && d[1] / d[0] > 1.6;
  // every frame has one ratio for its section; a picture is cropped to it,
  // around its focus, unless that would cut too much of it (ratios more than
  // 1.5x apart) or blow it up past 1.25x its own pixels: then it sits whole,
  // centred on the plain ground, with no fill and no effect
  const box = useRef(null);
  const [geo, setGeo] = useState(null);
  const [pan, setPan] = useState(false);
  useLayoutEffect(() => {
    const el = box.current;
    if (!el || !d) return undefined;
    const m = () => {
      const r = el.getBoundingClientRect();
      if (r.width && r.height) setGeo({ w: r.width, h: r.height });
    };
    m();
    const ro = new ResizeObserver(m);
    ro.observe(el);
    return () => ro.disconnect();
  }, [src]);
  const el = (cls, style) => (isVideo
    ? <video src={src} className={cls} style={style} autoPlay muted loop playsInline aria-label={alt} />
    : <img src={src} alt={alt} loading="lazy" className={cls} style={style} />);
  let crop = fit === 'cover';
  if (!crop && d && geo && !tall) {
    const k = (geo.w / geo.h) / (d[0] / d[1]);
    const up = Math.max(geo.w / d[0], geo.h / d[1]);
    crop = k < 1.5 && k > 1 / 1.5 && up <= 1.25;
  }
  // a very tall page (a full-scroll screenshot): shown at the frame's width
  // from the top, no scrollbar; hovering (or a tap) lets it glide down to its
  // end and back, like scrolling the page itself
  const shift = tall && geo ? Math.max(0, Math.round(Math.min(geo.w, d[0]) * d[1] / d[0] - geo.h)) : 0;
  return (
    <div
      ref={box}
      className={`absolute inset-0 overflow-hidden ${tall ? 'cursor-ns-resize' : 'flex items-center justify-center'}`}
      onMouseEnter={tall ? () => setPan(true) : undefined}
      onMouseLeave={tall ? () => setPan(false) : undefined}
      onClick={tall ? () => setPan((v) => !v) : undefined}
    >
      {tall
        ? el(`mx-auto block h-auto ${className}`, {
          width: '100%',
          maxWidth: d[0],
          transform: pan ? `translateY(-${shift}px)` : 'none',
          transition: `transform ${Math.max(1.6, shift / 260).toFixed(2)}s cubic-bezier(.45,0,.25,1)`
        })
        : crop
          ? el(`absolute inset-0 h-full w-full object-cover ${className}`, { objectPosition: caseFocus(src) })
          : el(`block h-auto w-auto object-contain ${className}`, d ? { maxWidth: `min(100%, ${d[0]}px)`, maxHeight: `min(100%, ${d[1]}px)` } : { maxWidth: '100%', maxHeight: '100%' })}
    </div>
  );
}

/** An image still to come, at the layout's ratio, caption above (II style). */
function CaseSlot({ monoStyle, label = '', caption, kind = '📷', ratio = 'aspect-[4/5]', ground, className = '', delay = 0, fx = 'auto', ordered = true, src, fit, frameRatio }) {
  const u = DETAIL_UI;
  const d = src && !frameRatio && CASE_ASSET_DIMS[src];
  const tall = d && d[1] / d[0] > 1.6;
  const natural = d && !tall;
  return (
    <figure className={`m-0 ${className}`} style={d ? { maxWidth: d[0] } : undefined}>
      <ImageReveal delay={delay} fx={fx} ordered={ordered} className="rounded" head={caption && <LateCaption delay={delay + 650} className="mb-3 text-xs" style={{ color: u.meta }}>{caption}</LateCaption>}>
        <div
          className={`relative flex ${d ? '' : ratio} items-center justify-center overflow-hidden ${src ? '' : 'p-6'} text-center text-xs`}
          style={{ ...monoStyle, aspectRatio: frameRatio ? `1 / ${frameRatio}` : natural ? `${d[0]} / ${d[1]}` : (tall ? '4 / 5' : undefined), backgroundColor: natural ? 'transparent' : (ground || u.imageWell), color: u.placeholderText }}
        >
          {src ? <CaseMedia src={src} alt={caption || label} fit={natural ? 'cover' : (fit || 'contain')} /> : <>{kind} {label}</>}
        </div>
      </ImageReveal>
    </figure>
  );
}

const AUTOSYNC_SEGMENTS = [{"d": "M7.94,2.27 L1.86,5.76 L1.59,5.99 L1.59,9.07 L2.86,9.84 L2.99,9.80 L3.09,6.81 L6.49,4.81 L6.67,4.81 L6.76,4.90 L6.76,12.02 L6.99,12.25 L8.12,12.84 L8.21,12.79 L8.21,2.27Z", "dx": -5.01, "dy": -4.06}, {"d": "M18.51,3.72 L12.25,0.05 L11.89,0.00 L9.30,1.54 L9.30,2.99 L9.53,3.09 L11.84,1.72 L12.11,1.68 L15.43,3.58 L15.56,3.72 L15.56,3.86 L14.74,4.40 L9.35,7.49 L9.30,8.98 L9.39,9.07 L9.57,9.07 L18.24,4.08 L18.51,3.86Z", "dx": 0.93, "dy": -5.53}, {"d": "M13.25,8.17 L13.25,8.30 L13.52,8.53 L22.09,13.47 L22.46,13.47 L22.46,5.99 L19.87,4.45 L19.55,4.49 L18.56,5.08 L18.42,5.26 L19.28,5.85 L20.78,6.67 L21.01,6.90 L21.01,10.84 L20.87,10.98 L20.55,10.89 L14.61,7.44 L14.29,7.53Z", "dx": 4.34, "dy": -2.22}, {"d": "M15.88,11.16 L15.79,11.30 L15.79,21.60 L15.88,21.73 L16.02,21.73 L22.46,18.01 L22.46,14.93 L22.28,14.74 L21.32,14.20 L21.10,14.16 L21.01,14.25 L20.96,17.15 L20.69,17.38 L17.51,19.19 L17.33,19.15 L17.24,18.96 L17.24,11.89 L16.06,11.16Z", "dx": 4.95, "dy": 4.2}, {"d": "M14.74,15.02 L14.56,14.88 L5.63,20.01 L5.53,20.10 L5.53,20.28 L11.80,23.95 L12.20,23.95 L14.70,22.50 L14.74,21.01 L14.65,20.91 L14.47,20.91 L12.25,22.23 L11.98,22.32 L8.71,20.46 L8.48,20.28 L8.48,20.14 L9.35,19.55 L14.61,16.56 L14.74,16.42Z", "dx": -0.9, "dy": 5.53}, {"d": "M1.59,10.53 L1.54,17.92 L1.63,18.06 L4.22,19.55 L4.54,19.46 L5.58,18.83 L5.53,18.60 L3.67,17.56 L3.04,17.10 L3.04,13.16 L3.13,13.02 L3.58,13.16 L9.44,16.56 L9.57,16.56 L10.80,15.79 L10.62,15.52 L1.91,10.48 L1.68,10.43Z", "dx": -4.4, "dy": 2.26}];

/** Top-right marks for the AutoSync and MotoInsight heroes, traced from Ink's
 *  logo files and drawn in like the II mark.
 *  AutoSync: the six segments arrive one by one and lock into the hexagon,
 *  one segment per product. MotoInsight: the M builds from its three parts,
 *  the left bar, the V, then the right stroke. Both in ink, black and white. */
function CaseHeroMark({ kind, color, className = '' }) {
  const [on, setOn] = useState(prefersReduced());
  useEffect(() => {
    if (on) return undefined;
    const id = setTimeout(() => setOn(true), 250);
    return () => clearTimeout(id);
  }, []);
  if (kind === 'hexagon') {
    return (
      <svg viewBox="0 0 24 24" className={className} aria-label="AutoSync" role="img" style={{ overflow: 'visible' }}>
        {AUTOSYNC_SEGMENTS.map((sg, k) => (
          <path
            key={k}
            d={sg.d}
            fill={color}
            style={{
              opacity: on ? 1 : 0,
              transform: on ? 'none' : `translate(${sg.dx}px, ${sg.dy}px)`,
              transition: `opacity 0.8s ease ${k * 130}ms, transform 1.3s ${SLIDE_EASE} ${k * 130}ms`
            }}
          />
        ))}
      </svg>
    );
  }
  const part = (k, from) => ({
    clipPath: on ? 'inset(0 0 0 0)' : from,
    WebkitClipPath: on ? 'inset(0 0 0 0)' : from,
    transition: `clip-path 1.1s ${WIPE_EASE} ${k * 180}ms, -webkit-clip-path 1.1s ${WIPE_EASE} ${k * 180}ms`
  });
  return (
    <svg viewBox="58 65 216 175" className={className} aria-label="MotoInsight" role="img">
      <polygon points="59,65 58,240 108,240 108,65" fill={color} style={part(0, 'inset(100% 0 0 0)')} />
      <polygon points="274,65 224,65 163,150 158,145 124,87 120,84 121,167 166,232 274,91" fill={color} style={part(1, 'inset(0 0 100% 0)')} />
      <polygon points="274,112 224,178 224,240 274,240" fill={color} style={part(2, 'inset(100% 0 0 0)')} />
    </svg>
  );
}

/** The case hero: meta, years and name set right, then the headline row. */
function CaseHero({ monoStyle, titleStyle, metaItems, years, name, label, headline, body, media, mark }) {
  const k = useCaseKit(monoStyle, titleStyle);
  const { u, frame, grid, labelCls, labelStyle, semi, bodyP } = k;
  return (
    <div className="pt-12 md:pt-32">
      <div className={`${frame} flex flex-col md:block`}>
        <div className="mt-12 flex items-start justify-between gap-8 md:mt-0">
          <dl className="m-0">
            {metaItems.map(([a, b]) => (
              <div key={a} className="grid grid-cols-[88px_minmax(0,1fr)] gap-x-3 py-0.5">
                <dt className={labelCls} style={labelStyle}>{a}</dt>
                <dd className="m-0 text-[13px] leading-[1.5]" style={{ color: u.body }}>{b}</dd>
              </div>
            ))}
          </dl>
          {mark && <div className="hidden shrink-0 pt-1 md:block">{mark}</div>}
        </div>
        <div className="order-first md:order-none md:mt-32">
          {mark && <div className="mb-4 h-8 md:hidden [&>svg]:h-8 [&>svg]:w-auto">{mark}</div>}
          <p className="m-0 text-left text-3xl leading-[1.2] md:text-right md:text-[48px]" style={{ ...titleStyle, color: u.title }}>
            <span style={{ fontWeight: 400 }}>{years}</span>
            <br />
            <span style={{ fontWeight: 600 }}>{name}</span>
          </p>
        </div>
      </div>
      <div className={`${frame} mt-20 md:mt-64`}>
        <div className={grid}>
          <p className={`col-span-12 mb-6 md:col-span-3 md:mb-0 md:pt-4 ${labelCls}`} style={labelStyle}>{label}</p>
          <div className="col-span-12 md:col-span-9 md:col-start-4">
            <Reveal>
              <h1 className="m-0 text-4xl leading-[1.2] md:text-[48px]" style={{ ...semi, letterSpacing: '-0.01em' }}>{headline}</h1>
            </Reveal>
            <Reveal delay={200}>
              <p className={bodyP} style={{ color: u.body }}>{body}</p>
              {media && <div className="mt-10 md:mt-16">{media}</div>}
            </Reveal>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Three items side by side on the content field, like II's 04 principles:
 *  the number, a breath, then a bold first line and the text. */
function CasePrinciples({ monoStyle, titleStyle, items, numbered = true }) {
  const { u, labelCls, labelStyle, strongStyle } = useCaseKit(monoStyle, titleStyle);
  return (
    <div className="grid grid-cols-9 gap-x-4 gap-y-10 md:gap-y-16 sm:gap-x-6">
      {items.map(([title, copy], k) => (
        <Reveal key={title} delay={k * 120} className="col-span-9 md:col-span-3">
          {numbered && <p className={`m-0 mb-6 tabular-nums md:mb-10 ${labelCls}`} style={labelStyle}>{String(k + 1).padStart(2, '0')}</p>}
          <p className="m-0 text-base leading-[1.6]" style={{ color: u.body }}>
            <b className="block" style={strongStyle}>{title}</b>
            {copy}
          </p>
        </Reveal>
      ))}
    </div>
  );
}

/** The case in three lines, right under the hero: problem, direction,
 *  result. Laid out like the case rows elsewhere (label, then text), so it
 *  adds no new element; a reader who stops here still has the whole case. */
function CaseSummary({ monoStyle, titleStyle, rows }) {
  const { u, ko, frame, grid, labelCls, labelStyle } = useCaseKit(monoStyle, titleStyle);
  return (
    <section className="pt-16 md:pt-40">
      <div className={`${frame} ${grid}`}>
        <p className={`col-span-12 mb-6 md:col-span-3 md:mb-0 md:pt-1 ${labelCls}`} style={labelStyle}>{ko ? '요약' : 'In short'}</p>
        <div className="col-span-12 grid grid-cols-9 gap-x-4 gap-y-6 sm:gap-x-6 md:col-span-9">
          {rows.map(([label, text], k) => (
            <Reveal key={label} delay={k * 120} className="col-span-9 grid grid-cols-9 gap-x-4 sm:gap-x-6">
              <p className={`col-span-9 m-0 mb-2 md:col-span-3 md:mb-0 md:pt-1 ${labelCls}`} style={labelStyle}>{label}</p>
              <p className="col-span-9 m-0 text-lg leading-[1.5] md:col-span-6" style={{ color: u.title }}>{text}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/** Selected work as one strip that keeps moving: every piece at the same
 *  height and its own ratio, 4px apart, edge to edge across the screen. It
 *  drifts slowly on a loop; hovering eases it to a stop, and a drag or a
 *  sideways swipe moves it by hand, after which it drifts on. With reduced
 *  motion it stays still and moves only by hand. items: [[src, caption], ...] */
function CaseStrip({ monoStyle, items, label, phoneTall = false }) {
  const u = DETAIL_UI;
  const [h, setH] = useState(420);
  const row = useRef(null);
  const st = useRef({ x: 0, v: 0, target: 0, set: 0, drag: null, last: 0, seen: false, hover: false });
  const box = useRef(null);
  useLayoutEffect(() => {
    const measure = () => {
      const wide = window.matchMedia('(min-width: 768px)').matches;
      setH(wide ? Math.round(Math.min(window.innerHeight * 0.5, 520)) : (phoneTall ? Math.round(Math.min(window.innerHeight * 0.75, window.innerWidth * 1.45)) : Math.round(Math.min(window.innerWidth * 1.1, 440))));
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);
  useEffect(() => {
    const s = st.current;
    // it waits, still, until the strip is well on screen, then eases into
    // motion; off screen it stops again (checked each frame, so it also works
    // inside the case sheet's own scroller)
    const io = { disconnect() {} };
    let raf = 0;
    const tick = (now) => {
      const el = row.current;
      const bx = box.current;
      if (bx) {
        const r = bx.getBoundingClientRect();
        const seen = r.width > 0 && r.top < window.innerHeight * 0.85 && r.bottom > window.innerHeight * 0.15;
        if (seen !== s.seen) { s.seen = seen; if (!seen) s.v = 0; }
        s.target = s.seen && !s.hover && !prefersReduced() ? 70 : 0;
      }
      if (el) {
        if (!s.set) s.set = el.scrollWidth / 2;
        const dt = s.last ? Math.min(0.05, (now - s.last) / 1000) : 0;
        s.last = now;
        s.v += (s.target - s.v) * Math.min(1, dt * 1.2);
        if (!s.drag && s.seen) s.x += s.v * dt;
        if (s.set) s.x = ((s.x % s.set) + s.set) % s.set;
        el.style.transform = `translate3d(${-s.x}px,0,0)`;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => { cancelAnimationFrame(raf); io.disconnect(); };
  }, []);
  useEffect(() => { st.current.set = 0; }, [h, items.length]);
  const hold = (on) => { const s = st.current; s.hover = on; s.target = on || !s.seen || prefersReduced() ? 0 : 70; };
  const onDown = (e) => { st.current.drag = { x0: e.clientX, s0: st.current.x }; e.currentTarget.setPointerCapture(e.pointerId); };
  const onMove = (e) => { const d = st.current.drag; if (d) st.current.x = d.s0 - (e.clientX - d.x0); };
  const onUp = () => { st.current.drag = null; };
  const onWheel = (e) => { if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) st.current.x += e.deltaX; };
  const ratioOf = (src) => { const d = CASE_ASSET_DIMS[src] || [16, 9]; return d[0] / d[1]; };
  const groups = items.reduce((acc, it) => {
    const last = acc[acc.length - 1];
    if (ratioOf(it[0]) > 3 && last && ratioOf(last[0][0]) > 3 && last.length < 3) last.push(it); else acc.push([it]);
    return acc;
  }, []);
  const piece = (g, k) => {
    const cap = g[0][1];
    const media = (src, w, hh) => (/\.mp4$/i.test(src)
      ? <video key={src} src={src} autoPlay muted loop playsInline draggable={false} className="block" style={{ width: w, height: hh }} aria-label={cap} />
      : <img key={src} src={src} alt={cap} loading="lazy" draggable={false} className="block" style={{ width: w, height: hh }} />);
    // a run of very wide pieces (banners) stacks into one column of the strip's height
    if (g.length > 1 || ratioOf(g[0][0]) > 3) {
      const inv = g.reduce((acc, [src]) => acc + 1 / ratioOf(src), 0);
      const w = Math.round((h - 4 * (g.length - 1)) / inv);
      return (
        <figure key={k} className="m-0 shrink-0" style={{ width: w }}>
          <div className="flex flex-col gap-1" style={{ height: h, justifyContent: 'center' }}>{g.map(([src]) => media(src, w, Math.round(w / ratioOf(src))))}</div>
        </figure>
      );
    }
    const w = Math.round(h * ratioOf(g[0][0]));
    return <figure key={k} className="m-0 shrink-0" style={{ width: w }}>{media(g[0][0], w, h)}</figure>;
  };
  return (
    <div>
      <div className="mb-4 border-t pt-3" style={{ borderColor: u.border }}>
        <p className="m-0 text-xs" style={{ ...monoStyle, color: u.meta }}>{label}</p>
      </div>
      {/* full bleed: the strip runs from one edge of the screen to the other */}
      <div
        ref={box}
        className="cursor-grab select-none overflow-hidden active:cursor-grabbing"
        style={{ marginLeft: 'calc(50% - 50vw)', width: '100vw', touchAction: 'pan-y' }}
        onMouseEnter={() => hold(true)}
        onMouseLeave={() => { hold(false); onUp(); }}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
        onWheel={onWheel}
      >
        <div ref={row} className="flex gap-1" style={{ willChange: 'transform', width: 'max-content' }}>
          {groups.map((g, k) => piece(g, `a${k}`))}
          <div className="w-1 shrink-0" aria-hidden />
          {groups.map((g, k) => piece(g, `b${k}`))}
          <div className="w-1 shrink-0" aria-hidden />
        </div>
      </div>
    </div>
  );
}

/** A stepper's items, laid flat for a strip: one entry per picture, captioned
 *  with its step's name and, when there is one, the picture's own. */
const stripOf = (items) => items.flatMap((it) => {
  const name = it.nav || it.kicker || it.title;
  if (it.frames && it.frames.length) return it.frames.filter((f) => f[2]).map(([nm, , src]) => [src, nm && nm !== name ? `${name} · ${nm}` : name]);
  return it.media ? [[it.media, name]] : [];
});

/** Picture cards side by side, like II's 02 rules: a picture, then a bold
 *  first line and the text; they come in out of order. */
function CaseCards({ monoStyle, titleStyle, items, cols = 'md:col-span-3', field = 'grid-cols-9', ground, match }) {
  const { u, smallCls, strongStyle } = { ...useCaseKit(monoStyle, titleStyle), smallCls: 'text-base leading-[1.6]' };
  const tallest = match ? Math.max(...items.map(([, , , , , src]) => { const d = CASE_ASSET_DIMS[src]; return d ? d[1] / d[0] : 0; })) : 0;
  const order = [0, 340, 170, 460, 250, 80];
  return (
    <div className={`grid ${field} items-start gap-x-4 gap-y-6 md:gap-y-12 sm:gap-x-6`}>
      {items.map(([title, copy, label, ratio, kind, src], k) => (
        <div key={title} className={`${field === 'grid-cols-12' ? 'col-span-12 sm:col-span-6' : 'col-span-9'} ${cols}`}>
          <CaseSlot monoStyle={monoStyle} label={label} kind={kind} ratio={ratio || 'aspect-[4/3]'} ground={match || ground} frameRatio={tallest || undefined} delay={order[k % order.length]} fx="rise" ordered={false} src={src} />
          <Reveal delay={order[k % order.length] + 500} y={8}>
            <p className={`mt-4 md:mt-6 ${smallCls}`} style={{ color: u.body }}><b style={strongStyle}>{title}</b> {copy}</p>
          </Reveal>
        </div>
      ))}
    </div>
  );
}

/** The II cover, for any case: a run of screens plays in one frame, the
 *  sequence written above it; once the cover has been seen and scrolled
 *  past, it stops on the last screen. */
function CaseCover({ monoStyle, screens, className = '' }) {
  const u = DETAIL_UI;
  const [i, setI] = useState(0);
  const [playing, setPlaying] = useState(true);
  const ref = useRef(null);
  const last = screens.length - 1;
  useEffect(() => {
    if (!playing || prefersReduced()) return undefined;
    const id = setInterval(() => setI((n) => (n + 1) % screens.length), 1600);
    return () => clearInterval(id);
  }, [playing]);
  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    let seen = false;
    const io = new IntersectionObserver(([e]) => {
      if (e.intersectionRatio >= 0.5) seen = true;
      else if (seen) { setPlaying(false); setI(last); }
    }, { threshold: [0.5] });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <figure ref={ref} className={`m-0 ${className}`}>
      <figcaption className="mb-3 flex flex-wrap gap-x-2 text-xs" style={{ color: u.meta }}>
        {screens.map(([name], k) => (
          <button key={name} type="button" onClick={() => { setI(k); setPlaying(false); }} className="cursor-pointer border-0 bg-transparent p-0 text-xs" style={{ color: k === i ? u.title : u.placeholderText, transition: 'color 0.3s ease' }}>
            {k > 0 && '→ '}{name}
          </button>
        ))}
      </figcaption>
      <ImageReveal className="rounded" fx="wipe">
        <div className="relative aspect-square overflow-hidden" style={{ backgroundColor: INV_INK.ground }}>
          {screens.map(([name, label, src], k) => (
            <div key={name} aria-hidden={k !== i} className="absolute inset-0 flex items-center justify-center p-6 text-center" style={{ opacity: k === i ? 1 : 0, transition: 'opacity 0.5s ease' }}>
              {src ? <CaseMedia src={src} alt={name} fit="cover" /> : <span className="text-xs" style={{ ...monoStyle, color: INV_INK.muted }}>{label}</span>}
            </div>
          ))}
        </div>
      </ImageReveal>
    </figure>
  );
}

/** The II 02 logo tile: a dark 2:1 frame (a picture to come). */
function CaseLogoTile({ monoStyle, label, src, fit = 'cover' }) {
  const d = src && CASE_ASSET_DIMS[src];
  return (
    <ImageReveal className="mt-10 md:mt-16 rounded" dir="left" style={d ? { maxWidth: d[0] } : undefined}>
      <div className={`relative flex ${d ? '' : 'aspect-[2/1]'} items-center justify-center overflow-hidden text-xs`} style={{ ...monoStyle, aspectRatio: d ? `${d[0]} / ${d[1]}` : undefined, backgroundColor: DARK_ROW_UI.imageWell, color: MUTED_ON_DARK }}>
        {src ? <CaseMedia src={src} alt={label} fit={fit} /> : <>📷 {label}</>}
      </div>
    </ImageReveal>
  );
}

/** The II Communication spread: two portraits (4 + 5 columns) on the content
 *  field, then a wide pair on columns 1–8 and one more on 7–11. */
function CaseSpread({ monoStyle, a, b, wide, wide2, side }) {
  const grid = 'grid grid-cols-12 gap-x-4 sm:gap-x-6';
  // the spread's frames are filled edge to edge (the work is cropped, not matted)
  const S = (p) => <CaseSlot monoStyle={monoStyle} {...p} />;
  return {
    inField: (
      <div className="mt-10 md:mt-16 grid grid-cols-9 items-start gap-x-4 gap-y-8 sm:gap-x-6">
        {S({ className: 'col-span-9 sm:col-span-4', ratio: 'aspect-[413/652]', fx: 'rise', ...a })}
        {S({ className: 'col-span-9 sm:col-span-5', ratio: 'aspect-[520/826]', fx: 'slide', delay: 220, ...b })}
      </div>
    ),
    wide: (
      <div className={`${grid} mt-12 md:mt-24 gap-y-10 md:gap-y-24`}>
        <div className="col-span-12 space-y-6 md:col-span-8">
          {S({ ratio: 'aspect-[822/555]', fx: 'slide', ...wide })}
          {wide2 && S({ ratio: 'aspect-[822/555]', fx: 'slide', delay: 240, ...wide2 })}
        </div>
        {side && S({ className: 'col-span-12 sm:col-span-8 md:col-span-5 md:col-start-7', ratio: 'aspect-[520/826]', fx: 'slide', ...side })}
      </div>
    )
  };
}

/** AutoSync case, in the II case's layout. Every sentence comes from the old
 *  site's AutoSync and GA4 pages or from facts Ink confirmed; see
 *  _reference/autosync-case-copy.md. Pictures: public/images/work/autosync,
 *  each shown at its own ratio and never larger than it was made. */
function AutoSyncCase({ monoStyle, titleStyle }) {
  const { u, ko, t, bodyP, WHITE, sec, statement } = useCaseKit(monoStyle, titleStyle);
  const S = (p) => <CaseSlot monoStyle={monoStyle} {...p} />;
  const P = 'images/work/autosync/';
  const range = (n, f) => Array.from({ length: n }, (_, k) => f(k + 1));

  const metaItems = [
    [t('Company', '회사'), t('A Trader division that brings its automotive software together', 'Trader의 자동차 소프트웨어를 한데 모은 디비전')],
    [t('Role', '역할'), t('Visual Designer', '비주얼 디자이너')],
    [t('Scope', '범위'), t('Identity · System · Marketing', '아이덴티티 · 시스템 · 마케팅')],
    [t('Team', '팀'), t('Leadership, marketing', '경영진, 마케팅')]
  ];
  const rules = [
    [t('One hexagon, in the same place.', '헥사곤 하나, 같은 자리.'), t('Every logo carries the same hexagon, in the same spot. That’s the thread.', '모든 로고가 같은 자리에 같은 헥사곤을 단다. 그게 하나로 잇는 실이다.'), `${P}subbrand-1.png`],
    [t('One color per product.', '제품마다 한 가지 색.'), t('Color lives inside the hexagon. The rest of the logo stays monotone, so six colors never fight.', '색은 헥사곤 안에만 있다. 로고의 나머지는 모노톤이라, 여섯 색이 서로 부딪히지 않는다.'), `${P}subbrand-2.png`],
    [t('Templates within the rules.', '규칙 안의 템플릿.'), t('Teams make their own decks and posts from templates. The rules are already built in.', '팀들은 템플릿으로 덱과 포스트를 직접 만든다. 규칙은 이미 그 안에 들어 있다.'), `${P}pres-01.jpg`]
  ];
  const comms = [
    { kicker: t('Presentation', '프레젠테이션'), title: t('One template, every presentation.', '템플릿 하나, 모든 발표.'), line: t('The base for internal and external decks, with layouts from data-heavy analytics slides to marketing pages, so presenters add content and the deck stays on brand.', '사내외 발표의 기본 틀. 데이터 분석 슬라이드부터 마케팅 페이지까지 레이아웃을 갖춰, 발표자는 내용만 넣고 덱은 브랜드를 지킨다.'), frames: keep(range(13, (k) => [null, '', `${P}pres-${String(k).padStart(2, '0')}.jpg`]), [1, 3, 7, 9, 10]) },
    { kicker: t('Landing · social · email', '랜딩 · 소셜 · 이메일'), title: t('One system, three formats.', '시스템 하나, 형식 셋.'), line: t('A landing page, social ads and an email banner, built from the same parts. The hexagon, brand color and type do the work, with a clear hierarchy and one strong call to action.', '랜딩 페이지, 소셜 광고, 이메일 배너를 같은 재료로 만들었다. 헥사곤과 브랜드 컬러, 타입이 일을 하고, 위계는 분명하게, CTA는 하나로 강하게.'), frames: keep(range(7, (k) => [null, '', `${P}lse-${k}.jpg`]), [1, 2, 5]) },
    { kicker: t('Webinar', '웨비나'), title: t('One webinar, every touchpoint.', '웨비나 하나, 모든 접점.'), line: t('A Google Analytics 4 webinar with PCG, in the AutoSync identity: the deck, the landing pages, the emails and the social posts.', 'PCG와 함께한 Google Analytics 4 웨비나. 덱, 랜딩 페이지, 이메일, 소셜 포스트까지 AutoSync 아이덴티티로.'), frames: keep([
      ...range(7, (k) => [t('Deck', '덱'), '', `${P}ga4-${String(k).padStart(2, '0')}.jpg`]),
      [t('Landing', '랜딩'), '', `${P}ga4-08.jpg`], [t('Landing', '랜딩'), '', `${P}ga4-09.jpg`],
      [t('Email', '이메일'), '', `${P}ga4-10.jpg`], [t('Email', '이메일'), '', `${P}ga4-11.jpg`], [t('Email', '이메일'), '', `${P}ga4-12.jpg`],
      [t('Social', '소셜'), '', `${P}ga4-13.jpg`], [t('Social', '소셜'), '', `${P}ga4-14.jpg`]
    ], [1, 5, 8, 10, 14]) },
    { kicker: t('Motion', '모션'), title: t('An intro in the same identity.', '같은 아이덴티티의 인트로.'), line: t('An animated intro for Shorts and YouTube: the AutoSync logo on the hexagon pattern, in the same colors and type as the rest of the system.', '쇼츠·유튜브용 애니메이션 인트로. 헥사곤 패턴 위의 AutoSync 로고를, 시스템의 다른 자료와 같은 컬러와 타입으로.'), media: `${P}motion.mp4` },
    { kicker: t('Holiday', '홀리데이'), title: t('A holiday card, animated.', '움직이는 연말 카드.'), line: t('The 2022 holiday card, animated in the same identity: a bilingual greeting, Happy Holidays and Joyeuses Fêtes, signed from AutoSync.', '같은 아이덴티티로 움직이게 만든 2022년 연말 카드. Happy Holidays와 Joyeuses Fêtes, 두 언어로 인사하고 AutoSync의 이름으로 보냈다.'), media: `${P}holiday.mp4` }
  ];

  return (
    <div style={{ color: u.title, fontFamily: titleStyle.fontFamily, overflowX: 'clip' }}>
      <header style={{ backgroundColor: WHITE }}>
        <CaseHero
          monoStyle={monoStyle} titleStyle={titleStyle} metaItems={metaItems}
          years="2022–2025" name="AutoSync" label="2022–2025 · AutoSync"
          mark={<CaseHeroMark kind="hexagon" color={u.title} className="h-9 w-auto md:h-12" />}
          headline={<L en={<>Six products.<br />One thread.</>} ko={<>제품 여섯 개.<br />실 하나.</>} />}
          body={t('AutoSync, a division of Trader, brought six automotive software products together: TRFFK, TAdvantage, MotoInsight, EasyDeal, Activix and vAuto. On my own, I defined and built the brand framework that holds them together while each keeps its identity.', 'Trader의 디비전인 AutoSync는 자동차 소프트웨어 여섯 개를 한데 모았다. TRFFK, TAdvantage, MotoInsight, EasyDeal, Activix, vAuto. 나는 각자의 정체성을 지키면서 여섯을 하나로 묶는 브랜드 프레임워크를 혼자 정의하고 만들었다.')}
          media={<div className="grid grid-cols-9 items-start gap-x-4 gap-y-8 sm:gap-x-6">
            <CaseCover monoStyle={monoStyle} className="col-span-9 md:col-span-6" screens={[
              [t('Construction', '구성'), '', `${P}cover-1.jpg`],
              [t('Six segments', '여섯 조각'), '', `${P}cover-2.mp4`],
              ['AutoSync', '', `${P}cover-3.jpg`]
            ]} />
            {S({ className: 'col-span-9 md:col-span-3', fx: 'slide', delay: 420, caption: ' ', src: `${P}side.mp4` })}
          </div>}
        />
        <CaseSummary monoStyle={monoStyle} titleStyle={titleStyle} rows={[
            [t('Problem', '문제'), t('Six products, six logos, six teams, and one launch date. Some came from companies Trader had acquired, some were Trader’s own, and all of them still ran on their own.', '제품 여섯, 로고 여섯, 팀 여섯, 그리고 정해진 런칭 날짜 하나. 일부는 Trader가 인수한 회사에서, 일부는 원래 Trader에서 왔고, 모두 여전히 따로 움직이고 있었다.')],
            [t('Direction', '디렉션'), t('Leadership gave me four words: keep diversity in one. So I didn’t replace the logos. I gave each product one segment of a hexagon. Six segments make the AutoSync mark, and each product keeps its name, its color and its place in the whole.', '리더십이 준 말은 짧았다. 다양성을 하나로. 그래서 로고를 바꾸지 않았다. 각 제품에 헥사곤의 한 조각을 줬다. 여섯 조각이 모이면 AutoSync가 되고, 각 제품은 이름과 색, 그리고 전체 속 제자리를 지킨다.')],
            [t('Result', '결과'), t('AutoSync launched as one division, and its six products still looked like themselves. Teams built their own decks, pages and posts from the templates, and the brand held.', 'AutoSync는 하나의 디비전으로 런칭했고, 여섯 제품은 여전히 제 모습이었다. 팀들은 템플릿으로 덱과 페이지, 포스트를 직접 만들었고, 브랜드는 흐트러지지 않았다.')]
          ]} />
        {statement(t('01 · Learn what matters', '01 · 중요한 것을 알아낸다'),
          ko
            ? [['각자의 로고와 정체성을 가진 제품 여섯 개. 일부는 Trader가 인수한 회사의 제품이었고, 일부는 원래 Trader의 것이었다. 나도 그 인수로 MotoInsight에서 들어왔다. 회사들은 여전히 각자의 팀과 제품으로 따로 돌아가고 있었다.'], [' 목표는 하나가 되는 것이었고, 런칭 날짜는 정해져 있었다.', true]]
            : [['Six products, each with its own logo and identity. Some came from companies Trader had acquired, some were Trader’s own. I came in through one of those acquisitions, from MotoInsight. The companies still ran on their own, with their own teams and products.'], [' The goal was to become one, and the launch date was set.', true]],
          WHITE, null, true
        )}
      </header>

      {sec(t('02 · Choose a direction', '02 · 방향을 정한다'),
        t('Leadership’s direction: “Keep diversity in one.”', '경영진의 방향: “다양성을 하나로.”'),
        <>
          <p className={bodyP} style={{ color: u.body }}>
            {t('I didn’t erase the existing logos. Each company kept its original logo, and each product gained one segment of a hexagon. Put the six segments together and they form the hexagon, the AutoSync logo.', '기존 로고를 지우지 않았다. 각 회사는 원래 로고를 그대로 두고, 제품마다 헥사곤의 조각 하나를 더했다. 여섯 조각이 모이면 헥사곤, 곧 AutoSync 로고가 된다.')}
          </p>
          <CaseLogoTile monoStyle={monoStyle} label={t('AutoSync and its six products', 'AutoSync와 여섯 제품')} src={`${P}tile.jpg`} />
          <p className={`mt-12 md:mt-24 text-base leading-[1.6] md:w-[${frameCols(6)}]`} style={{ color: u.body }}>
            {t('Main logo: six units in one hexagon, each in its own color. Three rules hold it together.', '메인 로고: 하나의 헥사곤 안의 여섯 유닛, 각자의 색으로. 세 가지 규칙이 이것을 묶는다.')}
          </p>
        </>,
        u.overlayBg,
        <div className="mt-10 md:mt-16"><CaseCards monoStyle={monoStyle} titleStyle={titleStyle} field="grid-cols-12" cols="md:col-span-4" match="#000" items={rules.map(([a, b, src]) => [a, b, '', null, undefined, src])} /></div>
      )}

      {(() => {
        const sp = CaseSpread({
          monoStyle,
          a: { caption: t('Typography', '타이포그래피'), src: `${P}type.png` },
          b: { caption: t('Color', '컬러'), src: `${P}color.png` },
          wide: { caption: t('Business card', '명함'), src: `${P}card-mockup.jpg` }
        });
        return sec(t('03 · System', '03 · 시스템'),
          t('Six sub-brands, one visual language.', '서브브랜드 여섯, 하나의 비주얼 언어.'),
          <>
            <p className={bodyP} style={{ color: u.body }}>
              {t('The typeface is Overpass. It’s clean and modern, and the diagonal endings on some letters echo the hexagon. Each product gets one accent color. Body text and supporting elements stay neutral, so the product colors never shout over each other. The back of the business card carries all six logos: the whole family on one card.', '서체는 Overpass. 깔끔하고 모던하며, 일부 글자의 사선 끝이 헥사곤과 닮았다. 제품마다 액센트 컬러 하나. 본문과 보조 요소는 뉴트럴로 두어, 제품 색들이 서로 목소리를 높이지 않게 했다. 명함 뒷면에는 여섯 로고가 모두 들어간다. 한 장에 담긴 한 가족.')}
            </p>
            {/* the six sub-brands, side by side */}
            <p className="m-0 mb-3 mt-10 md:mt-16 text-xs" style={{ color: u.meta }}>{t('Sub-brands: the same hexagon, one color each.', '서브브랜드: 같은 헥사곤, 각자 한 가지 색.')}</p>
            <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3">
              {range(6, (k) => S({ key: k, src: `${P}subbrand-${k}.png`, fx: 'rise', delay: [0, 170, 340, 80, 250, 420][k - 1], ordered: false }))}
            </div>
            {sp.inField}
          </>,
          WHITE,
          sp.wide
        );
      })()}

      {sec(t('04 · Communication', '04 · 커뮤니케이션'),
        t('Materials teams could build on themselves.', '팀이 직접 이어서 만들 수 있는 자료.'),
        <>
          <p className={bodyP} style={{ color: u.body }}>
            {t('Made alongside marketing, for both internal and external communication. One template, one banner system and one webinar kit, so teams could build their own decks, pages and posts, and the brand would hold without anyone watching over it.', '마케팅과 함께, 사내외 커뮤니케이션을 위해 만들었다. 템플릿 하나, 배너 시스템 하나, 웨비나 키트 하나. 팀들이 덱과 페이지, 포스트를 직접 만들어도 누가 지켜보지 않아도 브랜드가 유지되도록.')}
          </p>
          <ul className="m-0 mt-10 list-none p-0 text-sm leading-[1.7]" style={{ color: u.title }}>
            {comms.map((it) => <li key={it.title}>{it.nav || it.kicker}</li>)}
          </ul>
        </>,
        u.overlayBg,
        <Reveal className="mt-24 md:mt-32">
          <CaseStrip monoStyle={monoStyle} label={t('Selected work', '작업')} items={stripOf(comms)} />
        </Reveal>
      )}

      {statement(t('Outcome', '결과'),
        ko
          ? [['리더십의 한마디가 헥사곤이 되고, 타입 시스템이 되고, 팀들이 직접 쓰는 템플릿이 됐다.'], [' 제품 여섯, 한 가족, 로고는 그대로.', true]]
          : [['Four words from leadership became a hexagon, a type system and templates teams used on their own.'], [' Six products, one family, each logo intact.', true]],
        WHITE
      )}
    </div>
  );
}

/** MotoInsight case, in the II case's layout. Every sentence comes from the
 *  old site's MI pages (Branding, Marketing, Website Redesign, Honda Preorder,
 *  Genesis) or from facts Ink confirmed; see _reference/motoinsight-case-copy.md.
 *  Pictures: public/images/work/motoinsight, at their own ratio and size. */
function MotoInsightCase({ monoStyle, titleStyle }) {
  const { u, ko, t, bodyP, WHITE, sec, statement } = useCaseKit(monoStyle, titleStyle);
  const S = (p) => <CaseSlot monoStyle={monoStyle} {...p} />;
  const P = 'images/work/motoinsight/';
  const range = (n, f) => Array.from({ length: n }, (_, k) => f(k + 1));

  const metaItems = [
    [t('Company', '회사'), t('Omni-channel car-buying software for dealers and carmakers, sold whole or block by block', '딜러와 자동차 회사를 위한 옴니채널 자동차 구매 소프트웨어. 전체로도, 블록 단위로도 판매')],
    [t('Role', '역할'), t('Visual Designer', '비주얼 디자이너')],
    [t('Scope', '범위'), t('Brand · Marketing · Web', '브랜드 · 마케팅 · 웹')],
    [t('Team', '팀'), t('Marketing director, copywriter, product team', '마케팅 디렉터, 카피라이터, 프로덕트 팀')]
  ];
  const approach = [
    [t('Guidelines people actually use.', '실제로 쓰이는 가이드라인.'), t('Logo, type, color, imagery and tone of voice, each explained with examples, so the guidelines worked as a practical tool.', '로고, 타입, 컬러, 이미지, 보이스를 예시와 함께 설명해, 가이드라인이 실제로 쓰는 도구가 되도록 했다.'), `${P}card-1.png`],
    [t('Templates for every team.', '모든 팀을 위한 템플릿.'), t('A library of branded templates, so marketing, sales and design could make their own materials and stay on brand.', '브랜드 템플릿 라이브러리. 마케팅, 세일즈, 디자인 팀이 직접 자료를 만들어도 브랜드에 맞게.'), `${P}card-2.jpg`],
    [t('Room for each client.', '고객마다의 여지.'), t('Dealers and carmakers had their own marketing needs. The system stayed flexible enough to meet them without losing its look.', '딜러와 자동차 회사는 각자 다른 마케팅이 필요했다. 시스템은 그 요구에 맞출 만큼 유연하되, 모습을 잃지 않게 했다.'), `${P}card-3.jpg`]
  ];
  const blockNames = ['Sales Conversion', 'Omnichannel Transacting', 'Vehicle Acquisition & Trade', 'Preorder & Virtual Inventory', 'Custom Experiences', 'Automated Features'];
  const site = [
    { kicker: t('By client', '고객별'), title: t('Dealers, carmakers, partners and lenders.', '딜러, 자동차 회사, 파트너·대출기관.'), line: t('A later redesign organized the product by client, each with its own banner, and put “Book a Demo” in the navigation and the hero.', '이후 리디자인에서는 제품을 고객별로 나눠 각자의 배너를 두고, “Book a Demo”를 메뉴와 히어로 두 곳에 두었다.'), frames: range(3, (k) => [null, '', `${P}banner-${k}.jpg`]) },
    { kicker: t('By block', '블록별'), title: t('Six sales blocks.', '판매 블록 여섯.'), line: t('And by sales block, from Sales Conversion to Automated Features, since each client could buy the whole platform or only the blocks it needed.', '그리고 판매 블록별로. Sales Conversion부터 Automated Features까지. 고객마다 플랫폼 전체를 살 수도, 필요한 블록만 살 수도 있었기 때문이다.'), frames: range(6, (k) => [blockNames[k - 1], '', `${P}block-${k}.jpg`]) },
    { kicker: t('Motion', '모션'), title: t('Both sides of the sale.', '판매의 양쪽.'), line: t('An animated hero, and short animations on the detail pages showing the dealer’s and the customer’s experience side by side.', '움직이는 히어로, 그리고 상세 페이지에서 딜러와 고객의 경험을 함께 보여주는 짧은 애니메이션.'), frames: keep(range(7, (k) => [null, '', `${P}motion-${k}.mp4`]), [3, 4, 6, 7]) },
    { kicker: t('UI kit', 'UI 키트'), title: t('Designed with the site.', '사이트와 함께 만든 키트.'), line: t('The UI kit, designed together with the site: type, color, buttons, links, cards, and the illustrative icons used across its pages.', '사이트와 함께 디자인한 UI 키트. 타입, 컬러, 버튼, 링크, 카드, 그리고 페이지 곳곳에 쓰인 일러스트 아이콘.'), frames: keep(range(5, (k) => [null, '', `${P}ds-${k}.jpg`]), [1, 2, 5]) }
  ];
  const comms = [
    { kicker: t('Campaigns', '캠페인'), title: t('Campaigns that lead to a demo.', '데모로 이어지는 캠페인.'), line: t('Email sequences, landing pages for webinars and seasonal events, and banners on dealership websites, each leading to a demo request or straight to MotoCommerce.', '이메일 시퀀스, 웨비나·시즌 이벤트 랜딩 페이지, 딜러 웹사이트 배너. 모두 데모 신청으로, 또는 MotoCommerce로 바로 이어졌다.'), frames: keep(range(4, (k) => [null, '', `${P}campaign-${k}.${k === 1 || k === 3 ? 'png' : 'jpg'}`]), [2, 3, 4]) },
    { kicker: t('Sales', '세일즈'), title: t('Materials for sales and dealers.', '세일즈와 딜러를 위한 자료.'), line: t('One-pagers and sales decks on content and pricing, a presentation template for every team, and a training book for dealers using MotoCommerce.', '콘텐츠와 가격을 전하는 원페이저와 세일즈 덱, 모든 팀이 쓰는 프레젠테이션 템플릿, 그리고 MotoCommerce를 쓰는 딜러를 위한 교육 책.'), frames: range(3, (k) => [null, '', `${P}sales-${k}.jpg`]) },
    { kicker: t('In use', '적용'), title: t('The guidelines, applied.', '가이드라인의 적용.'), line: t('Examples of use from the brand guidelines, on walls, signage and booths. Each rule came with an example, so the guidelines worked as a practical tool.', '브랜드 가이드라인의 적용 예. 벽, 사인, 부스. 규칙마다 예시를 붙여, 가이드라인이 실제로 쓰는 도구가 되게 했다.'), frames: keep(range(7, (k) => [null, '', `${P}example-${k}.jpg`]), [1, 2, 5, 7]) },
    { kicker: t('Trade shows', '전시회'), title: t('A startup at industry shows.', '업계 전시회의 스타트업.'), line: t('For a startup, a trade show is where the technology gets seen. Booths for the 2019 NADA Show and 2020 Digital Dealer carried the same brand.', '스타트업에게 전시회는 기술을 보여주는 자리다. 2019 NADA Show와 2020 Digital Dealer 부스도 같은 브랜드로 만들었다.'), frames: keep(range(8, (k) => [null, '', `${P}booth-${k}.jpg`]), [1, 4, 6]) },
    { kicker: t('Office', '사무실'), title: t('The office.', '사무실.'), line: t('In the new office, meeting rooms took the names of past locations and racing tracks, and murals brought the brand onto the walls. Each year, clients got a holiday card.', '새 사무실의 회의실에는 지나온 사무실과 레이싱 트랙의 이름이 붙었고, 벽화가 브랜드를 벽 위로 옮겼다. 매년 고객에게는 연말 카드가 갔다.'), frames: keep([...range(23, (k) => [null, '', `${P}office-${String(k).padStart(2, '0')}.jpg`]), [null, '', `${P}holiday-1.jpg`], [null, '', `${P}holiday-2.jpg`]], [2, 4, 6, 7, 11, 24]) }
  ];
  const product = [
    { nav: t('Honda · Pre-order', 'Honda · 프리오더'), kicker: t('Honda pre-order · 2021', 'Honda 프리오더 · 2021'), title: t('The UI, in Honda’s brand.', 'Honda 브랜드로 만든 UI.'), line: t('In 2021, a streamlined MotoCommerce for Honda. The flow already existed; I did the UI in Honda’s brand. Pre-orders for some models sold out.', '2021년, Honda를 위해 간소화한 MotoCommerce. 흐름은 원래 있던 것이고, 나는 Honda의 브랜드로 UI를 만들었다. 일부 모델은 프리오더가 매진됐다.'), frames: [
      [t('Flow', '흐름'), '', `${P}honda-flow.jpg`],
      [t('Vehicle', '차 선택'), '', `${P}honda-1.jpg`], [t('Dealership', '딜러'), '', `${P}honda-2.jpg`], [t('Deposit', '예약금'), '', `${P}honda-3.jpg`], [t('Review', '확인'), '', `${P}honda-4.jpg`], [t('Confirm', '완료'), '', `${P}honda-5.png`],
      [t('UI kit', 'UI 키트'), '', `${P}honda-kit.jpg`]
    ] },
    { nav: t('Genesis · Service booking', 'Genesis · 서비스 예약'), kicker: t('Genesis Canada · 2020–2021', 'Genesis Canada · 2020–2021'), title: t('Service booking.', '서비스 예약.'), line: t('Genesis Canada, 2020–2021: a shopper and dealer platform. I worked with the project team on features such as service booking, on desktop and mobile.', 'Genesis Canada, 2020–2021. 구매자와 딜러를 잇는 플랫폼. 프로젝트 팀과 함께 서비스 예약 같은 기능을 데스크톱과 모바일로 만들었다.'), frames: keep(range(8, (k) => [null, '', `${P}genesis-book-${k}.jpg`]), [1, 4, 5, 8]) },
    { nav: t('Genesis · Incentives', 'Genesis · 인센티브'), kicker: t('Genesis Canada', 'Genesis Canada'), title: t('Incentives, out of the images.', '이미지 밖으로 나온 인센티브.'), line: t('Incentives used to be baked into images and redone every month. On the trim page, they became a banner of their own, designed in Genesis’ brand.', '인센티브 정보는 이미지 안에 들어가 있어 매달 새로 만들어야 했다. 트림 선택 페이지에서는 이를 Genesis의 브랜드로 만든 별도의 배너로 바꿨다.'), frames: [[null, '', `${P}genesis-trim-1.jpg`], [null, '', `${P}genesis-trim-2.png`]] },
    { nav: t('Genesis · UI kit', 'Genesis · UI 키트'), kicker: t('Genesis Canada', 'Genesis Canada'), title: t('The UI kit, in atoms and modules.', '아톰과 모듈로 짠 UI 키트.'), line: t('Customizing MotoCommerce for Genesis meant rebuilding its UI kit, in atoms and modules, from Genesis’ website and guidelines.', 'MotoCommerce를 Genesis에 맞추는 일은, Genesis의 웹사이트와 가이드라인을 바탕으로 UI 키트를 아톰과 모듈 단위로 다시 짜는 일이었다.'), frames: keep(range(9, (k) => [null, '', `${P}genesis-kit-${k}.jpg`]), [1, 2, 6, 7]) }
  ];

  return (
    <div style={{ color: u.title, fontFamily: titleStyle.fontFamily, overflowX: 'clip' }}>
      <header style={{ backgroundColor: WHITE }}>
        <CaseHero
          monoStyle={monoStyle} titleStyle={titleStyle} metaItems={metaItems}
          years="2018–2021" name="MotoInsight" label="2018–2021 · MotoInsight"
          mark={<CaseHeroMark kind="m" color={u.title} className="h-9 w-auto md:h-12" />}
          headline={<L en={<>A logo.<br />No brand.</>} ko={<>로고는 있었다.<br />브랜드는 없었다.</>} />}
          body={t('MotoInsight had a logo and product designers, but no one for the brand or marketing. As the only visual designer, I built the brand into a system and carried it across every touchpoint: guidelines, sales and marketing materials, the website, events and the office.', 'MotoInsight에는 로고와 프로덕트 디자이너들이 있었지만, 브랜드와 마케팅을 맡을 사람은 없었다. 유일한 비주얼 디자이너로서 나는 브랜드를 시스템으로 만들고 모든 접점으로 가져갔다. 가이드라인, 영업과 마케팅 자료, 웹사이트, 이벤트, 그리고 사무실까지.')}
          media={<div className="grid grid-cols-9 items-start gap-x-4 gap-y-8 sm:gap-x-6">
            <CaseCover monoStyle={monoStyle} className="col-span-9 md:col-span-6" screens={[
              [t('Guidelines', '가이드라인'), '', `${P}cover-1.jpg`],
              [t('Sales & marketing', '세일즈·마케팅'), '', `${P}cover-2.jpg`],
              [t('Website', '웹사이트'), '', `${P}cover-3.jpg`],
              [t('Events', '이벤트'), '', `${P}cover-4.jpg`],
              [t('Office', '사무실'), '', `${P}cover-5.jpg`]
            ]} />
            {S({ className: 'col-span-9 md:col-span-3', fx: 'slide', delay: 420, caption: ' ', src: `${P}side.jpg` })}
          </div>}
        />
        <CaseSummary monoStyle={monoStyle} titleStyle={titleStyle} rows={[
            [t('Problem', '문제'), t('Car buying was moving online, and dealers, carmakers and buyers all needed it explained. The company had product designers and a logo. It had no brand, and no one to build one.', '차를 사는 일이 온라인으로 옮겨가고 있었고, 딜러도 자동차 회사도 구매자도 설명이 필요했다. 회사에는 프로덕트 디자이너와 로고가 있었다. 브랜드는 없었고, 그걸 만들 사람도 없었다.')],
            [t('Direction', '디렉션'), t('I set the overall direction of the brand and systematized the rest. Recurring, functionally similar materials became templates, so each owner could produce them within a defined brief while the brand stayed consistent.', '브랜드의 전체 방향은 직접 설계하고, 나머지는 시스템으로 만들었다. 반복되거나 기능이 비슷한 자료는 템플릿으로 정리해, 각 담당자가 정해진 디렉션 안에서 직접 제작하더라도 브랜드의 일관성이 유지되도록 했다.')],
            [t('Result', '결과'), t('The website, campaigns, sales materials, trade show booths and the office all carried one brand. Strategic work stayed in one place. Recurring work scaled through templates.', '웹사이트, 캠페인, 영업 자료, 전시회 부스, 사무실까지 하나의 브랜드로 정리됐다. 전략적인 작업은 한 곳에서 이끌고, 반복되는 작업은 템플릿으로 확장했다.')]
          ]} />
        {statement(t('01 · Learn what matters', '01 · 중요한 것을 알아낸다'),
          ko
            ? [['일반적인 이커머스와 달리, 온라인으로 차를 사는 일은 딜러에게도, 자동차 회사에게도, 소비자에게도 낯설었다. MotoInsight는 그 경험을 위한 커머스 소프트웨어를 만들었다. 고객은 딜러이기도 했고 자동차 회사이기도 했으며, 각자 플랫폼 전체를 사거나 필요한 블록만 골라 샀다.'], [' 회사에는 프로덕트 디자이너가 있었지만, 브랜드와 마케팅을 맡을 디자이너는 없었다.', true]]
            : [['Unlike ordinary e-commerce, buying a car online was new to dealers, carmakers and buyers alike. MotoInsight built commerce software for it. Its clients were both dealers and carmakers, and each could buy the whole platform or only the blocks it needed.'], [' The company had product designers, but no designer for the brand or for marketing.', true]],
          WHITE, null, true
        )}
      </header>

      {sec(t('02 · Choose a direction', '02 · 방향을 정한다'),
        t('A system the teams could run themselves.', '팀이 스스로 굴릴 수 있는 시스템.'),
        <>
          <p className={bodyP} style={{ color: u.body }}>
            {t('Guidelines usually explain. These had to be used. Every rule, from the logo to the tone of voice, came with an example, and recurring materials for marketing, sales and design were built as templates.', '가이드라인은 보통 설명에 그친다. 이번 가이드라인은 실제로 쓰여야 했다. 로고부터 말투까지 모든 규칙에 예시를 붙였고, 마케팅, 영업, 디자인 팀의 반복 자료는 템플릿으로 제작했다.')}
          </p>
          <CaseLogoTile monoStyle={monoStyle} label={t('Brand guidelines', '브랜드 가이드라인')} src={`${P}tile.jpg`} />
          <p className={`mt-12 md:mt-24 text-base leading-[1.6] md:w-[${frameCols(6)}]`} style={{ color: u.body }}>
            {t('Brand guidelines: logo, type, color, imagery, tone of voice, examples of use.', '브랜드 가이드라인: 로고, 타입, 컬러, 이미지, 보이스, 적용 예.')}
          </p>
        </>,
        u.overlayBg,
        <div className="mt-10 md:mt-16"><CaseCards monoStyle={monoStyle} titleStyle={titleStyle} field="grid-cols-12" cols="md:col-span-4" items={approach.map(([a, b, src]) => [a, b, '', null, undefined, src])} /></div>
      )}

      {(() => {
        return sec(t('03 · Website', '03 · 웹사이트'),
          t('Show the product first.', '제품을 먼저 보여준다.'),
          <>
            <p className={bodyP} style={{ color: u.body }}>
              {t('The old site worked, but it didn’t show the product. With the marketing director and a copywriter, I rebuilt the wireframe and content, and designed the site and its UI kit together. “Our Solution” became the first item in the navigation, and the actual MotoCommerce product sits in the hero.', '기존 사이트는 작동은 했지만, 제품을 보여주지 못했다. 마케팅 디렉터, 카피라이터와 함께 와이어프레임과 콘텐츠를 다시 짜고, 사이트와 UI 키트를 함께 디자인했다. 메뉴의 첫 자리는 “Our Solution”이 됐고, 히어로에는 실제 MotoCommerce 제품을 두었다.')}
            </p>

            <ul className="m-0 mt-10 list-none p-0 text-sm leading-[1.7]" style={{ color: u.title }}>
              {site.map((it) => <li key={it.title}>{it.nav || it.kicker}</li>)}
            </ul>
          </>,
          WHITE,
          <Reveal className="mt-24 md:mt-32">
          <CaseStrip monoStyle={monoStyle} label={t('Selected work', '작업')} items={[[`${P}web-3.jpg`, ''], [`${P}web-1.jpg`, ''], [`${P}web-2.jpg`, ''], [`${P}web-4.jpg`, ''], ...stripOf(site)]} />
        </Reveal>
        );
      })()}

      {sec(t('04 · Communication', '04 · 커뮤니케이션'),
        t('Explaining something new, to every audience.', '새로운 것을, 모든 사람에게 설명하기.'),
        <>
          <p className={bodyP} style={{ color: u.body }}>
            {t('Online car buying needed explaining: to dealers, to carmakers and to the people buying the cars. Each audience got materials in the same brand.', '온라인 자동차 구매는 설명이 필요했다. 딜러에게, 자동차 회사에게, 그리고 차를 사는 사람에게. 대상마다 같은 브랜드로 된 자료를 만들었다.')}
    </p>
            <ul className="m-0 mt-10 list-none p-0 text-sm leading-[1.7]" style={{ color: u.title }}>
              {comms.map((it) => <li key={it.title}>{it.nav || it.kicker}</li>)}
            </ul>
        </>,
        u.overlayBg,
        <Reveal className="mt-24 md:mt-32">
          <CaseStrip monoStyle={monoStyle} label={t('Selected work', '작업')} items={stripOf(comms)} />
        </Reveal>
      )}

      {sec(t('05 · Product', '05 · 제품'),
        t('Helping the product team, in each carmaker’s brand.', '자동차 회사의 브랜드로, 프로덕트 팀을 도왔다.'),
        <>
          <p className={bodyP} style={{ color: u.body }}>
            {t('When MotoCommerce ran under a carmaker’s name, it had to look like that carmaker. I helped the product team make it so, in each carmaker’s brand.', 'MotoCommerce가 자동차 회사의 이름으로 나갈 때는, 그 회사처럼 보여야 했다. 나는 프로덕트 팀이 그렇게 만들도록, 각 회사의 브랜드로 도왔다.')}
    </p>
            <ul className="m-0 mt-10 list-none p-0 text-sm leading-[1.7]" style={{ color: u.title }}>
              {product.map((it) => <li key={it.title}>{it.nav || it.kicker}</li>)}
            </ul>
        </>,
        u.overlayBg,
        <Reveal className="mt-24 md:mt-32">
          <CaseStrip monoStyle={monoStyle} label={t('Selected work', '작업')} items={stripOf(product)} />
        </Reveal>
      )}

      {statement(t('Outcome', '결과'),
        ko
          ? [['로고 하나에서 시작했다.'], [' 하나의 방향과, 그 방향을 확장하는 템플릿으로 이루어진 시스템이 됐다.', true]]
          : [['It began with a logo and no brand.'], [' It became a system: one direction, and the templates that carry it.', true]],
        WHITE
      )}
    </div>
  );
}

/** II cover: the user's path (ad, website, sign-up, performance) plays in one
 *  screen; the II symbol under it is the pause button. Scrolling past the cover
 *  stops it on the performance screen, the moment the hero title names. */
function InvCover({ monoStyle, metaItems, ko }) {
  const u = DETAIL_UI;
  const t = (en, kr) => (ko ? kr : en);
  const frame = `${PAGE_FRAME} ${WORK_PAGE_GUTTER_X}`;
  const screens = [
    [t('Ad', '광고'), null, t('🎞 Reel, one frame', '🎞 릴 한 컷')],
    [t('Website', '웹사이트'), null, t('📷 Landing page', '📷 랜딩 페이지')],
    [t('Sign-up', '가입'), null, t('📷 Sign-up intro', '📷 가입 인트로')],
    [t('Performance', '성과'), 'images/investing-p1-entrance.jpg', null]
  ];
  const last = screens.length - 1;
  const [i, setI] = useState(0);
  const [playing, setPlaying] = useState(true);
  const ref = useRef(null);
  useEffect(() => {
    if (!playing) return undefined;
    const id = setInterval(() => setI((n) => (n + 1) % screens.length), 1600);
    return () => clearInterval(id);
  }, [playing]);
  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const io = new IntersectionObserver(([e]) => {
      if (e.intersectionRatio < 0.8) { setPlaying(false); setI(last); } else setPlaying(true);
    }, { threshold: [0.8] });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div ref={ref} className="relative flex min-h-[86vh] flex-col pt-12 md:pt-24" style={{ backgroundColor: '#ffffff' }}>
      <div className={`${frame} w-full`}>
        <dl className="m-0">
          {metaItems.map(([k, v]) => (
            <div key={k} className="grid grid-cols-[88px_minmax(0,1fr)] gap-x-3 py-0.5">
              <dt className="text-xs" style={{ ...monoStyle, color: u.meta }}>{k}</dt>
              <dd className="m-0 text-sm leading-[1.5]" style={{ color: u.body }}>{v}</dd>
            </div>
          ))}
        </dl>
      </div>
      <div className="flex flex-1 flex-col items-center justify-center gap-6 py-10">
        <div className="relative aspect-[9/19.5] h-[52vh] max-h-[560px] overflow-hidden rounded-[28px]" style={{ backgroundColor: INV_INK.ground, border: `1px solid ${INV_INK.line}` }}>
          {screens.map(([name, src, label], k) => (
            <div key={name} aria-hidden={k !== i} className="absolute inset-0 flex items-center justify-center p-5 text-center" style={{ opacity: k === i ? 1 : 0, transition: 'opacity 0.5s ease' }}>
              {src
                ? <img src={src} alt="" className="absolute inset-0 h-full w-full object-cover object-top" />
                : <span className="text-xs" style={{ ...monoStyle, color: INV_INK.muted }}>{label}</span>}
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setPlaying((p) => !p)}
          aria-label={playing ? t('Pause', '일시정지') : t('Play', '재생')}
          className="cursor-pointer border-0 bg-transparent p-2"
        >
          <svg viewBox="0 0 15 18" className="h-10 w-auto" fill="none" aria-hidden="true">
            <path d="M5.59903 0H7.79315L2.19412 17.6523H0L5.59903 0Z" fill={u.title} />
            <path d="M12.8061 0H15.0002L9.40115 17.6523H7.20703L12.8061 0Z" fill={u.title} />
          </svg>
        </button>
        <p className="m-0 flex gap-2 text-xs" style={{ ...monoStyle, color: u.meta }}>
          {screens.map(([name], k) => (
            <span key={name} style={{ color: k === i ? u.title : u.placeholderText }}>{k > 0 && '→ '}{name}</span>
          ))}
        </p>
      </div>
    </div>
  );
}

function CaseStudy({ project, projects, monoStyle, titleStyle, onOpenProject }) {
  const koNext = useKo();
  const content = CASE_STUDIES[project];
  const meta = projects.find((p) => p.id === project);
  const currentIndex = projects.findIndex(p => p.id === project);
  const nextProject = projects[(currentIndex + 1) % projects.length];
  const u = DETAIL_UI;

  const [lightbox, setLightbox] = useState(null);
  const closeLightbox = useCallback(() => setLightbox(null), []);
  const prevImage = useCallback(() => setLightbox(lb => lb ? { ...lb, index: (lb.index - 1 + lb.items.length) % lb.items.length } : null), []);
  const nextImage = useCallback(() => setLightbox(lb => lb ? { ...lb, index: (lb.index + 1) % lb.items.length } : null), []);

  const Section = ({ label, children, className = '', split = false }) =>
    split ? (
      <div
        className={`grid grid-cols-1 gap-8 md:grid-cols-[minmax(7rem,11rem)_minmax(0,1fr)] md:gap-x-10 md:items-start lg:gap-x-16 xl:gap-x-24 ${className}`.trim()}
      >
        <p
          className="shrink-0 text-left text-[11px] leading-snug tracking-wide md:max-w-[11rem] md:pt-1 md:text-xs"
          style={{ ...monoStyle, color: u.meta }}
        >
          {label}
        </p>
        <div className="min-w-0">{children}</div>
      </div>
    ) : (
      <div className={className}>
        <p className="mb-12 text-xs" style={{ ...monoStyle, color: u.meta }}>
          {label}
        </p>
        {children}
      </div>
    );

  const imageFrameStyle = { border: `1px solid ${u.border}`, backgroundColor: u.imageWell };

  return (
    <>
    {/* the II case starts flush with its white opening field, so no top padding */}
    <section className={`w-full min-w-0 px-0 pb-24 sm:pb-32 ${['investing', 'autosync', 'mi'].includes(project) ? '' : 'pt-8 sm:pt-12 md:pt-16'}`}>
      {project === 'investing' ? (
        <InvestingCase monoStyle={monoStyle} titleStyle={titleStyle} />
      ) : project === 'autosync' ? (
        <AutoSyncCase monoStyle={monoStyle} titleStyle={titleStyle} />
      ) : project === 'mi' ? (
        <MotoInsightCase monoStyle={monoStyle} titleStyle={titleStyle} />
      ) : project === 'autosync-old' ? (
        <>
        <div className={`mb-48 w-full min-w-0 pb-12 sm:pb-14 md:pb-20 md:mb-56 ${WORK_PAGE_GUTTER_X}`}>
          {/*
            lg+ layout: title left, meta right. No flex-1/basis-0 on title (that collapsed the column). shrink-0 keeps a readable min width.
          */}
          <div className="flex w-full min-w-0 flex-col gap-10 lg:flex-row lg:flex-wrap lg:items-start lg:justify-between lg:gap-x-8 lg:gap-y-10 xl:gap-x-10">
            <header className="w-full max-w-[36rem] shrink-0 text-left">
              <h1
                className="text-3xl tracking-tight md:text-5xl md:leading-[1.15]"
                style={{ ...titleStyle, color: u.title }}
              >
                <span className="block">{content.title}</span>
                <span className="mt-2 block md:mt-3">{content.titleLine2}</span>
              </h1>
              <p
                className="mt-4 max-w-xl text-lg font-normal leading-relaxed md:mt-5 md:text-xl md:leading-relaxed"
                style={{ color: u.body }}
              >
                {content.subtitle}
              </p>
            </header>
            {/*
              Column gaps: see index.css .autosync-meta-row (CDN Tailwind often skips responsive ml/gap from JSX).
            */}
            <div className="autosync-meta-row flex w-full min-w-0 flex-col gap-y-8 md:flex-row md:flex-nowrap md:items-start md:justify-end md:gap-y-0 lg:w-auto lg:shrink-0">
              <div className="autosync-meta-col min-w-0 text-left">
                <p className="text-xs leading-relaxed" style={{ ...monoStyle, color: u.meta }}>
                  Company
                </p>
                <p
                  className="mt-5 text-base font-normal leading-[1.55] md:text-lg md:leading-[1.55] lg:text-xl lg:leading-[1.55]"
                  style={{ ...titleStyle, fontWeight: 400, color: u.title }}
                >
                  AutoSync / Trader
                </p>
              </div>
              <div className="autosync-meta-col min-w-0 text-left">
                <p className="text-xs leading-relaxed" style={{ ...monoStyle, color: u.meta }}>
                  Scope
                </p>
                <p
                  className="mt-5 text-base font-normal leading-[1.55] md:text-lg md:leading-[1.55] lg:text-xl lg:leading-[1.55]"
                  style={{ ...titleStyle, fontWeight: 400, color: u.title }}
                >
                  Brand Identity, System Design
                </p>
              </div>
              <div className="autosync-meta-col min-w-0 text-left">
                <p className="text-xs leading-relaxed" style={{ ...monoStyle, color: u.meta }}>
                  Deliverables
                </p>
                <p
                  className="mt-5 text-base font-normal leading-[1.55] md:text-lg md:leading-[1.55] lg:text-xl lg:leading-[1.55] lg:whitespace-nowrap"
                  style={{ ...titleStyle, fontWeight: 400, color: u.title }}
                >
                  Brand Guidelines, Templates, Collateral
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className={`mb-12 w-full min-w-0 sm:mb-14 md:mb-16 ${WORK_PAGE_GUTTER_X}`}>
          <PlaceholderFrame
            label="[ Image ]"
            src="images/autosync-p1.png"
            monoStyle={monoStyle}
            aspectClass=""
            borderless
            className="w-full"
            style={{ aspectRatio: '16 / 6.3' }}
          />
        </div>
        </>
      ) : (
        <>
        <div className={`mb-48 w-full min-w-0 pb-12 sm:pb-14 md:pb-20 md:mb-56 ${WORK_PAGE_GUTTER_X}`}>
          <div className="flex w-full min-w-0 flex-col gap-10 lg:flex-row lg:flex-wrap lg:items-start lg:justify-between lg:gap-x-8 lg:gap-y-10 xl:gap-x-10">
            <header className="w-full max-w-[36rem] shrink-0 text-left">
              <h1
                className="text-3xl tracking-tight md:text-5xl md:leading-[1.15]"
                style={{ ...titleStyle, color: u.title }}
              >
                <span className="block">{content.title}</span>
                {content.titleLine2 && (
                  <span className="mt-2 block md:mt-3">{content.titleLine2}</span>
                )}
              </h1>
              <p
                className="mt-4 max-w-xl text-lg font-normal leading-relaxed md:mt-5 md:text-xl md:leading-relaxed"
                style={{ color: u.body }}
              >
                {content.subtitle || '[ Project summary ]'}
              </p>
            </header>
            <div className="autosync-meta-row flex w-full min-w-0 flex-col gap-y-8 md:flex-row md:flex-nowrap md:items-start md:justify-end md:gap-y-0 lg:w-auto lg:shrink-0">
              <div className="autosync-meta-col min-w-0 text-left">
                <p className="text-xs leading-relaxed" style={{ ...monoStyle, color: u.meta }}>
                  Company
                </p>
                <p
                  className="mt-5 text-base font-normal leading-[1.55] md:text-lg md:leading-[1.55] lg:text-xl lg:leading-[1.55]"
                  style={{ ...titleStyle, fontWeight: 400, color: u.title }}
                >
                  {content.company || '[ Company ]'}
                </p>
              </div>
              <div className="autosync-meta-col min-w-0 text-left">
                <p className="text-xs leading-relaxed" style={{ ...monoStyle, color: u.meta }}>
                  Scope
                </p>
                <p
                  className="mt-5 text-base font-normal leading-[1.55] md:text-lg md:leading-[1.55] lg:text-xl lg:leading-[1.55]"
                  style={{ ...titleStyle, fontWeight: 400, color: u.title }}
                >
                  {content.scope || '[ Scope ]'}
                </p>
              </div>
              <div className="autosync-meta-col min-w-0 text-left">
                <p className="text-xs leading-relaxed" style={{ ...monoStyle, color: u.meta }}>
                  Deliverables
                </p>
                <p
                  className="mt-5 text-base font-normal leading-[1.55] md:text-lg md:leading-[1.55] lg:text-xl lg:leading-[1.55] lg:whitespace-nowrap"
                  style={{ ...titleStyle, fontWeight: 400, color: u.title }}
                >
                  {content.deliverables || '[ Deliverables ]'}
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className={`mb-12 w-full min-w-0 sm:mb-14 md:mb-16 ${WORK_PAGE_GUTTER_X}`}>
          <PlaceholderFrame
            label="[ Hero Image ]"
            src={content.heroImage}
            monoStyle={monoStyle}
            aspectClass=""
            borderless
            className="w-full"
            style={{ aspectRatio: '16 / 6.3' }}
          />
        </div>
        </>
      )}

      <div className={`w-full min-w-0 ${WORK_PAGE_GUTTER_X}`}>
        {project === 'investing' || project === 'autosync' || project === 'mi' ? null : project === 'autosync-old' ? (
          <div className="space-y-36 pt-12 sm:space-y-44 sm:pt-14 md:space-y-52 md:pt-20">
            <Section label="01 Context" split>
              <div>
                <div className="mb-12 space-y-1 md:mb-14">
                  <p
                    className="text-3xl leading-snug md:text-4xl md:leading-snug"
                    style={{ ...titleStyle, color: u.kickerMuted }}
                  >
                    The Situation
                  </p>
                  <p
                    className="text-3xl leading-snug md:text-4xl md:leading-snug"
                    style={{ ...titleStyle, color: u.title }}
                  >
                    Nothing broken. Nothing there.
                  </p>
                </div>

                <div className="min-w-0 max-w-[42rem] space-y-6 xl:max-w-[44rem]">
                  <p className="text-2xl leading-relaxed" style={{ color: u.body }}>
                    AutoSync was a brand new division inside Trader, built to bring the company&apos;s digital products
                    under one roof. There was no broken identity to fix. There was no identity at all.
                  </p>
                  <p className="text-2xl leading-relaxed" style={{ color: u.body }}>
                    Starting from zero is a different kind of problem. You can&apos;t audit what doesn&apos;t exist. Every
                    decision (color, type, structure) had to be made without a reference point, while the products
                    themselves were still being built.
                  </p>
                  <p className="text-2xl leading-relaxed" style={{ color: u.body }}>
                    And it had to look credible fast. New department, real stakes.
                  </p>
                </div>

                <div className="mt-24 w-full min-w-0 sm:mt-28 md:mt-36">
                  {/*
                    Stack until xl: split Section leaves a narrow content rail; lg side-by-side still collided with image column.
                  */}
                  <div className="flex w-full min-w-0 flex-col gap-10 xl:flex-row xl:items-center xl:justify-between xl:gap-10 2xl:gap-14">
                    <div className="w-full min-w-0 max-w-[min(100%,20rem)] shrink-0 space-y-3">
                      <p
                        className="text-2xl leading-relaxed"
                        style={{ color: u.body }}
                      >
                        <span className="block">The brief wasn&apos;t a brief.</span>
                        <span className="block">It was a direction from a meeting: &ldquo;keep diversity in one.&rdquo;</span>
                      </p>
                      <p
                        className="text-2xl leading-relaxed"
                        style={{ color: u.body }}
                      >
                        <span className="block">Multiple products.</span>
                        <span className="block">One connecting thread.</span>
                        <span className="block">Figure out what that looks like.</span>
                      </p>
                    </div>
                    <div
                      className="w-full min-w-0 shrink-0"
                      style={{
                        maxWidth: `min(100%, ${AUTOSYNC_BRIEF_MEDIA_DISPLAY_PX}px)`
                      }}
                    >
                      <div className="flex flex-col gap-3 sm:gap-4 md:gap-4">
                        <PlaceholderFrame
                          label="[ Image ]"
                          monoStyle={monoStyle}
                          borderless
                          aspectClass="aspect-[2/3]"
                          className="w-full"
                        />
                        <PlaceholderFrame
                          label="[ Image ]"
                          monoStyle={monoStyle}
                          borderless
                          aspectClass="aspect-[2/3]"
                          className="w-full"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Section>

            <Section label="02 Structure" split>
              <div>
                <div className="mb-12 space-y-1 md:mb-14">
                  <p
                    className="text-3xl leading-snug md:text-4xl md:leading-snug"
                    style={{ ...titleStyle, color: u.kickerMuted }}
                  >
                    The Thinking
                  </p>
                  <p
                    className="text-3xl leading-snug md:text-4xl md:leading-snug"
                    style={{ ...titleStyle, color: u.title }}
                  >
                    From a phrase to a system.
                  </p>
                </div>

                <div className="min-w-0 max-w-[42rem] space-y-12 md:space-y-14 xl:max-w-[44rem]">
                  <div className="space-y-3">
                    <p className="text-2xl leading-relaxed" style={{ ...titleStyle, color: u.title }}>
                      The hex wasn&apos;t the starting point: the logic was
                    </p>
                    <p className="text-2xl leading-relaxed" style={{ color: u.body }}>
                      &ldquo;Diversity in one&rdquo; came out of a team conversation. It wasn&apos;t a design brief, it
                      was a direction. I took that idea (connection without uniformity) and looked for a form that could
                      carry it. The hexagonal system came from that question, not the other way around.
                    </p>
                  </div>
                  <div className="space-y-3">
                    <p className="text-2xl leading-relaxed" style={{ ...titleStyle, color: u.title }}>
                      Each product needed room, not just rules
                    </p>
                    <p className="text-2xl leading-relaxed" style={{ color: u.body }}>
                      The products under AutoSync were different enough that forcing them into one look would&apos;ve
                      felt false. The system had to be a framework, not a template. The hex, grid logic, and type
                      hierarchy are shared. Color and tone belong to each product. That&apos;s what gives them room to breathe.
                    </p>
                  </div>
                  <div className="space-y-3">
                    <p className="text-2xl leading-relaxed" style={{ ...titleStyle, color: u.title }}>
                      Built to be used without a designer in the room
                    </p>
                    <p className="text-2xl leading-relaxed" style={{ color: u.body }}>
                      A new department moves fast. If the brand system required a designer to approve every output, it
                      would get ignored. Every decision was tested against one question: can someone else use this and
                      still get it right?
                    </p>
                  </div>
                  <div className="space-y-3">
                    <p className="text-2xl leading-relaxed" style={{ ...titleStyle, color: u.title }}>
                      Credibility before personality
                    </p>
                    <p className="text-2xl leading-relaxed" style={{ color: u.body }}>
                      AutoSync was brand new. The first job of the identity wasn&apos;t to be distinctive. It was to look
                      like it belonged inside Trader, alongside products with years of visual history behind them.
                      Personality could come later. Foundation first.
                    </p>
                  </div>
                </div>

                <div className="mt-28 w-full min-w-0 sm:mt-32 md:mt-40 lg:mt-44">
                  {/*
                    Stack until lg: side-by-side at md squeezed the card grid + split Section → overlapping columns.
                  */}
                  <div className="flex w-full min-w-0 flex-col gap-10 lg:flex-row lg:items-center lg:justify-between lg:gap-10 xl:gap-14 2xl:gap-16">
                    <div className="min-w-0 w-full max-w-[28rem] shrink-0 text-left">
                      <div className="mb-6 space-y-1 md:mb-8">
                        <p
                          className="text-3xl leading-snug md:text-4xl md:leading-snug"
                          style={{ ...titleStyle, color: u.kickerMuted }}
                        >
                          What Got Built
                        </p>
                      </div>
                      <p className="text-2xl leading-relaxed" style={{ color: u.body }}>
                        Not a mood board. Not a PDF no one opens. Something teams could actually use.
                      </p>
                    </div>
                    <div className="min-w-0 w-full text-left lg:min-w-0 lg:flex-1">
                      {/*
                        2-col cards only when the content rail is wide enough (xl+); avoids razor-thin columns beside intro.
                      */}
                      <div className="grid w-full min-w-0 grid-cols-1 gap-x-8 gap-y-12 xl:grid-cols-2 xl:gap-x-10 xl:gap-y-14">
                    {[
                      {
                        title: 'Visual Language',
                        body:
                          'Color, type, and spacing: defined once, applied everywhere. No one has to guess what "on-brand" means.'
                      },
                      {
                        title: 'Hexagonal System',
                        body:
                          'The structural thread running through everything: logos, layouts, product marks. It organizes the system without drawing attention to itself.'
                      },
                      {
                        title: 'Sub-brand Rules',
                        body:
                          "Shared grid and hex logic. Product-specific color and tone. They're clearly related, but each one has its own register."
                      },
                      {
                        title: 'Presentation Templates',
                        body:
                          'Sales decks, product pitches, internal reviews. Built to the system so anyone can pick them up and not break anything.'
                      },
                      {
                        title: 'Marketing Collateral',
                        body:
                          'Print and digital campaign assets. Each one looks like its product. Pull them together and they\'re clearly the same family.'
                      },
                      {
                        title: 'Brand Guidelines',
                        body:
                          "Documentation that explains the why, not just the what. Written for people who weren't in the room when the decisions were made."
                      }
                    ].map(({ title, body }) => (
                      <div key={title} className="min-w-0 max-w-prose space-y-3">
                        <p className="text-xl leading-snug" style={{ ...titleStyle, color: u.title }}>
                          {title}
                        </p>
                        <p
                          className="text-lg leading-[1.65] md:text-xl md:leading-[1.65]"
                          style={{ color: u.body }}
                        >
                          {body}
                        </p>
                      </div>
                    ))}
                    </div>
                  </div>
                </div>

                <div className="mt-16 min-w-0 md:mt-24">
                  <div className="grid w-full min-w-0 grid-cols-1 gap-y-12 gap-x-0 md:grid-cols-2 md:gap-x-10 md:gap-y-16">
                    {AUTOSYNC_BUILT_CATALOG.map(({ caption, aspect }, idx) => (
                      <div key={caption} className="flex min-w-0 flex-col">
                        <button
                          className="min-w-0 w-full cursor-zoom-in"
                          onClick={() => setLightbox({ items: AUTOSYNC_BUILT_CATALOG, index: idx })}
                          aria-label={`Open ${caption}`}
                        >
                          <PlaceholderFrame
                            label="[ Image ]"
                            monoStyle={monoStyle}
                            borderless
                            aspectClass={aspect}
                            className="w-full rounded-sm"
                          />
                        </button>
                        <p
                          className="mt-2.5 text-left text-[11px] tracking-wide md:mt-3"
                          style={{ ...monoStyle, color: u.meta }}
                        >
                          {caption}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Presentation Templates section */}
                <div className="mt-28 w-full min-w-0 sm:mt-32 md:mt-40 lg:mt-44">
                  <div className="mb-6 space-y-1 md:mb-8">
                    <p
                      className="text-3xl leading-snug md:text-4xl md:leading-snug"
                      style={{ ...titleStyle, color: u.kickerMuted }}
                    >
                      Presentation Templates
                    </p>
                  </div>
                  <div className="grid w-full min-w-0 grid-cols-1 gap-y-12 gap-x-0 md:grid-cols-2 md:gap-x-10 md:gap-y-16">
                    {AUTOSYNC_PRESENTATION_CATALOG.map(({ caption, aspect, src }, idx) => (
                      <div key={caption} className="flex min-w-0 flex-col">
                        <button
                          className="min-w-0 w-full cursor-zoom-in"
                          onClick={() => setLightbox({ items: AUTOSYNC_PRESENTATION_CATALOG, index: idx })}
                          aria-label={`Open ${caption}`}
                        >
                          <PlaceholderFrame
                            label="[ Image ]"
                            src={src}
                            monoStyle={monoStyle}
                            borderless
                            aspectClass={aspect}
                            className="w-full rounded-sm"
                          />
                        </button>
                        <p
                          className="mt-2.5 text-left text-[11px] tracking-wide md:mt-3"
                          style={{ ...monoStyle, color: u.meta }}
                        >
                          {caption}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
                </div>
              </div>
            </Section>

            <Section label="03 Experience" split>
              <div>
                <div className="mb-12 space-y-1 md:mb-14">
                  <p
                    className="text-3xl leading-snug md:text-4xl md:leading-snug"
                    style={{ ...titleStyle, color: u.kickerMuted }}
                  >
                    The Shift
                  </p>
                  <p
                    className="text-3xl leading-snug md:text-4xl md:leading-snug"
                    style={{ ...titleStyle, color: u.title }}
                  >
                    A department that looked like it had always been there.
                  </p>
                </div>

                <div className="min-w-0 max-w-[42rem] space-y-6 xl:max-w-[44rem]">
                  <p className="text-2xl leading-relaxed" style={{ color: u.body }}>
                    AutoSync launched as a new division but it didn&apos;t look like one. That&apos;s the whole job: credibility that would normally take years to build, available on day one.
                  </p>
                  <p className="text-2xl leading-relaxed" style={{ color: u.body }}>
                    Teams started producing content without routing everything through design. The hex gave them a visual shorthand: something concrete to point at when someone asked what the brand actually was.
                  </p>
                  <p className="text-2xl leading-relaxed" style={{ color: u.body }}>
                    When new products joined, the system absorbed them. No rebuilding from scratch, no visual inconsistency. Just another product that fit.
                  </p>
                </div>

                <div className="mt-16 w-full min-w-0 md:mt-20">
                  <div className="grid grid-cols-1 gap-0 border-t" style={{ borderColor: u.border }}>
                    {[
                      {
                        title: 'Zero to credible',
                        body: 'A new department has no visual track record. A well-built system can fake it.'
                      },
                      {
                        title: 'Works without a designer',
                        body: 'Templates handle the rules. Teams handle the content.'
                      },
                      {
                        title: 'Grows with the company',
                        body: 'New products, new campaigns. The system scales without starting over.'
                      }
                    ].map(({ title, body }) => (
                      <div key={title} className="flex min-w-0 flex-col gap-3 border-b py-8 sm:flex-row sm:gap-8 md:gap-16 md:py-10" style={{ borderColor: u.border }}>
                        <p className="shrink-0 text-xl leading-snug sm:w-56 md:w-64 lg:w-72" style={{ ...titleStyle, color: u.title }}>
                          {title}
                        </p>
                        <p className="text-lg leading-relaxed" style={{ color: u.body }}>
                          {body}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Section>
          </div>
        ) : (
          <div className="space-y-36 pt-12 sm:space-y-44 sm:pt-14 md:space-y-52 md:pt-20">
            <Section label="01 Context" split>
              <div>
                <div className="mb-12 space-y-1 md:mb-14">
                  <p
                    className="text-3xl leading-snug md:text-4xl md:leading-snug"
                    style={{ ...titleStyle, color: u.kickerMuted }}
                  >
                    The Situation
                  </p>
                  <p
                    className="text-3xl leading-snug md:text-4xl md:leading-snug"
                    style={{ ...titleStyle, color: u.title }}
                  >
                    {content.contextHeadline || '[ Situation headline ]'}
                  </p>
                </div>
                <div className="min-w-0 max-w-[42rem] space-y-6 xl:max-w-[44rem]">
                  {(Array.isArray(content.contextBody)
                    ? content.contextBody
                    : [content.contextBody || '[ Situation body ]']
                  ).map((para, i) => (
                    <p key={i} className="text-2xl leading-relaxed" style={{ color: u.body }}>
                      {para}
                    </p>
                  ))}
                </div>
              </div>
            </Section>

            <Section label="02 Structure" split>
              <div>
                <div className="mb-12 space-y-1 md:mb-14">
                  <p
                    className="text-3xl leading-snug md:text-4xl md:leading-snug"
                    style={{ ...titleStyle, color: u.kickerMuted }}
                  >
                    The Thinking
                  </p>
                  <p
                    className="text-3xl leading-snug md:text-4xl md:leading-snug"
                    style={{ ...titleStyle, color: u.title }}
                  >
                    {content.thinkingHeadline || '[ Thinking headline ]'}
                  </p>
                </div>
                <div className="min-w-0 max-w-[42rem] space-y-6 xl:max-w-[44rem]">
                  {(Array.isArray(content.thinkingBody)
                    ? content.thinkingBody
                    : [content.thinkingBody || '[ Thinking body ]']
                  ).map((para, i) => (
                    <p key={i} className="text-2xl leading-relaxed" style={{ color: u.body }}>
                      {para}
                    </p>
                  ))}
                </div>

                {/* 02a — Dashboard (centerpiece) */}
                {content.dashboardBody && (
                  <div className="mt-28 w-full min-w-0 sm:mt-32 md:mt-40 lg:mt-44">
                    <div className="mb-12 space-y-1 md:mb-14">
                      {content.dashboardKicker && (
                        <p
                          className="text-3xl leading-snug md:text-4xl md:leading-snug"
                          style={{ ...titleStyle, color: u.kickerMuted }}
                        >
                          {content.dashboardKicker}
                        </p>
                      )}
                      {content.dashboardHeadline && (
                        <p
                          className="text-3xl leading-snug md:text-4xl md:leading-snug"
                          style={{ ...titleStyle, color: u.title }}
                        >
                          {content.dashboardHeadline}
                        </p>
                      )}
                    </div>
                    <div className="min-w-0 max-w-[42rem] space-y-6 xl:max-w-[44rem]">
                      {(Array.isArray(content.dashboardBody)
                        ? content.dashboardBody
                        : [content.dashboardBody]
                      ).map((para, i) => (
                        <p key={i} className="text-2xl leading-relaxed" style={{ color: u.body }}>
                          {para}
                        </p>
                      ))}
                    </div>
                    {content.dashboardImage !== undefined && (
                      <div className="mt-16 w-full min-w-0 md:mt-20">
                        <PlaceholderFrame
                          label="[ Dashboard ]"
                          src={content.dashboardImage}
                          monoStyle={monoStyle}
                          aspectClass=""
                          borderless
                          className="w-full"
                          style={{ aspectRatio: '16 / 9' }}
                        />
                      </div>
                    )}
                  </div>
                )}

                {/* 02b — Gates (doctrine across the app) */}
                {content.topics && content.topics.length > 0 && (
                  <div className="mt-28 w-full min-w-0 sm:mt-32 md:mt-40 lg:mt-44">
                    {content.gatesKicker && (
                      <div className="mb-12 space-y-1 md:mb-14">
                        <p
                          className="text-3xl leading-snug md:text-4xl md:leading-snug"
                          style={{ ...titleStyle, color: u.kickerMuted }}
                        >
                          {content.gatesKicker}
                        </p>
                      </div>
                    )}
                    <div className="min-w-0 max-w-[42rem] space-y-12 md:space-y-14 xl:max-w-[44rem]">
                      {content.topics.map(({ title: topicTitle, body, image }) => (
                        <div key={topicTitle} className="space-y-3">
                          <p
                            className="text-2xl leading-relaxed"
                            style={{ ...titleStyle, color: u.title }}
                          >
                            {topicTitle}
                          </p>
                          <p className="text-2xl leading-relaxed" style={{ color: u.body }}>
                            {body}
                          </p>
                          {image !== undefined && (
                            <div className="mt-4 w-full max-w-md">
                              <PlaceholderFrame
                                label="[ Image ]"
                                src={image}
                                monoStyle={monoStyle}
                                aspectClass="aspect-[16/10]"
                                borderless
                                className="w-full"
                              />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 02c — Safety net (Self-Directed) */}
                {content.flows && content.flows.length > 0 && (
                  <div className="mt-28 w-full min-w-0 sm:mt-32 md:mt-40 lg:mt-44">
                    <div className="mb-8 space-y-1 md:mb-10">
                      <p
                        className="text-3xl leading-snug md:text-4xl md:leading-snug"
                        style={{ ...titleStyle, color: u.kickerMuted }}
                      >
                        {content.safetyNetKicker || 'Where it shows'}
                      </p>
                    </div>
                    {content.safetyNetIntro && (
                      <div className="mb-12 min-w-0 max-w-[42rem] xl:max-w-[44rem] md:mb-14">
                        <p className="text-2xl leading-relaxed" style={{ color: u.body }}>
                          {content.safetyNetIntro}
                        </p>
                      </div>
                    )}
                    <div className="grid w-full min-w-0 grid-cols-1 gap-x-8 gap-y-12 xl:grid-cols-2 xl:gap-x-10 xl:gap-y-14">
                      {content.flows.map(({ title: flowTitle, problem, solution }) => (
                        <div key={flowTitle} className="min-w-0 max-w-prose space-y-3">
                          <p
                            className="text-xl leading-snug"
                            style={{ ...titleStyle, color: u.title }}
                          >
                            {flowTitle}
                          </p>
                          <p
                            className="text-xs leading-relaxed"
                            style={{ ...monoStyle, color: u.meta }}
                          >
                            {problem}
                          </p>
                          <p
                            className="text-lg leading-[1.65] md:text-xl md:leading-[1.65]"
                            style={{ color: u.body }}
                          >
                            {solution}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Section>

            <Section label="03 Experience" split>
              <div>
                <div className="mb-12 space-y-1 md:mb-14">
                  <p
                    className="text-3xl leading-snug md:text-4xl md:leading-snug"
                    style={{ ...titleStyle, color: u.kickerMuted }}
                  >
                    The Shift
                  </p>
                  <p
                    className="text-3xl leading-snug md:text-4xl md:leading-snug"
                    style={{ ...titleStyle, color: u.title }}
                  >
                    {content.shiftHeadline || '[ Shift headline ]'}
                  </p>
                </div>
                <div className="min-w-0 max-w-[42rem] space-y-6 xl:max-w-[44rem]">
                  {(Array.isArray(content.shiftBody)
                    ? content.shiftBody
                    : [content.shiftBody || '[ Shift body ]']
                  ).map((para, i) => (
                    <p key={i} className="text-2xl leading-relaxed" style={{ color: u.body }}>
                      {para}
                    </p>
                  ))}
                </div>
                {content.outcomes && content.outcomes.length > 0 && (
                  <div className="mt-16 w-full min-w-0 md:mt-20">
                    <div className="grid grid-cols-1 gap-0 border-t" style={{ borderColor: u.border }}>
                      {content.outcomes.map(({ label, body }) => (
                        <div
                          key={label}
                          className="flex min-w-0 flex-col gap-3 border-b py-8 sm:flex-row sm:gap-8 md:gap-16 md:py-10"
                          style={{ borderColor: u.border }}
                        >
                          <p
                            className="shrink-0 text-xl leading-snug sm:w-56 md:w-64 lg:w-72"
                            style={{ ...titleStyle, color: u.title }}
                          >
                            {label}
                          </p>
                          <p className="text-lg leading-relaxed" style={{ color: u.body }}>
                            {body}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Section>
          </div>
        )}

        <div className="mt-8 w-full pt-8 md:mt-32">
          {/* set like every case section: label on columns 1–3, the title from 4 */}
          <div className="grid grid-cols-12 gap-x-4 sm:gap-x-6">
            <p className="col-span-12 mb-6 text-xs md:col-span-3 md:mb-0 md:pt-4" style={{ ...monoStyle, color: u.meta }}>
              {koNext ? '다음 프로젝트' : 'Next project'}
            </p>
            <button
              type="button"
              onClick={() => onOpenProject(nextProject.id)}
              className="group col-span-12 block cursor-pointer border-0 bg-transparent p-0 text-left md:col-span-9 md:col-start-4"
            >
              <span
                className="inline-block text-4xl leading-[1.2] transition-transform duration-700 ease-[cubic-bezier(.16,1,.3,1)] group-hover:translate-x-3 md:text-[48px]"
                style={{ ...titleStyle, fontWeight: 600, color: u.title, letterSpacing: '-0.01em' }}
              >
                {nextProject.title}
              </span>
            </button>
          </div>
        </div>
      </div>
    </section>
    {lightbox && (
      <Lightbox
        items={lightbox.items}
        index={lightbox.index}
        onClose={closeLightbox}
        onPrev={prevImage}
        onNext={nextImage}
        monoStyle={monoStyle}
      />
    )}
    </>
  );
}
