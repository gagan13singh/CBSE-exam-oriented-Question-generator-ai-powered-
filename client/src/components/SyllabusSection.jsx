/**
 * client/src/components/SyllabusSection.jsx
 *
 * REBUILT: Full 3-level hierarchy — Class → Subject → Chapters (expandable) → Topics
 * Uses syllabusData.js (embedded, no network call)
 *
 * ─── Copyright Compliance ────────────────────────────────────────────────────
 * • Chapter and topic NAMES are factual identifiers — not copyrightable
 * • Source: CBSE Curriculum 2025-26 (cbseacademic.nic.in)
 * • No NCERT textbook content, descriptions, or excerpts are displayed
 * • Users are directed to ncert.nic.in for actual content
 * ─────────────────────────────────────────────────────────────────────────────
 */

import React, { useState, useEffect } from 'react';
import { getSubjects, getChapters, getTopics } from '../data/syllabusData';

/* ── Subject accent colours ── */
const SUBJECT_COLORS = {
  Physics:            { accent: '#60a5fa', bg: 'rgba(96,165,250,0.08)',  border: 'rgba(96,165,250,0.22)',  dot: '#60a5fa'  },
  Chemistry:          { accent: '#34d399', bg: 'rgba(52,211,153,0.08)',  border: 'rgba(52,211,153,0.22)',  dot: '#34d399'  },
  Biology:            { accent: '#a78bfa', bg: 'rgba(167,139,250,0.08)', border: 'rgba(167,139,250,0.22)', dot: '#a78bfa'  },
  Mathematics:        { accent: '#818cf8', bg: 'rgba(129,140,248,0.08)', border: 'rgba(129,140,248,0.22)', dot: '#818cf8'  },
  Science:            { accent: '#34d399', bg: 'rgba(52,211,153,0.08)',  border: 'rgba(52,211,153,0.22)',  dot: '#34d399'  },
  'Social Science':   { accent: '#fbbf24', bg: 'rgba(251,191,36,0.08)',  border: 'rgba(251,191,36,0.22)',  dot: '#fbbf24'  },
  English:            { accent: '#f472b6', bg: 'rgba(244,114,182,0.08)', border: 'rgba(244,114,182,0.22)', dot: '#f472b6'  },
  Hindi:              { accent: '#fb923c', bg: 'rgba(251,146,60,0.08)',  border: 'rgba(251,146,60,0.22)',  dot: '#fb923c'  },
  Economics:          { accent: '#fbbf24', bg: 'rgba(251,191,36,0.08)',  border: 'rgba(251,191,36,0.22)',  dot: '#fbbf24'  },
  'Computer Science': { accent: '#22d3ee', bg: 'rgba(34,211,238,0.08)',  border: 'rgba(34,211,238,0.22)',  dot: '#22d3ee'  },
};
const DEF_COLOR = { accent: '#818cf8', bg: 'rgba(129,140,248,0.08)', border: 'rgba(129,140,248,0.22)', dot: '#818cf8' };
const getColor = s => SUBJECT_COLORS[s] || DEF_COLOR;

