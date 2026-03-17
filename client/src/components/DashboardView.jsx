import React from 'react';

const DashboardView = ({ setAppMode }) => {
  // Real-ish data from localStorage
  const questionsGenerated = parseInt(localStorage.getItem('questions_generated') || '0');
  const testsCompleted = parseInt(localStorage.getItem('tests_completed') || '0');
  const avgAccuracy = localStorage.getItem('avg_accuracy') || '73%';
  const streak = localStorage.getItem('user_streak') || '7';

  return (
    <div className="animate-fade-in w-full max-w-6xl mx-auto px-4">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '48px', fontWeight: 800, color: 'white', marginBottom: '8px', letterSpacing: '-0.02em' }}>
            Good morning 👋
          </h1>
          <p style={{ color: 'var(--muted)', fontSize: '16px' }}>
            You're on a {streak}-day streak. Keep going!
          </p>
        </div>
        
        {/* Streak Card */}
        <div className="cosmic-card flex items-center gap-4 py-3 px-6" style={{ borderRadius: '16px', background: 'rgba(245,158,11,0.05)', borderColor: 'rgba(245,158,11,0.2)' }}>
          <div style={{ fontSize: '32px' }}>🔥</div>
          <div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--gold2)', lineHeight: 1 }}>{streak}</div>
            <div style={{ fontSize: '12px', color: 'var(--gold2)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>day streak</div>
          </div>
        </div>
      </div>

      {/* Main Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
        <div className="cosmic-card p-10 transition-all hover:border-[rgba(99,102,241,0.4)]">
          <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '24px' }}>
            Questions Generated
          </div>
          <div style={{ fontSize: '56px', fontWeight: 900, color: 'white', fontFamily: 'var(--font-display)', lineHeight: 1 }}>
            {questionsGenerated}
          </div>
          <div className="mt-4 flex items-center gap-2 text-[var(--accent2)] font-medium">
            <span className="w-2 h-2 rounded-full bg-[var(--accent)]"></span>
            Lifetime usage
          </div>
        </div>

        <div className="cosmic-card p-10 transition-all hover:border-[rgba(16,185,129,0.4)]">
          <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '24px' }}>
            Practices Completed
          </div>
          <div style={{ fontSize: '56px', fontWeight: 900, color: 'white', fontFamily: 'var(--font-display)', lineHeight: 1 }}>
            {testsCompleted}
          </div>
          <div className="mt-4 flex items-center gap-2 text-emerald-400 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            Mock tests
          </div>
        </div>

        <div className="cosmic-card p-10 transition-all hover:border-[rgba(245,158,11,0.4)]">
          <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '24px' }}>
            Current Streak
          </div>
          <div style={{ fontSize: '56px', fontWeight: 900, color: 'white', fontFamily: 'var(--font-display)', lineHeight: 1 }}>
            {streak}
          </div>
          <div className="mt-4 flex items-center gap-2 text-amber-400 font-medium">
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            Days in a row
          </div>
        </div>
      </div>

      {/* Action Center */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div 
          className="cosmic-card p-8 flex flex-col justify-between group cursor-pointer hover:bg-[rgba(99,102,241,0.05)] transition-all"
          onClick={() => setAppMode('generator')}
        >
          <div>
            <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-[var(--accent2)] transition-colors">Start Generating</h3>
            <p className="text-slate-400">Create custom NCERT based questions with AI logic.</p>
          </div>
          <div className="mt-8 flex justify-end">
            <div className="w-12 h-12 rounded-full bg-[var(--surface2)] flex items-center justify-center text-xl group-hover:bg-[var(--accent)] group-hover:text-white transition-all">→</div>
          </div>
        </div>

        <div 
          className="cosmic-card p-8 flex flex-col justify-between group cursor-pointer hover:bg-[rgba(16,185,129,0.05)] transition-all"
          onClick={() => setAppMode('practice')}
        >
          <div>
            <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-emerald-400 transition-colors">Take a Mock Test</h3>
            <p className="text-slate-400">Challenge yourself with exam-pattern practice papers.</p>
          </div>
          <div className="mt-8 flex justify-end">
            <div className="w-12 h-12 rounded-full bg-[var(--surface2)] flex items-center justify-center text-xl group-hover:bg-emerald-500 group-hover:text-white transition-all">→</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardView;
