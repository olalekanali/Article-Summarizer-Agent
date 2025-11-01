import { z } from 'zod';
import { createToolCallAccuracyScorerCode } from '@mastra/evals/scorers/code';
import { createCompletenessScorer } from '@mastra/evals/scorers/code';
import { createScorer } from '@mastra/core/scores';

export const toolCallAppropriatenessScorer = createToolCallAccuracyScorerCode({
  expectedTool: 'articleTool',
  strictMode: false,
});

export const completenessScorer = createCompletenessScorer();

export const clarityScorer = createScorer({
  name: 'Clarity and Structure',
  description: 'Evaluates how clear, concise, and well-structured the summary is.',
  type: 'agent',
  judge: {
    model: 'google/gemini-2.0-flash',
    instructions: `
      You are an expert evaluator of writing clarity.
      Judge how clear, concise, and well-structured the summary is.
      Reward summaries that are logically organized and easy to read.
      Return a JSON score with "clarity", "structure", and "overall" ratings between 0 and 1.
    `,
  },
})
  .preprocess(({ run }) => {
    const output = run.output?.[0]?.content || '';
    return { text: output };
  })
  .analyze({
    outputSchema: z.object({
      clarity: z.number().min(0).max(1),
      structure: z.number().min(0).max(1),
      overall: z.number().min(0).max(1),
    }),
    createPrompt: ({ results }) => `
      Evaluate the following summary:
      """
      ${results.preprocessStepResult.text}
      """
      Provide clarity, structure, and overall scores (0–1 each) as JSON.
    `,
  })
  .generateScore(({ results }) => {
    const { overall } = (results as any)?.analyzeStepResult || {};
    return overall ?? 0.5;
  });

export const scorers = {
  toolCallAppropriatenessScorer,
  completenessScorer,
  clarityScorer,
};
