// https://vite.dev/config/
export default {
  server: {
    proxy: {
      "/api": "http://localhost:5000",
    },
  },
};
