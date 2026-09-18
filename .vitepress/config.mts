import { defineConfig } from 'vitepress'

const base = process.env.DOCS_BASE || '/'

export default defineConfig({
  title: 'Digicomp Technologies',
  description: 'Development board documentation',
  lang: 'en-US',
  base,
  srcExclude: ['**/README.md'],
  appearance: {
    // @ts-expect-error not supported
    initialValue: 'light',
  },
  themeConfig: {
    logo: '/digicomp.svg',
    siteTitle: false,
    nav: [ {
      text: '🛒 Store',
      link: 'https://digicomp.app'
    }, {
      text: 'Documentation',
      link: '/boards/'
    }],
    sidebar: {
      '/boards/esp32-s3/': [
        {
          text: 'ESP32-S3',
          items: [
            { text: 'Overview', link: '/boards/esp32-s3/' },
            { text: 'Touch-controlled RGB LED strip', link: '/boards/esp32-s3/neopixel' }
          ]
        }
      ],
      '/boards/': [
        { text: 'Development boards', items: [{ text: 'All boards', link: '/boards/' }] }
      ]
    },
    footer: {
      message: 'Made in India',
      copyright: 'Copyright © Digicomp Technologies'
    },
    search: { provider: 'local' }
  }
})
