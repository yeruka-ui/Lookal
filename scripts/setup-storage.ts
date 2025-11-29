import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Service role key required for bucket creation

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase env vars');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupStorage() {
  console.log('Checking storage buckets...');
  const { data: buckets, error } = await supabase.storage.listBuckets();

  if (error) {
    console.error('Error listing buckets:', error);
    return;
  }

  const bucketName = 'productImage';
  const bucketExists = buckets.find(b => b.name === bucketName);

  if (bucketExists) {
    console.log(`Bucket '${bucketName}' already exists.`);
  } else {
    console.log(`Bucket '${bucketName}' does not exist. Attempting to create...`);
    // Note: Creating buckets usually requires service role key or admin rights. 
    // If this fails, the user might need to do it manually or provide a service role key.
    const { data, error: createError } = await supabase.storage.createBucket(bucketName, {
      public: true,
      fileSizeLimit: 10485760, // 10MB
    });

    if (createError) {
      console.error('Error creating bucket:', createError);
      console.log('TIP: You might need to create the bucket manually in the Supabase dashboard if RLS prevents this.');
    } else {
      console.log(`Bucket '${bucketName}' created successfully.`);
    }
  }
}

setupStorage();
