import { Mastra } from '@mastra/core/mastra';
import { PinoLogger } from '@mastra/loggers';
import { LibSQLStore } from '@mastra/libsql';
import { weatherWorkflow } from './workflows/weather-workflow';
import { articleWorkflow } from './workflows/article-workflow';
import { weatherAgent } from './agents/weather-agent';
import { articleAgent } from './agents/article-agent';
import {
  toolCallAppropriatenessScorer,
  completenessScorer,
  translationScorer,
} from './scorers/weather-scorer';
import { scorers as articleScorers } from './scorers/article-scorer';
import { a2aAgentRoute } from './routes/a2a-agent-route';

export const mastra = new Mastra({
  workflows: { weatherWorkflow, articleWorkflow },
  agents: { weatherAgent, articleAgent },
  scorers: {
    toolCallAppropriatenessScorer,
    completenessScorer,
    translationScorer,
    ...articleScorers,
  },
  storage: new LibSQLStore({
    url: ':memory:',
  }),
  logger: new PinoLogger({
    name: 'Mastra',
    level: 'debug',
  }),
  observability: {
    default: { enabled: true },
  },
  server: {
    build: {
      openAPIDocs: true,
      swaggerUI: true,
    },
    apiRoutes: [a2aAgentRoute],
  },
});
