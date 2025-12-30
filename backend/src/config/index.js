// src/config/index.js — small wrapper and env defaults
module.exports = {
  port: process.env.PORT || 8080,
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
};
