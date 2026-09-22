import { defineConfig } from 'vitepress'
import { GitChangelog, GitChangelogMarkdownSection } from '@nolebase/vitepress-plugin-git-changelog/vite'
import { withSidebar } from 'vitepress-sidebar'

const base = process.env.DOCS_BASE || '/'

const vitePressConfig = {
  title: 'Digicomp Technologies',
  description: 'Development board documentation',
  lang: 'en-US',
  base,
  srcExclude: ['**/README.md'],
  lastUpdated: true,
  vite: {
    plugins: [
      GitChangelog({
        repoURL: 'https://github.com/digicomp-app/docs'
      }),
      GitChangelogMarkdownSection()
    ]
  },
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
    editLink: {
      pattern: 'https://github.com/digicomp-app/docs/edit/main/:path',
      text: 'Edit this page on GitHub'
    },
    lastUpdated: {
      text: 'Last updated'
    },
    footer: {
      message: 'Made in India',
      copyright: 'Copyright © Digicomp Technologies'
    },
    search: { provider: 'local' }
  }
}

export default defineConfig(withSidebar(vitePressConfig, {
  documentRootPath: '.',
  collapsed: false,
  includeRootIndexFile: false,
  useTitleFromFileHeading: true,
  useTitleFromFrontmatter: true,
  useFolderTitleFromIndexFile: true,
  useFolderLinkFromIndexFile: true,
  sortMenusByName: true
}))
