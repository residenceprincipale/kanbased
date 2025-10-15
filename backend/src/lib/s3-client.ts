import { S3Client } from "@aws-sdk/client-s3";
import { env } from "../env.js";

let _s3Client: S3Client | null = null;

export const getS3Client = (): S3Client => {
  if (!_s3Client) {
    if (!env.S3_ENDPOINT || !env.S3_ACCESS_KEY_ID || !env.S3_SECRET_ACCESS_KEY) {
      throw new Error("S3 configuration is missing. Please set S3_ENDPOINT, S3_ACCESS_KEY_ID, and S3_SECRET_ACCESS_KEY in your environment variables.");
    }
    
    _s3Client = new S3Client({
      endpoint: env.S3_ENDPOINT,
      credentials: {
        accessKeyId: env.S3_ACCESS_KEY_ID,
        secretAccessKey: env.S3_SECRET_ACCESS_KEY,
      },
      region: env.S3_REGION || "auto",
    });
  }
  return _s3Client;
};

// For backward compatibility
export const s3Client = new Proxy({} as S3Client, {
  get: (_target, prop) => {
    return getS3Client()[prop as keyof S3Client];
  }
});

