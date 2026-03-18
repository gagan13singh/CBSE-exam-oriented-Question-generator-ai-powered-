/**
 * client/src/components/SyllabusSection.jsx
 * Dark cosmic theme — matches Vidyastra's existing design system
 * Shows disclaimer overlay on first open, then topic browser
 */

import React, { useState, useEffect } from 'react';

// Topic names only — factual, not copyrightable
// Source: CBSE Curriculum 2025-26 (cbseacademic.nic.in)
const SYLLABUS = {
  'Class 9': {
    Physics:   ['Motion', 'Force and Laws of Motion', 'Gravitation', 'Work and Energy', 'Sound'],
    Chemistry: ['Matter in Our Surroundings', 'Is Matter Around Us Pure?', 'Atoms and Molecules', 'Structure of the Atom'],
    Biology:   ['The Fundamental Unit of Life', 'Tissues', 'Diversity in Living Organisms', 'Why Do We Fall Ill?', 'Natural Resources'],
    Mathematics: ['Number Systems', 'Polynomials', 'Coordinate Geometry', 'Linear Equations in Two Variables', "Introduction to Euclid's Geometry", 'Lines and Angles', 'Triangles', 'Quadrilaterals', 'Areas of Parallelograms and Triangles', 'Circles', 'Surface Areas and Volumes', 'Statistics', 'Probability'],
    'Social Science': ['The French Revolution', 'Socialism in Europe and Russian Revolution', 'Nazism and the Rise of Hitler', 'Forest Society and Colonialism', 'Pastoralists in the Modern World', 'India – Size and Location', 'Physical Features of India', 'Drainage', 'Climate', 'Natural Vegetation and Wildlife', 'Population', 'What is Democracy?', 'Constitutional Design', 'Electoral Politics', 'Working of Institutions', 'Democratic Rights', 'The Story of Village Palampur', 'People as Resource', 'Poverty as a Challenge', 'Food Security in India'],
    English: ['Beehive (Prose)', 'Beehive (Poetry)', 'Moments (Supplementary)', 'Grammar and Writing'],
  },
  'Class 10': {
    Physics:   ['Light – Reflection and Refraction', 'Human Eye and the Colourful World', 'Electricity', 'Magnetic Effects of Electric Current', 'Sources of Energy'],
    Chemistry: ['Chemical Reactions and Equations', 'Acids, Bases and Salts', 'Metals and Non-metals', 'Carbon and its Compounds', 'Periodic Classification of Elements'],
    Biology:   ['Life Processes', 'Control and Coordination', 'How do Organisms Reproduce?', 'Heredity and Evolution', 'Our Environment', 'Management of Natural Resources'],
    Mathematics: ['Real Numbers', 'Polynomials', 'Pair of Linear Equations in Two Variables', 'Quadratic Equations', 'Arithmetic Progressions', 'Triangles', 'Coordinate Geometry', 'Introduction to Trigonometry', 'Applications of Trigonometry', 'Circles', 'Areas Related to Circles', 'Surface Areas and Volumes', 'Statistics', 'Probability'],
    'Social Science': ['The Rise of Nationalism in Europe', 'Nationalism in India', 'The Making of a Global World', 'The Age of Industrialisation', 'Print Culture and the Modern World', 'Resources and Development', 'Forest and Wildlife Resources', 'Water Resources', 'Agriculture', 'Minerals and Energy Resources', 'Manufacturing Industries', 'Lifelines of National Economy', 'Power Sharing', 'Federalism', 'Democracy and Diversity', 'Gender, Religion and Caste', 'Popular Struggles and Movements', 'Political Parties', 'Outcomes of Democracy', 'Challenges to Democracy', 'Development', 'Sectors of the Indian Economy', 'Money and Credit', 'Globalisation and the Indian Economy', 'Consumer Rights'],
    English: ['First Flight (Prose)', 'First Flight (Poetry)', 'Footprints Without Feet', 'Grammar and Writing'],
  },
  'Class 11': {
    Physics:   ['Physical World', 'Units and Measurements', 'Motion in a Straight Line', 'Motion in a Plane', 'Laws of Motion', 'Work, Energy and Power', 'System of Particles and Rotational Motion', 'Gravitation', 'Mechanical Properties of Solids', 'Mechanical Properties of Fluids', 'Thermal Properties of Matter', 'Thermodynamics', 'Kinetic Theory', 'Oscillations', 'Waves'],
    Chemistry: ['Some Basic Concepts of Chemistry', 'Structure of Atom', 'Classification of Elements and Periodicity', 'Chemical Bonding and Molecular Structure', 'States of Matter', 'Thermodynamics', 'Equilibrium', 'Redox Reactions', 'Hydrogen', 'The s-Block Elements', 'The p-Block Elements', 'Organic Chemistry – Basic Principles', 'Hydrocarbons', 'Environmental Chemistry'],
    Biology:   ['The Living World', 'Biological Classification', 'Plant Kingdom', 'Animal Kingdom', 'Morphology of Flowering Plants', 'Anatomy of Flowering Plants', 'Structural Organisation in Animals', 'Cell: The Unit of Life', 'Biomolecules', 'Cell Cycle and Cell Division', 'Transport in Plants', 'Mineral Nutrition', 'Photosynthesis in Higher Plants', 'Respiration in Plants', 'Plant Growth and Development', 'Digestion and Absorption', 'Breathing and Exchange of Gases', 'Body Fluids and Circulation', 'Excretory Products and their Elimination', 'Locomotion and Movement', 'Neural Control and Coordination', 'Chemical Coordination and Integration'],
    Mathematics: ['Sets', 'Relations and Functions', 'Trigonometric Functions', 'Principle of Mathematical Induction', 'Complex Numbers and Quadratic Equations', 'Linear Inequalities', 'Permutations and Combinations', 'Binomial Theorem', 'Sequences and Series', 'Straight Lines', 'Conic Sections', 'Introduction to 3D Geometry', 'Limits and Derivatives', 'Statistics', 'Probability'],
  },
  'Class 12': {
    Physics:   ['Electric Charges and Fields', 'Electrostatic Potential and Capacitance', 'Current Electricity', 'Moving Charges and Magnetism', 'Magnetism and Matter', 'Electromagnetic Induction', 'Alternating Current', 'Electromagnetic Waves', 'Ray Optics and Optical Instruments', 'Wave Optics', 'Dual Nature of Radiation and Matter', 'Atoms', 'Nuclei', 'Semiconductor Electronics'],
    Chemistry: ['The Solid State', 'Solutions', 'Electrochemistry', 'Chemical Kinetics', 'Surface Chemistry', 'General Principles and Processes of Isolation of Elements', 'The p-Block Elements', 'The d- and f-Block Elements', 'Coordination Compounds', 'Haloalkanes and Haloarenes', 'Alcohols, Phenols and Ethers', 'Aldehydes, Ketones and Carboxylic Acids', 'Amines', 'Biomolecules', 'Polymers', 'Chemistry in Everyday Life'],
    Biology:   ['Reproduction in Organisms', 'Sexual Reproduction in Flowering Plants', 'Human Reproduction', 'Reproductive Health', 'Principles of Inheritance and Variation', 'Molecular Basis of Inheritance', 'Evolution', 'Human Health and Disease', 'Strategies for Enhancement in Food Production', 'Microbes in Human Welfare', 'Biotechnology: Principles and Processes', 'Biotechnology and its Applications', 'Organisms and Populations', 'Ecosystem', 'Biodiversity and Conservation', 'Environmental Issues'],
    Mathematics: ['Relations and Functions', 'Inverse Trigonometric Functions', 'Matrices', 'Determinants', 'Continuity and Differentiability', 'Applications of Derivatives', 'Integrals', 'Applications of Integrals', 'Differential Equations', 'Vector Algebra', 'Three Dimensional Geometry', 'Linear Programming', 'Probability'],
  },
};

