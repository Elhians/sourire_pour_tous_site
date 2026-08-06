const fs = require('fs');
require('dotenv').config({ path: '.env' }); // try loading .env if exists

const targetPath = './src/environments/environment.ts';
const isProd = process.env.NODE_ENV === 'production';

// Fail if variables are not provided
if (!process.env.VITE_SUPABASE_URL || !process.env.VITE_SUPABASE_ANON_KEY) {
  console.warn("⚠️ Warning: Missing Supabase environment variables. Using placeholder keys.");
}

const envConfigFile = `export const environment = {
  production: ${isProd},
  supabaseUrl: '${process.env.VITE_SUPABASE_URL || 'YOUR_SUPABASE_URL'}',
  supabaseKey: '${process.env.VITE_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY'}'
};
`;

fs.writeFileSync(targetPath, envConfigFile);
console.log('✅ Environment file generated dynamically');
