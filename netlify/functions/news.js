// netlify/functions/news.js
const NEWS_API_KEY = '9878bdf2ddfd43c29fc9a49ac4b92582';

const QUERIES = {
  conflict: 'Iran Israel war attack strike',
  nuclear:  'Iran nuclear program uranium',
  proxy:    'Hezbollah Houthi attack missile',
  leaders:  'Netanyahu Trump Khamenei Iran Israel statement says warns',
  markets:  'Iran Israel oil Hormuz strait market',
};

exports.handler = async function(event) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  const type  = event.queryStringParameters?.type || 'conflict';
  const query = QUERIES[type] || QUERIES.conflict;
  const page  = event.queryStringParameters?.page || 1;

  const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&sortBy=publishedAt&pageSize=10&page=${page}&language=en&apiKey=${NEWS_API_KEY}`;

  try {
    const res  = await fetch(url);
    const data = await res.json();

    if (data.status !== 'ok') {
      return { statusCode: 502, headers, body: JSON.stringify({ error: data.message }) };
    }

    const articles = (data.articles || [])
      .filter(a => a.title && a.title !== '[Removed]')
      .map(a => ({ ...a, fullDate: formatDate(new Date(a.publishedAt)), timeAgo: timeAgo(new Date(a.publishedAt)) }));

    return { statusCode: 200, headers, body: JSON.stringify({ status: 'ok', articles }) };

  } catch (err) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
  }
};

function timeAgo(d) {
  const diff = Math.floor((Date.now() - d) / 60000);
  if (diff < 1)    return 'للتو';
  if (diff < 60)   return `منذ ${diff} دقيقة`;
  if (diff < 1440) return `منذ ${Math.floor(diff / 60)} ساعة`;
  return `منذ ${Math.floor(diff / 1440)} يوم`;
}

function formatDate(d) {
  if (!d || isNaN(d)) return '';
  const days   = ['الأحد','الاثنين','الثلاثاء','الأربعاء','الخميس','الجمعة','السبت'];
  const months = ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'];
  const pad    = x => String(x).padStart(2, '0');
  return `${days[d.getDay()]} ${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()} — ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
