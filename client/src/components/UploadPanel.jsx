/**
 * client/src/components/UploadPanel.jsx
 * Mobile responsive update — all logic UNCHANGED
 */

import React, { useState, useRef } from 'react';
import { ENDPOINTS } from '../config';
import QuestionCard from './QuestionCard';

export default function UploadPanel() {
  const [tab, setTab] = useState('pdf');

  return (
    <div className="p-card" style={{ padding: 0, overflow: 'hidden' }}>
      {/* Tab bar */}
      <div style={{
        display: 'flex',
        borderBottom: '1px solid var(--border)',
        background: 'rgba(255,255,255,0.02)',
        overflowX: 'auto',
        scrollbarWidth: 'none',
      }}>
        {[
          { id: 'pdf',     label: '📄 Upload Textbook PDF', desc: 'Ground AI in your NCERT chapter' },
          { id: 'similar', label: '❓ Get Similar Questions', desc: 'Paste or photo a question' },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              flex: 1, padding: '12px 16px', border: 'none', cursor: 'pointer',
              background: tab === t.id ? 'rgba(99,102,241,0.08)' : 'transparent',
              borderBottom: tab === t.id ? '2px solid var(--accent)' : '2px solid transparent',
              transition: 'all .2s', textAlign: 'left',
              minWidth: 140,
            }}
          >
            <div style={{ fontSize: 13, fontWeight: 600, color: tab === t.id ? 'var(--accent2)' : 'var(--muted)', fontFamily: 'DM Sans, sans-serif', whiteSpace: 'nowrap' }}>
              {t.label}
            </div>
            <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2, whiteSpace: 'nowrap' }}>{t.desc}</div>
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ padding: 20 }}>
        {tab === 'pdf'     && <PDFTab />}
        {tab === 'similar' && <SimilarTab />}
      </div>
    </div>
  );
}

