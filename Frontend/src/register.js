import React from "react";
import Header from "./header";
import { Link } from "react-router-dom";
import checkLogin from "./loginChecker";

const less = require("lesser.js"); // For making AJAX Requests.

class Register extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      loggedIn: this.props.loggedIn || false,
      message: "",
      messageType: "none"
    };

    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleSubmit(e) {
    e.preventDefault();

    let username = escape(less.getById("username").value),
      password = escape(less.getById("password").value),
      email = escape(less.getById("email").value);

    if (username === password || password === email || username === email) {
      this.setState(() => {
        return {
          message: "One or more input fields match.",
          messageType: "error"
        };
      });
    } else if (!/[\^%$#@!*/\\()]/.test(password) || !/[0-9]/.test(password)) {
      this.setState(() => {
        return {
          message:
            "Password must conatin at least one special character \n and one numeric character.",
          messageType: "error"
        };
      });
    } else if (password.length < 8) {
      this.setState(() => {
        return {
          message: "Password too short.",
          messageType: "error"
        };
      });
    } else {
      // Validations over, now checking the registering route.

      let payLoad = JSON.stringify({ username, password, email });

      // Making the AJAX Call to submit the user details.

      less.AJAX(
        "POST",
        process.env.REACT_APP_BACKEND + "/register",
        req => {
          let reqJSON = JSON.parse(req.response);

          if (req.status === 200) {
            // Show a successful registration message and redirect the user to the login page.

            this.setState(() => {
              return {
                loggedIn: true,
                message: "Successfully Registered.",
                messageType: "success"
              };
            });

            window.location = "/login";
          } else {
            if (reqJSON.error) {
              this.setState(() => {
                return {
                  message: reqJSON.error,
                  messageType: "error",
                  loggedIn: false
                };
              });
            } else {
              this.setState(() => {
                return {
                  message: "Internal Server Error.",
                  messageType: "error",
                  loggedIn: false
                };
              });
            }
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
        payLoad
      );
    }
  }

  componentDidMount() {
    document.title = "Median - Register";
    if (checkLogin() === true) window.location = "/"; // User cannot register if they are already logged in.
  }

  render() {
    return (
      <div id="registerpage">
        <Header loggedIn={this.state.loggedIn} />
        <br />
        <div className="registerContainer">
          <form
            method="POST"
            action=""
            id="registerform"
            onSubmit={this.handleSubmit}
          >
            <h3>Register</h3>
            <br />
            {this.state.messageType === "none" ? (
              this.state.message
            ) : this.state.messageType === "error" ? (
              <div className="alert alert-danger">{this.state.message}</div>
            ) : this.state.messageType === "success" ? (
              <div className="alert alert-success">
                Registered Successfully!
              </div>
            ) : (
              ""
            )}
            <input
              type="text"
              id="username"
              placeholder="Username"
              className="form-control"
              required
            />
            <br />
            <input
              type="email"
              id="email"
              placeholder="Email"
              className="form-control"
              required
            />
            <br />
            <input
              type="password"
              id="password"
              placeholder="Password"
              className="form-control"
              required
            />
            <br />
            <button type="submit" className="btn btn-primary">
              Register
            </button>
            <br />
            <br />
            <Link to={"/login"}>Login</Link>
          </form>
        </div>
      </div>
    );
  }
}

export default Register;
