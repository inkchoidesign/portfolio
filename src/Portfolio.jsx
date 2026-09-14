// Portfolio Site v8 - Preview
import { useState, useEffect, useRef, useLayoutEffect, useCallback } from 'react';
import { MetaballAnimation } from './MetaballAnimation';
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

/** Shared outer styles for all `[ Label ]` text CTAs (mono brackets) */
const CTA_BRACKET_CLASS =
  'tap-target inline-flex w-fit max-w-full cursor-pointer touch-manipulation items-center border-0 bg-transparent p-0 text-left no-underline transition-opacity hover:no-underline hover:opacity-60 visited:text-inherit focus:outline-none';
/** Link-style CTA text on dark UI: one step darker than primary text. */
const CTA_TEXT_ON_DARK = '#9a9a9a';

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
  monoStyle: m
}) {
  const inner = (
    <span className="whitespace-nowrap text-xs" style={{ ...m, color: CTA_TEXT_ON_DARK }}>
      [ {label} ]
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
    period: 'Apr 2024 · Present',
    bullets: [
      'Contributed to UI/UX direction across digital touchpoints',
      'Aligned brand, product, and marketing experiences',
      'Explored AI workflows to accelerate concepting'
    ]
  },
  {
    role: 'Visual Designer',
    org: 'TRADER (AutoSync)',
    period: '2022 · 2024',
    bullets: [
      'Delivered landing and campaign experiences',
      'Strengthened consistency across touchpoints',
      'Built scalable assets and systems'
    ]
  },
  {
    role: 'Visual Designer',
    org: 'Motoinsight',
    period: '2018 · 2021',
    bullets: [
      'Produced branded assets across web and campaigns',
      'Supported multi-channel communication'
    ]
  },
  {
    role: 'Senior Graphic Designer',
    org: 'Synergy Network',
    period: '2015 · 2018',
    bullets: [
      'Designed brand, web, and presentation materials',
      'Delivered projects from concept to production'
    ]
  },
  {
    role: 'Graphic Designer',
    org: 'Arbor Memorial Inc.',
    period: '2013 · 2015',
    bullets: [
      'Produced print and communication materials',
      'Managed production and delivery'
    ]
  }
];

const ABOUT_SKILLS_COPY =
  'Brand Identity, Marketing Design, Campaign Creative, Landing Pages, UI·UX, Design Systems, Visual Storytelling, Creative Strategy, Cross·Functional Collaboration, AI·Assisted Design, Figma, Adobe Creative Suite.';

/** Case study overlay / full-width card captions: fluid horizontal gutters */
const WORK_PAGE_GUTTER_X = 'px-5 sm:px-8 md:px-12 lg:px-16 xl:px-20';

const fadeUpStyle = (isVisible) => ({
  transform: isVisible ? 'translateY(0)' : 'translateY(60px)',
  opacity: isVisible ? 1 : 0,
  transition: 'transform 0.8s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.8s cubic-bezier(0.4, 0, 0.2, 1)'
});

/** Approach strip: solid, slightly darker than main shell (not pure black) */
const APPROACH_SURFACE = '#121212';

/** Home [Selected Work]: full index on Work page */
const FEATURED_WORK_IDS = ['investing', 'autosync', 'mi'];

/** Shared frame for every section and the fixed nav. Below 1440 this is a no-op and
 *  the page stays full-bleed; above it everything centres together, so the layout
 *  can't drift apart the way it did when only one section was constrained. */
const PAGE_FRAME = 'mx-auto w-full max-w-[1440px]';

/** Muted labels on dark UI (mono tags, years, section markers, approach subheads).
 *  4.72:1 on #1a1a1a — these render at 11-12px, so they need the AA 4.5 floor. */