function PDFTab() {
  const [file, setFile]       = useState(null);
  const [cls, setCls]         = useState('');
  const [subject, setSubject] = useState('');
  const [chapter, setChapter] = useState('');
  const [dragging, setDragging] = useState(false);
  const [status, setStatus]   = useState('idle');
  const [msg, setMsg]         = useState('');
  const ref = useRef();

  const selectStyle = {
    padding: '9px 12px', borderRadius: 9,
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid var(--border)',
    color: 'var(--text)', fontSize: 13,
    fontFamily: 'DM Sans, sans-serif',
    width: '100%', outline: 'none',
  };

  const handleDrop = e => {
    e.preventDefault(); setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f?.type === 'application/pdf') setFile(f);
    else setMsg('Only PDF files accepted.');
  };

  const handleUpload = async () => {
    if (!file || !cls || !subject || !chapter) {
      setMsg('Fill all fields and select a PDF.'); return;
    }
    setStatus('uploading'); setMsg('');
    const fd = new FormData();
    fd.append('pdf', file);
    fd.append('class', cls);
    fd.append('subject', subject);
    fd.append('chapter', chapter);

    try {
      const res = await fetch(ENDPOINTS.uploadPdf || '/api/v1/upload/pdf', { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Upload failed');
      setStatus('success');
      setMsg(data.message || 'PDF indexed! Questions will now be grounded in your textbook.');
      setFile(null);
    } catch (err) {
      setStatus('error');
      setMsg(err.message || 'Upload failed.');
    }
  };

  return (
    <div>
      {/* Legal note */}
      <div style={{
        display: 'flex', gap: 10, padding: '9px 12px',
        background: 'rgba(245,158,11,0.07)',
        border: '1px solid rgba(245,158,11,0.2)',
        borderRadius: 10, marginBottom: 16, fontSize: 12, color: '#d4a017',
      }}>
        <span style={{ flexShrink: 0 }}>⚖️</span>
        <span>Upload <strong>your own copy</strong> of the NCERT PDF.{' '}
          <a href="https://ncert.nic.in/textbook.php" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent2)', textDecoration: 'underline' }}>
            Free PDFs ↗
          </a>
        </span>
      </div>

      {/* Fields — responsive */}
      <div className="upload-fields-grid">
        <div>
          <label style={{ display: 'block', fontSize: 10.5, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.07em', color: 'var(--muted)', marginBottom: 5 }}>Class</label>
          <select value={cls} onChange={e => setCls(e.target.value)} style={selectStyle}>
            <option value="" style={{ background: '#131c30' }}>Select</option>
            {['9','10','11','12'].map(c => <option key={c} value={c} style={{ background: '#131c30' }}>Class {c}</option>)}
          </select>
        </div>
        <div>
          <label style={{ display: 'block', fontSize: 10.5, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.07em', color: 'var(--muted)', marginBottom: 5 }}>Subject</label>
          <select value={subject} onChange={e => setSubject(e.target.value)} style={selectStyle}>
            <option value="" style={{ background: '#131c30' }}>Select</option>
            {['Physics','Chemistry','Biology','Mathematics','Social Science','English'].map(s =>
              <option key={s} value={s} style={{ background: '#131c30' }}>{s}</option>
            )}
          </select>
        </div>
        <div>
          <label style={{ display: 'block', fontSize: 10.5, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.07em', color: 'var(--muted)', marginBottom: 5 }}>Chapter</label>
          <input
            type="text" value={chapter} onChange={e => setChapter(e.target.value)}
            placeholder="e.g. Gravitation"
            style={{ ...selectStyle, padding: '9px 12px' }}
          />
        </div>
      </div>

      {/* Drop zone */}
      {status !== 'success' && (
        <div
          className="upload-dropzone"
          onDragOver={e => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => ref.current.click()}
          style={{
            cursor: 'pointer', borderRadius: 12, padding: '20px',
            border: `1.5px dashed ${dragging ? 'var(--accent)' : file ? 'rgba(16,185,129,0.5)' : 'var(--border2, rgba(99,102,241,0.3))'}`,
            background: dragging ? 'rgba(99,102,241,0.06)' : file ? 'rgba(16,185,129,0.05)' : 'rgba(255,255,255,0.02)',
            textAlign: 'center', transition: 'all .2s',
          }}
        >
          <input ref={ref} type="file" accept=".pdf" onChange={e => { if (e.target.files[0]?.type === 'application/pdf') setFile(e.target.files[0]); }} style={{ display: 'none' }} />
          <div style={{ fontSize: 24, marginBottom: 6 }}>{file ? '✅' : '📄'}</div>
          {file ? (
            <>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#10b981', wordBreak: 'break-all' }}>{file.name}</div>
              <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 3 }}>{(file.size / 1024 / 1024).toFixed(2)} MB · Tap to change</div>
            </>
          ) : (
            <>
              <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)' }}>Drop PDF or tap to browse</div>
              <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 3 }}>PDF only · max 20MB</div>
            </>
          )}
        </div>
      )}

      {msg && (
        <div style={{
          marginTop: 12, padding: '9px 12px', borderRadius: 9, fontSize: 13,
          background: status === 'success' ? 'rgba(16,185,129,0.08)' : status === 'error' ? 'rgba(239,68,68,0.08)' : 'rgba(245,158,11,0.08)',
          border: `1px solid ${status === 'success' ? 'rgba(16,185,129,0.25)' : status === 'error' ? 'rgba(239,68,68,0.25)' : 'rgba(245,158,11,0.25)'}`,
          color: status === 'success' ? '#10b981' : status === 'error' ? '#ef4444' : '#d4a017',
          display: 'flex', gap: 8,
        }}>
          <span>{status === 'success' ? '✅' : status === 'error' ? '❌' : '⚠️'}</span>
          {msg}
        </div>
      )}

      <div style={{ marginTop: 14 }}>
        {status === 'success' ? (
          <button onClick={() => { setStatus('idle'); setMsg(''); }} className="btn-secondary" style={{ width: '100%' }}>
            Upload Another PDF
          </button>
        ) : (
          <button
            onClick={handleUpload}
            disabled={status === 'uploading' || !file || !cls || !subject || !chapter}
            className="btn-generate"
            style={{ position: 'relative' }}
          >
            <div className="btn-shine" />
            {status === 'uploading' ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}>
                <span style={{ width: 14, height: 14, borderRadius: '50%', border: '2px solid rgba(255,255,255,.3)', borderTopColor: '#fff', animation: 'spin .7s linear infinite', display: 'inline-block' }} />
                Indexing…
              </span>
            ) : '⬆️ Upload & Index PDF'}
          </button>
        )}
      </div>
    </div>
  );
}

