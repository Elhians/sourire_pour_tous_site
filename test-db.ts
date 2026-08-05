import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { readFileSync } from 'fs';

// Read from environment.ts since dotenv might not have the variables
const envFile = readFileSync('src/environments/environment.ts', 'utf8');
const urlMatch = envFile.match(/supabaseUrl:\s*'([^']+)'/);
const keyMatch = envFile.match(/supabaseKey:\s*'([^']+)'/);

if (urlMatch && keyMatch) {
  const supabase = createClient(urlMatch[1], keyMatch[1]);
  supabase.from('site_settings').select('*').then(console.log).catch(console.error);
} else {
  console.log("Could not parse env file");
}
