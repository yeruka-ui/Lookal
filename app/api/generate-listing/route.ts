import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase Client
// Initialize Supabase Client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

// Initialize Gemini Client
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);

const AVAILABLE_TAGS = [
  { "tag": "Streetwear", "color": "zinc-600" },
  { "tag": "Vintage", "color": "amber-500" },
  { "tag": "Kicks", "color": "red-500" },
  { "tag": "Luxury", "color": "stone-500" },
  { "tag": "Accessories", "color": "fuchsia-500" },
  { "tag": "Activewear", "color": "lime-500" },
  { "tag": "Upcycled", "color": "teal-500" },
  { "tag": "Apple", "color": "slate-500" },
  { "tag": "Gaming", "color": "violet-500" },
  { "tag": "Audio", "color": "indigo-500" },
  { "tag": "Photography", "color": "neutral-500" },
  { "tag": "Computers", "color": "sky-500" },
  { "tag": "Tools", "color": "orange-500" },
  { "tag": "Decor", "color": "rose-400" },
  { "tag": "Plants", "color": "emerald-500" },
  { "tag": "Furniture", "color": "yellow-500" },
  { "tag": "Kitchen", "color": "cyan-500" },
  { "tag": "Books", "color": "blue-500" },
  { "tag": "Vinyl & Music", "color": "purple-500" },
  { "tag": "Pet Gear", "color": "pink-400" },
  { "tag": "Skills", "color": "blue-400" },
  { "tag": "Services", "color": "sky-400" },
  { "tag": "Collectibles", "color": "purple-400" },
  { "tag": "Sports", "color": "orange-400" },
  { "tag": "Camping", "color": "green-500" },
  { "tag": "Vehicles", "color": "gray-500" },
  { "tag": "Beauty", "color": "pink-500" },
  { "tag": "Kids", "color": "yellow-400" },
  { "tag": "Freecycle", "color": "teal-400" },
  { "tag": "ISO", "color": "red-400" },
  { "tag": "Handmade", "color": "orange-400" },
  { "tag": "Art Supplies", "color": "fuchsia-400" },
  { "tag": "Instruments", "color": "amber-600" },
  { "tag": "Tabletop Games", "color": "red-400" },
  { "tag": "Smart Home", "color": "cyan-400" },
  { "tag": "Wearables", "color": "lime-400" },
  { "tag": "Tickets", "color": "green-400" },
  { "tag": "Office", "color": "slate-400" },
  { "tag": "Textbooks", "color": "stone-400" },
  { "tag": "Comics", "color": "violet-400" },
  { "tag": "Anime", "color": "pink-300" },
  { "tag": "Fitness Gear", "color": "zinc-500" },
  { "tag": "Travel", "color": "sky-300" },
  { "tag": "Materials", "color": "neutral-400" },
  { "tag": "Maternity", "color": "rose-300" },
  { "tag": "Party Supplies", "color": "purple-300" },
  { "tag": "Gift Cards", "color": "emerald-400" },
  { "tag": "Watches", "color": "gray-600" },
  { "tag": "Grooming", "color": "teal-300" },
  { "tag": "Rentals", "color": "indigo-400" }
];

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('data') as File;
    const title = formData.get('title') as string;
    // Price is no longer used in bartering mode

    // 1. Validation
    if (!file) {
      return NextResponse.json({ error: 'No image file provided' }, { status: 400 });
    }
    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64Image = buffer.toString('base64');
    const mimeType = file.type;

    // 2. Parallel Execution Setup
    
    // Task A: Gemini Analysis (Description & Tags only)
    const geminiPromise = (async () => {
        const model = genAI.getGenerativeModel({ 
            model: 'gemini-2.0-flash',
            generationConfig: { responseMimeType: "application/json" }
        });
        const imagePart = {
          inlineData: {
            data: base64Image,
            mimeType: mimeType,
          },
        };
        
        const tagsList = AVAILABLE_TAGS.map(t => t.tag).join(", ");
        const prompt = `
            You are an e-commerce expert. 
            1. Write a persuasive, 2-sentence description of this product based on its visual features.
            2. Select the best 1-3 tags from this list: ${tagsList}.
            
            Return a JSON object with this structure:
            {
                "description": "string",
                "tags": ["tag1", "tag2"]
            }
        `;
        
        const result = await model.generateContent([prompt, imagePart]);
        const response = await result.response;
        const jsonResponse = JSON.parse(response.text());
        
        // Map tags back to their full objects with colors
        const enrichedTags = jsonResponse.tags.map((tagName: string) => {
            const found = AVAILABLE_TAGS.find(t => t.tag.toLowerCase() === tagName.toLowerCase());
            return found || { tag: tagName, color: "gray" };
        });

        return {
            description: jsonResponse.description,
            tags: enrichedTags
        };
    })();

    // Task B: Upload Original Image
    const uploadOriginalPromise = (async () => {
          const timestamp = Date.now();
          const sanitizedTitle = title.replace(/[^a-zA-Z0-9-_]/g, '');
          const originalFilename = `original-${sanitizedTitle}-${timestamp}.png`;

          const { error: uploadError } = await supabase.storage
            .from('productImage')
            .upload(originalFilename, buffer, {
              contentType: mimeType,
              upsert: true
            });

          if (uploadError) throw uploadError;

          const { data: publicUrlData } = supabase.storage
            .from('productImage')
            .getPublicUrl(originalFilename);

          return publicUrlData.publicUrl;
    })();

    // 3. Wait for Analysis and Upload
    const [aiResult, originalImageUrl] = await Promise.all([geminiPromise, uploadOriginalPromise]);

    // 4. Generate Enhanced Image (CSS Only)
    // User Request: "ditch the image generation and opt for css image improvement"
    // We strictly return the original image. The visual enhancement is handled by CSS in the frontend.
    const storageResult = { 
        url: originalImageUrl, 
        is_generated: false, 
        fallback_reason: "CSS Enhancement Mode" 
    };

    // 5. Response
    return NextResponse.json({
      title,
      ai_description: aiResult.description,
      tags: aiResult.tags,
      image_url: storageResult.url,
      is_generated_image: storageResult.is_generated,
      fallback_reason: storageResult.fallback_reason
    });

  } catch (error: any) {
    console.error('Error processing request:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
