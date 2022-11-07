require('dotenv-safe').config({ allowEmptyValues: true });

const commonConfig = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '8081', 10),
  uploadMaxSize: parseInt(process.env.UPLOAD_MAX_SIZE || '2', 10),
  databaseURL: process.env.DATABASE_URL,
  autoRunMigrations: process.env.AUTO_RUN_MIGRATIONS === 'true' || false,
  cookie: {
    name: process.env.COOKIE_NAME || 'compass.session',
    // Duration in MS
    duration: (process.env.COOKIE_DURATION ? parseInt(process.env.COOKIE_DURATION, 10) : 24 * 60 * 60) * 1000,
    key: process.env.COOKIE_KEY || '27bf603fdaf288cef80a4434bdd46d4c2274226fc40bffd9661236940cbdcd92',
    domain: process.env.COOKIE_DOMAIN || undefined,
  },
  redisURL: process.env.REDIS_URL || null,
  aws: {
    access_key: process.env.AWS_ACCESS_KEY_ID,
    secret_access_key: process.env.AWS_SECRET_ACCESS_KEY,
    default_region: process.env.AWS_DEFAULT_REGION || 'us-west-1',
    local_s3_uri: process.env.AWS_LOCAL_S3_URI,
    cdn_url: process.env.AWS_CDN_URL,
    bucket: {
      default: process.env.AWS_BUCKET_DEFAULT || 'compass',
    },
  },
  sendGrid: {
    apiKey: process.env.SENDGRID_API_KEY || '',
    emailFrom: process.env.SENDGRID_EMAIL_FROM || '',
    nameFrom: process.env.SENDGRID_NAME_FROM || '',
  },
  customHeader: process.env.COMPASS_HASH_ID_HEADER || 'x-compass-hash-id',
  jwtValues: {
    privateKey: process.env.JWT_PRIVATE_KEY || 'privateKey',
  },
};

function getCorsDomain(): string | string[] {
  const base = process.env.CORS_DOMAIN || '*';
  if (base.startsWith('[')) {
    return JSON.parse(base);
  }
  return base;
}

export default {
  ...commonConfig,
  isDev: commonConfig.env === 'development',
  corsDomain: getCorsDomain(),
};