const SUBJECT_COLORS = {
  Physics:          { accent: '#60a5fa', bg: 'rgba(96,165,250,0.08)',  border: 'rgba(96,165,250,0.25)',  dot: '#60a5fa' },
  Chemistry:        { accent: '#34d399', bg: 'rgba(52,211,153,0.08)',  border: 'rgba(52,211,153,0.25)',  dot: '#34d399' },
  Biology:          { accent: '#a78bfa', bg: 'rgba(167,139,250,0.08)', border: 'rgba(167,139,250,0.25)', dot: '#a78bfa' },
  Mathematics:      { accent: '#818cf8', bg: 'rgba(129,140,248,0.08)', border: 'rgba(129,140,248,0.25)', dot: '#818cf8' },
  'Social Science': { accent: '#fbbf24', bg: 'rgba(251,191,36,0.08)',  border: 'rgba(251,191,36,0.25)',  dot: '#fbbf24' },
  English:          { accent: '#f472b6', bg: 'rgba(244,114,182,0.08)', border: 'rgba(244,114,182,0.25)', dot: '#f472b6' },
};

/* ─── Disclaimer Overlay ──────────────────────────────────────────────────── */
function DisclaimerOverlay({ onAccept }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 200,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '1rem',
      background: 'rgba(5,9,21,0.85)',
      backdropFilter: 'blur(12px)',
      animation: 'revealUp .3s cubic-bezier(.22,1,.36,1) both',
    }}>
      <div style={{
        background: 'var(--surface, #0d1425)',
        border: '1px solid var(--border, rgba(99,102,241,0.2))',
        borderRadius: 20, padding: '32px 28px',
        maxWidth: 480, width: '100%',
        animation: 'revealUp .4s cubic-bezier(.22,1,.36,1) both',
      }}>
        <div style={{
          width: 48, height: 48, borderRadius: 14,
          background: 'rgba(245,158,11,0.12)',
          border: '1px solid rgba(245,158,11,0.25)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 22, margin: '0 auto 20px',
        }}>⚖️</div>

        <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: 20, fontWeight: 700, color: 'var(--text)', textAlign: 'center', marginBottom: 6 }}>
          Copyright Notice
        </h2>
        <p style={{ fontSize: 12.5, color: 'var(--muted)', textAlign: 'center', marginBottom: 20 }}>
          Please read before accessing the syllabus browser
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
          {[
            { icon: '✓', col: '#10b981', text: 'Topic names shown here (e.g. "Gravitation") are factual identifiers — not copyrightable.' },
            { icon: '✓', col: '#10b981', text: 'Based on CBSE Curriculum 2025-26. Full credit to CBSE / cbseacademic.nic.in.' },
            { icon: '!',  col: '#fbbf24', text: 'We do NOT host NCERT textbook content. Official free PDFs → ncert.nic.in' },
            { icon: '!',  col: '#fbbf24', text: 'For full chapter content, always refer to the official CBSE / NCERT websites.' },
          ].map((item, i) => (
            <div key={i} style={{ display: 'flex', gap: 10, padding: '10px 13px', borderRadius: 10, background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)' }}>
              <span style={{ color: item.col, fontWeight: 700, flexShrink: 0, fontSize: 13 }}>{item.icon}</span>
              <span style={{ fontSize: 12.5, color: '#94a3b8', lineHeight: 1.5 }}>{item.text}</span>
            </div>
          ))}
        </div>

        <p style={{ fontSize: 11, color: 'var(--muted)', textAlign: 'center', marginBottom: 18, fontFamily: 'monospace' }}>
          Source: cbseacademic.nic.in
        </p>

        <button onClick={onAccept} className="btn-generate" style={{ position: 'relative' }}>
          <div className="btn-shine" />
          I understand — Show Syllabus
        </button>
      </div>
    </div>
  );
}