function SimilarTab() {
  const [mode, setMode]         = useState('text');
  const [text, setText]         = useState('');
  const [imageFile, setImgFile] = useState(null);
  const [imgPreview, setPreview] = useState(null);
  const [count, setCount]       = useState(3);
  const [difficulty, setDiff]   = useState('Same');
  const [loading, setLoading]   = useState(false);
  const [results, setResults]   = useState(null);
  const [error, setError]       = useState('');
  const imgRef = useRef();

  const handleImg = e => {
    const f = e.target.files[0];
    if (!f) return;
    setImgFile(f);
    const reader = new FileReader();
    reader.onload = ev => setPreview(ev.target.result);
    reader.readAsDataURL(f);
  };

  const generate = async () => {
    if (mode === 'text' && !text.trim()) { setError('Paste a question first.'); return; }
    if (mode === 'image' && !imageFile) { setError('Upload an image first.'); return; }
    setLoading(true); setError(''); setResults(null);

    try {
      let res;
      if (mode === 'image') {
        const fd = new FormData();
        fd.append('image', imageFile);
        fd.append('count', count);
        fd.append('difficulty', difficulty);
        res = await fetch(ENDPOINTS.similarFromImage || '/api/v1/questions/similar-from-image', { method: 'POST', body: fd });
      } else {
        res = await fetch(ENDPOINTS.similarQuestions || '/api/v1/questions/similar', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ question: text.trim(), count, difficulty }),
        });
      }
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Generation failed');
      setResults(data.data);
    } catch (err) {
      setError(err.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  const btnStyle = (active, color = 'var(--accent)') => ({
    flex: 1, padding: '8px 10px', borderRadius: 9, border: 'none', cursor: 'pointer',
    fontFamily: 'DM Sans, sans-serif', fontSize: 12.5, fontWeight: 500,
    background: active ? `${color}22` : 'transparent',
    border: `1px solid ${active ? color : 'var(--border)'}`,
    color: active ? color : 'var(--muted)',
    transition: 'all .18s',
  });

  return (
    <div>
      {/* Input mode */}
      <div className="similar-mode-btns" style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
        <button style={btnStyle(mode === 'text')} onClick={() => setMode('text')}>✏️ Type / Paste</button>
        <button style={btnStyle(mode === 'image')} onClick={() => setMode('image')}>📸 Upload Photo</button>
      </div>

      {mode === 'text' && (
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          rows={4}
          placeholder={`Paste your question here…\n\nExample: A ball is thrown with velocity 20 m/s. Find max height.`}
          style={{
            width: '100%', padding: '12px 14px', borderRadius: 10,
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid var(--border)',
            color: '#e2e8f0', fontSize: 13.5, fontFamily: 'DM Sans, sans-serif',
            lineHeight: 1.65, resize: 'vertical', outline: 'none',
          }}
          onFocus={e => { e.target.style.borderColor = 'var(--accent)'; e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,.12)'; }}
          onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none'; }}
        />
      )}

      {mode === 'image' && (
        imgPreview ? (
          <div style={{ position: 'relative', borderRadius: 10, overflow: 'hidden', marginBottom: 4 }}>
            <img src={imgPreview} alt="Question" style={{ width: '100%', maxHeight: 180, objectFit: 'contain', background: 'rgba(0,0,0,0.3)' }} />
            <button onClick={() => { setImgFile(null); setPreview(null); }} style={{
              position: 'absolute', top: 8, right: 8,
              width: 28, height: 28, borderRadius: '50%',
              background: 'rgba(0,0,0,0.7)', border: 'none',
              color: '#fff', cursor: 'pointer', fontSize: 14, fontWeight: 700,
            }}>×</button>
          </div>
        ) : (
          <div
            onClick={() => imgRef.current.click()}
            style={{
              cursor: 'pointer', borderRadius: 10, padding: '22px 16px', textAlign: 'center',
              border: '1.5px dashed var(--border2, rgba(99,102,241,0.3))',
              background: 'rgba(255,255,255,0.02)',
            }}
          >
            <input ref={imgRef} type="file" accept="image/*" onChange={handleImg} style={{ display: 'none' }} />
            <div style={{ fontSize: 24, marginBottom: 6 }}>📸</div>
            <div style={{ fontSize: 13, color: 'var(--muted)' }}>Upload a photo of your question</div>
            <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 3 }}>From textbook, notes, or worksheet</div>
          </div>
        )
      )}

      {/* Options */}
      <div className="similar-options-grid">
        <div>
          <label style={{ display: 'block', fontSize: 10.5, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.07em', color: 'var(--muted)', marginBottom: 6 }}>Count</label>
          <div style={{ display: 'flex', gap: 6 }}>
            {[3, 5, 10].map(n => (
              <button key={n} onClick={() => setCount(n)} style={btnStyle(count === n)}>
                {n}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label style={{ display: 'block', fontSize: 10.5, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.07em', color: 'var(--muted)', marginBottom: 6 }}>Difficulty</label>
          <div style={{ display: 'flex', gap: 6 }}>
            {[['Easier','#10b981'], ['Same','var(--accent2)'], ['Harder','#ef4444']].map(([d, col]) => (
              <button key={d} onClick={() => setDiff(d)} style={btnStyle(difficulty === d, col)}>
                {d}
              </button>
            ))}
          </div>
        </div>
      </div>

      {error && (
        <div style={{ marginTop: 12, padding: '9px 13px', borderRadius: 9, fontSize: 13, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', color: '#ef4444', display: 'flex', gap: 8 }}>
          <span>❌</span> {error}
        </div>
      )}

      <button onClick={generate} disabled={loading} className="btn-generate" style={{ marginTop: 14, position: 'relative' }}>
        <div className="btn-shine" />
        {loading ? (
          <span style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}>
            <span style={{ width: 14, height: 14, borderRadius: '50%', border: '2px solid rgba(255,255,255,.3)', borderTopColor: '#fff', animation: 'spin .7s linear infinite', display: 'inline-block' }} />
            Generating…
          </span>
        ) : `✨ Generate ${count} Similar Questions`}
      </button>

      {results && Array.isArray(results) && (
        <div style={{ marginTop: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, flexWrap: 'wrap', gap: 8 }}>
            <div style={{ fontFamily: 'Syne,sans-serif', fontSize: 16, fontWeight: 700, color: 'var(--text)' }}>
              Similar Questions ({results.length})
            </div>
            <button onClick={() => { setResults(null); setText(''); setImgFile(null); setPreview(null); }} className="btn-secondary" style={{ fontSize: 12, padding: '5px 12px' }}>
              Try another
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {results.map((q, i) => (
              <QuestionCard key={i} data={q} index={i + 1} animate={i === 0} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}