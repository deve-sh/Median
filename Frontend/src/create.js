// Page to create a post.

import React, { useState, useEffect } from "react";
import { get, AJAX } from "lesser.js";
import Header from "./header";
import checkLogin from "./loginChecker";
import Footer from "./footer";

export default function Create() {
  const [isLoggedIn, logger] = useState(false);
  const [errorMessage, messager] = useState("");
  const [genMessage, success] = useState("");

  useEffect(() => {
    document.title = "Median - Create Post";

    logger(checkLogin());

    if (!checkLogin()) logOut(); // Redirect the user back home if they are not logged in.
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

  const formSubmitter = e => {
    // Function to submit the post.
    e.preventDefault();

    if (checkLogin()) {
      const postTitle = get("#postTitleField")[0].value,
        postContent = get("#postContentField")[0].innerHTML,
        token = localStorage.getItem("f-token");

      const payLoad = { postTitle, postContent, token };

      AJAX(
        "POST",
        process.env.REACT_APP_BACKEND + "/submitpost",
        req => {
          let json = JSON.parse(req.response);
          if (req.status !== 200) {
            messager(json.error);
          } else {
            // Successfully created post.
            success("Successfully created Post!");
            get("#postTitleField")[0].value = "";
            get("#postContentField")[0].innerHTML = "";
          }
        },
        JSON.stringify(payLoad)
      );
    } else {
      messager("401 : Unauthorised!"); // User not logged in. Or the localStorage has been tampered with.
    }
  };

  if (checkLogin()) {
    return (
      <React.Fragment>
        <Header loggedIn={checkLogin()} logOutFunc={logOut} />
        <div id="creatorPage">
          <h3>Create Post</h3>
          <br />
          {errorMessage ? (
            <div className="alert alert-danger">{errorMessage}</div>
          ) : (
            ""
          )}
          {genMessage ? (
            <div className="alert alert-success">{genMessage}</div>
          ) : (
            ""
          )}
          <input
            type="text"
            placeHolder={"Post Title"}
            className={"form-control"}
            id={"postTitleField"}
            required
          />
          <br />
          Content :
          <br />
          <div
            contentEditable={true}
            holder={"Enter your Post's content."}
            id={"postContentField"}
            style={{ marginTop: "0.6rem" }}
          />
          <br />
          <button onClick={formSubmitter} className="btn btn-primary">
            Create Post
          </button>
          <br />
          <br />
        </div>
        <Footer />
      </React.Fragment>
    );
  } else {
    return (
      <React.Fragment>
        <Header loggedIn={isLoggedIn} logOutFunc={logOut} />
        <div id="creatorPage">Please sign in to continue.</div>
        <Footer />
      </React.Fragment>
    );
  }
}
