import type { SiteConfig, BadgeOptions } from './types';

export const site: SiteConfig = {
  /**
   *  TITLES NAMES SECTION
   */
  title: 'Yw4rf',
  titleDefault: 'Yw4rf',
  siteName: 'Yw4rf',
  author: 'トビアス・F',
  
  /**
   * SEO  
   */
  description: 'Cybersecurity Enthusiast focused on SOC, DFIR, Hands-on Penetration Testing, and active CTF Player.',
  url: 'https://yw4rf.netlify.app',
  keywords: 'Stalux, 博客主题, 内容创作, Astro主题, 静态网站生成器, SEO优化, 自定义博客, 响应式设计, 评论系统, 前端开发, Astro',
  lang: 'en-US',
  locale: 'en-US',
  canonical: 'https://yw4rf.netlify.app',

  /**
   *  
   */
  favicon: '',
  avatarPath: '',
  
  /**
   * <head> 
   */
  head: `<meta name="Yw4rf" content="Yw4rf">
        <script>console.log("Yw4rf")</script>`,

  /**
   * NAVBAR SECTION NAV
   */
  nav: [
    { title: 'Home', path: '/', icon: 'home' },
    { title: 'Blog', path: '/archives/', icon: 'archive' },
    { title: 'Categories', path: '/categories/', icon: 'folder' },
    { title: 'Tags', path: '/tags/', icon: 'tag' },
    { title: 'Projects', path: '/projects/', icon: 'link' },
    
  ],

  /**
   * TEXT TYPING 
   */
  textyping: [
    'Cybersecurity Enthusiast',
    'SOC, DFIR, Threat Hunting',
    'Computer Networks student'
  ],

  /**
   * WAILINE COMMENTS SECTION
   */
  comment: {
    waline: {
      serverURL: 'https://RHZbJvipWf8nQyIXcj8uH6tN-MdYXbMMI.api.lncldglobal.com', // 你的Waline服务器地址 //我加白名单了,别让我在日志里逮到你用(╯▔皿▔)╯
      lang: 'en-US', // 语言设置
      emoji: ['https://unpkg.com/@waline/emojis@1.1.0/weibo'], // 表情包设置
      requiredFields: [], // 必填项
      reaction: false, // 文章反应
      meta: ['nick', 'mail', 'link'], // 评论者的元数据
      wordLimit: 200, // 字数限制
      pageSize: 10 // 评论分页大小
    }
  },

  /**
   * SOCIAL LINKS SECTION CONTACT
   */
  medialinks: [
    { title: 'Github', url: 'https://github.com/Yw4rf', icon: 'github' },
    { title: 'Twitter', url: 'https://x.com/Yw4rf', icon: 'x-twitter' },
    { title: 'Telegram', url: 'https://t.me/Yw4rf', icon: 'telegram' },
    { title: 'Gmail', url: 'mailto:yw4rf@protonmail.com', icon: 'gmail' },
  ],

  /**
   * PROYECTS SECTION
   */
  friendlinks_title: 'Projects',
  friendlinks_description: 'Explore a few of my projects.',
  /**  friendlinks: [
    {
      title: 'Astro',
      url: 'https://astro.build/',
      avatar: 'https://astro.build/favicon.svg',
      description: 'The web framework for content-driven websites'
    },
  
  ],
  */

  /**
   * FOOTER SECTION
   *  
   */
  footer: {
    //  
    buildtime: '2025-05-01T10:00:00', 

    // COPYRIGHT CC
    copyright: {
      enabled: true, 
      startYear: 2025, 
      customText: '' 
    },
  }
}
