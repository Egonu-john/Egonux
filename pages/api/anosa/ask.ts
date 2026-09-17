import { Output, generateText } from 'ai';
import type { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';
import { ANOSA_SOURCES, sourceContext } from '@/lib/anosa/sources';
import { requireAnosaFounder } from '@/lib/anosa/server';
import type { AnosaAnswer, AnosaProposal } from '@/lib/anosa/types';
import { AuthenticationError, AuthorizationError } from '@/lib/auth/session';
import { anosaLog } from '@/lib/anosa/telemetry';
import { withVercelOidcToken } from '@/lib/firebase/admin';

const questionSchema = z.object({ question: z.string().trim().min(3).max(1200) });
const intelligenceSchema = z.object({
  answer: z.string().min(20).max(2400),
  proposals: z.array(z.object({
    title: z.string().min(4).max(100),
    purpose: z.string().min(8).max(240),
    detail: z.string().min(12).max(500),
    impact: z.string().min(8).max(280),
    risk: z.enum(['Low', 'Medium', 'High']),
    sourceIds: z.array(z.enum(['enterprise-mvp', 'anosa-mobile-v1', 'security-policy', 'github-main', 'deployment-health', 'decision-ledger', 'phase2-architecture'])).min(1).max(7),
    actionType: z.enum(['brief', 'email_draft', 'task_draft', 'github_draft']),
    draftPreview: z.string().min(8).max(800),
  })).min(1).max(3),
});

function fallback(question: string): Omit<AnosaAnswer, 'generatedAt'> {
  const normalized = question.toLowerCase();
  const briefing = normalized.includes('brief') || normalized.includes('attention') || normalized.includes('priority');
  const proposalSeeds = briefing
    ? [
        ['Review identity and access readiness', 'Confirm founder access, session protection, and role boundaries before expanding connected data.', 'Reduces unauthorized access risk while keeping all permission changes outside ANOSA.', 'Medium', ['security-policy', 'anosa-mobile-v1']],
        ['Approve the ANOSA intelligence pilot', 'Evaluate grounded answers and proposal quality against approved EGONUX documents.', 'Creates review material and test evidence only; it does not publish or execute.', 'Low', ['anosa-mobile-v1', 'enterprise-mvp']],
        ['Prepare the next delivery backlog', 'Convert reviewed MVP gaps into an ordered implementation plan with acceptance gates.', 'Creates a draft backlog for founder review without changing GitHub or production.', 'Low', ['enterprise-mvp', 'github-main']],
      ] as const
    : [[
        `Review: ${question.slice(0, 72)}`,
        'Turn the founder request into a bounded, reviewable EGONUX proposal.',
        'Creates a preparation record only. No external, financial, publishing, or production action will occur.',
        'Low',
        ['anosa-mobile-v1', 'enterprise-mvp'],
      ]] as const;

  const proposals = proposalSeeds.map(([title, detail, impact, risk, sourceIds], index): AnosaProposal => ({
    id: `anosa-${Date.now()}-${index + 1}`,
    title,
    purpose: question,
    detail,
    impact,
    risk,
    executionBoundary: 'Decision recording only. Execution remains locked.',
    sourceIds: [...sourceIds],
    createdAt: new Date().toISOString(),
    state: 'pending',
    actionType: 'brief',
    draftPreview: `Founder review draft: ${detail}`,
  }));

  return {
    answer: briefing
      ? 'Founder briefing prepared from seven governed EGONUX sources. The immediate priorities are identity and access assurance, validation of the ANOSA intelligence pilot, and conversion of known MVP gaps into an ordered delivery backlog. Three bounded proposals are ready for review.'
      : `ANOSA reviewed “${question}” against the approved EGONUX product, governance, security, and delivery sources. A bounded proposal is ready for founder review; uncertainty remains limited to information not present in those sources.`,
    confidence: 'limited',
    engine: 'grounded-fallback',
    sources: [...ANOSA_SOURCES],
    proposals,
  };
}

async function handleRequest(request: NextApiRequest, response: NextApiResponse) {
  const startedAt = Date.now();
  response.setHeader('Cache-Control', 'no-store');
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST');
    return response.status(405).json({ error: 'Method not allowed.' });
  }

  try {
    const principal = await requireAnosaFounder(request);
    const { question } = questionSchema.parse(request.body);
    const generatedAt = new Date().toISOString();

    try {
      const result = await generateText({
        model: process.env.ANOSA_AI_MODEL || 'anthropic/claude-sonnet-5',
        output: Output.object({ schema: intelligenceSchema }),
        system: [
          'You are ANOSA, the private founder intelligence assistant for EGONUX WEALTH CENTRAL HUB.',
          'Use only the supplied approved source summaries. Never claim live financial, customer, regulatory, or production data.',
          'Be concise and executive-ready. Surface uncertainty. Prepare one to three proposals.',
          'Every proposal is non-executing: never send, publish, transfer funds, change access, or alter production. Return an exact draftPreview and actionType so the founder can inspect what would be prepared.',
        ].join(' '),
        prompt: `Founder: ${principal.displayName || principal.email || 'Founder'}\nRequest: ${question}\n\nApproved sources:\n${sourceContext()}`,
      });
      const output = result.output;
      const proposals: AnosaProposal[] = output.proposals.map((proposal, index) => ({
        ...proposal,
        id: `anosa-${Date.now()}-${index + 1}`,
        executionBoundary: 'Decision recording only. Execution remains locked.',
        createdAt: generatedAt,
        state: 'pending',
      }));
      anosaLog(request, '/api/anosa/ask', 'prepared', startedAt, { engine: 'ai-gateway', proposals: proposals.length });

      return response.status(200).json({
        answer: output.answer,
        confidence: 'grounded',
        engine: 'ai-gateway',
        sources: [...ANOSA_SOURCES],
        proposals,
        generatedAt,
      } satisfies AnosaAnswer);
    } catch (error) {
      console.warn('ANOSA AI Gateway unavailable; serving grounded fallback.', error);
      anosaLog(request, '/api/anosa/ask', 'prepared', startedAt, { engine: 'grounded-fallback' });
      return response.status(200).json({ ...fallback(question), generatedAt } satisfies AnosaAnswer);
    }
  } catch (error) {
    if (error instanceof z.ZodError) return response.status(400).json({ error: 'Enter a founder request between 3 and 1,200 characters.' });
    if (error instanceof AuthenticationError) return response.status(401).json({ error: 'Authentication required.' });
    if (error instanceof AuthorizationError) return response.status(403).json({ error: 'Founder access required.' });
    throw error;
  }
}

export default function handler(request: NextApiRequest, response: NextApiResponse) {
  return withVercelOidcToken(request.headers['x-vercel-oidc-token'], () => handleRequest(request, response));
}
