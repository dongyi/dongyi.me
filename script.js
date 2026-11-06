const copy = {
  zh: {
    greeting: '你好，我是 Dongyi。', intro: '写代码，也跑步。\n这里是我做的几个小产品。',
    portraitAlt: '复古胶片风格的马拉松跑者',
    products: '一些产品',
    contact: '联系我',
    cadenceCategory: '跑步', cadenceDescription: '一个帮助稳定步频的跑步节拍器。',
    lsCategory: '学习', lsDescription: '用播客逐句精听、跟读，练习英语。',
    raceCategory: '探索', raceDescription: '发现跑步赛事，找找下一场跑哪里。',
    newTab: '（在新标签页打开）', title: 'Dongyi',
    description: 'Dongyi 的个人网站。探索我的产品：Cadence 跑步节拍器、100ls 英语听力练习和 RaceWhere 赛事发现。',
    ogDescription: 'Cadence · 100ls · RaceWhere。'
  },
  en: {
    greeting: 'Hi, I’m Dongyi.', intro: 'I write code and go for runs.\nHere are a few things I’ve made.',
    portraitAlt: 'Vintage film-style artwork of a marathon runner',
    products: 'A few projects',
    contact: 'Contact me',
    cadenceCategory: 'Running', cadenceDescription: 'A running metronome for a steadier cadence.',
    lsCategory: 'Learning', lsDescription: 'Practice English with podcasts, one sentence at a time.',
    raceCategory: 'Discovery', raceDescription: 'Discover running events and find your next race.',
    newTab: ' (opens in a new tab)', title: 'Dongyi',
    description: 'Products by Dongyi: Cadence, a running metronome; 100ls, English listening practice; and RaceWhere, running event discovery.',
    ogDescription: 'Products by Dongyi: Cadence · 100ls · RaceWhere.'
  }
};
function setLanguage(language) {
  const selected = copy[language] ? language : 'zh';
  const text = copy[selected];
  document.documentElement.lang = selected === 'zh' ? 'zh-CN' : 'en';
  document.querySelectorAll('[data-i18n]').forEach(element => {
    const key = element.dataset.i18n;
    element.replaceChildren();
    text[key].split('\n').forEach((line, index) => {
      if (index) element.append(document.createElement('br'));
      element.append(document.createTextNode(line));
    });
  });
  document.querySelectorAll('[data-language]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.language === selected)));
  document.querySelectorAll('[data-i18n-alt]').forEach(element => { element.alt = text[element.dataset.i18nAlt]; });
  document.title = text.title;
  document.querySelector('meta[name="description"]').content = text.description;
  document.querySelector('meta[property="og:title"]').content = text.title;
  document.querySelector('meta[property="og:description"]').content = text.ogDescription;
  document.querySelector('.wordmark').setAttribute('aria-label', selected === 'zh' ? 'Dongyi 首页' : 'Dongyi home');
  try { localStorage.setItem('dongyi-language', selected); } catch { /* Storage may be disabled. */ }
}
document.querySelectorAll('[data-language]').forEach(button => button.addEventListener('click', () => setLanguage(button.dataset.language)));
let savedLanguage;
try { savedLanguage = localStorage.getItem('dongyi-language'); } catch { /* Use the default language. */ }
setLanguage(savedLanguage || 'zh');
document.getElementById('year').textContent = String(new Date().getFullYear());
