CREATE DATABASE thankfulnotes;

CREATE TABLE users (
    id uuid NOT NULL PRIMARY KEY DEFAULT
    uuid_generate_v4(),
    is_in_group BOOLEAN NOT NULL,
    group_id uuid,
    username VARCHAR(100) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    age INT NOT NULL check(age >= 1 and age <= 120),
    email VARCHAR(100) NOT NULL,
    password VARCHAR(200) NOT NULL,
    date_joined DATE DEFAULT CURRENT_DATE,
    current_day INTEGER,
    last_posted_date VARCHAR(100),
    UNIQUE (email, username)
);


INSERT INTO users (is_in_group, first_name, last_name, age, email, password, date_joined) 
values (true, 'Jae', 'Park', 27, 'pjaew94@gmail.com', 'blacksheepwall', 'Nov 04 2021');   

SELECT * FROM users;



CREATE TABLE groups (
    id uuid NOT NULL PRIMARY KEY DEFAULT
    uuid_generate_v4(),
    unique_group_name VARCHAR(100) NOT NULL,
    group_name VARCHAR(100) NOT NULL,
    date_created DATE DEFAULT CURRENT_DATE,
    UNIQUE (unique_group_name)
);

INSERT INTO groups (unique_group_name, group_name) values ('Jesus Love Church', 'Jesus Love Church');


CREATE TABLE posts (
    id uuid NOT NULL PRIMARY KEY DEFAULT
    uuid_generate_v4(),
    username VARCHAR(100) NOT NULL,
    group_id uuid,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    message VARCHAR(1000) NOT NULL,
    message_kor VARCHAR(1000) NOT NULL,
    book VARCHAR(100),
    book_kor VARCHAR(100),
    chapter_and_verse VARCHAR(100),
    thought_on_verse1 VARCHAR(2000) NOT NULL,
    thought_on_verse2 VARCHAR(2000) NOT NULL,
    thought_on_verse3 VARCHAR(2000) NOT NULL,
    thought_on_verse4 VARCHAR(2000) NOT NULL,
    thought_on_verse5 VARCHAR(2000) NOT NULL,
    show_thanks1 VARCHAR(2000) NOT NULL,
    show_thanks2 VARCHAR(2000) NOT NULL,
    show_thanks3 VARCHAR(2000) NOT NULL,
    is_private BOOLEAN NOT NULL,
    date_posted DATE DEFAULT CURRENT_DATE
);

CREATE TABLE messages (
    id SMALLSERIAL PRIMARY KEY,
    message VARCHAR(2000) NOT NULL,
    message_kor VARCHAR(2000) NOT NULL,
    book VARCHAR(100),
    book_kor VARCHAR(100),
    chapter_and_verse VARCHAR(20)
);
