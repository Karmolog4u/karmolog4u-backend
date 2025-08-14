import * as Joi from 'joi';

export const newGiftSchema = Joi.object()
  .keys({
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
    cover: Joi.string().optional().messages({
      'string.base': 'cover має бути рядком',
    }),
    price: Joi.number().optional().messages({
      'number.base': 'price має бути числом',
    }),
    status: Joi.string()
      .valid('DRAFT', 'HIDDEN', 'PUBLISHED')
      .required()
      .messages({
        'any.required': "status є обов'язковим полем",
        'string.base': 'status має бути рядком',
        'string.empty': 'status не може бути порожнім',
        'any.only':
          'status має бути одним з таких значень: DRAFT, HIDDEN, PUBLISHED',
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

export const updateGiftSchema = Joi.object()
  .keys({
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
    cover: Joi.string().optional().messages({
      'string.base': 'cover має бути рядком',
    }),
    price: Joi.number().optional().messages({
      'number.base': 'price має бути числом',
    }),
    status: Joi.string()
      .valid('DRAFT', 'HIDDEN', 'PUBLISHED')
      .required()
      .messages({
        'any.required': "status є обов'язковим полем",
        'string.base': 'status має бути рядком',
        'string.empty': 'status не може бути порожнім',
        'any.only':
          'status має бути одним з таких значень: DRAFT, HIDDEN, PUBLISHED',
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

export const changeStatusGiftSchema = Joi.object()
  .keys({
    status: Joi.string()
      .valid('DRAFT', 'HIDDEN', 'PUBLISHED')
      .required()
      .messages({
        'any.required': "status є обов'язковим полем",
        'string.base': 'status має бути рядком',
        'string.empty': 'status не може бути порожнім',
        'any.only':
          'status має бути одним з таких значень: DRAFT, HIDDEN, PUBLISHED',
      }),
  })
  .unknown(false);
