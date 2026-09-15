// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: ['@nuxt/eslint', '@nuxt/ui', '@pinia/nuxt', '@vite-pwa/nuxt'],

  devtools: {
    enabled: true
  },

  css: ['~/assets/css/main.css'],

  routeRules: {
    '/': { prerender: true }
  },

  runtimeConfig: {
    public: {
      apiBase: 'http://localhost:8000'
    }
  },

  // pwa: {
  //   registerType: 'autoUpdate',
  //   manifest: false,
  //   workbox: {
  //     globPatterns: ['**/*.{js,css,html,png,svg,ico,woff,woff2}'],
  //     navigateFallback: '/',
  //     runtimeCaching: [
  //       {
  //         urlPattern: /^http:\/\/localhost:8000\/api\/v1\/.*/i,
  //         handler: 'NetworkFirst',
  //         options: {
  //           cacheName: 'api-cache',
  //           expiration: {
  //             maxEntries: 50,
  //             maxAgeSeconds: 300
  //           }
  //         }
  //       },
  //       {
  //         urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
  //         handler: 'CacheFirst',
  //         options: {
  //           cacheName: 'google-fonts-stylesheets',
  //           expiration: {
  //             maxEntries: 10,
  //             maxAgeSeconds: 60 * 60 * 24 * 365
  //           }
  //         }
  //       },
  //       {
  //         urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
  //         handler: 'CacheFirst',
  //         options: {
  //           cacheName: 'google-fonts-webfonts',
  //           expiration: {
  //             maxEntries: 30,
  //             maxAgeSeconds: 60 * 60 * 24 * 365
  //           }
  //         }
  //       }
  //     ]
  //   },
  //   client: {
  //     installPrompt: true,
  //     periodicSyncForUpdates: 3600
  //   },
  //   devOptions: {
  //     enabled: false
  //   }
  // },

  pwa: {
    registerType: 'autoUpdate',
    manifest: {
      name: 'commerce',
      short_name: 'commerce',
      description: 'Gestiona tu tienda online',
      lang: 'es',
      display: 'standalone',
      start_url: '/',
      theme_color: '#2563eb',
      background_color: '#0b1220',
      icons: [
        { src: '/pwa-192x192.png', sizes: '192x192', type: 'image/png' },
        { src: '/pwa-512x512.png', sizes: '512x512', type: 'image/png' },
        { src: '/pwa-maskable-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
      ]
    },
    injectManifest: {
      globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
      globIgnores: [
        '**/404*',
        '**/200*'
      ]
    },
    devOptions: {
      enabled: true
    }
  },

  app: {
    head: {
      htmlAttrs: { lang: 'es' },
      meta: [
        { name: 'theme-color', content: '#6366f1' },
        { name: 'robots', content: 'index, follow' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'format-detection', content: 'telephone=no' }
      ],
      link: [
        { rel: 'icon', href: '/favicon.ico' },
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap' }
      ]
    }
  },

  compatibilityDate: '2026-06-30',

  eslint: {
    config: {
      stylistic: {
        commaDangle: 'never',
        braceStyle: '1tbs'
      }
    }
  }
})
