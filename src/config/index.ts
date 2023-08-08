import { config } from 'dotenv';
import Joi from 'joi';

config();

const envVarsSchema = Joi.object({
  PORT: Joi.number().default(3000),
  NODE_ENV: Joi.string().default('development'),
  DATABASE_URL: Joi.string().required(),
  SECRET_KEY: Joi.string().required(),
});

const { error } = envVarsSchema.validate({
  PORT: process.env.PORT,
  DATABASE_URL: process.env.DATABASE_URL,
  SECRET_KEY: process.env.SECRET_KEY,
});

if (error) {
  throw new Error(`Error validating environment variables: ${error.message}`);
}

export const { NODE_ENV, PORT, SECRET_KEY, DATABASE_URL } = process.env;
