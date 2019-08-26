import React, { useState, useEffect } from "react";
import Header from "./header";
import checkLogin from "./loginChecker";
import { Link } from "react-router-dom";
import Footer from "./footer";
import HoveringButton from "./hoveringButton";

// Images and other stuff.

import bioImage from "./files/short_bio.png";
import task from "./files/task.png";

const Home = () => {
  const [isLoggedIn, logger] = useState(false);

  useEffect(() => {
    document.title = "Median";
    logger(checkLogin());
  }, []);

  const logOut = e => {
    if (checkLogin()) {
      // If the user is indeed logged in.
      // Remove the token from the localStorage.

      localStorage.removeItem("f-token");
      logger(false); // Update the state.
    }
  };

  return (
    <div id="home">
      <Header loggedIn={isLoggedIn} logOutFunc={logOut} />
      <div id="intro" className="section descBox row">
        <div className="col-md-6">
          <img src={bioImage} alt="Description" className="containedImage" />
        </div>
        <div className="ColToPad col-md-6">
          <h2>Connecting Everyone</h2>
          <br />
          <p>
            One Blog Post at a time.
            <br />
            <br />
            Welcome to Median, a blog platform built for people to stare stuff,
            and best of all, we don't group the posts on the basis of anything.
          </p>
          <br />
          <Link to="/login">
            <div className="btn btn-primary">Login</div>
          </Link>
          &nbsp;&nbsp;
          <Link to="/register">
            <div className="btn btn-info">Register</div>
          </Link>
        </div>
      </div>
      <div className="section" style={{ background: "#029285" }}>
        <div className="descBox row">
          <div className="ColToPad col-md-6" style={{ color: "white" }}>
            <h2>Unlimited. Fast. Secure.</h2>
            <br />
            <p>
              The platform nails the fundamentals of a great experience.
              <br />
              Make Unlimited Posts, Make them fast. And noone wihout your
              password will ever have access to your posts to edit.
            </p>
            <br />
            <div>
              <Link to="/login">
                <div className="btn btn-danger">Try It Out</div>
              </Link>
            </div>
          </div>
          <div className="col-md-6">
            <img src={task} alt={"Task"} className="containedImage" />
          </div>
        </div>
        <HoveringButton link={"/create"} />
      </div>
      <Footer />
    </div>
  );
};

export default Home;
