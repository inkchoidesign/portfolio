// Portfolio Site v8 - Preview
import { useState, useEffect } from 'react';
import ParticleSphere from './ParticleSphere';

const monoStyle = {
  fontFamily: "'SF Mono', 'Fira Code', monospace",
  letterSpacing: '0.02em'
};

const titleStyle = {
  fontFamily: "'Inter', -apple-system, sans-serif",
  fontWeight: 600,
  letterSpacing: '0em'
};

const INITIAL_ABOUT_SECTIONS = ['title', 'section1', 'section2', 'section3'];

const fadeUpStyle = (isVisible) => ({
  transform: isVisible ? 'translateY(0)' : 'translateY(60px)',
  opacity: isVisible ? 1 : 0,
  transition: 'transform 0.8s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.8s cubic-bezier(0.4, 0, 0.2, 1)'
});

export default function Portfolio() {
  const [scrollY, setScrollY] = useState(0);
  const [hoveredProject, setHoveredProject] = useState(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [thumbTransition, setThumbTransition] = useState({ current: null, prev: null, isAnimating: false });
  const [hoveredMenu, setHoveredMenu] = useState(null);
  const [logoHovered, setLogoHovered] = useState(false);
  const [blinking, setBlinking] = useState(false);
  const [currentPage, setCurrentPage] = useState('home');
  const [visibleSections, setVisibleSections] = useState({});
  const [homeLoaded, setHomeLoaded] = useState(false);
  const [projectsVisible, setProjectsVisible] = useState(false);
  const [visibleProjectIndices, setVisibleProjectIndices] = useState([]);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    setVisibleSections({});
    setHomeLoaded(false);
    setProjectsVisible(false);
    setVisibleProjectIndices([]);
    
    if (currentPage === 'about') {
      const delays = [100, 250, 400, 550];
      INITIAL_ABOUT_SECTIONS.forEach((section, i) => {
        setTimeout(() => {
          setVisibleSections(prev => ({ ...prev, [section]: true }));
        }, delays[i]);
      });
    } else if (currentPage === 'home') {
      // Animate home page elements on load
      setTimeout(() => setHomeLoaded(true), 100);
    }
  }, [currentPage]);

  // Intersection Observer for projects section
  useEffect(() => {
    if (currentPage !== 'home') return;

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
  }, [currentPage, visibleProjectIndices]);

  useEffect(() => {
    if (currentPage !== 'about') return;

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
  }, [currentPage]);

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
          setThumbTransition(prev => ({ ...prev, isAnimating: true }));
        });
      });
      setTimeout(() => setThumbTransition(prev => ({ ...prev, prev: null })), 600);
    } else {
      setThumbTransition({ current: projectId, prev: null, isAnimating: false });
    }
    
    setHoveredProject(projectId);
  };

  const projects = [
    { id: 'investing', num: '001', title: 'Intelligent Investing', tag: 'UX/UI', year: '2025', 
      thumb: (
        <img 
          src="/images/project-1.png" 
          alt="Intelligent Investing" 
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      )
    },
    { id: 'genesis', num: '002', title: 'Genesis', tag: 'UX/UI', year: '2024',
      thumb: (
        <img 
          src="/images/project-2.png" 
          alt="Genesis" 
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      )
    },
    { id: 'honda', num: '003', title: 'Honda Preorder', tag: 'UX', year: '2024',
      thumb: (
        <img 
          src="/images/project-3.png" 
          alt="Honda Preorder" 
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      )
    },
    { id: 'autosync', num: '004', title: 'AutoSync', tag: 'Brand', year: '2023',
      thumb: (
        <img 
          src="/images/project-4.png" 
          alt="AutoSync" 
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      )
    },
    { id: 'mi', num: '005', title: 'Motoinsight', tag: 'Web', year: '2023',
      thumb: (
        <img 
          src="/images/project-5.png" 
          alt="Motoinsight" 
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      )
    }
  ];

  return (
    <div className="relative" style={{ backgroundColor: '#1a1a1a' }}>
      {/* Nav - 좌측 로고 */}
      <nav className="fixed top-0 left-0 z-50 p-8">
        <button 
          onClick={() => setCurrentPage('home')} 
          onMouseEnter={() => setLogoHovered(true)}
          onMouseLeave={() => setLogoHovered(false)}
          className="flex items-center gap-1"
        >
          <div className="rounded-full" style={{ backgroundColor: '#e5e5e5', width: '18px', height: '18px' }} />
          <div className="rounded-full flex items-center justify-center gap-0.5" style={{ backgroundColor: '#e5e5e5', width: '18px', height: '18px' }}>
            <div 
              className="rounded-full transition-all duration-100" 
              style={{ 
                backgroundColor: '#1a1a1a', 
                width: '3px', 
                height: blinking ? '1px' : '3px'
              }} 
            />
            <div 
              className="rounded-full transition-all duration-100" 
              style={{ 
                backgroundColor: '#1a1a1a', 
                width: '3px', 
                height: blinking ? '1px' : '3px'
              }} 
            />
          </div>
        </button>
      </nav>

      {/* Nav - 메뉴 */}
      <nav className="fixed top-0 z-50 p-8" style={{ left: '55%' }}>
        <div className="space-y-2 text-xs" style={monoStyle}>
          {['work', 'info', 'contact', 'playground'].map((menu) => {
            const isActive = (menu === 'work' && currentPage === 'home') || (menu === 'info' && currentPage === 'about');
            const isHovered = hoveredMenu === menu;
            const displayText = menu.charAt(0).toUpperCase() + menu.slice(1);
            const hoverText = menu === 'playground' ? 'Coming Soon' : displayText;
            
            return (
              <button 
                key={menu}
                onClick={() => menu !== 'contact' && menu !== 'playground' && setCurrentPage(menu === 'work' ? 'home' : 'about')}
                onMouseEnter={() => setHoveredMenu(menu)}
                onMouseLeave={() => setHoveredMenu(null)}
                className="block text-left"
                style={{ 
                  position: 'relative',
                  height: '16px',
                  overflow: 'hidden',
                  whiteSpace: 'nowrap',
                  minWidth: '120px'
                }}
              >
                <span 
                  style={{ 
                    display: 'block',
                    transition: 'transform 0.3s ease',
                    transform: isHovered ? 'translateY(-100%)' : 'translateY(0)',
                    color: isActive ? '#e5e5e5' : '#525252'
                  }}
                >
                  {isActive && '■ '}{displayText}
                </span>
                <span 
                  style={{ 
                    display: 'block',
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    transition: 'transform 0.3s ease',
                    transform: isHovered ? 'translateY(-100%)' : 'translateY(0)',
                    fontStyle: 'italic',
                    color: '#e5e5e5'
                  }}
                >
                  {isActive && '■ '}{hoverText}
                </span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Year badge */}
      <div className="fixed top-8 right-8 text-xs z-50" style={{ ...monoStyle, color: '#525252' }}>[2026]</div>

      {currentPage === 'home' && (
        <>
          {/* Hero Section */}
          <section className="h-screen flex flex-col justify-between px-8 py-8">
            <div 
              className="flex-1 flex items-center"
              style={{
                transform: `translateY(${scrollY * -0.3}px)`,
                transition: 'transform 0.1s ease-out'
              }}
            >
              <div>
                <p 
                  className="text-xs mb-8" 
                  style={{ 
                    ...monoStyle, 
                    color: '#525252',
                    opacity: homeLoaded ? 1 : 0,
                    transform: homeLoaded ? 'translateY(0)' : 'translateY(20px)',
                    transition: 'opacity 0.8s ease, transform 0.8s ease'
                  }}
                >
                  Digital Designer
                </p>
                <h1 
                  className="text-2xl md:text-4xl leading-tight max-w-5xl" 
                  style={{ 
                    ...titleStyle, 
                    color: '#e5e5e5',
                    opacity: homeLoaded ? 1 : 0,
                    transform: homeLoaded ? 'translateY(0)' : 'translateY(30px)',
                    transition: 'opacity 0.8s ease 0.15s, transform 0.8s ease 0.15s'
                  }}
                >
                  I Partner with Brands and
                  <br />
                  Companies to Craft Meaningful
                  <br />
                  <span style={{ color: '#525252' }}>Digital Experiences</span>
                </h1>
              </div>
            </div>
            <div 
              className="flex justify-between items-end"
              style={{
                opacity: homeLoaded ? 1 : 0,
                transition: 'opacity 0.8s ease 0.3s'
              }}
            >
              <div className="text-xs" style={{ ...monoStyle, color: '#737373' }}>Toronto, CA</div>
              <div className="text-xs text-right" style={{ ...monoStyle, color: '#737373' }}>Print / Brand / Digital</div>
            </div>
          </section>

          {/* Projects Section */}
          <section 
            data-section="projects"
            className="min-h-screen px-8 py-48"
          >
            <div 
              className="mb-16"
              style={{
                opacity: projectsVisible ? 1 : 0,
                transform: projectsVisible ? 'translateY(0)' : 'translateY(20px)',
                transition: 'opacity 0.8s ease, transform 0.8s ease'
              }}
            >
              <p className="text-xs" style={{ ...monoStyle, color: '#525252' }}>[Selected Work]</p>
            </div>
            
            <div>
              {projects.map((project, index) => {
                const isHovered = hoveredProject === project.id;
                const isVisible = visibleProjectIndices.includes(index);
                
                return (
                  <button
                    key={project.id}
                    data-project-index={index}
                    onClick={() => setCurrentPage(project.id)}
                    onMouseEnter={() => handleProjectHover(project.id)}
                    onMouseLeave={() => setHoveredProject(null)}
                    onMouseMove={(e) => setMousePos({ x: e.clientX, y: e.clientY })}
                    className="w-full text-left block py-6 transition-all duration-300"
                    style={{ 
                      borderTop: '1px solid #2a2a2a',
                      opacity: isVisible ? 1 : 0,
                      transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
                      transition: 'opacity 0.8s ease, transform 0.8s ease'
                    }}
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-8">
                        <span className="text-xs" style={{ ...monoStyle, color: '#525252' }}>{project.num}</span>
                        <div style={{ position: 'relative', height: '52px', overflow: 'hidden' }}>
                          <span 
                            className="text-2xl md:text-4xl block transition-transform duration-300"
                            style={{ 
                              ...titleStyle,
                              color: '#737373',
                              transform: isHovered ? 'translateY(-100%)' : 'translateY(0)',
                              lineHeight: '1.3'
                            }}
                          >
                            {project.title}
                          </span>
                          <span 
                            className="text-2xl md:text-4xl block absolute transition-transform duration-300"
                            style={{ 
                              ...titleStyle,
                              color: '#e5e5e5',
                              top: '100%',
                              left: 0,
                              transform: isHovered ? 'translateY(-100%)' : 'translateY(0)',
                              lineHeight: '1.3'
                            }}
                          >
                            {project.title}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-8">
                        <span className="text-xs hidden md:block" style={{ ...monoStyle, color: '#525252' }}>{project.tag}</span>
                        <span className="text-xs" style={{ ...monoStyle, color: '#525252' }}>{project.year}</span>
                        <span 
                          className="text-xl transition-all duration-300"
                          style={{ 
                            color: '#525252',
                            opacity: isHovered ? 1 : 0,
                            transform: isHovered ? 'translateX(0)' : 'translateX(-10px)'
                          }}
                        >
                          →
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
              <div style={{ borderTop: '1px solid #2a2a2a' }}></div>
            </div>

            {/* Hover Thumbnail */}
            {hoveredProject && (
              <div 
                className="fixed pointer-events-none z-50"
                style={{ 
                  left: mousePos.x + 15,
                  top: mousePos.y - 100,
                  transition: 'left 0.15s ease-out, top 0.15s ease-out'
                }}
              >
                <div 
                  className="w-80 h-56 overflow-hidden rounded" 
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
                      {projects.find(p => p.id === thumbTransition.prev)?.thumb}
                    </div>
                  )}
                  <div 
                    className="w-full h-full absolute top-0 left-0"
                    style={{ 
                      transition: thumbTransition.isAnimating ? 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)' : 'none',
                      transform: (!thumbTransition.prev || thumbTransition.isAnimating) ? 'translateY(0)' : 'translateY(100%)',
                      zIndex: 2
                    }}
                  >
                    {projects.find(p => p.id === thumbTransition.current)?.thumb}
                  </div>
                </div>
              </div>
            )}
          </section>

          {/* Footer */}
          <footer 
            className="px-8 py-16 flex justify-between items-end"
            style={{
              transform: `translateY(${scrollY * -0.05}px)`,
              opacity: homeLoaded ? 1 : 0,
              transition: 'opacity 0.8s ease 1s, transform 0.1s ease-out'
            }}
          >
            <div className="text-xs" style={{ ...monoStyle, color: '#525252' }}>[Nice to Meet You]</div>
            <div className="text-xs" style={{ ...monoStyle, color: '#525252' }}>© 2026</div>
          </footer>
        </>
      )}

      {currentPage === 'about' && (
        <section className="px-8 py-32 pt-72" style={{ minHeight: '200vh' }}>
          <div className="grid grid-cols-12 gap-8">
            <div className="col-span-12 md:col-span-5">
              <div style={{ position: 'sticky', top: '8rem' }}>
                <div style={fadeUpStyle(visibleSections.title)}>
                  <h1 
                    data-section="title"
                    className="text-2xl md:text-4xl leading-tight mb-12"
                    style={{ ...titleStyle, color: '#e5e5e5' }}
                  >
                    Inkyung<br />Choi_
                  </h1>
                  
                  {/* 3D Particle Sphere with scroll animation */}
                  <div 
                    style={{ 
                      position: 'absolute',
                      top: '0rem',
                      left: '30%',
                      width: '500px',
                      height: '500px',
                      transform: `translateY(${scrollY * 0.035}px)`,
                      transition: 'transform 0.1s ease-out',
                      opacity: 1
                    }}
                  >
                    <ParticleSphere scrollY={scrollY} />
                  </div>
                </div>
              </div>
            </div>

            <div className="col-span-12 md:col-span-7">
              <div className="max-w-lg ml-auto space-y-24">
                <div data-section="section1" style={fadeUpStyle(visibleSections.section1)}>
                  <p className="text-xs mb-4" style={{ ...monoStyle, color: '#525252' }}>1.0</p>
                  <p className="text-base leading-relaxed" style={{ color: '#a3a3a3' }}>
                    Digital Designer with 10 years of experience spanning print, brand identity, web, and product design. Currently crafting meaningful experiences in Toronto.
                  </p>
                </div>
                
                <div data-section="section2" style={fadeUpStyle(visibleSections.section2)}>
                  <p className="text-xs mb-4" style={{ ...monoStyle, color: '#525252' }}>2.0</p>
                  <p className="text-base leading-relaxed" style={{ color: '#a3a3a3' }}>
                    My career began in print production, evolved through branding and visual identity, and now focuses on digital product experiences.
                  </p>
                </div>

                <div data-section="section3" style={fadeUpStyle(visibleSections.section3)}>
                  <p className="text-xs mb-4" style={{ ...monoStyle, color: '#525252' }}>3.0</p>
                  <p className="text-base leading-relaxed" style={{ color: '#a3a3a3' }}>
                    I believe in design that's both beautiful and functional. Whether it's a brand system or a fintech app, I focus on clarity, craft, and meaningful impact.
                  </p>
                </div>

                <div data-section="experience" style={fadeUpStyle(visibleSections.experience)}>
                  <p className="text-xs mb-6" style={{ ...monoStyle, color: '#525252' }}>[Experience]</p>
                  <div className="space-y-4" style={monoStyle}>
                    {[
                      { company: 'Orion Digital', period: '2023—', active: true },
                      { company: 'Lucid', period: '2022—23', active: false },
                      { company: 'Manulife', period: '2019—22', active: false }
                    ].map(({ company, period, active }) => (
                      <div key={company} className="flex justify-between py-3" style={{ borderBottom: '1px solid #2a2a2a' }}>
                        <span style={{ color: active ? '#e5e5e5' : '#a3a3a3' }}>{company}</span>
                        <span style={{ color: '#525252' }}>{period}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div data-section="expertise" style={fadeUpStyle(visibleSections.expertise)}>
                  <p className="text-xs mb-6" style={{ ...monoStyle, color: '#525252' }}>[Expertise]</p>
                  <p className="text-base leading-relaxed" style={{ color: '#a3a3a3' }}>
                    Brand Identity, Web Design, UX/UI Design, Design Systems, Prototyping, User Research
                  </p>
                </div>

                <div data-section="connect" style={fadeUpStyle(visibleSections.connect)}>
                  <p className="text-xs mb-6" style={{ ...monoStyle, color: '#525252' }}>[Connect]</p>
                  <div className="space-y-3 text-sm" style={monoStyle}>
                    <a href="#" className="block transition-opacity hover:opacity-50" style={{ color: '#e5e5e5' }}>LinkedIn ↗</a>
                    <a href="#" className="block transition-opacity hover:opacity-50" style={{ color: '#e5e5e5' }}>Resume ↗</a>
                    <a href="mailto:ink@inkchoidesign.com" className="block transition-opacity hover:opacity-50" style={{ color: '#e5e5e5' }}>ink@inkchoidesign.com ↗</a>
                  </div>
                </div>

                <div data-section="location" className="flex justify-between items-end pt-16" style={fadeUpStyle(visibleSections.location)}>
                  <div>
                    <p className="text-xs mb-2" style={{ ...monoStyle, color: '#525252' }}>[Location]</p>
                    <p className="text-lg" style={{ ...titleStyle, color: '#e5e5e5' }}>Toronto, CA_</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs mb-2" style={{ ...monoStyle, color: '#525252' }}>[Availability]</p>
                    <p className="text-lg" style={{ ...titleStyle, color: '#e5e5e5' }}>Open to Work_</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Case Study Pages */}
      {projects.map(p => p.id).includes(currentPage) && (
        <CaseStudy 
          project={currentPage} 
          projects={projects}
          monoStyle={monoStyle}
          titleStyle={titleStyle}
          setCurrentPage={setCurrentPage}
        />
      )}
    </div>
  );
}

const CASE_STUDIES = {
  investing: {
    title: 'Intelligent Investing',
    subtitle: 'AI-powered wealth management app',
    tag: 'UX/UI Design',
    num: '001',
    situation: 'Traditional investing platforms overwhelm users with complex data and jargon, creating barriers for first-time investors.',
    task: 'Design a mobile-first investing experience that makes portfolio management accessible while building user confidence.',
    action: [
      'Conducted user research with 12 first-time investors',
      'Mapped the emotional journey to identify high-anxiety moments',
      'Designed progressive disclosure system',
      'Created AI-powered plain-language recommendations'
    ],
    result: 'Early usability testing shows 40% reduction in time-to-first-investment compared to competitor benchmarks.'
  },
  genesis: {
    title: 'Genesis',
    subtitle: 'Luxury automotive interface system',
    tag: 'UX/UI Design',
    num: '002',
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
    subtitle: 'Vehicle reservation experience',
    tag: 'UX Design',
    num: '003',
    situation: 'Honda\'s vehicle preorder process had high abandonment rates due to fragmented experience.',
    task: 'Redesign the end-to-end preorder flow to increase conversion.',
    action: [
      'Analyzed funnel data to identify drop-off points',
      'Simplified process from 12 steps to 5',
      'Designed transparent pricing calculator',
      'Created post-reservation engagement dashboard'
    ],
    result: 'Preorder completion rate improved from 23% to 47%.'
  },
  autosync: {
    title: 'AutoSync',
    subtitle: 'Automotive tech brand identity',
    tag: 'Brand Design',
    num: '004',
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
    title: 'Motoinsight',
    subtitle: 'Corporate website redesign',
    tag: 'Web Design',
    num: '005',
    situation: 'Motoinsight\'s website was outdated and didn\'t reflect their market position.',
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

function CaseStudy({ project, projects, monoStyle, titleStyle, setCurrentPage }) {
  const content = CASE_STUDIES[project];
  const currentIndex = projects.findIndex(p => p.id === project);
  const nextProject = projects[(currentIndex + 1) % projects.length];

  const Section = ({ label, children, className = "" }) => (
    <div className={className}>
      <p className="text-xs mb-4" style={{ ...monoStyle, color: '#525252' }}>[{label}]</p>
      {children}
    </div>
  );

  return (
    <section className="min-h-screen px-8 py-32 pt-48">
      <div className="max-w-4xl">
        <button 
          onClick={() => setCurrentPage('home')}
          className="text-xs mb-16 transition-opacity hover:opacity-50"
          style={{ ...monoStyle, color: '#525252' }}
        >
          ← Back
        </button>

        <header className="mb-24">
          <div className="flex items-center gap-4 mb-4">
            <span className="text-xs" style={{ ...monoStyle, color: '#525252' }}>{content.num}</span>
            <span className="text-xs" style={{ ...monoStyle, color: '#525252' }}>{content.tag}</span>
          </div>
          <h1 className="text-3xl md:text-5xl mb-4" style={{ ...titleStyle, color: '#e5e5e5' }}>{content.title}</h1>
          <p className="text-lg" style={{ ...monoStyle, color: '#525252' }}>{content.subtitle}</p>
        </header>

        <div className="aspect-video mb-24 flex items-center justify-center" style={{ backgroundColor: '#252525' }}>
          <span style={{ ...monoStyle, color: '#525252', fontSize: '12px' }}>[Project Hero]</span>
        </div>

        <div className="space-y-20">
          <Section label="Situation">
            <p className="text-xl leading-relaxed" style={{ color: '#a3a3a3' }}>{content.situation}</p>
          </Section>

          <Section label="Task">
            <p className="text-xl leading-relaxed" style={{ color: '#a3a3a3' }}>{content.task}</p>
          </Section>

          <Section label="Action">
            <div className="space-y-3">
              {content.action.map((item, i) => (
                <div key={i} className="flex gap-4">
                  <span className="text-xs" style={{ ...monoStyle, color: '#525252' }}>0{i + 1}</span>
                  <p className="text-lg" style={{ color: '#a3a3a3' }}>{item}</p>
                </div>
              ))}
            </div>
          </Section>

          <div className="grid grid-cols-2 gap-4">
            {[1, 2].map(i => (
              <div key={i} className="aspect-video flex items-center justify-center" style={{ backgroundColor: '#252525' }}>
                <span style={{ ...monoStyle, color: '#525252', fontSize: '12px' }}>[Process]</span>
              </div>
            ))}
          </div>

          <Section label="Result">
            <p className="text-xl leading-relaxed" style={{ color: '#a3a3a3' }}>{content.result}</p>
          </Section>
        </div>

        <div className="mt-32 pt-8" style={{ borderTop: '1px solid #2a2a2a' }}>
          <Section label="Next">
            <button 
              onClick={() => setCurrentPage(nextProject.id)}
              className="text-2xl transition-opacity hover:opacity-50"
              style={{ ...titleStyle, color: '#e5e5e5' }}
            >
              {nextProject.title} →
            </button>
          </Section>
        </div>
      </div>
    </section>
  );
}