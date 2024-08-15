export declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: string;
      DB_USER: string;
      DB_PASSWORD: string;
      DB_NAME: string;
      DB_PORT: string;
      DB_HOST: string;
      DATABASE_URL: string;
      DB_MIGRATING: string;
      DB_SEEDING: string;
    }
  }
}
