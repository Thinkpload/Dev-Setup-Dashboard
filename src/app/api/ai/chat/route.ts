import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createChatCompletion } from '../../../../lib/ai';

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { messages?: unknown };
    const response = await createChatCompletion({
      messages: body.messages as Parameters<typeof createChatCompletion>[0]['messages'],
    });
    return NextResponse.json({ response });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'AI provider error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
