
import { ImageFile, AudioFile } from '../types';

async function fetchAI(endpoint: string, body: any) {
    const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    });
    if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'AI request failed');
    }
    return response.json();
}

export async function generateImage(
  productImages: ImageFile[],
  prompt: string,
  styleImages: ImageFile[] | null,
  aspectRatio: string = "1:1"
): Promise<ImageFile> {
    return fetchAI('/api/ai/generate-image', { productImages, prompt, styleImages, aspectRatio });
}

export async function editImage(
  baseImage: ImageFile,
  prompt: string,
): Promise<ImageFile> {
    return fetchAI('/api/ai/generate-image', { productImages: [baseImage], prompt });
}

export async function expandImage(
  image: ImageFile,
  prompt: string
): Promise<ImageFile> {
    return editImage(image, prompt);
}

export async function analyzeImageForPrompt(
  images: ImageFile[],
  instructions: string
): Promise<string> {
    const res = await fetchAI('/api/ai/analyze-image', { images, instructions });
    return res.text;
}

export async function analyzeStyleImage(images: ImageFile[]): Promise<string> {
    const res = await fetchAI('/api/ai/analyze-image', { images, type: 'style' });
    return res.text;
}

export async function analyzeLogoForBranding(images: ImageFile[]): Promise<{ colors: string[] }> {
    const res = await fetchAI('/api/ai/analyze-image', { images, type: 'logo' });
    return JSON.parse(res.text);
}

export async function generatePromptFromText(instructions: string): Promise<string> {
    const res = await fetchAI('/api/ai/text-action', { text: instructions, action: 'expand' });
    return res.text;
}

export async function translateText(text: string): Promise<string> {
    const res = await fetchAI('/api/ai/text-action', { text, action: 'translate' });
    return res.text;
}

export async function generateSpeech(text: string, styleInstructions: string, voiceName: string): Promise<AudioFile> {
    return fetchAI('/api/ai/generate-speech', { text, styleInstructions, voiceName });
}

export async function generateCampaignPlan(
    productImages: ImageFile[],
    userPrompt: string,
    targetMarket: string = "Global",
    dialect: string = "English"
): Promise<any[]> {
    const res = await fetchAI('/api/ai/complex-generation', { 
        type: 'campaign', 
        data: { images: productImages, userPrompt, targetMarket, dialect } 
    });
    return JSON.parse(res.result);
}

export async function analyzeProductForCampaign(productImages: ImageFile[]): Promise<string> {
    const res = await fetchAI('/api/ai/analyze-image', { images: productImages, instructions: 'Analyze product for campaign' });
    return res.text;
}

export async function generateStoryboardPlan(
    subjectImages: ImageFile[],
    customInstructions: string
): Promise<any[]> {
    const res = await fetchAI('/api/ai/complex-generation', { 
        type: 'storyboard', 
        data: { images: subjectImages, customInstructions } 
    });
    return JSON.parse(res.result);
}

export async function generateMarketingAnalysis(
    brandData: { type: 'new' | 'existing'; name?: string; specialty?: string; brief?: string; link?: string },
    language: 'ar' | 'en'
): Promise<string> {
    const res = await fetchAI('/api/ai/complex-generation', { 
        type: 'marketing-analysis', 
        data: { brandData, language } 
    });
    return res.result;
}

export async function generateAdCreative(
    productImages: ImageFile[],
    platform: string,
    targetAudience: string,
    competitorLinks: string[] = []
): Promise<any[]> {
    const res = await fetchAI('/api/ai/complex-generation', { 
        type: 'ad-creative', 
        data: { images: productImages, platform, targetAudience, competitorLinks } 
    });
    return JSON.parse(res.result);
}

export async function generateAdTargetingSuggestions(
    platform: string,
    productImages: ImageFile[]
): Promise<string[]> {
    const res = await fetchAI('/api/ai/complex-generation', { 
        type: 'targeting', 
        data: { images: productImages, platform } 
    });
    return JSON.parse(res.result);
}

export async function askMarketingAssistant(history: { role: string, text: string }[]): Promise<string> {
    const res = await fetchAI('/api/ai/chat', { history });
    return res.text;
}

export async function suggestScenarios(analysis: string): Promise<string[]> {
    const res = await fetchAI('/api/ai/complex-generation', { type: 'scenarios', data: { analysis } });
    return JSON.parse(res.result);
}

export async function generateSocialDrafts(
    brandData: any,
    images: ImageFile[],
    language: 'ar' | 'en'
): Promise<any[]> {
    const res = await fetchAI('/api/ai/complex-generation', { 
        type: 'social-drafts', 
        data: { brandData, images, language } 
    });
    return JSON.parse(res.result);
}

export async function suggestShotTypes(images: ImageFile[]): Promise<string[]> {
    const res = await fetchAI('/api/ai/analyze-image', { images, instructions: 'Suggest shot types' });
    return JSON.parse(res.text);
}

export async function generateProductRotation(
    productImage: ImageFile,
    prompt: string
): Promise<ImageFile[]> {
    // This one might need multiple calls or a specialized endpoint. For now, keep it simple by calling generic generation or moving loop to server.
    // Moving the loop to the server is better for performance and security.
    const res = await fetchAI('/api/ai/complex-generation', { type: 'rotation', data: { image: productImage, prompt } });
    return JSON.parse(res.result);
}
