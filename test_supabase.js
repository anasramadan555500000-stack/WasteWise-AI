const SUPABASE_URL = 'https://nxiajseyrarmmnddjmoa.supabase.co';
const SUPABASE_KEY = 'sb_publishable_4l11qjmOnn0tETrS5EzbYg_4YmKbCMv';

async function test() {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/products?select=*`, {
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`
      }
    });
    console.log('Status:', res.status, res.statusText);
    const data = await res.text();
    console.log('Body:', data);
  } catch (err) {
    console.error('Fetch error:', err);
  }
}
test();
