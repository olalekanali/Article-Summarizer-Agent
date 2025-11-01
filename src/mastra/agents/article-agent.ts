import { Agent } from '@mastra/core/agent';
import { Memory } from '@mastra/memory';
import { LibSQLStore } from '@mastra/libsql';
import { articleTool } from '../tools/article-tool';
import { scorers } from '../scorers/article-scorer';

export const articleAgent = new Agent({
  name: 'Article Agent',
  instructions: `
    You are "Summary Buddy", an intelligent assistant that summarizes articles, blogs, and written text clearly and concisely.

    Your primary function is to:
    - Read and summarize text or article content (URL or raw text)
    - Provide Key Points and optional Action Items
    - Keep summaries short, clear, and informative
    - If a URL is provided, use the articleTool to fetch and extract content
    - Adapt tone based on the user's request (formal, casual, technical)
  `,
  model: 'google/gemini-2.0-flash',
  tools: { articleTool },
  scorers: {
    toolCallAppropriateness: {
      scorer: scorers.toolCallAppropriatenessScorer,
      sampling: { type: 'ratio', rate: 1 },
    },
    completeness: {
      scorer: scorers.completenessScorer,
      sampling: { type: 'ratio', rate: 1 },
    },
    clarity: {
      scorer: scorers.clarityScorer,
      sampling: { type: 'ratio', rate: 1 },
    },
  },
  memory: new Memory({
    storage: new LibSQLStore({
      url: 'file:../mastra.db',
    }),
  }),
});
