import * as Joi from 'joi';

export const UpdateAdminUserSchema = Joi.object()
  .keys({
    name: Joi.string().min(3).optional(),
    lastName: Joi.string().min(3).optional(),
    email: Joi.string().email().required(),
    mobPhone: Joi.string().min(3).optional(),
    role: Joi.string().optional(),
    banned: Joi.boolean().optional(),
    verified: Joi.boolean().optional(),
  })
  .unknown(false);
