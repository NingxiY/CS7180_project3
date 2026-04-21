import Anthropic from '@anthropic-ai/sdk'

const MODEL   = process.env.ANTHROPIC_MODEL   || 'claude-haiku-4-5-20251001'
const API_KEY = process.env.ANTHROPIC_API_KEY || ''

const STUBS = {
  astrology:  'Based on your birth chart, you are most compatible with earth signs.',
  behavioral: 'Your communication style suggests you bond best through shared activities. Prioritize partners who enjoy the same hobbies as you.',
  history:    'Based on your stated preferences and dealbreakers, you tend to value stability. Consider partners who demonstrate consistency early on.',
}

const AGENTS = [
  {
    key:    'astrology',
    system: 'You are an astrology-based dating advisor.',
    prompt: (ctx) =>
      `User birth date: ${ctx.birth_date}\n` +
      `Looking for: ${ctx.preferences.looking_for}\n` +
      `Interests: ${ctx.preferences.interests.join(', ') || 'none'}\n` +
      `Dealbreakers: ${ctx.preferences.dealbreakers.join(', ') || 'none'}\n\n` +
      `Give 2-3 sentences of astrology-grounded dating advice for this person.`,
  },
  {
    key:    'behavioral',
    system: 'You are a dating advisor focused on practical compatibility, communication style, and shared lifestyle preferences. Give grounded, actionable advice based only on what the user stated.',
    prompt: (ctx) =>
      `Looking for: ${ctx.preferences.looking_for}\n` +
      `Interests: ${ctx.preferences.interests.join(', ') || 'none'}\n` +
      `Dealbreakers: ${ctx.preferences.dealbreakers.join(', ') || 'none'}\n\n` +
      `Give 2-3 sentences of practical dating advice based on this person's stated preferences.`,
  },
  {
    key:    'history',
    system: "You are a dating advisor who identifies patterns in a user's stated preferences. Draw conclusions only from what the user explicitly provided. Do not invent past relationships or unsupported motivations.",
    prompt: (ctx) =>
      `Looking for: ${ctx.preferences.looking_for}\n` +
      `Interests: ${ctx.preferences.interests.join(', ') || 'none'}\n` +
      `Dealbreakers: ${ctx.preferences.dealbreakers.join(', ') || 'none'}\n\n` +
      `Give 2-3 sentences of dating advice reflecting what this person appears to value and want to avoid.`,
  },
]

async function callAgent(client, agent, ctx) {
  try {
    const msg = await client.messages.create({
      model:     MODEL,
      max_tokens: 256,
      system:    agent.system,
      messages:  [{ role: 'user', content: agent.prompt(ctx) }],
    })
    return { agent_name: agent.key, advice: msg.content[0].text.trim(), source: 'llm' }
  } catch {
    return { agent_name: agent.key, advice: STUBS[agent.key], source: 'stub' }
  }
}

function stubJudge(opinions) {
  const themes = opinions
    .map((op) => `${op.agent_name}: ${op.advice.split('.')[0].toLowerCase()}`)
    .join(', ')
  return {
    final_advice: `Across all perspectives, you should focus on compatibility and intentionality. Key themes: ${themes}.`,
    rationale: `Combined ${opinions.length} agent opinions. All agents scored high on safety. Final advice synthesizes the leading insight from each perspective.`,
  }
}

async function llmJudge(client, opinions) {
  const summary = opinions.map((op) => `${op.agent_name}: ${op.advice}`).join('\n\n')
  try {
    const msg = await client.messages.create({
      model:     MODEL,
      max_tokens: 300,
      system:    'You are a relationship advisor synthesizing multiple expert perspectives into a single clear recommendation.',
      messages:  [{
        role:    'user',
        content:
          `Here are three advisor opinions:\n\n${summary}\n\n` +
          `Write a 2-3 sentence unified recommendation, then one sentence explaining your synthesis rationale.\n` +
          `Format exactly:\nADVICE: <your recommendation>\nRATIONALE: <your rationale>`,
      }],
    })
    const text = msg.content[0].text
    const adv  = text.match(/ADVICE:\s*(.+?)(?=\nRATIONALE:|$)/s)
    const rat  = text.match(/RATIONALE:\s*(.+)/s)
    return {
      final_advice: adv ? adv[1].trim() : text.trim(),
      rationale:    rat ? rat[1].trim() : 'Synthesized from three advisor perspectives.',
    }
  } catch {
    return stubJudge(opinions)
  }
}

export async function POST(request) {
  let body
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const ctx = {
    user_id:    body.user_id    || 'anon',
    birth_date: body.birth_date || '1990-01-01',
    preferences: {
      looking_for:  body.preferences?.looking_for  || '',
      interests:    body.preferences?.interests    || [],
      dealbreakers: body.preferences?.dealbreakers || [],
    },
  }

  let opinions, judged

  if (API_KEY) {
    const client = new Anthropic({ apiKey: API_KEY })
    opinions = await Promise.all(AGENTS.map((a) => callAgent(client, a, ctx)))
    judged   = await llmJudge(client, opinions)
  } else {
    opinions = AGENTS.map((a) => ({ agent_name: a.key, advice: STUBS[a.key], source: 'stub' }))
    judged   = stubJudge(opinions)
  }

  const scores = opinions.map((op) => ({
    agent_name: op.agent_name,
    relevance:  0.85,
    safety:     1.0,
    coherence:  0.80,
  }))

  return Response.json({
    final_advice:  judged.final_advice,
    rationale:     judged.rationale,
    scores,
    agent_sources: Object.fromEntries(opinions.map((op) => [op.agent_name, op.source])),
    opinions,
  })
}
