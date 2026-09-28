// config.js — shared across all pages
// A relative path works both locally (Express serves API + frontend on the
// same port) and on Vercel (same domain, /api/* routes to the serverless
// function) — no URL to change between environments.
const API_BASE = '/api';
