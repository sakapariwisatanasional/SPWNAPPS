// Dedicated Vercel serverless entrypoint.
// The Express application itself is exported from server.ts; this file exists
// so Vercel does not attempt to treat the full project as a traditional server.
import { app } from '../server';

export default app;
