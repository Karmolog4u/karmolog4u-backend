import * as Joi from 'joi';
import { Category, Status } from 'src/products/meditations/schemas/meditation.schema';

export const newMeditationSchema = Joi.object()
  .keys({
    category: Joi.string()
      .valid(...Object.values(Category))
      .required()
      .messages({
        'any.required': "category є обов'язковим полем",
        'string.base': 'category має бути рядком',
        'string.empty': 'category не може бути порожнім',
        'any.only': 'category has an invalid value',
      }),
    name: Joi.object()
      .keys({
        ru: Joi.string().required().messages({
          'string.base': 'ru має бути рядком',
          'any.required': "ru є обов'язковим полем",
        }),
        uk: Joi.string().required().messages({
          'string.base': 'uk має бути рядком',
          'any.required': "uk є обов'язковим полем",
        }),
      })
      .required()
      .messages({
        'any.required': "name є обов'язковим полем",
      })
      .unknown(false),
    isWaiting: Joi.bool().optional().messages({
      'bool.base': 'isWaiting має бути рядком',
    }),
    description: Joi.object()
      .keys({
        ru: Joi.string().optional().messages({
          'string.base': 'ru має бути рядком',
        }),
        uk: Joi.string().optional().messages({
          'string.base': 'uk має бути рядком',
        }),
      })
      .optional()
      .unknown(false),
    video: Joi.object()
      .keys({
        video: Joi.string().allow('').optional().messages({
          'string.base': 'video.video має бути рядком',
        }),
        playlist: Joi.string().allow('').optional().messages({
          'string.base': 'video.playlist має бути рядком',
        }),
      })
      .optional()
      .unknown(false),
    cover: Joi.string().optional().messages({
      'string.base': 'cover має бути рядком',
    }),
    price: Joi.number().optional().messages({
      'number.base': 'price має бути числом',
    }),
    status: Joi.string()
      .valid(...Object.values(Status))
      .required()
      .messages({
        'any.required': "status є обов'язковим полем",
        'string.base': 'status має бути рядком',
        'string.empty': 'status не може бути порожнім',
        'any.only': 'status has an invalid value',
      }),
    discount: Joi.object()
      .keys({
        discount: Joi.number().optional().messages({
          'number.base': 'discount має бути числом',
        }),
        start: Joi.date().optional().messages({
          'date.base': 'start має бути датою',
        }),
        expiredAt: Joi.date().optional().messages({
          'date.base': 'expiredAt має бути датою',
        }),
      })
      .optional()
      .unknown(false),
  })
  .unknown(false);

export const updateMeditationSchema = Joi.object()
  .keys({
    category: Joi.string()
      .valid(...Object.values(Category))
      .required()
      .messages({
        'any.required': "category є обов'язковим полем",
        'string.base': 'category має бути рядком',
        'string.empty': 'category не може бути порожнім',
        'any.only': 'category has an invalid value',
      }),
    name: Joi.object()
      .keys({
        ru: Joi.string().optional().messages({
          'string.base': 'ru має бути рядком',
        }),
        uk: Joi.string().optional().messages({
          'string.base': 'uk має бути рядком',
        }),
      })
      .optional()
      .unknown(false),
    isWaiting: Joi.bool().optional().messages({
      'bool.base': 'isWaiting має бути рядком',
    }),
    description: Joi.object()
      .keys({
        ru: Joi.string().optional().messages({
          'string.base': 'ru має бути рядком',
        }),
        uk: Joi.string().optional().messages({
          'string.base': 'uk має бути рядком',
        }),
      })
      .optional()
      .unknown(false),
    video: Joi.object()
      .keys({
        video: Joi.string().allow('').optional().messages({
          'string.base': 'video.video має бути рядком',
        }),
        playlist: Joi.string().allow('').optional().messages({
          'string.base': 'video.playlist має бути рядком',
        }),
      })
      .optional()
      .unknown(false),
    cover: Joi.string().optional().messages({
      'string.base': 'cover має бути рядком',
    }),
    price: Joi.number().optional().messages({
      'number.base': 'price має бути числом',
    }),
    status: Joi.string()
      .valid(...Object.values(Status))
      .required()
      .messages({
        'any.required': "status є обов'язковим полем",
        'string.base': 'status має бути рядком',
        'string.empty': 'status не може бути порожнім',
        'any.only': 'status has an invalid value',
      }),
    discount: Joi.object()
      .keys({
        discount: Joi.number().optional().messages({
          'number.base': 'discount має бути числом',
        }),
        start: Joi.date().optional().messages({
          'date.base': 'start має бути датою',
        }),
        expiredAt: Joi.date().optional().messages({
          'date.base': 'expiredAt має бути датою',
        }),
      })
      .optional()
      .unknown(false),
  })
  .unknown(false);

export const changeStatusMeditationSchema = Joi.object()
  .keys({
    status: Joi.string()
      .valid(...Object.values(Status))
      .required()
      .messages({
        'any.required': "status є обов'язковим полем",
        'string.base': 'status має бути рядком',
        'string.empty': 'status не може бути порожнім',
        'any.only': 'status has an invalid value',
      }),
  })
  .unknown(false);
