import * as Joi from 'joi';

export const createPromoCodeSchema = Joi.object()
  .keys({
    name: Joi.string().required().messages({
      'string.base': 'name має бути рядком',
      'any.required': "name є обов'язковим полем",
    }),
    promoDiscount: Joi.number().required().messages({
      'number.base': 'promoDiscount має бути числом',
      'any.required': 'promoDiscount є обов’язковим',
    }),
    start: Joi.date().required().messages({
      'date.base': 'start має бути валідною датою',
      'any.required': 'start є обов’язковим',
    }),
    end: Joi.date().required().min(Joi.ref('start')).messages({
      'date.min': 'end не може бути раніше за start',
      'any.required': 'start є обов’язковим',
    }),
    productName: Joi.string().required().messages({
      'string.base': 'productName має бути рядком',
      'any.required': 'productName є обов’язковим',
    }),
    collectionName: Joi.string().required().messages({
      'string.base': 'collectionName має бути рядком',
      'any.required': 'collectionName є обов’язковим',
    }),
    refId: Joi.string().required().messages({
      'string.base': 'refId має бути рядком',
      'any.required': 'refId є обов’язковим',
    }),
  })
  .unknown(false);

export const editPromoCodeSchema = Joi.object()
  .keys({
    name: Joi.string().required().messages({
      'string.base': 'name має бути рядком',
      'any.required': "name є обов'язковим полем",
    }),
    promoDiscount: Joi.number().required().messages({
      'number.base': 'promoDiscount має бути числом',
      'any.required': 'promoDiscount є обов’язковим',
    }),
    start: Joi.date().required().messages({
      'date.base': 'start має бути валідною датою',
      'any.required': 'start є обов’язковим',
    }),
    end: Joi.date().required().min(Joi.ref('start')).messages({
      'date.min': 'end не може бути раніше за start',
      'any.required': 'start є обов’язковим',
    }),
    productName: Joi.string().required().messages({
      'string.base': 'productName має бути рядком',
      'any.required': 'productName є обов’язковим',
    }),
    collectionName: Joi.string().required().messages({
      'string.base': 'collectionName має бути рядком',
      'any.required': 'collectionName є обов’язковим',
    }),
    refId: Joi.string().required().messages({
      'string.base': 'refId має бути рядком',
      'any.required': 'refId є обов’язковим',
    }),
  })
  .unknown(false);

export const DeletePromoCodesValidationSchema = Joi.array()
  .items(
    Joi.string()
      .required()
      .messages({
        'any.required': "id є обов'язковим полем",
        'string.base': 'id має бути рядком',
        'string.empty': 'id не може бути порожнім',
      })
      .example('6744d2c8bd8f6d722ff28c49'),
  )
  .min(1)
  .required()
  .messages({
    'any.required': " є обов'язковим полем",
    'array.base': ' має бути масивом',
    'array.empty': ' не може бути порожнім',
  });
