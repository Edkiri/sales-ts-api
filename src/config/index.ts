import dotenv from 'dotenv';
import Joi from 'joi';
import { Config } from 'src/interfaces/config.interface';

dotenv.config();

const envVarsSchema = Joi.object({
  PORT: Joi.number().default(3000),
  NODE_ENV: Joi.string().default('development'),
  DATABASE_URL: Joi.string().required(),
  SECRET_KEY: Joi.string().required(),
});

const { value, error } = envVarsSchema.validate({
  PORT: process.env.PORT,
  NODE_ENV: process.env.NODE_ENV,
  DATABASE_URL: process.env.DATABASE_URL,
  SECRET_KEY: process.env.SECRET_KEY,
});

if (error) {
  throw new Error(`Error validating environment variables: ${error.message}`);
}

const config = {
  port: value.PORT,
  env: value.NODE_ENV,
  databaseUrl: value.DATABASE_URL,
  secretKey: value.SECRET_KEY,
} as Config;

export { config };
