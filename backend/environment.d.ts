export declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: string;
      DATABASE_URL: string;
      DB_MIGRATING: string;
      DB_SEEDING: string;
      GOOGLE_CLIENT_ID: string
      GOOGLE_CLIENT_SECRET: string
      BE_ORIGIN: string
      FE_ORIGIN: string
    }
  }
}