/* ── Disclaimer overlay ── */
function DisclaimerOverlay({ onAccept }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 200,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '1rem',
      background: 'rgba(5,9,21,0.88)',
      backdropFilter: 'blur(14px)',
    }}>
      <div style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 20, padding: '28px 22px',
        maxWidth: 480, width: '100%',
        maxHeight: '90vh', overflowY: 'auto',
        animation: 'revealUp .35s cubic-bezier(.22,1,.36,1) both',
      }}>
        <div style={{
          width: 48, height: 48, borderRadius: 14,
          background: 'rgba(245,158,11,0.1)',
          border: '1px solid rgba(245,158,11,0.25)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 22, margin: '0 auto 16px',
        }}>⚖️</div>

        <h2 style={{
          fontFamily: 'Syne, sans-serif', fontSize: 18, fontWeight: 700,
          color: 'var(--text)', textAlign: 'center', marginBottom: 6,
        }}>Copyright Notice</h2>
        <p style={{ fontSize: 12, color: 'var(--muted)', textAlign: 'center', marginBottom: 18 }}>
          Please read before accessing the syllabus browser
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 18 }}>
          {[
            { icon: '✓', col: '#10b981', text: 'Chapter and topic names are factual identifiers — they are not copyrightable.' },
            { icon: '✓', col: '#10b981', text: 'Based on CBSE Curriculum 2025-26. Full credit to CBSE (cbseacademic.nic.in).' },
            { icon: '!', col: '#fbbf24', text: 'We do NOT display NCERT textbook content, descriptions, or excerpts of any kind.' },
            { icon: '!', col: '#fbbf24', text: 'For full chapter content, visit ncert.nic.in — all PDFs are free and official.' },
          ].map((item, i) => (
            <div key={i} style={{
              display: 'flex', gap: 10, padding: '9px 12px',
              borderRadius: 10, background: 'rgba(255,255,255,0.03)',
              border: '1px solid var(--border)',
            }}>
              <span style={{ color: item.col, fontWeight: 700, flexShrink: 0, fontSize: 13 }}>{item.icon}</span>
              <span style={{ fontSize: 12, color: '#94a3b8', lineHeight: 1.55 }}>{item.text}</span>
            </div>
          ))}
        </div>

        <p style={{ fontSize: 11, color: 'var(--muted)', textAlign: 'center', marginBottom: 16, fontFamily: 'monospace' }}>
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

