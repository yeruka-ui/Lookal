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
      // Task A: AI Description
      (async () => {
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
        const imagePart = {
          inlineData: {
            data: base64Image,
            mimeType: mimeType,
          },
        };
        const prompt = "You are an e-commerce copywriter. Write a persuasive, 2-sentence description of this product based on its visual features.";
        const result = await model.generateContent([prompt, imagePart]);
        const response = await result.response;
        return response.text();
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
        // If generated, we upload it. If fallback, we can return the original URL directly 
        // OR upload the original buffer again with a new name. 
        // To keep logic simple and consistent with the original snippet:
        
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
      ai_description: aiResult,
      image_url: storageResult.url,
      is_generated_image: storageResult.is_generated,
      fallback_reason: storageResult.fallback_reason
    });

  } catch (error: any) {
    console.error('Error processing request:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
