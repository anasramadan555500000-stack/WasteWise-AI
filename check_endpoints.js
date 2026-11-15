const SUPABASE_URL = 'https://nxiajseyrarmmnddjmoa.supabase.co';
const SUPABASE_KEY = 'sb_publishable_4l11qjmOnn0tETrS5EzbYg_4YmKbCMv';

async function checkEndpoints() {
  const endpoints = [
    '/rest/v1/',
    '/rest/v1/rpc',
    '/auth/v1/health',
    '/pg/query'
  ];
  for (const ep of endpoints) {
    try {
      const res = await fetch(`${SUPABASE_URL}${ep}`, {
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`
        }
      });
      console.log(ep, '-> Status:', res.status);
      const text = await res.text();
      console.log(ep, '-> Body:', text.slice(0, 100));
    } catch (e) {
      console.log(ep, '-> Error:', e.message);
    }
  }
}
checkEndpoints();
