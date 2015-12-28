drop table if exists users;
create table users (
  id INTEGER PRIMARY KEY,
  email TEXT NOT NULL,
  password TEXT NOT NULL,
  firstname text,
  familyname text,
  gender text,
  city text,
  country text
);

drop table if exists messages;
create table messages (
  id integer PRIMARY KEY,
  content TEXT NOT NULL ,
  toUser INTEGER NOT NULL ,
  fromUser INTEGER NOT NULL ,
  FOREIGN KEY(toUser) REFERENCES users(id),
  FOREIGN KEY(fromUser) REFERENCES users(id)
);