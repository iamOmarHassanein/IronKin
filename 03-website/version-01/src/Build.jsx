import { useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import DecryptedText from './bits/DecryptedText';
import './build.css';

gsap.registerPlugin(ScrollTrigger, useGSAP);

const B = (f) => `assets/build/${f}`;
const A = (f) => `assets/${f}`;
const Code = ({ children, className = '' }) => <span className={`code ${className}`}><i className="code__dot" />{children}</span>;

const STAGES = [
  { n: '01', t: 'Sketch', meta: 'Line sketch · front + back', note: 'It starts on paper. Pencil lines, notes in red, the anvil on the chest before it had a size.' },
  { n: '02', t: 'Blueprint', meta: 'Size M · proposed · ± tolerance', note: 'The sketch becomes a measured flat. Every seam gets a number, every number a tolerance.' },
  { n: '03', t: 'Spec', meta: 'IK-C001-04 · v1.0 proto', note: 'The tech pack: construction, stitching, colourway and points of measure, ready for the first proto.' },
  { n: '04', t: 'Fabric', meta: '100% cotton · 450 gsm', note: 'Brushed fleece for the body, 1x1 rib at the hem and cuffs, bone chain stitch on the seams.' },
  { n: '05', t: 'Sample', meta: 'Proto 01 · on the rail', note: 'The first sample goes on the rail. Then it gets worn, washed and trained in before anyone else sees it.' }
];
// the hoodie blueprint (1600 x 1129): points of measure from its spec, size M
const DIMS = [
  { d: 'M272 529 L606 529', tx: 439, ty: 516, label: 'B · CHEST ½ · 64 CM' },
  { d: 'M780 362 L780 879', tx: 796, ty: 620, label: 'A · LENGTH · 70 CM', v: true },
  { d: 'M258 905 L623 905', tx: 440, ty: 940, label: 'C · HEM ½ · 52 CM' }
];
const PIECES = [
  { no: '04', name: 'Heavyweight Hoodie' }, { no: '01', name: 'Wide-Leg Track Pant' }, { no: '03', name: 'Compression Tee' },
  { no: '05', name: 'Fitted Crop Tee' }, { no: '02', name: 'Flare Track Pant' }
];
const FABRICS = [
  { img: 'fab-fleece', name: 'Heavyweight brushed fleece', comp: '100% cotton', gsm: '450 gsm', use: 'FRG-0104 · Hoodie' },
  { img: 'fab-fleece', name: 'Brushed-back fleece', comp: '80% cotton / 20% polyester', gsm: '380 gsm', use: 'FRG-0101 · Wide-leg pant', alt: true },
  { img: 'fab-stretch', name: '4-way stretch jersey', comp: '78% polyester / 22% elastane', gsm: '220 gsm', use: 'FRG-0103 · Compression tee' },
  { img: 'fab-jersey', name: 'Stretch jersey, rose marl', comp: '92% cotton / 8% elastane', gsm: '200 gsm', use: 'FRG-0105 · Crop tee' },
  { img: 'fab-interlock', name: 'Brushed interlock', comp: '88% polyester / 12% elastane', gsm: '300 gsm', use: 'FRG-0102 · Flare pant' },
  { img: 'fab-rib', name: '1x1 rib', comp: 'Hem + cuffs', gsm: '8 cm', use: 'FRG-0104 · Trim' },
  { img: 'fab-stitch', name: 'Bone chain stitch', comp: 'Contrast seams + pocket', gsm: 'Bone #EEE0CC', use: 'All black pieces · Trim' }
];
// pinked (zig-zag) edge, like a swatch cut with pinking shears
const PINK = (() => {
  const n = 22, a = 2.2, pts = [];
  for (let i = 0; i <= n; i++) pts.push(`${(i / n) * 100}% ${i % 2 ? a : 0}%`);
  for (let i = 0; i <= n; i++) pts.push(`${100 - (i % 2 ? a : 0)}% ${(i / n) * 100}%`);
  for (let i = n; i >= 0; i--) pts.push(`${(i / n) * 100}% ${100 - (i % 2 ? a : 0)}%`);
  for (let i = n; i >= 0; i--) pts.push(`${i % 2 ? a : 0}% ${(i / n) * 100}%`);
  return `polygon(${pts.join(',')})`;
})();

function Xray({ p, big }) {
  const ref = useRef(null);
  const move = (e) => {
    const r = ref.current.getBoundingClientRect();
    ref.current.style.setProperty('--x', `${e.clientX - r.left}px`);
    ref.current.style.setProperty('--y', `${e.clientY - r.top}px`);
  };
  return (
    <figure className={`xray cursor-target ${big ? 'xray--big' : ''}`} ref={ref} onPointerMove={move} data-cursor-label={`FRG-01${p.no} · x-ray`}>
      <div className="xray__frame">
        <img className="xray__bp" src={B(`bp-${p.no}.webp`)} alt={`Blueprint of the ${p.name}, front and back, with construction notes`} loading="lazy" />
        <img className="xray__col" src={B(`col-${p.no}.webp`)} alt="" aria-hidden="true" loading="lazy" />
        <span className="xray__lens" aria-hidden="true" />
      </div>
      <figcaption className="mono"><span>FRG-01{p.no}</span><span>{p.name}</span><span className="xray__hint">Hover to x-ray</span></figcaption>
    </figure>
  );
}

export default function Build() {
  const root = useRef(null);
  useGSAP(() => {
    const mm = gsap.matchMedia();
    mm.add('(min-width: 900px)', () => {
      const track = root.current.querySelector('.stages__track');
      const dist = () => track.scrollWidth - window.innerWidth;
      const tween = gsap.to(track, {
        x: () => -dist(), ease: 'none',
        scrollTrigger: { trigger: root.current.querySelector('.stages'), start: 'top top', end: () => '+=' + dist(), pin: true, scrub: 1, invalidateOnRefresh: true,
          onUpdate: (st) => { const el = root.current.querySelector('.stages__fill'); if (el) el.style.transform = `scaleX(${st.progress})`; } }
      });
      // dimension lines draw in as the blueprint slides into view
      gsap.fromTo('.dims path', { strokeDashoffset: 1 }, { strokeDashoffset: 0, stagger: 0.15, ease: 'none',
        scrollTrigger: { trigger: '.bstage--bp', containerAnimation: tween, start: 'left 85%', end: 'left 25%', scrub: true } });
      gsap.fromTo('.dims text', { autoAlpha: 0 }, { autoAlpha: 1, stagger: 0.15,
        scrollTrigger: { trigger: '.bstage--bp', containerAnimation: tween, start: 'left 55%', end: 'left 25%', scrub: true } });
      gsap.utils.toArray('.bstage__visual').forEach((v) => {
        gsap.fromTo(v, { rotate: 2.5, y: 30 }, { rotate: 0, y: 0, ease: 'none', scrollTrigger: { trigger: v, containerAnimation: tween, start: 'left right', end: 'center center', scrub: true } });
      });
    });
    mm.add('(max-width: 899px)', () => { gsap.set('.dims path', { strokeDashoffset: 0 }); });
    gsap.from('.xray', { autoAlpha: 0, y: 60, stagger: 0.1, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: '.archive', start: 'top 75%' } });
    gsap.from('.swatch', { autoAlpha: 0, y: 50, rotate: (i) => (i % 2 ? 4 : -4), stagger: 0.07, duration: 0.9, ease: 'power3.out', scrollTrigger: { trigger: '.fabrics', start: 'top 78%' } });
    return () => mm.revert();
  }, { scope: root });

  return (
    <section className="build" id="build" ref={root}>
      <div className="sec__head sec__head--dark">
        <Code>Behind the scenes · Collection 001</Code>
        <h2 className="display sec__t">The build</h2>
        <p className="sec__s">Before anything hung on the rail: the sketches, the blueprints, the spec sheets and the swatches. One piece, start to sample.</p>
      </div>

      <div className="stages">
        <div className="stages__bar mono"><span>Heavyweight Hoodie · from sketch to sample</span><span className="stages__track-line"><i className="stages__fill" /></span></div>
        <div className="stages__track">
          {STAGES.map((s, k) => (
            <article className={`bstage bstage--${['sketch', 'bp', 'spec', 'fabric', 'sample'][k]}`} key={s.n}>
              <div className="bstage__visual">
                {k === 0 && (
                  <figure className="paper paper--sketch">
                    <img src={B('sketch-04.webp')} alt="Pencil line sketch of the heavyweight hoodie, front and back, with notes in red" loading="lazy" />
                    <i className="tape tape--a" /><i className="tape tape--b" />
                  </figure>
                )}
                {k === 1 && (
                  <figure className="bpsheet">
                    <img src={B('bp-04.webp')} alt="Blueprint of the heavyweight hoodie with measurements" loading="lazy" />
                    <svg viewBox="0 0 1600 1129" className="dims" aria-hidden="true">
                      {DIMS.map((d) => <path key={d.label} d={d.d} pathLength="1" />)}
                      {DIMS.map((d) => <text key={d.label + 't'} x={d.tx} y={d.ty} textAnchor={d.v ? 'start' : 'middle'}>{d.label}</text>)}
                    </svg>
                  </figure>
                )}
                {k === 2 && (
                  <div className="fan">
                    <img className="fan__a paper" src={B('tp-04-p2.webp')} alt="Tech pack page 2: points of measure and bill of materials" loading="lazy" />
                    <img className="fan__b paper" src={B('tp-04-p1.webp')} alt="Tech pack page 1: technical flats, style information and construction details" loading="lazy" />
                  </div>
                )}
                {k === 3 && (
                  <div className="swfan">
                    {['fab-fleece', 'fab-rib', 'fab-stitch'].map((f, i) => (
                      <figure key={f} className={`swfan__s swfan__s--${i}`} style={{ clipPath: PINK }}><img src={B(`${f}.webp`)} alt="" loading="lazy" /></figure>
                    ))}
                    <span className="mono swfan__l swfan__l--0">450 gsm brushed fleece</span>
                    <span className="mono swfan__l swfan__l--1">1x1 rib · 8 cm</span>
                    <span className="mono swfan__l swfan__l--2">Bone chain stitch</span>
                  </div>
                )}
                {k === 4 && (
                  <figure className="sample">
                    <img src={A('g-04.webp')} alt="The first hoodie sample on its hanger" loading="lazy" />
                    <i className="vf vf--tl" /><i className="vf vf--tr" /><i className="vf vf--bl" /><i className="vf vf--br" />
                    <span className="mono sample__tag">Proto 01</span>
                  </figure>
                )}
              </div>
              <div className="bstage__txt">
                <span className="mono bstage__n">Stage {s.n} / 05</span>
                <h3 className="display bstage__t">{s.t}</h3>
                <p className="bstage__note">{s.note}</p>
                <span className="mono bstage__meta">{s.meta}</span>
              </div>
            </article>
          ))}
        </div>
      </div>

      <div className="archive">
        <div className="sec__head sec__head--dark sec__head--small">
          <Code>Blueprint archive</Code>
          <h3 className="display sec__t sec__t--md">Every piece, x-rayed</h3>
          <p className="sec__s">Move over a blueprint to see the finished colourway underneath.</p>
        </div>
        <div className="archive__grid">{PIECES.map((p, k) => <Xray key={p.no} p={p} big={k === 0} />)}</div>
      </div>

      <div className="fabrics">
        <div className="sec__head sec__head--dark sec__head--small">
          <Code>Fabric library</Code>
          <h3 className="display sec__t sec__t--md">Swatches</h3>
          <p className="sec__s">What each piece is cut from. Weights and blends are the proposed specs for the first proto.</p>
        </div>
        <div className="fabrics__grid">
          {FABRICS.map((f, k) => (
            <article className="swatch cursor-target" key={k} data-cursor-label={f.use}>
              <figure className={`swatch__cloth ${f.alt ? 'swatch__cloth--alt' : ''}`} style={{ clipPath: PINK }}><img src={B(`${f.img}.webp`)} alt={`${f.name} swatch`} loading="lazy" /></figure>
              <span className="mono swatch__no">SW-{String(k + 1).padStart(2, '0')}</span>
              <h4 className="display swatch__t">{f.name}</h4>
              <p className="mono swatch__m">{f.comp} · {f.gsm}</p>
              <p className="mono swatch__u"><DecryptedText text={f.use} animateOn="hover" speed={30} characters="0123456789-FRG" /></p>
            </article>
          ))}
          <article className="swatch swatch--note">
            <p className="display">Nothing on the rail started on the rail.</p>
            <span className="mono">Specs are proposed until the first proto is signed off.</span>
          </article>
        </div>
      </div>
    </section>
  );
}
