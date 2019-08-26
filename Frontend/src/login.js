import React from "react";
import Header from "./header";
import checkLogin from "./loginChecker";
import { Link } from "react-router-dom";

const less = require("lesser.js");

function login(token) {
  localStorage.setItem("f-token", token.toString());
}

class Login extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      loggedIn: checkLogin() || false,
      message: "",
      messageType: "none"
    };

    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleSubmit(e) {
    e.preventDefault();

    let usernameBox = less.getById("usernameInput"),
      passwordBox = less.getById("passwordInput");

    const username = usernameBox.value,
      password = passwordBox.value;

    const postMessage = JSON.stringify({ username, password });

    less.AJAX(
      "POST",
      process.env.REACT_APP_BACKEND + "/login",
      req => {
        let response = JSON.parse(req.response);

        if (req.status !== 200) {
          this.setState({
            // Request Gone Wrong.
            loggedIn: false,
            message: "Invalid Credentials",
            messageType: "error"
          });
        } else if (response.token) {
          this.setState({
            loggedIn: true,
            message: "Logged In Successfully",
            messageType: "success"
          });

          login(response.token); // Login the user and redirect them to the /user route.

          window.location = "/user";
        } else {
          this.setState({
            // Invalid Token.
            loggedIn: false,
            message: "Invalid Credentials",
            messageType: "error"
          });
        }

        if (this.state.message) {
          // Remove the message after 3 seconds.

          setTimeout(() => {
            this.setState({
              message: "",
              messageType: ""
            });
          }, 3000);
        }
      },
      postMessage
    );
  }

  componentDidMount() {
    document.title = "Median - Login";
    if (checkLogin() === true) window.location = "/user"; // Redirect user to user page if they have already logged in.
  }

  render() {
    return (
      <div id="loginpage">
        <Header />
        <br />
        <form
          action=""
          id="loginform"
          method="POST"
          onSubmit={this.handleSubmit}
        >
          <h3>Login</h3>
          <br />
          {this.state.messageType === "none" ? (
            this.state.message
          ) : this.state.messageType === "error" ? (
            <div className="alert alert-danger">{this.state.message}</div>
          ) : this.state.messageType === "success" ? (
            <div className="alert alert-success">Logged In Successfully!</div>
          ) : (
            ""
          )}
          <input
            name="username"
            type="text"
            className="form-control"
            id="usernameInput"
            placeholder="Username or Email"
            required
          />
          <br />
          <input
            name="password"
            type="password"
            className="form-control"
            id="passwordInput"
            placeholder="Password"
            required
          />
          <br />
          <br />
          <button type="submit" className="btn btn-primary">
            Login
          </button>
          <br />
          <br />
          <Link to={"/register"}>Register</Link>
        </form>
      </div>
    );
  }
}

export default Login;
