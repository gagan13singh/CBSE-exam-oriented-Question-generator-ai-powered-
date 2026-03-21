/**
 * src/config.js
 * FIX: removed dead `|| 'http://192.168.1.5:3000'` — JS short-circuits so
 * the second fallback was unreachable. Now correctly falls back to localhost.
 */
export const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const ENDPOINTS = {
  generateQuestions: `${API_BASE}/api/v1/questions/generate`,
  generatePaper:     `${API_BASE}/api/v1/paper/generate`,
  gradePaper:        `${API_BASE}/api/v1/grade`,
  health:            `${API_BASE}/api/health`,
  syllabus:          `${API_BASE}/api/v1/syllabus`,
  askDoubt:          `${API_BASE}/api/v1/doubt`,
  uploadPdf:         `${API_BASE}/api/v1/upload/pdf`,
  similarQuestions:  `${API_BASE}/api/v1/questions/similar`,
  similarFromImage:  `${API_BASE}/api/v1/questions/similar-from-image`,
};