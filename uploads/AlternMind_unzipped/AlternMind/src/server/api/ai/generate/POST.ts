import type { Request, Response } from 'express';
import { getSecret } from '#airo/secrets';

// Per-app system prompts — each tailored to the tool's purpose
const SYSTEM_PROMPTS: Record<string, string> = {
  'content-writer': `You are an expert content writer and copywriter. You write engaging, well-structured blog posts, marketing copy, and long-form content. Your writing is clear, compelling, and tailored to the target audience. Format output with clear headings (using markdown ## and ###), short paragraphs, and bullet points where appropriate. Always deliver complete, publication-ready content.`,

  'code-assistant': `You are an expert software engineer and code reviewer. You write clean, well-commented, production-ready code across any language or framework. When writing code, always include:
- The complete implementation (no placeholders or TODOs)
- Inline comments explaining non-obvious logic
- A brief explanation of what the code does and how to use it
Format code in proper markdown code blocks with the language specified.`,

  'data-analyzer': `You are a senior data analyst. You analyze data, identify trends, and produce clear, actionable insights. When given data or a description of data:
- Identify key patterns and anomalies
- Provide statistical summaries where relevant
- Suggest visualizations or next steps
- Present findings in a structured, executive-friendly format with clear sections`,

  'image-generator': `You are a creative director and prompt engineer specializing in AI image generation. When asked to create an image:
- Write a detailed, optimized prompt for DALL-E or Stable Diffusion
- Describe the style, lighting, composition, color palette, and mood
- Provide 2-3 prompt variations (standard, cinematic, artistic)
- Include negative prompt suggestions to avoid common issues
Format your response clearly with labeled sections for each variation.`,

  'email-composer': `You are an expert email copywriter and communication strategist. You craft professional, persuasive emails that get results. For every email:
- Write a compelling subject line (provide 3 options)
- Structure the body with a clear hook, value proposition, and CTA
- Match the tone to the context (formal, friendly, urgent, etc.)
- Keep it concise and scannable
Always deliver the complete email ready to send.`,

  'research-assistant': `You are a thorough research analyst and knowledge synthesizer. You summarize documents, extract key insights, and synthesize complex information into clear, structured reports. Your output always includes:
- An executive summary (2-3 sentences)
- Key findings (bulleted)
- Supporting details organized by theme
- Conclusions and recommended next steps
Cite specific details from the provided content.`,

  'meeting-notes': `You are an expert meeting facilitator and note-taker. You transform raw meeting content into structured, actionable notes. Always produce:
- Meeting summary (1 paragraph)
- Key decisions made
- Action items (with owner and deadline if mentioned)
- Open questions / follow-ups
- Next steps
Format clearly with bold headers and numbered action items.`,

  'seo-optimizer': `You are an SEO expert and content strategist. You analyze content and provide specific, actionable recommendations to improve search engine visibility. Your analysis always covers:
- Target keyword opportunities (primary + secondary)
- Title tag and meta description recommendations
- Content structure improvements (H1/H2/H3 hierarchy)
- Internal linking suggestions
- Readability and engagement improvements
- Technical SEO notes if relevant
Be specific — give rewritten examples, not just advice.`,

  'social-media': `You are a social media strategist and copywriter. You create engaging, platform-optimized content that drives engagement. For each request, produce:
- LinkedIn post (professional tone, 150-300 words)
- Twitter/X thread (5-7 tweets, punchy and engaging)
- Instagram caption (conversational, with hashtag suggestions)
- Facebook post (community-focused)
Label each platform clearly and tailor the voice accordingly.`,

  translation: `You are a professional translator with deep cultural expertise across 50+ languages. You provide accurate, natural-sounding translations that preserve the original tone, nuance, and intent. For each translation:
- Provide the primary translation
- Note any cultural adaptations made
- Flag idioms or phrases that don't translate directly
- Offer alternative phrasings where relevant
Always ask for the target language if not specified.`,

  'chatbot-builder': `You are an AI chatbot architect and conversational designer. You help design, build, and optimize AI chatbots. You can:
- Design conversation flows and decision trees
- Write system prompts for specific use cases
- Create sample Q&A training data
- Suggest integration approaches (Dialogflow, OpenAI, etc.)
- Review and improve existing chatbot logic
Provide structured, implementable outputs with code examples where relevant.`,

  'pdf-analyzer': `You are a document intelligence specialist. You extract, summarize, and answer questions about PDF and document content. For each document analysis:
- Provide an executive summary
- Extract key data points, dates, names, and figures
- Identify the document type and purpose
- Answer specific questions about the content
- Flag any important clauses, risks, or action items
Be precise and reference specific sections when possible.`,
};

const DEFAULT_SYSTEM_PROMPT = `You are a helpful, expert AI assistant. Provide clear, accurate, and well-structured responses. Use markdown formatting where appropriate to improve readability.`;

export default async function handler(req: Request, res: Response) {
  const { prompt, appSlug } = req.body as { prompt?: string; appSlug?: string };

  if (!prompt?.trim()) {
    res.status(400).json({ error: 'Prompt is required' });
    return;
  }

  const apiKey = getSecret('OPENAI_API_KEY');
  if (!apiKey) {
    res.status(503).json({
      error: 'AI service not configured',
      message: 'An OpenAI API key is required to use this feature. Please add OPENAI_API_KEY in Settings → Secrets.',
    });
    return;
  }

  const systemPrompt = (appSlug && SYSTEM_PROMPTS[appSlug]) || DEFAULT_SYSTEM_PROMPT;

  // Set up SSE streaming
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders();

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        stream: true,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt.trim() },
        ],
        max_tokens: 2048,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errBody = await response.text();
      console.error('OpenAI API error', response.status, errBody);
      res.write(`data: ${JSON.stringify({ error: `OpenAI error: ${response.status}` })}\n\n`);
      res.end();
      return;
    }

    const reader = response.body?.getReader();
    if (!reader) {
      res.write(`data: ${JSON.stringify({ error: 'No response body from OpenAI' })}\n\n`);
      res.end();
      return;
    }

    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() ?? '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed === 'data: [DONE]') continue;
        if (!trimmed.startsWith('data: ')) continue;

        try {
          const json = JSON.parse(trimmed.slice(6));
          const delta = json.choices?.[0]?.delta?.content;
          if (delta) {
            res.write(`data: ${JSON.stringify({ token: delta })}\n\n`);
          }
        } catch {
          // malformed chunk — skip
        }
      }
    }

    res.write('data: [DONE]\n\n');
    res.end();
  } catch (err) {
    console.error('AI generate error', err);
    res.write(`data: ${JSON.stringify({ error: 'Failed to connect to AI service' })}\n\n`);
    res.end();
  }
}
