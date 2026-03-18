/**
 * src/config.js
 * Central API config — change BASE_URL here when deploying.
 */

export const API_BASE = import.meta.env.VITE_API_URL || 'http://192.168.1.5:3000';
export const ENDPOINTS = {
  // Existing
  generateQuestions: `${API_BASE}/api/v1/questions/generate`,
  generatePaper:     `${API_BASE}/api/v1/paper/generate`,
  gradePaper:        `${API_BASE}/api/v1/grade`,
  health:            `${API_BASE}/api/health`,
  syllabus:          `${API_BASE}/api/v1/syllabus`,

  // New
  uploadPdf:          `${API_BASE}/api/v1/upload/pdf`,
  similarQuestions:   `${API_BASE}/api/v1/questions/similar`,
  similarFromImage:   `${API_BASE}/api/v1/questions/similar-from-image`,
};