const SUPABASE_URL = 'https://nxiajseyrarmmnddjmoa.supabase.co';
const SUPABASE_KEY = 'sb_publishable_4l11qjmOnn0tETrS5EzbYg_4YmKbCMv';

async function checkTables() {
  const tableNames = ['products', 'product', 'items', 'item', 'inventory', 'menu', 'fried_chicken', 'categories', 'orders', 'users'];
  for (const name of tableNames) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${name}?select=*`, {
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`
      }
    });
    console.log(name, ':', res.status);
    if (res.status !== 404) {
      console.log('Found table:', name, await res.text());
    }
  }
}
checkTables();
