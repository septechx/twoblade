declare module '$env/static/public' {
  export const PUBLIC_DOMAIN: string;
  export const PUBLIC_WEBSOCKET_URL: string;
}

declare module "$env/static/private" {
  export const DATABASE_URL: string;
  export const JWT_SECRET: string;
  export const PRIVATE_B2_KEY_ID: string;
  export const PRIVATE_B2_APP_KEY: string;
  export const PRIVATE_B2_BUCKET: string;
  export const PRIVATE_B2_REGION: string;
  export const PRIVATE_B2_ENDPOINT: string;
  export const TEST_AUTH_TOKEN: string;
  export const REDIS_URL: string;
  export const PUBLIC_TURNSTILE_SITE_KEY: string;
}
