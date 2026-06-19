// Central API base URL – reads from Vite env var in production,
// falls back to the deployed Render backend if running on a hosted domain,
// and falls back to localhost for local development.
const getApiBase = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  if (typeof window !== 'undefined' && window.location) {
    const hostname = window.location.hostname;
    // If not running on localhost/127.0.0.1, default to the production backend URL
    if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
      return 'https://trendtrim-salon.onrender.com';
    }
  }
  return 'http://localhost:5000';
};

const API_BASE = getApiBase();

export default API_BASE;

