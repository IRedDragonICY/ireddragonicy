import { NextRequest, NextResponse } from 'next/server';
import { getSystemPrompt } from '@/lib/context';

export async function GET() {
  return NextResponse.json({ status: 'online', message: 'Neural Interface Active. Please use POST to interact.' });
}

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'Server configuration error: Missing API Key' }, { status: 500 });
    }

    const { messages, pathname } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Invalid messages format' }, { status: 400 });
    }

    const systemPrompt = getSystemPrompt(pathname || '/');
    
    // Prepend system prompt
    const finalMessages = [
      { role: 'system', content: systemPrompt },
      ...messages
    ];

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL || 'https://ireddragonicy.vercel.app',
        "X-Title": "IRedDragonICY Portfolio",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "openai/gpt-oss-20b:free", // Using consistent free model
        messages: finalMessages
      })
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("OpenRouter API Error:", errorData);
        throw new Error(errorData.error?.message || `OpenRouter responded with ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    return NextResponse.json({ content });
  } catch (error: any) {
    console.error('Chat API Error:', error);
    return NextResponse.json({ error: 'Failed to generate response', details: error.message }, { status: 500 });
  }
}
