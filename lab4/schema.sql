drop table if exists users;
create table users (
  email TEXT PRIMARY KEY ,
  password TEXT NOT NULL,
  firstname text,
  familyname text,
  gender text,
  city text,
  country text,
  page_visits INTEGER
);

drop table if exists messages;
create table messages (
  id integer PRIMARY KEY AUTOINCREMENT ,
  content TEXT NOT NULL ,
  toUser INTEGER NOT NULL ,
  fromUser INTEGER NOT NULL ,
  FOREIGN KEY(toUser) REFERENCES users(email),
  FOREIGN KEY(fromUser) REFERENCES users(email)
);
