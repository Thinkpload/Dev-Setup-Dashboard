import { Inngest } from 'inngest';

export const inngest = new Inngest({
  id: process.env.INNGEST_APP_NAME ?? 'template-bmad-app',
});
