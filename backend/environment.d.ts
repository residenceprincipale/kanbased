export declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: string;
      DB_PASSWORD: string;
      DB_USER: string;
      DB_NAME: string;
      DB_PORT: string;
      DATABASE_URL: string;
      GOOGLE_CLIENT_ID: string;
      GOOGLE_CLIENT_SECRET: string;
      BE_ORIGIN: string;
      FE_ORIGIN: string;
    }
  }
}
