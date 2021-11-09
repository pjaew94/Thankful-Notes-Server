import {Request, Response,} from 'express';

export interface IRegisterFields {
  group_id: string;
  first_name: string;
  last_name: string;
  age: number;
  email: string;
  password: string;
  repeat_password: string;
  date_joined: string;
}


export interface ILoginFields {
    email: string,
    password: string
}



export interface IGroupFields {
  unique_group_name: string,
  group_name: string
}


export interface IPostsFields {
  username: string,
  group_id: string,
  verse_of_the_day: string,
  verse_book: string,
  verse_verse: string,
  thought_on_verse1: string,
  thought_on_verse2: string,
  thought_on_verse3: string,
  thought_on_verse4: string,
  thought_on_verse5: string,
  show_thanks1: string,
  show_thanks2: string,
  show_thanks3: string,
  is_private: boolean
}