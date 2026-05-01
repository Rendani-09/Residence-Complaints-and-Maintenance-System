import { Pool, type QueryResult, type QueryResultRow } from "pg";
import { config } from "./config";

export const pool = new Pool({
  connectionString: config.databaseUrl,
  ssl: {
    rejectUnauthorized: false,
  },
});

export const query = <T extends QueryResultRow = QueryResultRow>(
  text: string,
  params?: unknown[],
): Promise<QueryResult<T>> => {
  return pool.query<T>(text, params);
};
