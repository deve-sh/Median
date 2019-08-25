CREATE TABLE blog_users(id integer primary key auto_increment, username varchar(255) unique not null, email varchar(255) unique not null, password varchar(255) not null);

CREATE TABLE blog_posts(postid integer primary key auto_increment, userid integer references blog_users(id) on delete cascade on update set null, postTitle text, postContent text, created text);