/* ── Individual chapter card with expandable topics ── */
function ChapterCard({ cls, subject, chapter, chapterIndex, color, search, forceOpen }) {
  const topics = getTopics(cls, subject, chapter);
  const [open, setOpen] = useState(false);

  // Auto-open when search matches something inside, or forceOpen is set
  useEffect(() => {
    if (forceOpen) { setOpen(true); return; }
    if (!forceOpen && !search) { setOpen(false); return; }
    if (search) {
      const hasMatch = topics.some(t => t.toLowerCase().includes(search.toLowerCase()));
      setOpen(hasMatch);
    }
  }, [search, forceOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  const visibleTopics = search
    ? topics.filter(t => t.toLowerCase().includes(search.toLowerCase()))
    : topics;

  // Hide card entirely if searching and nothing matches
  if (search &&
      !chapter.toLowerCase().includes(search.toLowerCase()) &&
      visibleTopics.length === 0) {
    return null;
  }

  const chapterMatchesSearch = search && chapter.toLowerCase().includes(search.toLowerCase());

  return (
    <div style={{
      background: 'var(--surface)',
      border: `1px solid ${open ? color.border : 'var(--border)'}`,
      borderRadius: 13,
      overflow: 'hidden',
      transition: 'border-color .2s, box-shadow .2s',
      boxShadow: open ? `0 0 0 1px ${color.border}20` : 'none',
    }}>

      {/* ── Header row ── */}
      <button
        onClick={() => setOpen(v => !v)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', gap: 10,
          padding: '12px 14px', background: 'transparent',
          border: 'none', cursor: 'pointer', textAlign: 'left',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
          {/* Number badge */}
          <span style={{
            width: 26, height: 26, borderRadius: 8, flexShrink: 0,
            background: open ? color.bg : 'rgba(255,255,255,0.05)',
            border: `1px solid ${open ? color.border : 'var(--border)'}`,
            color: open ? color.accent : 'var(--muted)',
            fontSize: 10, fontWeight: 700,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'DM Sans, sans-serif',
            transition: 'all .2s',
          }}>
            {String(chapterIndex + 1).padStart(2, '0')}
          </span>

          {/* Chapter name */}
          <span style={{
            fontSize: 13, fontWeight: 600, lineHeight: 1.35,
            color: chapterMatchesSearch ? color.accent : open ? 'var(--text)' : '#94a3b8',
            transition: 'color .2s',
          }}>
            {chapter}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 7, flexShrink: 0 }}>
          <span style={{
            padding: '2px 8px', borderRadius: 20,
            fontSize: 10.5, fontWeight: 500,
            background: 'rgba(255,255,255,0.04)',
            color: 'var(--muted)',
          }}>
            {topics.length} topic{topics.length !== 1 ? 's' : ''}
          </span>
          <span style={{
            color: 'var(--muted)', fontSize: 10,
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform .22s',
            display: 'inline-block',
          }}>▾</span>
        </div>
      </button>

      {/* ── Topics panel ── */}
      {open && (
        <div style={{
          padding: '2px 14px 14px',
          borderTop: '1px solid var(--border)',
          animation: 'revealUp .18s cubic-bezier(.22,1,.36,1) both',
        }}>
          {/* Topics label */}
          <div style={{
            fontSize: 9.5, fontWeight: 700, textTransform: 'uppercase',
            letterSpacing: '.08em', color: 'var(--muted)',
            margin: '10px 0 8px',
            display: 'flex', alignItems: 'center', gap: 6,
          }}>
            <span style={{
              width: 3, height: 10,
              background: color.accent,
              borderRadius: 2, display: 'inline-block',
            }} />
            Key topics
            <span style={{
              fontSize: 9, fontWeight: 400, color: 'var(--muted)',
              textTransform: 'none', letterSpacing: 0,
            }}>
              · names only · no NCERT content
            </span>
          </div>

          {/* Topic pills */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
            {visibleTopics.map((topic, i) => {
              const highlighted = search && topic.toLowerCase().includes(search.toLowerCase());
              return (
                <span key={i} style={{
                  padding: '4px 10px', borderRadius: 20,
                  fontSize: 11.5, fontWeight: 500,
                  background: highlighted ? color.bg : 'rgba(255,255,255,0.04)',
                  border: `1px solid ${highlighted ? color.border : 'var(--border)'}`,
                  color: highlighted ? color.accent : '#64748b',
                  transition: 'all .15s',
                }}>
                  {topic}
                </span>
              );
            })}
          </div>

          {/* NCERT link per chapter */}
          <div style={{ marginTop: 10, paddingTop: 8, borderTop: '1px solid var(--border)' }}>
            <a
              href="https://ncert.nic.in/textbook.php"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontSize: 11, color: 'var(--accent2)',
                textDecoration: 'none',
                display: 'inline-flex', alignItems: 'center', gap: 4,
              }}
            >
              📥 Read full chapter on ncert.nic.in ↗
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Main export ── */
export default function SyllabusSection() {
  const [accepted,   setAccepted]  = useState(false);
  const [selClass,   setSelClass]  = useState('10');
  const [selSubject, setSelSubject]= useState(null);
  const [search,     setSearch]    = useState('');
  const [expandAll,  setExpandAll] = useState(false);

  const subjects = getSubjects(selClass);

  useEffect(() => {
    if (subjects.length > 0) setSelSubject(subjects[0]);
    setSearch('');
    setExpandAll(false);
  }, [selClass]); // eslint-disable-line react-hooks/exhaustive-deps

  const chapters    = selSubject ? getChapters(selClass, selSubject) : [];
  const color       = getColor(selSubject);
  const totalTopics = chapters.reduce((n, ch) => n + getTopics(selClass, selSubject, ch).length, 0);

  // Filter chapters by search
  const visibleChapters = search
    ? chapters.filter(ch => {
        const topics = getTopics(selClass, selSubject, ch);
        return ch.toLowerCase().includes(search.toLowerCase()) ||
               topics.some(t => t.toLowerCase().includes(search.toLowerCase()));
      })
    : chapters;

  return (
    <>
      {!accepted && <DisclaimerOverlay onAccept={() => setAccepted(true)} />}

      <div style={{
        filter: !accepted ? 'blur(4px)' : 'none',
        pointerEvents: !accepted ? 'none' : 'auto',
        transition: 'filter .3s',
        paddingBottom: 80,
      }}>

        {/* ── Header ── */}
        <div style={{ marginBottom: 20 }}>
          <h1 style={{
            fontFamily: 'Syne, sans-serif',
            fontSize: 'clamp(20px,5vw,26px)',
            fontWeight: 800, color: 'var(--text)', marginBottom: 6,
          }}>
            CBSE Syllabus Browser
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <p style={{ fontSize: 13, color: 'var(--muted)' }}>
              CBSE 2025-26 ·{' '}
              <a href="https://cbseacademic.nic.in/curriculum_2025-26.html"
                target="_blank" rel="noopener noreferrer"
                style={{ color: 'var(--accent2)', textDecoration: 'none' }}>Official ↗</a>
              {' '}·{' '}
              <a href="https://ncert.nic.in/textbook.php"
                target="_blank" rel="noopener noreferrer"
                style={{ color: 'var(--accent2)', textDecoration: 'none' }}>Free PDFs ↗</a>
            </p>
            <span style={{
              padding: '2px 10px', borderRadius: 20, fontSize: 10.5, fontWeight: 600,
              background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)',
              color: '#fbbf24', whiteSpace: 'nowrap',
            }}>
              ⚖️ Chapter &amp; topic names only
            </span>
          </div>
        </div>

        {/* ── Class tabs ── */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
          {['9', '10', '11', '12'].map(cls => (
            <button key={cls} onClick={() => setSelClass(cls)} style={{
              padding: '7px 18px', borderRadius: 10, cursor: 'pointer',
              border: `1px solid ${selClass === cls ? 'var(--accent)' : 'var(--border)'}`,
              background: selClass === cls ? 'var(--accent)' : 'var(--surface)',
              color: selClass === cls ? '#fff' : 'var(--muted)',
              fontFamily: 'DM Sans, sans-serif', fontSize: 13, fontWeight: 500,
              boxShadow: selClass === cls ? '0 4px 14px rgba(99,102,241,0.3)' : 'none',
              transition: 'all .18s',
            }}>
              Class {cls}
            </button>
          ))}
        </div>

        {/* ── Grid: subject sidebar + chapters ── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '190px 1fr',
          gap: 16, alignItems: 'start',
        }}
          className="syllabus-layout"
        >

          {/* Subjects */}
          <div className="syllabus-subjects" style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            {subjects.map(subj => {
              const c = getColor(subj);
              const active = selSubject === subj;
              return (
                <button key={subj}
                  onClick={() => { setSelSubject(subj); setSearch(''); setExpandAll(false); }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 9,
                    padding: '9px 12px', borderRadius: 10, textAlign: 'left',
                    border: `1px solid ${active ? c.border : 'var(--border)'}`,
                    background: active ? c.bg : 'var(--surface)',
                    color: active ? c.accent : 'var(--muted)',
                    fontFamily: 'DM Sans, sans-serif', fontSize: 13,
                    fontWeight: active ? 600 : 500,
                    cursor: 'pointer', transition: 'all .18s',
                    whiteSpace: 'nowrap',
                  }}
                >
                  <span style={{ width: 7, height: 7, borderRadius: '50%', background: c.dot, flexShrink: 0 }} />
                  {subj}
                </button>
              );
            })}
          </div>

          {/* Chapters + Topics */}
          <div>

            {/* Toolbar */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              marginBottom: 12, gap: 10, flexWrap: 'wrap',
            }}>
              {/* Badge + count */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <span style={{
                  padding: '4px 13px', borderRadius: 20, fontSize: 12, fontWeight: 600,
                  background: color.bg, border: `1px solid ${color.border}`, color: color.accent,
                }}>
                  {selSubject}
                </span>
                <span style={{ fontSize: 12, color: 'var(--muted)' }}>
                  {chapters.length} chapters · {totalTopics} topics
                </span>
              </div>

              {/* Controls */}
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                {/* Search */}
                <div style={{ position: 'relative' }}>
                  <svg style={{
                    position: 'absolute', left: 9, top: '50%',
                    transform: 'translateY(-50%)', color: 'var(--muted)', pointerEvents: 'none',
                  }} width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    type="text" value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search chapters, topics…"
                    style={{
                      paddingLeft: 28, paddingRight: search ? 28 : 10,
                      paddingTop: 7, paddingBottom: 7,
                      borderRadius: 9, border: '1px solid var(--border)',
                      background: 'rgba(255,255,255,0.04)',
                      color: 'var(--text)', fontSize: 12.5,
                      fontFamily: 'DM Sans, sans-serif',
                      outline: 'none', width: 185,
                      transition: 'border-color .2s',
                    }}
                    onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                    onBlur={e => e.target.style.borderColor = 'var(--border)'}
                  />
                  {search && (
                    <button onClick={() => setSearch('')} style={{
                      position: 'absolute', right: 7, top: '50%',
                      transform: 'translateY(-50%)', background: 'none',
                      border: 'none', color: 'var(--muted)', cursor: 'pointer',
                      fontSize: 14, padding: 0, lineHeight: 1,
                    }}>×</button>
                  )}
                </div>

                {/* Expand / collapse all */}
                <button
                  onClick={() => setExpandAll(v => !v)}
                  className="btn-secondary"
                  style={{ fontSize: 11.5, padding: '6px 12px', whiteSpace: 'nowrap' }}
                >
                  {expandAll ? '⊖ Collapse' : '⊕ Expand all'}
                </button>
              </div>
            </div>

            {/* Search result notice */}
            {search && (
              <div style={{
                fontSize: 12, color: 'var(--muted)', marginBottom: 10,
                padding: '6px 10px', background: 'rgba(99,102,241,0.06)',
                border: '1px solid rgba(99,102,241,0.15)', borderRadius: 8,
              }}>
                🔍 {visibleChapters.length === 0
                  ? `No results for "${search}"`
                  : `${visibleChapters.length} chapter${visibleChapters.length !== 1 ? 's' : ''} match "${search}"`
                }
              </div>
            )}

            {/* Chapter cards */}
            {visibleChapters.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                {visibleChapters.map(chapter => (
                  <ChapterCard
                    key={chapter}
                    cls={selClass}
                    subject={selSubject}
                    chapter={chapter}
                    chapterIndex={chapters.indexOf(chapter)}
                    color={color}
                    search={search}
                    forceOpen={expandAll}
                  />
                ))}
              </div>
            ) : (
              <div style={{
                textAlign: 'center', padding: '40px 20px',
                border: '1.5px dashed var(--border)', borderRadius: 16,
                color: 'var(--muted)',
              }}>
                <div style={{ fontSize: 32, marginBottom: 10 }}>🔍</div>
                <div style={{ fontSize: 14 }}>No chapters or topics match "{search}"</div>
                <button onClick={() => setSearch('')} style={{
                  marginTop: 12, background: 'none',
                  border: '1px solid var(--border)', borderRadius: 8,
                  padding: '6px 14px', color: 'var(--muted)',
                  fontSize: 12, cursor: 'pointer',
                  fontFamily: 'DM Sans, sans-serif',
                }}>Clear search</button>
              </div>
            )}

            {/* Footer */}
            <div style={{
              marginTop: 16, paddingTop: 12,
              borderTop: '1px solid var(--border)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              fontSize: 11, color: 'var(--muted)', flexWrap: 'wrap', gap: 6,
            }}>
              <span>📌 CBSE 2025-26 · Chapter &amp; topic names only · No NCERT content hosted</span>
              <div style={{ display: 'flex', gap: 14 }}>
                <a href="https://ncert.nic.in/textbook.php" target="_blank" rel="noopener noreferrer"
                  style={{ color: 'var(--accent2)', fontSize: 11 }}>📥 NCERT PDFs ↗</a>
                <a href="https://cbseacademic.nic.in/curriculum_2025-26.html" target="_blank" rel="noopener noreferrer"
                  style={{ color: 'var(--accent2)', fontSize: 11 }}>CBSE Official ↗</a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 640px) {
          .syllabus-layout {
            grid-template-columns: 1fr !important;
          }
          .syllabus-subjects {
            flex-direction: row !important;
            flex-wrap: wrap;
            gap: 5px !important;
          }
        }
      `}</style>
    </>
  );
}