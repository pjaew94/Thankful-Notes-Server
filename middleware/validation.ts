import Joi from "joi";
import { IGroupFields, ILoginFields, IPostsFields, IRegisterFields } from "./types";

export const registerValidation = (data: IRegisterFields) => {
  const schema = Joi.object({
    group_id: Joi.string(),
    username: Joi.string().min(1).max(100).required(),
    first_name: Joi.string().min(1).max(100).required(),
    last_name: Joi.string().min(1).max(100).required(),
    age: Joi.number().integer().min(1).max(120).required(),
    email: Joi.string().email({
      minDomainSegments: 2,
      tlds: { allow: ["com", "net", "org"] },
    }),
    password: Joi.string().pattern(new RegExp("^[a-zA-Z0-9]{3,30}$")),
    repeat_password: Joi.ref("password")
  }).unknown();


  return schema.validate(data);
};

export const loginValidation = (data: ILoginFields) => {
  const schema = Joi.object({
    email: Joi.string().email({
      minDomainSegments: 2,
      tlds: { allow: ["com", "net", "org"] },
    }),
    password: Joi.string()
  });

  return schema.validate(data)
};

export const groupValidation = (data: IGroupFields) => {
  const schema = Joi.object({
    unique_group_name: Joi.string().required(),
    group_name: Joi.string().required()
  })

  return schema.validate(data)
}

export const postValidation = (data: IPostsFields) => {
  const schema = Joi.object({
    username: Joi.string().required(),
    group_id: Joi.string(),
    verse_of_the_day: Joi.string().required(),
    verse_book: Joi.string().required(),
    verse_verse: Joi.string().required(),
    thought_on_verse1: Joi.string().required(),
    thought_on_verse2: Joi.string().required(),
    thought_on_verse3: Joi.string().required(),
    thought_on_verse4: Joi.string().required(),
    thought_on_verse5: Joi.string().required(),
    show_thanks1: Joi.string().required(),
    show_thanks2: Joi.string().required(),
    show_thanks3: Joi.string().required(),
    is_private: Joi.boolean().required(),
  })
  return schema.validate(data)
}