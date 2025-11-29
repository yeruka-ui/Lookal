import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTable() {
  console.log('Checking product_embeddings table...');
  const { error } = await supabase.from('product_embeddings').select('count', { count: 'exact', head: true });

  if (error) {
    console.error('Error accessing table:', error.message);
    if (error.code === '42P01') { // undefined_table
        console.log('Table does NOT exist.');
    }
  } else {
    console.log('Table exists and is accessible.');
  }
}

checkTable();
