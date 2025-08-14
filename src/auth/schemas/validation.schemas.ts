import * as Joi from 'joi';

export const loginUserSchema = Joi.object()
  .keys({
    email: Joi.string().email().required(),
    password: Joi.string().min(8).max(20).required(),
  })
  .unknown(false);

export const refreshTokenSchema = Joi.object()
  .keys({
    token: Joi.string().min(10).required(),
  })
  .unknown(false);

export const registerUserSchema = Joi.object()
  .keys({
    name: Joi.string().min(1).max(20).required(),
    lastName: Joi.string().min(1).max(20).required(),
    mobPhone: Joi.string().min(1).max(20).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(8).max(20).required(),
  })
  .unknown(false);

export const resetPasswordSchema = Joi.object()
  .keys({
    email: Joi.string().email().required(),
  })
  .unknown(false);