/* ─── Main SyllabusSection ────────────────────────────────────────────────── */
export default function SyllabusSection() {
  const [accepted, setAccepted]   = useState(false);
  const [selClass, setSelClass]   = useState('Class 10');
  const [selSubject, setSelSubject] = useState(null);
  const [search, setSearch]       = useState('');

  const classes  = Object.keys(SYLLABUS);
  const subjects = Object.keys(SYLLABUS[selClass] || {});

  useEffect(() => {
    if (subjects.length > 0) setSelSubject(subjects[0]);
  }, [selClass]);

  const topics = selSubject ? SYLLABUS[selClass][selSubject] : [];
  const filtered = search
    ? topics.filter(t => t.toLowerCase().includes(search.toLowerCase()))
    : topics;

  const colors = SUBJECT_COLORS[selSubject] || SUBJECT_COLORS['Physics'];

  return (
    <>
      {!accepted && <DisclaimerOverlay onAccept={() => setAccepted(true)} />}

      <div style={{ filter: !accepted ? 'blur(4px)' : 'none', pointerEvents: !accepted ? 'none' : 'auto', transition: 'filter .3s' }}>

        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 26, fontWeight: 800, color: 'var(--text)', marginBottom: 6 }}>
            CBSE Syllabus Browser
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <p style={{ fontSize: 13.5, color: 'var(--muted)' }}>
              Based on CBSE Curriculum 2025-26 ·{' '}
              <a href="https://cbseacademic.nic.in/curriculum_2025-26.html" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent2)', textDecoration: 'none' }}>
                Official syllabus ↗
              </a>
              {' '}·{' '}
              <a href="https://ncert.nic.in/textbook/textbook.htm" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent2)', textDecoration: 'none' }}>
                Free NCERT PDFs ↗
              </a>
            </p>
            <span style={{
              padding: '3px 11px', borderRadius: 20, fontSize: 11, fontWeight: 600,
              background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)',
              color: '#fbbf24',
            }}>
              ⚖️ Topic names only · NCERT content not hosted
            </span>
          </div>
        </div>

        {/* Class tabs */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
          {classes.map(cls => (
            <button
              key={cls}
              onClick={() => { setSelClass(cls); setSearch(''); }}
              style={{
                padding: '8px 18px', borderRadius: 10, border: 'none', cursor: 'pointer',
                fontFamily: 'DM Sans, sans-serif', fontSize: 13.5, fontWeight: 500,
                background: selClass === cls ? 'var(--accent)' : 'var(--surface)',
                color: selClass === cls ? '#fff' : 'var(--muted)',
                border: `1px solid ${selClass === cls ? 'var(--accent)' : 'var(--border)'}`,
                boxShadow: selClass === cls ? '0 4px 14px rgba(99,102,241,0.3)' : 'none',
                transition: 'all .2s',
              }}
            >{cls}</button>
          ))}
        </div>

        {/* Layout */}
        <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr', gap: 16 }}>

          {/* Subject list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {subjects.map(subj => {
              const c = SUBJECT_COLORS[subj] || SUBJECT_COLORS['Physics'];
              const active = selSubject === subj;
              return (
                <button
                  key={subj}
                  onClick={() => { setSelSubject(subj); setSearch(''); }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 9,
                    padding: '10px 13px', borderRadius: 10, border: 'none', cursor: 'pointer',
                    fontFamily: 'DM Sans, sans-serif', fontSize: 13, fontWeight: active ? 600 : 500,
                    textAlign: 'left',
                    background: active ? c.bg : 'var(--surface)',
                    border: `1px solid ${active ? c.border : 'var(--border)'}`,
                    color: active ? c.accent : 'var(--muted)',
                    transition: 'all .18s',
                  }}
                >
                  <span style={{ width: 7, height: 7, borderRadius: '50%', background: c.dot, flexShrink: 0 }} />
                  {subj}
                </button>
              );
            })}
          </div>

          {/* Topics panel */}
          <div className="p-card" style={{ padding: 20 }}>
            {/* Panel header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, gap: 12, flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{
                  padding: '3px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600,
                  background: colors.bg, border: `1px solid ${colors.border}`, color: colors.accent,
                }}>
                  {selSubject}
                </span>
                <span style={{ fontSize: 12, color: 'var(--muted)' }}>{filtered.length} topics</span>
              </div>
              {/* Search */}
              <div style={{ position: 'relative' }}>
                <svg style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }} width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text" value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="Search topics…"
                  style={{
                    paddingLeft: 30, paddingRight: 12, paddingTop: 7, paddingBottom: 7,
                    borderRadius: 9, border: '1px solid var(--border)',
                    background: 'rgba(255,255,255,0.04)', color: 'var(--text)',
                    fontSize: 12.5, fontFamily: 'DM Sans, sans-serif', outline: 'none', width: 180,
                  }}
                  onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                  onBlur={e => e.target.style.borderColor = 'var(--border)'}
                />
              </div>
            </div>

            {/* Topics grid */}
            {filtered.length > 0 ? (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {filtered.map((topic, idx) => (
                  <div key={idx} style={{
                    display: 'flex', alignItems: 'flex-start', gap: 10,
                    padding: '10px 13px', borderRadius: 9,
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid var(--border)',
                    transition: 'border-color .15s',
                  }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = colors.border}
                    onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
                  >
                    <span style={{ fontSize: 10.5, color: 'var(--muted)', fontFamily: 'monospace', flexShrink: 0, marginTop: 1 }}>
                      {String(idx + 1).padStart(2, '0')}
                    </span>
                    <span style={{ fontSize: 13, color: '#94a3b8', lineHeight: 1.4, fontWeight: 500 }}>{topic}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--muted)' }}>
                <div style={{ fontSize: 28, marginBottom: 8 }}>🔍</div>
                <div style={{ fontSize: 13 }}>No topics match "{search}"</div>
              </div>
            )}

            {/* Footer */}
            <div style={{
              marginTop: 16, paddingTop: 14,
              borderTop: '1px solid var(--border)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              fontSize: 11, color: 'var(--muted)', flexWrap: 'wrap', gap: 8,
            }}>
              <span>📌 Topics based on CBSE Curriculum 2025-26 · cbseacademic.nic.in</span>
              <div style={{ display: 'flex', gap: 14 }}>
                <a href="https://ncert.nic.in/textbook.php" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent2)', fontSize: 11 }}>📥 NCERT PDFs ↗</a>
                <a href="https://cbseacademic.nic.in/curriculum_2025.html" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent2)', fontSize: 11 }}>Official CBSE ↗</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}