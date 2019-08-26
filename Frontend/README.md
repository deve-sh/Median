# Median - Frontend

Welcome to the documentation for the frontend of Median. If you wanna know more about Median in general, just [click here](https://github.com/deve-sh/Median).

## What it is.

The frontend of Median is a React Application that is connected to its backend using AJAX Requests, for every post, user, and user's post, an AJAX Request is sent to the backend.

The application consists of multiple components which are linked together using `React-Router-DOM`. Each route has a specific component and behaviour associated with it. The entire system is sessionless and authentication of users is done using [JWT](https://github.com/auth0/node-jsonwebtoken) in the backend and sent to the frontend.

The app stores the token of access (JWT) in the localStorage, so it is advised not to flush the localStorage very often until you really need to.

## Setting Up

Clone the repo and cd into it. Change the directory further into `frontend` and run the following command : 

```bash
npm install
```

This shall install all dependencies, create a **.env.** file and add a field `REACT_APP_BACKEND` to it and set it to your app's backend.

Then

```bash
npm start
```

The app should be set up. Edit is just like any React App as you would.

## Components

Almost every component is commented and used in the application, some that haven't been used are reserved for future feature implementations. Just view any JavaScript file in `src` folder, its bound to have some Component or functionality associated with it.

### Open Source Libraries Used

* [Bootstrap](https://getbootstrap.com)
* [Lesser.js](https://npmjs.com/lesser.js) - For AJAX Request and reducing the amount of code written, after all I wrote it. 😛
* [React](https://reactjs.org)
* [React Router DOM](https://npmjs.com/react-router-dom)