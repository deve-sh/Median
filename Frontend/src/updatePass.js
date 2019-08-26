// Component to house the route to update a user's password.

import React, { useState, useEffect } from "react";
import { AJAX, get } from "lesser.js";
import Header from "./header";
import Footer from "./footer";
import { Link } from "react-router-dom";
import checkLogin from "./loginChecker";

export default function UpdatePass(props) {
  const [isLoggedIn, logger] = useState(false);
  const [errorMessage, messager] = useState("");
  const [successMessage, success] = useState("");

  useEffect(() => {
    document.title = "Median - Update Password";
    logger(checkLogin());

    if (!checkLogin()) logOut();
  }, []);

  const logOut = e => {
    if (checkLogin()) {
      // If the user is indeed logged in.
      // Remove the token from the localStorage.

      localStorage.removeItem("f-token");
      logger(false); // Update the state.
    }

    window.location = "/login";
  };

  const update = e => {
    e.preventDefault();

    // Function to update the password.

    let password = get("#newpassword")[0].value;

    if (!password) {
      messager("Enter a password please.");
    } else {
      const token = localStorage.getItem("f-token");
      const payLoad = { token, password };

      AJAX(
        "PUT",
        process.env.REACT_APP_BACKEND + "/updatepass",
        req => {
          let json = JSON.parse(req.response);

          if (req.status !== 200) {
            messager(json.error);
          } else {
            success("Password Updated Successfully. Kindly Login Again.");

            setTimeout(logOut, 2000); // Log the user out.
          }
        },
        JSON.stringify(payLoad)
      );
    }

    if (errorMessage) {
      // Remove any error message after 3 seconds.

      setTimeout(() => {
        messager("");
      }, 3000);
    }

    if (successMessage) {
      // Remove any success message after 3 seconds.

      setTimeout(() => {
        success("");
      }, 3000);
    }
  };

  return (
    <React.Fragment>
      <Header loggedIn={checkLogin()} logOutFunc={logOut} />
      <div id="passwordUpdater">
        {isLoggedIn ? (
          <React.Fragment>
            <h2>Update Password</h2>
            <br />

            {errorMessage ? (
              <div className="alert alert-danger">{errorMessage}</div>
            ) : (
              ""
            )}

            {successMessage ? (
              <div className="alert alert-success">{successMessage}</div>
            ) : (
              ""
            )}
            <form onSubmit={update}>
              <input
                type="password"
                className={"form-control"}
                placeholder={"New Password"}
                id="newpassword"
                required
              />
              <br />
              <div style={{ textAlign: "center" }}>
                <button className="btn btn-primary" type="submit">
                  Update Password
                </button>
                &nbsp;&nbsp;&nbsp;
                <Link to="/user">
                  <span className="btn btn-danger">Back</span>
                </Link>
              </div>
            </form>
          </React.Fragment>
        ) : (
          "Unauthorised."
        )}
      </div>
      <Footer />
    </React.Fragment>
  );
}
