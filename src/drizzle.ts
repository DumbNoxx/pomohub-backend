import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from "~/db/schema"
import { env } from '~/config';


export const db = drizzle(env.DATABASE_URL, { schema: schema });
