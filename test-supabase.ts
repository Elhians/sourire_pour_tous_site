import { createClient } from '@supabase/supabase-js';
import { environment.ts } from './src/environment.tss/environment.ts';

const supabase = createClient(environment.ts.supabaseUrl, environment.ts.supabaseKey);

async function run() {
  const { data, error } = await supabase.from('articles').select('*');
  console.log(JSON.stringify(data, null, 2));
  console.log('Error:', error);
}
run();
