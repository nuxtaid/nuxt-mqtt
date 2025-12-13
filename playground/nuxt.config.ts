export default defineNuxtConfig({
  modules: ['../src/module'],
  devtools: { enabled: true },
  mqtt: {
    url: 'ws://localhost:9001',
  },
})
