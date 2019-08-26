# Median - Backend

Welcome to the documentation for the backend of Median. If you wanna know more about Median in general, just [click here](https://github.com/deve-sh/Median).

## What it is.

The Backend for Median is written using Node.js and the Express Framework. Data about users, posts and other stuff is stored in a relational MySQL Database.

The Frontend is connected to the backend using AJAX requests using various routes defined in this upcoming sections.

## Requirements

The following are required in order to setup the backend for the project.

* Node.js
* NPM
* MySQL (Latest if possible)
* Knowledge of JavaScript and Express. (Required, especially for editing. Of Course.)

## Setting it up

Clone the repo and cd into it. Then in your command line, change the directory to Backend and inside run the following commands.

```bash
npm install
```

Create a **.env** file in which add the following values

```env
DB_HOST=
DB_USER=
DB_PASS=
DB_NAME=
SECRETKEY=
```

Where DB_HOST is the host your MySQL database runs on, DB_USER is the username of the Database user, DB_PASS the user's password and DB_NAME is the database name.

The SECRETKEY should be set to a random string, this is used in encrypting JSON Web Token for sessionless authentication between the Backend and Frontend.

Once all that is done, just run the following commands :

```bash
npm start		

# If you have Nodemon install run

npm run dev 	# For refreshing of server on code updation. Useful when you're developing.
```

The app should be setup now.

## Routes

The API serves the following routes : 

* POST **/register** : Route to register a user. Needs username, password and email in the request body.
* POST **/login** : Route to login a user, returns a Signed JWT with the userid of the user if user exits. Needs username and password in the request body.
* POST **/submitpost** : Route to submit a post on behalf of a user, takes the token, postTitle, postContent in the request body.
* GET **/posts** : Returns a dump of 10 posts in the database for all the users, in descending order of their timestamps (Latest First). Returns **next** and **prev** along with the posts to signify if there are more posts upcoming or before the page. To get a specific page, just send a query parameter **page** set to the page no you want to posts from.

... For more routes and information, just read the **index.js** file in the directory, it contains detailed Express code and documenation for each route.

## Hosting

Host the backend on a service that supports Node.js and MySQL Hosting. Or you could use a service like CloudSQL and a seperate Node.js service like Glitch or Heroku. Or you could just deploy it all in a container on a service like Digital Ocean.