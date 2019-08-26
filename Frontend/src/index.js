// Core Dependency

import React from "react";
import ReactDOM from "react-dom";

// Router

import { BrowserRouter as Router, Route } from "react-router-dom";

// Styles

import "bootstrap/dist/css/bootstrap.css";
import "./styles.css";

// Route Components

import Login from "./login";
import Register from "./register";
import User from "./user";
import Home from "./home";
import Posts from "./posts";
import PostPage from "./post";
import Create from "./create";
import UpdatePass from "./updatePass";

const App = () => {
  return (
    <Router>
      <Route path="/" exact component={Home} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/user" component={User} />
      <Route path="/posts" component={Posts} />
      <Route path="/post" component={PostPage} />
      <Route path="/create" component={Create} />
      <Route path="/updatePass" component={UpdatePass} />
    </Router>
  );
};

const rootElement = document.getElementById("root");
ReactDOM.render(<App />, rootElement);