const MUTED_ON_DARK = '#858585';
/** Body copy on dark UI (one step brighter, keeps the muted/body hierarchy readable) */
const BODY_ON_DARK = '#9a9a9a';

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
  onHoverMove
}) {
  return (
    <button
      type="button"
      data-project-index={index}
      onClick={onOpen}
      onMouseEnter={(e) => onHoverStart(e)}
      onMouseLeave={onHoverEnd}
      onMouseMove={onHoverMove}
      className="w-full text-left block py-6 transition-all duration-300"
      style={{
        borderTop: '1px solid #2a2a2a',
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
        transition: 'opacity 0.8s ease, transform 0.8s ease'
      }}
    >
      <div className="flex justify-between items-start md:items-center gap-8">
        {/* Hugs its content on desktop so the subtext sits next to the title instead
            of being pushed to the far edge by a stretched title column. */}
        <div className="flex items-start md:items-center gap-8 min-w-0 flex-1 md:flex-none">
          <span
            className="text-xs shrink-0 tabular-nums pt-1 md:pt-0"
            style={{ ...monoStyle, color: MUTED_ON_DARK }}
          >
            {project.num}
          </span>
          <div className="min-w-0 flex-1">
            <span
              className="text-2xl md:hidden block"
              style={{ ...titleStyle, color: TEXT_LIGHT_ON_DARK, lineHeight: '1.3' }}
            >
              {project.title}
            </span>
            <div
              className="hidden md:block min-w-0"
              style={{ position: 'relative', height: '52px', overflow: 'hidden' }}
            >
              <span
                className="text-4xl block transition-transform duration-300"
                style={{
                  ...titleStyle,
                  color: BODY_ON_DARK,
                  transform: isHovered ? 'translateY(-100%)' : 'translateY(0)',
                  lineHeight: '1.3'
                }}
              >
                {project.title}
              </span>
              <span
                className="text-4xl block absolute transition-transform duration-300"
                style={{
                  ...titleStyle,
                  color: TEXT_LIGHT_ON_DARK,
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
              style={{ ...monoStyle, letterSpacing: '0em', color: BODY_ON_DARK }}
            >
              {project.subtext}
            </p>
          </div>
        </div>
        {/* On desktop this line was hidden, leaving the middle of a full-bleed row
            empty but for the rule. It's the sharpest copy on the page, so it earns
            that space instead. */}
        <p
          className="hidden min-w-0 max-w-[620px] text-xs leading-relaxed md:block md:mr-auto"
          style={{ ...monoStyle, letterSpacing: '0em', color: MUTED_ON_DARK }}
        >
          {project.subtext}
        </p>
        <div className="flex items-center gap-8 shrink-0 pt-1 md:pt-0">
          <span
            className="text-xs hidden md:block"
            style={{ ...monoStyle, color: MUTED_ON_DARK }}
          >
            {project.tag}
          </span>
          <span className="text-xs tabular-nums" style={{ ...monoStyle, color: MUTED_ON_DARK }}>
            {project.year}
          </span>
        </div>
      </div>
    </button>
  );
}

/** Matches WorkGalleryCard widths: w-[min(92vw,560px)] md:w-[min(90vw,720px)], gap-6 / md:gap-10 */
function estimateWorkGalleryMaxShift(viewportW, cardCount) {
  const md = viewportW >= 768;
  const cardW = md ? Math.min(viewportW * 0.9, 720) : Math.min(viewportW * 0.92, 560);
  const gap = md ? 40 : 24;
  const rowW = cardCount * cardW + Math.max(0, cardCount - 1) * gap;
  return Math.max(0, Math.round(rowW - viewportW));
}

function WorkGalleryCard({ project, monoStyle, titleStyle, onOpen, variant = 'gallery' }) {
  const [imgHover, setImgHover] = useState(false);
  const widthClass =
    variant === 'full'
      ? 'w-full max-w-none shrink-0'
      : 'shrink-0 w-[min(92vw,560px)] md:w-[min(90vw,720px)]';

  const caption = (
    <>
      <p
        className="mt-12 w-full min-w-0 text-left text-base md:mt-16 md:text-lg"
        style={{ ...titleStyle, color: TEXT_LIGHT_ON_DARK }}
      >
        <span className="font-semibold">{project.title}</span>
        <span className="font-normal" style={{ color: BODY_ON_DARK }}>
          {' '}
          · {project.tag.trim()}
        </span>
      </p>
      <p
        className="mt-3 text-xs md:text-sm leading-relaxed"
        style={{ ...monoStyle, letterSpacing: '0em', color: BODY_ON_DARK }}
      >
        {project.subtext}
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
        className={`relative aspect-[16/10] w-full overflow-hidden bg-[#0a0a0a] md:aspect-[2/1] transition-[filter] duration-300 ease-out ${
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
  const [detailSheetOpen, setDetailSheetOpen] = useState(false);
  const detailOverlayRef = useRef(null);
  const detailSheetOpenRef = useRef(false);
  const prevDetailIdRef = useRef(null);

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
      const fallback = estimateWorkGalleryMaxShift(iw, 5);
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
    if (view !== 'about') return;

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
    return () => observer.disconnect();
  }, [view]);

  useEffect(() => {
    if (!logoHovered) {
      setBlinking(false);
      return;
    }
    const interval = setInterval(() => setBlinking(prev => !prev), 150);
    return () => clearInterval(interval);
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
      num: '001',
      title: 'Intelligent Investing',
      gallerySrc: 'images/investing-work-thumbnail.png',
      galleryHoverSrc: 'images/investing-home-thumbnail.png',
      subtext:
        'Not a buy button. A space to decide.',
      tag: 'Product · Platform',
      year: '2025',
      thumb: (
        <img
          src="images/investing-home-thumbnail.png"
          alt=""
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      )
    },
    {
      id: 'autosync',
      num: '002',
      title: 'AutoSync Branding',
      gallerySrc: 'images/autosync-work-thumbnail.png',
      galleryHoverSrc: 'images/autosync-home-thumbnail.png',
      subtext: 'Not just a logo, but a system that could hold products that didn\'t fully exist yet.',
      tag: 'Brand System',
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
      num: '003',
      title: 'MotoInsight',
      gallerySrc: 'images/motoinsight-work-thumbnail.png',
      galleryHoverSrc: 'images/motoinsight-home-thumbnail.png',
      subtext: 'Aligning brand across marketing and web experiences',
      tag: 'Brand · Marketing',
      year: '2023',
      thumb: (
        <img
          src="images/motoinsight-home-thumbnail.png"
          alt=""
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      )
    },
    {
      id: 'genesis',
      num: '004',
      title: 'Genesis',
      gallerySrc: 'images/genesis-work-thumbnail.png',
      galleryHoverSrc: 'images/genesis-home-thumbnail.png',
      subtext: 'Improving product flow clarity across complex user journeys',
      tag: 'UX · Product',
      year: '2024',
      thumb: (
        <img
          src="images/genesis-home-thumbnail.png"
          alt=""
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      )
    },
    {
      id: 'honda',
      num: '005',
      title: 'Honda Preorder',
      gallerySrc: 'images/honda-work-thumbnail.png',
      galleryHoverSrc: 'images/honda-home-thumbnail.png',
      subtext: "A pre-order flow most people didn't finish. The job was finding where it broke.",
      tag: 'UX · Journey',
      year: '2024',
      thumb: (
        <img
          src="images/honda-home-thumbnail.png"
          alt=""
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      )
    }
  ];

  /* Only the three featured case studies are published. Genesis and Honda stay in
     allProjects so the work isn't lost, but they're excluded everywhere until their
     case studies are written — otherwise the work gallery and the "next project"
     link would lead to pages that still show [ placeholder ] copy. */
  const projects = allProjects.filter((p) => FEATURED_WORK_IDS.includes(p.id));

  const featuredProjects = FEATURED_WORK_IDS.map((id) =>
    projects.find((p) => p.id === id)
  ).filter(Boolean);

  return (
    <div className="relative min-w-0 w-full" style={{ backgroundColor: '#1a1a1a' }}>
      {!detailProject && (
      <>
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
          <div className="rounded-full" style={{ backgroundColor: TEXT_LIGHT_ON_DARK, width: '18px', height: '18px' }} />
          <div className="rounded-full flex items-center justify-center gap-0.5" style={{ backgroundColor: TEXT_LIGHT_ON_DARK, width: '18px', height: '18px' }}>
            <div
              className="rounded-full transition-all duration-100"
              style={{
                backgroundColor: '#1a1a1a',
                width: '3px',
                height: '3px',
                opacity: blinking ? 0.35 : 1
              }}
            />
            <div
              className="rounded-full transition-all duration-100"
              style={{
                backgroundColor: '#1a1a1a',
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
          className="nav-stack pointer-events-auto ml-[52%] max-w-[calc(100vw-7rem)] text-xs sm:ml-[55%] sm:max-w-none"
          style={monoStyle}
        >
          {[
            { key: 'work', label: 'Work', page: 'work' },
            { key: 'about', label: 'About', page: 'about' },
            {
              key: 'contact',
              label: 'Contact',
              href: CONTACT_GMAIL_COMPOSE,
              openInNewTab: true
            }
          ].map((item) => {
            const isActive = item.page != null && view === item.page;
            const isHovered = hoveredMenu === item.key;
            const displayText = item.label;
            const hoverText = displayText;

            const navLinePx = 18;
            /* Outer element carries no overflow clip: it would also clip the
               .tap-target hit area down to 18px on touch devices. */
            const navItemStyle = {
              position: 'relative',
              height: `${navLinePx}px`,
              whiteSpace: 'nowrap',
              textDecoration: 'none',
              color: 'inherit'
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
                    color: isActive ? TEXT_LIGHT_ON_DARK : '#9a9a9a'
                  }}
                >
                  {(isActive || isHovered) && '■ '}
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
                    color: TEXT_LIGHT_ON_DARK
                  }}
                >
                  {(isActive || isHovered) && '■ '}
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
                  className="tap-target block min-w-0 max-w-full cursor-pointer touch-manipulation text-left no-underline transition-opacity hover:opacity-100 sm:min-w-[120px]"
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
                onClick={() => {
                  if (!item.page) return;
                  setDetailProject(null);
                  setDetailSheetOpen(false);
                  setView(item.page);
                }}
                onMouseEnter={() => setHoveredMenu(item.key)}
                onMouseLeave={() => setHoveredMenu(null)}
                className="tap-target block min-w-0 max-w-full touch-manipulation text-left sm:min-w-[120px]"
                style={navItemStyle}
              >
                {navItemBody}
              </button>
            );
          })}
        </div>
        </div>
      </nav>

      {/* Top-right meta: year on other views; site name on home */}
      <div className="pointer-events-none fixed inset-x-0 top-0 z-50">
        <div className={`${PAGE_FRAME} p-4 sm:p-8`}>
          <div
            className="text-right text-[10px] sm:text-xs"
            style={{ ...monoStyle, color: MUTED_ON_DARK }}
          >
            {view === 'home' ? 'Inkchoidesign' : '2026'}
          </div>
        </div>
      </div>
      </>
      )}

      {view === 'home' && (
        <>
          {/* Hero Section */}
          <section className={`hero-section ${PAGE_FRAME} flex h-screen flex-col justify-between px-4 py-6 sm:px-8 sm:py-8`}>
            <div
              className="flex-1 flex flex-col md:flex-row md:items-center gap-10"
              style={{
                transform: `translateY(${scrollY * -0.3}px)`,
                transition: 'transform 0.1s ease-out'
              }}
            >
              {/* Needs ~711px for the headline's intended two-line break; capped at
                  3xl so the paragraph underneath keeps a readable measure. */}
              <div className="min-w-0 md:max-w-3xl md:flex-[0_1_768px]">
                <h1
                  className="text-2xl md:text-4xl leading-tight max-w-5xl"
                  style={{
                    ...titleStyle,
                    color: TEXT_LIGHT_ON_DARK,
                    textWrap: 'balance',
                    opacity: homeLoaded ? 1 : 0,
                    transform: homeLoaded ? 'translateY(0)' : 'translateY(30px)',
                    transition: 'opacity 0.8s ease 0.15s, transform 0.8s ease 0.15s'
                  }}
                >
                  <span className="md:hidden">
                    Defining how brand and <span className="whitespace-nowrap">product connect</span>
                    <span className="block">through structure.</span>
                  </span>
                  <span className="hidden md:inline">
                    Defining how brand and product connect
                    <br />
                    through structure.
                  </span>
                </h1>
                <p
                  className="text-base md:text-lg leading-relaxed max-w-3xl mt-6"
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
                    Brand designer working across print, web, marketing, and product. The job: take a half-formed direction and make it concrete.
                  </span>
                  <span className="hidden md:inline">
                    Brand designer working across print, web, marketing, and product.
                    <br />
                    The job: take a half-formed direction and make it concrete.
                  </span>
                </p>
              </div>
              <div
                /* Absorbs whatever the text column leaves, so the headline always gets
                   its ~711px two-line measure first and no dead gap opens up on wide
                   screens. Fixed percentages broke at 1536 and ballooned past 2000. */
                className="mt-10 w-full min-w-0 md:mt-0 md:min-w-[280px] md:flex-[1_1_0%]"
                style={{
                  opacity: homeLoaded ? 1 : 0,
                  transform: homeLoaded ? 'translateY(0)' : 'translateY(30px)',
                  transition: 'opacity 1s ease 0.35s, transform 1s ease 0.35s'
                }}
              >
                <MetaballAnimation bgHex="#1a1a1a" mode="animation2" />
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
              <div className="text-xs text-right" style={{ ...monoStyle, color: MUTED_ON_DARK }}>
                [ Scroll ]
              </div>
            </div>
          </section>

          {/* Projects Section */}
          <section
            ref={projectsSectionRef}
            data-section="projects"
            className={`relative z-10 ${PAGE_FRAME} px-4 pb-36 pt-48 sm:px-8`}
          >
            <div
              className="mb-16"
              style={{
                opacity: projectsVisible ? 1 : 0,
                transform: projectsVisible ? 'translateY(0)' : 'translateY(20px)',
                transition: 'opacity 0.8s ease, transform 0.8s ease'
              }}
            >
              <h2 className="text-xs" style={{ ...monoStyle, color: MUTED_ON_DARK }}>Selected Work</h2>
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
                  onOpen={() => openProjectDetail(project.id)}
                  onHoverStart={(e) => {
                    setMousePos({ x: e.clientX, y: e.clientY });
                    handleProjectHover(project.id);
                  }}
                  onHoverEnd={() => setHoveredProject(null)}
                  onHoverMove={(e) => setMousePos({ x: e.clientX, y: e.clientY })}
                />
              ))}
              <div style={{ borderTop: '1px solid #2a2a2a' }} />
              <CtaBracket
                label="All Work"
                onClick={() => {
                  setDetailProject(null);
                  setDetailSheetOpen(false);
                  setView('work');
                }}
                monoStyle={monoStyle}
                className="mt-10 mb-0 text-left"
              />
            </div>
          </section>

          <div data-section="approach" className="relative z-0 px-4 sm:px-8">
            <div
              className="relative z-0 -mx-4 mt-12 mb-12 overflow-hidden sm:-mx-8"
              style={{ backgroundColor: APPROACH_SURFACE }}
            >
              <section className={`relative z-10 ${PAGE_FRAME} px-4 pb-40 pt-40 sm:px-8 md:pb-48 md:pt-48 lg:pb-[14rem] lg:pt-[14rem]`}>
                <div className="grid w-full grid-cols-1 items-start gap-12 text-left md:gap-14">
                  <div className="min-w-0 max-w-[42rem]">
                    <h2 className="mb-4 text-xs" style={{ ...monoStyle, color: MUTED_ON_DARK }}>
                      Process
                    </h2>
                    <p
                      className="text-base leading-[1.65] md:text-lg"
                      style={{ ...titleStyle, fontWeight: 400, color: BODY_ON_DARK }}
                    >
                      {
                        'From brand systems to product flows, my work is about making complexity clear, translating ideas into structured, intuitive experiences that connect strategy, design, and user needs.'
                      }
                    </p>
                    <p
                      className="mt-4 text-base leading-[1.65] md:text-lg"
                      style={{ ...titleStyle, fontWeight: 400, color: BODY_ON_DARK }}
                    >
                      {
                        'I focus on aligning brand, product, and interaction to create cohesive systems, turning ambiguity into clarity and helping teams move from concept to execution with purpose.'
                      }
                    </p>
                  </div>
                  {/* Three parallel ideas, each one short line. Stacked full-width
                      they left most of the row empty; side by side they fill it and
                      read as the comparison they are. */}
                  <div className="grid min-w-0 gap-10 md:grid-cols-3 md:gap-14">
                    <div className="pb-6">
                      <p
                        className="text-base md:text-lg"
                        style={{ ...titleStyle, fontWeight: 600, color: TEXT_LIGHT_ON_DARK }}
                      >
                        Context
                      </p>
                      <p
                        className="mt-3 text-base leading-[1.65] md:text-lg"
                        style={{ ...titleStyle, fontWeight: 400, color: BODY_ON_DARK }}
                      >
                        Understanding what matters
                      </p>
                    </div>
                    <div className="py-6">
                      <p
                        className="text-base md:text-lg"
                        style={{ ...titleStyle, fontWeight: 600, color: TEXT_LIGHT_ON_DARK }}
                      >
                        Structure
                      </p>
                      <p
                        className="mt-3 text-base leading-[1.65] md:text-lg"
                        style={{ ...titleStyle, fontWeight: 400, color: BODY_ON_DARK }}
                      >
                        Defining how things connect
                      </p>
                    </div>
                    <div className="pt-6">
                      <p
                        className="text-base md:text-lg"
                        style={{ ...titleStyle, fontWeight: 600, color: TEXT_LIGHT_ON_DARK }}
                      >
                        Experience
                      </p>
                      <p
                        className="mt-3 text-base leading-[1.65] md:text-lg"
                        style={{ ...titleStyle, fontWeight: 400, color: BODY_ON_DARK }}
                      >
                        Applying it across real use
                      </p>
                    </div>
                  </div>
                </div>
                <div className="mt-12 flex flex-wrap items-center gap-x-6 gap-y-2 md:mt-14">
                  <CtaBracket
                    label="About"
                    onClick={() => {
                      setDetailProject(null);
                      setDetailSheetOpen(false);
                      setView('about');
                    }}
                    monoStyle={monoStyle}
                    className="text-left"
                  />
                  <CtaBracket label="Contact" href={CONTACT_MAILTO} monoStyle={monoStyle} className="text-left" />
                </div>
              </section>
            </div>

            <footer
              className="-mx-4 border-t border-[#2a2a2a] px-4 pb-16 pt-12 sm:-mx-8 sm:px-8"
              style={{
                backgroundColor: APPROACH_SURFACE,
                transform: `translateY(${scrollY * -0.05}px)`,
                opacity: homeLoaded ? 1 : 0,
                transition: 'opacity 0.8s ease 1s, transform 0.1s ease-out'
              }}
            />
          </div>
        </>
      )}

      {view === 'work' && (
        <div className="relative z-10" style={{ backgroundColor: '#1a1a1a' }}>
          <section className="flex min-h-screen flex-col justify-center px-4 pb-8 pt-28 sm:px-8 md:pt-32">
            <div
              ref={workHeroParallaxRef}
              style={{
                willChange: 'transform',
                transform: 'translate3d(0, var(--wh-py, 0px), 0)'
              }}
            >
              <div
                className="max-w-4xl"
                style={{
                  opacity: workPageLoaded ? 1 : 0,
                  transform: workPageLoaded ? 'translateY(0)' : 'translateY(28px)',
                  transition: 'opacity 0.8s ease, transform 0.8s ease'
                }}
              >
                <h1
                  className="text-2xl leading-tight md:text-4xl"
                  style={{ ...titleStyle, color: TEXT_LIGHT_ON_DARK }}
                >
                  Work
                </h1>
                <p
                  className="mt-6 max-w-2xl text-base leading-[1.5] md:text-lg md:leading-[1.5]"
                  style={{
                    ...titleStyle,
                    fontWeight: 400,
                    color: '#999999',
                    letterSpacing: '-0.01em'
                  }}
                >
                  A selection of projects across brand, product, and marketing,
                  <br />
                  focused on clarity and structure.
                </p>
              </div>
            </div>
          </section>

          <section className="px-4 pb-6 pt-2 sm:px-8">
            <div
              ref={workGalleryPinRef}
              className="relative w-full min-h-screen"
              style={{ backgroundColor: '#1a1a1a' }}
            >
              <div
                className="sticky top-0 z-10 flex h-screen min-h-screen w-full flex-col overflow-hidden relative"
                style={{ backgroundColor: '#1a1a1a' }}
              >
                <div className="flex min-h-0 min-w-0 flex-1 flex-col items-center justify-center gap-20 px-2 sm:gap-24 md:gap-28">
                  <p
                    className="pointer-events-none shrink-0 text-center text-xs leading-normal"
                    style={{ ...monoStyle, color: MUTED_ON_DARK }}
                  >
                    {projects.length} Featured Projects
                  </p>
                  <div className="w-full min-h-0 min-w-0 shrink overflow-hidden">
                    <div
                      ref={workGalleryTrackRef}
                      className="flex w-max max-w-none shrink-0 gap-6 md:gap-10"
                      style={{
                        willChange: 'transform',
                        transform: 'translate3d(var(--wg-tx, 0px), 0, 0)'
                      }}
                    >
                      {projects.map((project) => (
                        <WorkGalleryCard
                          key={project.id}
                          project={project}
                          monoStyle={monoStyle}
                          titleStyle={titleStyle}
                          onOpen={(id) => openProjectDetail(id)}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section
            ref={workFooterRef}
            className="border-t border-[#2a2a2a] px-4 py-24 sm:px-8 md:py-32"
            style={{ backgroundColor: '#1a1a1a' }}
          >
            <h2
              className="max-w-3xl text-2xl leading-tight md:text-4xl"
              style={{ ...titleStyle, color: TEXT_LIGHT_ON_DARK }}
            >
              Let&apos;s build something meaningful.
            </h2>
            <CtaBracket
              label="Contact"
              href={CONTACT_MAILTO}
              monoStyle={monoStyle}
              className="mt-10 text-left md:mt-12"
            />
          </section>
        </div>
      )}

      {view === 'home' && !detailProject && hoveredProject && (() => {
        const vw = typeof window !== 'undefined' ? window.innerWidth : 1200;
        const previewW = Math.min(320, Math.max(240, vw - 24));
        const leftPx = Math.max(8, Math.min(mousePos.x + 15, vw - previewW - 8));
        const topPx = Math.max(12, mousePos.y - 100);
        return (
        <div
          className="fixed pointer-events-none z-[200] w-[min(20rem,calc(100vw-1.5rem))] sm:w-72 md:w-80"
          style={{
            left: `${leftPx}px`,
            top: `${topPx}px`,
            transition: 'left 0.15s ease-out, top 0.15s ease-out'
          }}
        >
          <div
            className="h-48 overflow-hidden rounded sm:h-52 md:h-56"
            style={{
              position: 'relative',
              backgroundColor: '#0a0a0a',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)'
            }}
          >
            {thumbTransition.prev && (
              <div
                className="w-full h-full absolute top-0 left-0"
                style={{
                  transition: 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                  transform: thumbTransition.isAnimating ? 'translateY(-100%)' : 'translateY(0)',
                  zIndex: 1
                }}
              >
                {projects.find((p) => p.id === thumbTransition.prev)?.thumb}
              </div>
            )}
            <div
              className="w-full h-full absolute top-0 left-0"
              style={{
                transition: thumbTransition.isAnimating
                  ? 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)'
                  : 'none',
                transform:
                  !thumbTransition.prev || thumbTransition.isAnimating
                    ? 'translateY(0)'
                    : 'translateY(100%)',
                zIndex: 2
              }}
            >
              {projects.find((p) => p.id === thumbTransition.current)?.thumb}
            </div>
            <div
              className="absolute inset-0 z-[3] pointer-events-none flex items-center justify-center px-5"
              style={{
                background: 'rgba(0,0,0,0.5)'
              }}
            >
              <p
                className="max-w-[86%] text-center text-xs md:text-sm leading-relaxed"
                style={{
                  ...monoStyle,
                  letterSpacing: '0em',
                  color: 'rgba(235, 232, 228, 0.95)'
                }}
              >
                {projects.find((p) => p.id === thumbTransition.current)?.subtext}
              </p>
            </div>
          </div>
        </div>
        );
      })()}

      {view === 'about' && (
        <div className="relative z-10 h-screen w-full min-w-0 overflow-hidden" style={{ backgroundColor: '#1a1a1a' }}>
          <section className="relative z-10 w-full min-w-0 px-4 pb-32 pt-28 sm:px-8 md:pb-40 md:pt-32">
            <div className="grid w-full min-w-0 grid-cols-1 gap-16 lg:grid-cols-[minmax(0,2.85fr)_minmax(0,1fr)] lg:items-start lg:gap-16 xl:gap-24">
              <div
                className="min-w-0 lg:sticky lg:top-28 lg:self-start"
                data-section="aboutLeft"
                style={fadeUpStyle(visibleSections.aboutLeft)}
              >
                <h1
                  className="max-w-5xl text-2xl leading-tight md:text-4xl"
                  style={{ ...titleStyle, color: TEXT_LIGHT_ON_DARK }}
                >
                  Inkyung Choi
                </h1>
                <p
                  className="mt-6 max-w-2xl text-base leading-relaxed md:text-lg"
                  style={{ ...titleStyle, fontWeight: 400, color: BODY_ON_DARK }}
                >
                  Designer with 10+ years of experience across branding, marketing, and digital product design.
                  I create cohesive experiences across campaigns, landing pages, UI systems, and onboarding by
                  bridging brand and product with clarity, craft, and strategic thinking.
                </p>
                <div className="mt-10">
                  <CtaBracket
                    label="Featured Projects"
                    onClick={() => setView('work')}
                    monoStyle={monoStyle}
                    className="text-left"
                  />
                </div>
              </div>

              <div
                className="flex min-w-0 flex-col gap-14"
                data-section="aboutRight"
                style={fadeUpStyle(visibleSections.aboutRight)}
              >
                <div className="space-y-12 md:space-y-14">
                  <div>
                    <p className="mb-6 text-xs tabular-nums" style={{ ...monoStyle, color: MUTED_ON_DARK }}>
                      1.0
                    </p>
                    <div className="space-y-10">
                      {ABOUT_EXPERIENCE.map((job, index) => (
                        <div
                          key={`${job.org}-${job.period}`}
                          className="border-t border-[#2a2a2a] pt-8 first:border-t-0 first:pt-0 overflow-hidden"
                        >
                          <button
                            type="button"
                            onClick={() =>
                              setExpandedAboutJobs((prev) => ({
                                ...prev,
                                [index]: !prev[index]
                              }))
                            }
                            className="w-full text-left"
                            aria-expanded={!!expandedAboutJobs[index]}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <p style={{ ...titleStyle, color: TEXT_LIGHT_ON_DARK }}>
                                  <span className="font-semibold">{job.org}</span>
                                  <span className="font-normal" style={{ color: BODY_ON_DARK }}>
                                    {' '}
                                    · {job.role}
                                  </span>
                                </p>
                                <p
                                  className="mt-1 text-xs sm:hidden"
                                  style={{ ...monoStyle, color: '#7a7a7a' }}
                                >
                                  {job.period}
                                </p>
                              </div>
                              <div className="flex items-center gap-3 shrink-0">
                                <p
                                  className="text-xs hidden sm:block"
                                  style={{ ...monoStyle, color: '#7a7a7a' }}
                                >
                                  {job.period}
                                </p>
                                <span
                                  className="text-xs leading-none"
                                  style={{ ...monoStyle, color: '#8a8a8a' }}
                                >
                                  {expandedAboutJobs[index] ? '[-]' : '[+]'}
                                </span>
                              </div>
                            </div>
                          </button>
                          {job.bullets.length > 0 && (
                            <div
                              className="grid transition-[grid-template-rows,opacity,margin-top] duration-300 ease-out"
                              style={{
                                gridTemplateRows: expandedAboutJobs[index] ? '1fr' : '0fr',
                                opacity: expandedAboutJobs[index] ? 1 : 0,
                                marginTop: expandedAboutJobs[index] ? '1rem' : '0'
                              }}
                            >
                              <div className="overflow-hidden">
                                <ul className="list-none space-y-2 p-0 m-0">
                                  {job.bullets.map((b) => (
                                    <li
                                      key={b}
                                      className="text-base leading-relaxed md:text-lg"
                                      style={{ ...titleStyle, fontWeight: 400, color: BODY_ON_DARK }}
                                    >
                                      {b}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="mb-3 text-xs tabular-nums" style={{ ...monoStyle, color: MUTED_ON_DARK }}>
                      2.0
                    </p>
                    <p
                      className="text-base leading-relaxed md:text-lg"
                      style={{ ...titleStyle, fontWeight: 400, color: BODY_ON_DARK }}
                    >
                      {ABOUT_SKILLS_COPY}
                    </p>
                  </div>
                </div>

                <div
                  className="border-t border-[#2a2a2a] pt-10"
                  data-section="aboutFooter"
                  style={fadeUpStyle(visibleSections.aboutFooter)}
                >
                  <CtaBracket
                    label="LinkedIn"
                    href="https://www.linkedin.com/"
                    external
                    monoStyle={monoStyle}
                    className="text-left"
                  />
                  <div className="mt-8 flex flex-col gap-4 text-left md:hidden">
                    <CtaBracket
                      label="Home"
                      onClick={() => {
                        setDetailProject(null);
                        setDetailSheetOpen(false);
                        setView('home');
                      }}
                      monoStyle={monoStyle}
                      className="text-left"
                    />
                    <CtaBracket
                      label="Work"
                      onClick={() => {
                        setDetailProject(null);
                        setDetailSheetOpen(false);
                        setView('work');
                      }}
                      monoStyle={monoStyle}
                      className="text-left"
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      )}

      {detailProject && (
        <div
          ref={detailOverlayRef}
          role="dialog"
          aria-modal="true"
          aria-label="Project"
          onTransitionEnd={handleDetailTransitionEnd}
          className={`fixed inset-0 z-[120] flex flex-col transition-transform duration-[480ms] ease-[cubic-bezier(0.32,0.72,0,1)] ${
            detailSheetOpen ? 'translate-y-0' : 'translate-y-full'
          }`}
          style={{ backgroundColor: DETAIL_UI.overlayBg, willChange: 'transform' }}
        >
          <div className={`flex shrink-0 justify-end pb-8 pt-6 sm:pb-10 sm:pt-8 ${WORK_PAGE_GUTTER_X}`}>
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
            <CaseStudy
              project={detailProject}
              projects={projects}
              monoStyle={monoStyle}
              titleStyle={titleStyle}
              onOpenProject={(id) => setDetailProject(id)}
            />
          </div>
        </div>
      )}
    </div>
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
    num: '001',
    company: 'Orion Digital Corp.',
    scope: 'Brand · Product · Design System · App architecture',
    deliverables:
      'Native app on iOS and Android. Severe-mode design system. The Manual. Onboarding signature.',
    heroImage: 'images/investing-work-thumbnail.png',

    // 01 — The Situation
    contextHeadline: 'What everyone else is solving for.',
    contextBody: [
      'The job is decision quality. Most fintech solves the opposite problem. Tap more. Trade more. Open the app more. Every default points at activity.',
      'The audience is the self-aware underperforming active investor. They already have positions. They already know they leave alpha on the table. They want a system that measures them honestly, not one that flatters them.',
      'Most fintech does the opposite job. The product has to repel the wrong audience as actively as it attracts the right one.'
    ],

    // 02 — The Thinking
    thinkingHeadline: 'The brand had to be the behavior.',
    thinkingBody: [
      'Severe mode means brand and UI are the same thing. No skin layer. The doctrine reads: if a screen feels nice, remove something. Rules like that cannot be applied at the end. They have to shape every decision from the first wireframe.',
      'The scope was brand, product, design system, and app architecture in the same hand. Brand and product cannot drift if they were never separate to begin with.'
    ],

    // 02a — Dashboard (centerpiece)
    dashboardKicker: 'The Centerpiece',
    dashboardHeadline: 'Where the doctrine starts.',
    dashboardBody: [
      'Most fintech dashboards are decision surfaces. Push, color, alert, suggestion. Every pixel sells the next action.',
      'The II dashboard is the opposite. The job is orientation, not decision. The doctrine reads: the restraint is the signal. The page answers one question. What do I own, and how meaningful are those decisions?',
      'The hero metric is total alpha. Three KPI cards. Your portfolio. What the benchmark would have made. The alpha between them. The equity curve has two lines. Solid is your real path. Dashed is the alternative you bypassed. The dashed line stays on the page every session. There is no hiding from it.',
      'No green. No red. Sign and label carry the meaning. Color is for legibility, not emotion. Cutting the most familiar fintech signal is a statement of posture before it is a design decision.',
      'The dashboard’s commercial job is the State 6 to State 7 transition. State 6 is the most common existing user. Capital in the account, Core portfolio sitting inactive. State 7 is the target. Same capital, Core active, projection arc forward. Activation here does not mean more trading. It means the user has moved onto the slower, supervised path. The word flips. From “do more” to “stand on the right default.”'
    ],
    dashboardImage: 'images/investing-dashboard-detail.png',

    // 02b — Gates (doctrine moments across the app)
    gatesKicker: 'Same doctrine. Different scale.',
    topics: [
      {
        title: 'Signature trio at sign-up',
        body:
          'Three doctrine moments before the first action. Calibration. A philosophy screen the user has to clear before account creation. Deliberate Proceed. A 1000ms hold built into the confirmation. Final Transition. The last screen of onboarding: “You’ve joined the few who invest with intention.” The first action of the product is selection, not welcome.',
        image: 'images/investing-signup-final.png'
      },
      {
        title: 'Decision language',
        body:
          'The buttons get new names. Not Buy. Initiate Position. Not Sell. Reduce Exposure. The words the user taps every day stop being verbs of activity. They become labels for a decision.',
        image: 'images/investing-capital-decision.png'
      },
      {
        title: 'Slow defaults',
        body:
          'The buy flow defaults to Limit, not Market. The most common fintech default, flipped on purpose. Transitions hold for 120 to 180 milliseconds before they start. Deliberate Proceed waits a full second. None of this is loading. It is the system making space for the call.',
        image: 'images/investing-buy-limit.png'
      },
      {
        title: 'No green. No red.',
        body:
          'The fintech default reads gain and loss in color. The system removes that signal. Sign and label do the work. Color is reserved for legibility. The hardest visual constraint to hold becomes the most quoted line in the doctrine. If a color feels expressive, it is wrong.',
        image: 'images/investing-closed-positions.png'
      },
      {
        title: 'Hidden vs Disabled',
        body:
          'Even failure states stay disciplined. A five-minute identity review disables the action button. It will come back. A pending account closure hides the button entirely. It will not. Disabled and hidden are not the same word here. The system never offers false hope.',
        image: 'images/investing-states-comparison.png'
      }
    ],

    // 02c — Safety net (Self-Directed)
    safetyNetKicker: 'The safety net.',
    safetyNetIntro:
      'The Self-Directed side carries the elaborate accountability layer. Per-tranche shadow benchmarking. Anti-hiding default sort. Cash drag callout. Re-underwriting triggers. None of this is the main product. It is the safety net for users who insist on driving themselves.',
    flows: [
      {
        title: 'The buy gate',
        problem: 'Capital allocation is irreversible. Decisions made quickly are rarely reviewed honestly.',
        solution:
          'The memo captures thesis, kill line, and time horizon at the moment of the action. Confidence input is 40, 50, 60, 70, or 80. No sliders. False precision is its own form of dishonesty.'
      },
      {
        title: 'Anti-hiding by default sort',
        problem: 'Investors instinctively scroll to their winners. Most fintech helps them do it.',
        solution:
          'Default sort across closed positions is alpha ascending. Worst dollar contributor at the top, every time the page opens. No winners-only view. The system refuses the hiding behavior it could otherwise enable.'
      },
      {
        title: 'Per-tranche shadow benchmarking',
        problem: 'Portfolio-level “I beat the market” is gameable. Selection bias and cash drag hide inside averages.',
        solution:
          'Every dollar deployed creates a shadow benchmark position at the same moment, FIFO-matched on close. Alpha is calculated per tranche, in dollars and percentage. Each decision answers for itself.'
      },
      {
        title: 'Re-underwriting you cannot ignore',
        problem: 'Standing still is also a decision. Most apps treat it as no action.',
        solution:
          'A 20% price move from the last assessment or an earnings date forces a re-underwriting surface. Confidence shifts of 10 points or more require notes. Ignoring the alert for five trading days marks the position as decision by not deciding.'
      }
    ],

    // 03 — The Shift
    shiftHeadline: 'Activation, redefined.',
    shiftBody: [
      'Shipping was not the hard part. Holding severity under pressure was. Every quarter, someone suggested softening the language to improve conversion, or testing a friendlier version. The doctrine has a phrase for those moments. Pause, we are breaking character. The product launched and still wears the same brand a year later. For an audience that tunes out the moment they feel pushed, that consistency mattered more than any CTA could.',
      'The deeper shift is internal. Activation used to mean trade count. Active accounts. Daily opens. Now it means the State 7 user. Capital plus Core active plus projection. The product succeeds when fewer people feel forced to be heroes.'
    ],
    outcomes: [
      {
        label: 'Shipped',
        body: 'Native app live on iOS and Android after a year of build. Brand intact.'
      },
      {
        label: 'Doctrine durability',
        body: 'Severity held through quarter-by-quarter pressure to soften. The same rules govern the product today.'
      },
      {
        label: 'System as contract',
        body: 'Component library and severity conventions absorb new features without rebuilding the language each time.'
      },
      {
        label: 'Selectivity',
        body: 'The product repels the comfort-seeker as actively as it attracts the disciplined investor.'
      }
    ]
  },
  genesis: {
    title: 'Genesis',
    subtitle: 'Luxury automotive interface system',
    tag: 'UX · Product',
    num: '003',
    situation: 'Genesis needed a cohesive digital interface system matching the sophistication of their vehicle interiors.',
    task: 'Design a unified UI system balancing luxury aesthetics with safety-first interaction patterns.',
    action: [
      'Audited automotive interfaces across luxury segment',
      'Developed design language for "Athletic Elegance" philosophy',
      'Created modular component system for glanceable info',
      'Designed adaptive interfaces that simplify during motion'
    ],
    result: 'Delivered UI kit with 200+ components. Design system adopted across Genesis digital touchpoints.'
  },
  honda: {
    title: 'Honda Preorder',
    titleLine2: 'Where the funnel was breaking.',
    subtitle: "A pre-order flow most people didn't finish. The job was finding where it broke.",
    tag: 'UX · Journey',
    num: '004',
    company: 'Honda',
    scope: 'UX · Flow Design',
    deliverables: 'End-to-end pre-order experience',
    contextHeadline: '[ Honda — situation headline to write ]',
    contextBody:
      '[ Honda — what was actually broken about the pre-order flow. Who was abandoning, where, why. Raw notes from ink go here. ]',
    thinkingHeadline: '[ Honda — thinking headline ]',
    thinkingBody:
      '[ Honda — the reasoning behind the redesign. The decision that shaped the new flow. ]',
    shiftHeadline: '[ Honda — shift headline ]',
    shiftBody: '[ Honda — what changed after launch. Real outcome, not overclaimed. ]'
  },
  autosync: {
    title: 'AutoSync Branding',
    titleLine2: 'Multiple products. One thread.',
    subtitle: 'Not just a logo, but a system that could hold products that didn\'t fully exist yet.',
    tag: 'Brand System',
    num: '002',
    situation: 'AutoSync needed a brand identity conveying innovation and reliability to enterprise clients.',
    task: 'Create a complete brand system including logo, visual identity, and guidelines.',
    action: [
      'Led discovery workshops for brand positioning',
      'Explored 30+ logo concepts',
      'Developed flexible visual system',
      'Created comprehensive brand guidelines'
    ],
    result: 'Brand launched supporting Series A fundraising and enterprise sales.'
  },
  mi: {
    title: 'MotoInsight',
    subtitle: 'Corporate website redesign',
    tag: 'Brand · Marketing',
    num: '005',
    situation: 'MotoInsight\'s website was outdated and didn\'t reflect their market position.',
    task: 'Redesign the corporate website to improve UX and brand perception.',
    action: [
      'Conducted stakeholder interviews',
      'Restructured information architecture',
      'Designed responsive layouts',
      'Collaborated on interactive elements'
    ],
    result: '35% improvement in session duration, 28% increase in inquiries.'
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

function CaseStudy({ project, projects, monoStyle, titleStyle, onOpenProject }) {
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
    <section className="w-full min-w-0 px-0 pb-24 pt-8 sm:pb-32 sm:pt-12 md:pt-16">
      {project === 'autosync' ? (
        <>
        <div className={`mb-48 w-full min-w-0 pb-12 sm:pb-14 md:pb-20 md:mb-56 ${WORK_PAGE_GUTTER_X}`}>
          {/*
            lg+ layout: title left, meta right. No flex-1/basis-0 on title (that collapsed the column). shrink-0 keeps a readable min width.
          */}
          <div className="flex w-full min-w-0 flex-col gap-10 lg:flex-row lg:flex-wrap lg:items-start lg:justify-between lg:gap-x-8 lg:gap-y-10 xl:gap-x-10">
            <header className="w-full max-w-[36rem] shrink-0 text-left">
              <h1
                className="text-2xl tracking-tight md:text-4xl md:leading-[1.08]"
                style={{ ...titleStyle, color: u.title }}
              >
                <span className="block">{content.title}</span>
                <span className="mt-2 block md:mt-3">{content.titleLine2}</span>
              </h1>
              <p
                className="mt-4 max-w-xl text-base font-normal leading-relaxed md:mt-5 md:text-lg md:leading-relaxed"
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
                  className="mt-5 text-sm font-normal leading-[1.55] md:text-base md:leading-[1.55] lg:text-lg lg:leading-[1.55]"
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
                  className="mt-5 text-sm font-normal leading-[1.55] md:text-base md:leading-[1.55] lg:text-lg lg:leading-[1.55]"
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
                  className="mt-5 text-sm font-normal leading-[1.55] md:text-base md:leading-[1.55] lg:text-lg lg:leading-[1.55] lg:whitespace-nowrap"
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
                className="text-2xl tracking-tight md:text-4xl md:leading-[1.08]"
                style={{ ...titleStyle, color: u.title }}
              >
                <span className="block">{content.title}</span>
                {content.titleLine2 && (
                  <span className="mt-2 block md:mt-3">{content.titleLine2}</span>
                )}
              </h1>
              <p
                className="mt-4 max-w-xl text-base font-normal leading-relaxed md:mt-5 md:text-lg md:leading-relaxed"
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
                  className="mt-5 text-sm font-normal leading-[1.55] md:text-base md:leading-[1.55] lg:text-lg lg:leading-[1.55]"
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
                  className="mt-5 text-sm font-normal leading-[1.55] md:text-base md:leading-[1.55] lg:text-lg lg:leading-[1.55]"
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
                  className="mt-5 text-sm font-normal leading-[1.55] md:text-base md:leading-[1.55] lg:text-lg lg:leading-[1.55] lg:whitespace-nowrap"
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
        {project === 'autosync' ? (
          <div className="space-y-36 pt-12 sm:space-y-44 sm:pt-14 md:space-y-52 md:pt-20">
            <Section label="01 Context" split>
              <div>
                <div className="mb-12 space-y-1 md:mb-14">
                  <p
                    className="text-2xl leading-snug md:text-3xl md:leading-snug"
                    style={{ ...titleStyle, color: u.kickerMuted }}
                  >
                    The Situation
                  </p>
                  <p
                    className="text-2xl leading-snug md:text-3xl md:leading-snug"
                    style={{ ...titleStyle, color: u.title }}
                  >
                    Nothing broken. Nothing there.
                  </p>
                </div>

                <div className="min-w-0 max-w-[42rem] space-y-6 xl:max-w-[44rem]">
                  <p className="text-xl leading-relaxed" style={{ color: u.body }}>
                    AutoSync was a brand new division inside Trader, built to bring the company&apos;s digital products
                    under one roof. There was no broken identity to fix. There was no identity at all.
                  </p>
                  <p className="text-xl leading-relaxed" style={{ color: u.body }}>
                    Starting from zero is a different kind of problem. You can&apos;t audit what doesn&apos;t exist. Every
                    decision (color, type, structure) had to be made without a reference point, while the products
                    themselves were still being built.
                  </p>
                  <p className="text-xl leading-relaxed" style={{ color: u.body }}>
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
                        className="text-xl leading-relaxed"
                        style={{ color: u.body }}
                      >
                        <span className="block">The brief wasn&apos;t a brief.</span>
                        <span className="block">It was a direction from a meeting: &ldquo;keep diversity in one.&rdquo;</span>
                      </p>
                      <p
                        className="text-xl leading-relaxed"
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
                    className="text-2xl leading-snug md:text-3xl md:leading-snug"
                    style={{ ...titleStyle, color: u.kickerMuted }}
                  >
                    The Thinking
                  </p>
                  <p
                    className="text-2xl leading-snug md:text-3xl md:leading-snug"
                    style={{ ...titleStyle, color: u.title }}
                  >
                    From a phrase to a system.
                  </p>
                </div>

                <div className="min-w-0 max-w-[42rem] space-y-12 md:space-y-14 xl:max-w-[44rem]">
                  <div className="space-y-3">
                    <p className="text-xl leading-relaxed" style={{ ...titleStyle, color: u.title }}>
                      The hex wasn&apos;t the starting point: the logic was
                    </p>
                    <p className="text-xl leading-relaxed" style={{ color: u.body }}>
                      &ldquo;Diversity in one&rdquo; came out of a team conversation. It wasn&apos;t a design brief, it
                      was a direction. I took that idea (connection without uniformity) and looked for a form that could
                      carry it. The hexagonal system came from that question, not the other way around.
                    </p>
                  </div>
                  <div className="space-y-3">
                    <p className="text-xl leading-relaxed" style={{ ...titleStyle, color: u.title }}>
                      Each product needed room, not just rules
                    </p>
                    <p className="text-xl leading-relaxed" style={{ color: u.body }}>
                      The products under AutoSync were different enough that forcing them into one look would&apos;ve
                      felt false. The system had to be a framework, not a template. The hex, grid logic, and type
                      hierarchy are shared. Color and tone belong to each product — that&apos;s what gives them room to breathe.
                    </p>
                  </div>
                  <div className="space-y-3">
                    <p className="text-xl leading-relaxed" style={{ ...titleStyle, color: u.title }}>
                      Built to be used without a designer in the room
                    </p>
                    <p className="text-xl leading-relaxed" style={{ color: u.body }}>
                      A new department moves fast. If the brand system required a designer to approve every output, it
                      would get ignored. Every decision was tested against one question: can someone else use this and
                      still get it right?
                    </p>
                  </div>
                  <div className="space-y-3">
                    <p className="text-xl leading-relaxed" style={{ ...titleStyle, color: u.title }}>
                      Credibility before personality
                    </p>
                    <p className="text-xl leading-relaxed" style={{ color: u.body }}>
                      AutoSync was brand new. The first job of the identity wasn&apos;t to be distinctive — it was to look
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
                          className="text-2xl leading-snug md:text-3xl md:leading-snug"
                          style={{ ...titleStyle, color: u.kickerMuted }}
                        >
                          What Got Built
                        </p>
                      </div>
                      <p className="text-xl leading-relaxed" style={{ color: u.body }}>
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
                          'The structural thread running through everything — logos, layouts, product marks. It organizes the system without drawing attention to itself.'
                      },
                      {
                        title: 'Sub-brand Rules',
                        body:
                          "Shared grid and hex logic. Product-specific color and tone. They're clearly related — but each one has its own register."
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
                      className="text-2xl leading-snug md:text-3xl md:leading-snug"
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
                    className="text-2xl leading-snug md:text-3xl md:leading-snug"
                    style={{ ...titleStyle, color: u.kickerMuted }}
                  >
                    The Shift
                  </p>
                  <p
                    className="text-2xl leading-snug md:text-3xl md:leading-snug"
                    style={{ ...titleStyle, color: u.title }}
                  >
                    A department that looked like it had always been there.
                  </p>
                </div>

                <div className="min-w-0 max-w-[42rem] space-y-6 xl:max-w-[44rem]">
                  <p className="text-xl leading-relaxed" style={{ color: u.body }}>
                    AutoSync launched as a new division but it didn&apos;t look like one. That&apos;s the whole job — credibility that would normally take years to build, available on day one.
                  </p>
                  <p className="text-xl leading-relaxed" style={{ color: u.body }}>
                    Teams started producing content without routing everything through design. The hex gave them a visual shorthand — something concrete to point at when someone asked what the brand actually was.
                  </p>
                  <p className="text-xl leading-relaxed" style={{ color: u.body }}>
                    When new products joined, the system absorbed them. No rebuilding from scratch, no visual inconsistency — just another product that fit.
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
                    className="text-2xl leading-snug md:text-3xl md:leading-snug"
                    style={{ ...titleStyle, color: u.kickerMuted }}
                  >
                    The Situation
                  </p>
                  <p
                    className="text-2xl leading-snug md:text-3xl md:leading-snug"
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
                    <p key={i} className="text-xl leading-relaxed" style={{ color: u.body }}>
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
                    className="text-2xl leading-snug md:text-3xl md:leading-snug"
                    style={{ ...titleStyle, color: u.kickerMuted }}
                  >
                    The Thinking
                  </p>
                  <p
                    className="text-2xl leading-snug md:text-3xl md:leading-snug"
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
                    <p key={i} className="text-xl leading-relaxed" style={{ color: u.body }}>
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
                          className="text-2xl leading-snug md:text-3xl md:leading-snug"
                          style={{ ...titleStyle, color: u.kickerMuted }}
                        >
                          {content.dashboardKicker}
                        </p>
                      )}
                      {content.dashboardHeadline && (
                        <p
                          className="text-2xl leading-snug md:text-3xl md:leading-snug"
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
                        <p key={i} className="text-xl leading-relaxed" style={{ color: u.body }}>
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
                          className="text-2xl leading-snug md:text-3xl md:leading-snug"
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
                            className="text-xl leading-relaxed"
                            style={{ ...titleStyle, color: u.title }}
                          >
                            {topicTitle}
                          </p>
                          <p className="text-xl leading-relaxed" style={{ color: u.body }}>
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
                        className="text-2xl leading-snug md:text-3xl md:leading-snug"
                        style={{ ...titleStyle, color: u.kickerMuted }}
                      >
                        {content.safetyNetKicker || 'Where it shows'}
                      </p>
                    </div>
                    {content.safetyNetIntro && (
                      <div className="mb-12 min-w-0 max-w-[42rem] xl:max-w-[44rem] md:mb-14">
                        <p className="text-xl leading-relaxed" style={{ color: u.body }}>
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
                    className="text-2xl leading-snug md:text-3xl md:leading-snug"
                    style={{ ...titleStyle, color: u.kickerMuted }}
                  >
                    The Shift
                  </p>
                  <p
                    className="text-2xl leading-snug md:text-3xl md:leading-snug"
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
                    <p key={i} className="text-xl leading-relaxed" style={{ color: u.body }}>
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

        <div className="mt-32 w-full pt-8" style={{ borderTop: `1px solid ${u.border}` }}>
          <Section label="Next" split>
            <button
              onClick={() => onOpenProject(nextProject.id)}
              className="group block w-full text-left"
            >
              <p className="text-xs uppercase tracking-wider" style={{ ...monoStyle, color: u.meta }}>
                Next project
              </p>
              <p
                className="mt-3 text-3xl leading-tight md:text-4xl"
                style={{ ...titleStyle, color: u.title }}
              >
                {nextProject.title}
              </p>
            </button>
          </Section>
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
