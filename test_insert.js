const fs = require('fs');
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY);

async function test() {
  const { data, error } = await supabase.from('products').insert([{
    code: 'TEST-999',
    name: 'Test Product',
    slug: 'test-product-test-999',
    brand: 'general',
    designer: null,
    ambiente: 'general',
    subcategoria: 'general',
    is_active: true
  }]).select();
  console.log("Error:", error);
  console.log("Data:", data);
  if (!error && data) {
    await supabase.from('products').delete().eq('id', data[0].id);
  }
}
test();
