import React, { useState } from 'react';
import QuestionForm from './components/QuestionForm';
import QuestionCard from './components/QuestionCard';
import LoadingFact from './components/LoadingFact';
import Footer from './components/Footer';
import PracticeConfig from './components/PracticeConfig';
import PracticeTestInterface from './components/PracticeTestInterface';
import PracticeResult from './components/PracticeResult';

function App() {
  // Mode State: 'generator' | 'practice'
  const [appMode, setAppMode] = useState('generator');

  // Generator State
  const [questionData, setQuestionData] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [loadingContext, setLoadingContext] = useState({ class: null, subject: null });

  // Practice State: 'config' | 'test' | 'result'
  const [practiceState, setPracticeState] = useState('config');
  const [practiceData, setPracticeData] = useState(null);
  const [practiceResult, setPracticeResult] = useState(null);

  // --- QUESTION GENERATOR HANDLERS ---
  const generateQuestion = async (formData) => {
    setLoading(true);
    setLoadingContext({ class: formData.class, subject: formData.subject });
    setError('');
    setQuestionData(null);
    setCurrentQuestionIndex(0);

    try {
      const response = await fetch('http://localhost:3000/generate-questions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to generate question');
      }

      setQuestionData(data.data);
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
      setLoadingContext({ class: null, subject: null });
    }
  };

  // --- PRACTICE TEST HANDLERS ---
  const generatePracticePaper = async (configData) => {
    setLoading(true);
    setLoadingContext({ class: configData.class, subject: configData.subject });
    setError('');

    try {
      const response = await fetch('http://localhost:3000/generate-paper', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(configData)
      });

      const data = await response.json();

      if (!data.success) throw new Error(data.error || 'Failed to generate paper');

      setPracticeData(data.data);
      setPracticeState('test');

    } catch (err) {
      setError(err.message || 'Failed to create practice test.');
    } finally {
      setLoading(false);
      setLoadingContext({ class: null, subject: null });
    }
  };

  const submitPracticePaper = async (submissions) => {
    setLoading(true); // Re-use loading state for grading
    // No specific loading context for grading, or could imply it from previous state
    try {
      const response = await fetch('http://localhost:3000/grade-paper', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ submissions })
      });

      const data = await response.json();
      if (!data.success) throw new Error(data.error || 'Failed to grade paper');

      setPracticeResult(data.data);
      setPracticeState('result');

    } catch (err) {
      setError(err.message || 'Error submitting test.');
    } finally {
      setLoading(false);
    }
  };

  const resetPractice = () => {
    setPracticeState('config');
    setPracticeData(null);
    setPracticeResult(null);
    setError('');
  };

  return (
    <div className="relative min-h-screen overflow-hidden selection:bg-purple-500 selection:text-white flex flex-col">

      {/* Animated Background Blobs */}
      <div className="absolute top-0 left-0 w-full h-full -z-10 bg-slate-50">
        <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute top-0 -right-4 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      <div className="container mx-auto px-4 py-8 md:py-16 relative flex-grow">

        {/* Modern Header */}
        <header className="mb-12 text-center animate-fade-in relative z-10">
          <div className="inline-block mb-4 px-6 py-2 rounded-full border border-slate-200 bg-white/50 backdrop-blur-sm shadow-sm">
            <span className="bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent font-bold tracking-wide uppercase text-sm">
              ✨ Next-Gen Exam Prep
            </span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tight text-slate-900 leading-tight">
            Create. Practice. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 via-fuchsia-500 to-pink-600">
              Excel.
            </span>
          </h1>

          {/* Mode Switcher */}
          <div className="flex justify-center mb-8">
            <div className="bg-white/50 backdrop-blur-md p-1 rounded-2xl border border-slate-200 shadow-sm inline-flex">
              <button
                onClick={() => setAppMode('generator')}
                className={`px-6 py-2 rounded-xl font-bold text-sm transition-all ${appMode === 'generator' ? 'bg-white shadow text-violet-600' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Question Generator
              </button>
              <button
                onClick={() => setAppMode('practice')}
                className={`px-6 py-2 rounded-xl font-bold text-sm transition-all ${appMode === 'practice' ? 'bg-white shadow text-fuchsia-600' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Practice Test
              </button>
            </div>
          </div>
        </header>

        {/* MAIN CONTENT AREA */}
        <main className="max-w-6xl mx-auto">

          {/* ERROR DISPLAY */}
          {error && (
            <div className="max-w-2xl mx-auto mb-8 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg shadow-sm animate-fade-in flex items-start gap-3">
              <svg className="h-5 w-5 text-red-500 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <div>
                <h3 className="text-sm font-bold text-red-800">Something went wrong</h3>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          )}

          {/* LOADING STATE - SHARED */}
          {loading && (
            <div className="text-center py-20 animate-fade-in">
              <div className="relative w-24 h-24 mx-auto mb-8">
                <div className="absolute top-0 left-0 w-full h-full border-4 border-violet-100 rounded-full"></div>
                <div className="absolute top-0 left-0 w-full h-full border-4 border-violet-600 rounded-full border-t-transparent animate-spin"></div>
              </div>
              <h3 className="text-2xl font-bold text-slate-800 animate-pulse">
                {appMode === 'practice' && practiceState === 'test' ? 'Grading your answers...' : 'AI is working magic...'}
              </h3>
              <p className="text-slate-500 mt-2">
                {appMode === 'practice'
                  ? (practiceState === 'test' ? 'Evaluating concepts & key points 🧠' : 'Constructing a balanced paper 📝')
                  : 'Checking topic validity & generating questions 🤖'}
              </p>
              <div className="mt-8"><LoadingFact context={loadingContext} /></div>
            </div>
          )}

          {/* CONTENT: GENERATOR MODE */}
          {!loading && appMode === 'generator' && (
            <div className="grid lg:grid-cols-12 gap-12 items-start animate-slide-up">
              <div className="lg:col-span-5 w-full sticky top-6 z-20">
                <QuestionForm onSubmit={generateQuestion} isLoading={loading} />
              </div>
              <div className="lg:col-span-7 w-full">
                {/* Empty State */}
                {!questionData && !error && (
                  <div className="relative group p-12 rounded-[2rem] border-2 border-dashed border-slate-300 bg-white/30 backdrop-blur-sm text-center transition-all hover:border-violet-300">
                    <div className="relative z-10">
                      <div className="w-24 h-24 bg-white rounded-full shadow-lg mx-auto mb-6 flex items-center justify-center text-4xl transform group-hover:scale-110 transition-transform duration-300">🚀</div>
                      <h3 className="text-2xl font-bold text-slate-800 mb-2">Ready for Lift Off?</h3>
                      <p className="text-slate-500">Configure your parameters on the left and hit generate.</p>
                    </div>
                  </div>
                )}
                {/* Questions Display with Pagination */}
                {questionData && (
                  <div className="pb-10">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-2xl font-bold text-slate-800">Generated Questions</h2>
                      <span className="px-3 py-1 bg-violet-100 text-violet-700 rounded-full text-sm font-bold">
                        Question {currentQuestionIndex + 1} of {Array.isArray(questionData) ? questionData.length : 1}
                      </span>
                    </div>

                    {/* Single Question Card */}
                    <div className="relative min-h-[400px]">
                      {(() => {
                        const questions = Array.isArray(questionData) ? questionData : [questionData];
                        const currentQuestion = questions[currentQuestionIndex];
                        return (
                          <div className="animate-fade-in">
                            <QuestionCard
                              key={currentQuestionIndex} // Key forces re-render for animation/streaming
                              data={currentQuestion}
                              index={currentQuestionIndex + 1}
                            />
                          </div>
                        );
                      })()}
                    </div>

                    {/* Navigation Controls */}
                    {(Array.isArray(questionData) && questionData.length > 1) && (
                      <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-200">
                        <button
                          onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
                          disabled={currentQuestionIndex === 0}
                          className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
                          Previous
                        </button>

                        <div className="flex gap-2">
                          {questionData.map((_, idx) => (
                            <div
                              key={idx}
                              className={`w-2.5 h-2.5 rounded-full transition-all ${idx === currentQuestionIndex ? 'bg-violet-600 scale-125' : 'bg-slate-300'}`}
                            />
                          ))}
                        </div>

                        <button
                          onClick={() => setCurrentQuestionIndex(prev => Math.min(questionData.length - 1, prev + 1))}
                          disabled={currentQuestionIndex === questionData.length - 1}
                          className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-slate-900 text-white hover:bg-slate-800 hover:shadow-lg disabled:bg-slate-300 disabled:shadow-none"
                        >
                          Next
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* CONTENT: PRACTICE MODE */}
          {!loading && appMode === 'practice' && (
            <div className="animate-slide-up w-full max-w-4xl mx-auto">
              {practiceState === 'config' && (
                <PracticeConfig onSubmit={generatePracticePaper} isLoading={loading} />
              )}

              {practiceState === 'test' && practiceData && (
                <PracticeTestInterface
                  testData={practiceData}
                  onSubmit={submitPracticePaper}
                  onBack={resetPractice}
                />
              )}

              {practiceState === 'result' && practiceResult && (
                <PracticeResult
                  resultData={practiceResult}
                  onRetry={resetPractice}
                />
              )}
            </div>
          )}

        </main>
      </div>
      <Footer />
    </div>
  );
}

export default App;
