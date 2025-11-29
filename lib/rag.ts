import { GoogleGenerativeAI } from '@google/generative-ai';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase Client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Initialize Gemini Client
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);

export async function generateEmbedding(text: string): Promise<number[]> {
  const model = genAI.getGenerativeModel({ model: 'text-embedding-004' });
  const result = await model.embedContent(text);
  const embedding = result.embedding;
  return embedding.values;
}

export async function storeProductEmbedding(productId: string, content: string) {
  const embedding = await generateEmbedding(content);

  const { error } = await supabase
    .from('product_embeddings')
    .insert({
      product_id: productId,
      content: content,
      embedding: embedding,
    });

  if (error) {
    console.error('Error storing embedding:', error);
    throw error;
  }
}

export async function searchProducts(query: string, matchThreshold = 0.5, matchCount = 5) {
  const queryEmbedding = await generateEmbedding(query);

  const { data, error } = await supabase.rpc('match_products', {
    query_embedding: queryEmbedding,
    match_threshold: matchThreshold,
    match_count: matchCount,
  });

  if (error) {
    console.error('Error searching products:', error);
    throw error;
  }

  return data;
}
