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
  { "tag": "Streetwear", "color": "zinc" },
  { "tag": "Vintage", "color": "amber" },
  { "tag": "Kicks", "color": "red" },
  { "tag": "Luxury", "color": "stone" },
  { "tag": "Accessories", "color": "fuchsia" },
  { "tag": "Activewear", "color": "lime" },
  { "tag": "Upcycled", "color": "teal" },
  { "tag": "Apple", "color": "slate" },
  { "tag": "Gaming", "color": "violet" },
  { "tag": "Audio", "color": "indigo" },
  { "tag": "Photography", "color": "neutral" },
  { "tag": "Computers", "color": "sky" },
  { "tag": "Tools", "color": "orange" },
  { "tag": "Decor", "color": "rose" },
  { "tag": "Plants", "color": "emerald" },
  { "tag": "Furniture", "color": "yellow" },
  { "tag": "Kitchen", "color": "cyan" },
  { "tag": "Books", "color": "blue" },
  { "tag": "Vinyl & Music", "color": "purple" },
  { "tag": "Pet Gear", "color": "pink" },
  { "tag": "Skills", "color": "blue" },
  { "tag": "Services", "color": "sky" },
  { "tag": "Collectibles", "color": "purple" },
  { "tag": "Sports", "color": "orange" },
  { "tag": "Camping", "color": "green" },
  { "tag": "Vehicles", "color": "gray" },
  { "tag": "Beauty", "color": "pink" },
  { "tag": "Kids", "color": "yellow" },
  { "tag": "Freecycle", "color": "teal" },
  { "tag": "ISO", "color": "red" }
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

    // 2. Parallel Execution
    const [aiResult, storageResult] = await Promise.all([
      // Task A: AI Description & Tags
      (async () => {
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
      })(),

      // Task B: Image Generation & Upload
      (async () => {
        let imageBuffer = buffer;
        let finalMimeType = mimeType;
        let isGenerated = false;
        let fallbackReason = null;
        let originalImageUrl = null;

        try {
          // 0. Upload Original Image First
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

          originalImageUrl = publicUrlData.publicUrl;

          // Step 1: Analyze original image
          const visionModel = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
          const analysisPrompt = "Describe the visual appearance of this product in extreme detail. Focus on exact shape, colors, materials. Do not describe the background.";

          const visionImagePart = {
            inlineData: {
              data: base64Image,
              mimeType: mimeType,
            },
          };

          const analysisResult = await visionModel.generateContent([analysisPrompt, visionImagePart]);
          const productDescription = (await analysisResult.response).text();

          console.log("Product Analysis:", productDescription);

          // Step 2: Generate new image using Pollinations.ai (Image-to-Image)
          const imagePrompt = `Cinematic product photography of ${title}. ${productDescription}. Dramatic studio lighting, rim lighting, 8k, photorealistic. KEEP ORIGINAL GEOMETRY.`;
          
          console.log("Generating image with prompt:", imagePrompt);

          const encodedPrompt = encodeURIComponent(imagePrompt);
          const encodedImage = encodeURIComponent(originalImageUrl);
          const pollinationsUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1024&height=1024&model=flux&nologo=true&image=${encodedImage}`;

          const response = await fetch(pollinationsUrl);

          if (!response.ok) {
            throw new Error(`Pollinations API failed with status: ${response.status}`);
          }

          const generatedArrayBuffer = await response.arrayBuffer();
          imageBuffer = Buffer.from(generatedArrayBuffer);
          finalMimeType = 'image/jpeg';
          isGenerated = true;

        } catch (genError: any) {
          console.error("Image generation failed, falling back to original image:", genError.message);
          // Fallback to original buffer and mimeType (already set)
          fallbackReason = genError.message;
        }

        // Upload Final Image (Generated or Original fallback)
        if (isGenerated) {
             const timestamp = Date.now();
             const sanitizedTitle = title.replace(/[^a-zA-Z0-9-_]/g, '');
             const filename = `${sanitizedTitle}-${timestamp}.jpg`; // Pollinations returns JPEGs usually

             const { error } = await supabase.storage
               .from('productImage')
               .upload(filename, imageBuffer, {
                 contentType: finalMimeType,
                 upsert: true
               });

             if (error) throw error;

             const { data: publicUrlData } = supabase.storage
               .from('productImage')
               .getPublicUrl(filename);
             
             return { url: publicUrlData.publicUrl, is_generated: true, fallback_reason: null };
        } else {
             // Return original URL
             return { url: originalImageUrl, is_generated: false, fallback_reason: fallbackReason };
        }
      })(),
    ]);

    // 3. Response
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
