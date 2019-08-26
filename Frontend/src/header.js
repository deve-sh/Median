import React from "react";
import { Link } from "react-router-dom";

const Header = props => {
  return (
    <div id="head">
      <div className="row headerContainer">
        <div className="col-4" style={{ textAlign: "left" }}>
          <strong>
            <Link to="/" title={"Home"}>
              Median
            </Link>
          </strong>
        </div>
        <div className="col-8" style={{ textAlign: "right" }}>
          <Link to="/posts" title={"View Posts"}>
            <i className="far fa-list-alt fa-lg" />
          </Link>
          &nbsp;&nbsp;&nbsp;&nbsp;
          {props.loggedIn === false ? (
            <span>
              <Link to="/login" title="Login">
                <i className="fas fa-door-open fa-lg" />
              </Link>
              &nbsp;&nbsp;&nbsp;&nbsp;
              <Link to="/register" title="Register">
                <i className="fas fa-user-plus fa-lg" />
              </Link>
            </span>
          ) : (
            <span>
              <span className="userPanelButton">
                <Link to="./user" title={"Dashboard"}>
                  <i className="fas fa-user fa-lg" />
                </Link>
              </span>
              &nbsp;&nbsp;&nbsp;
              {/* Display the logout button only if the logout function has been passed. */}
              {props.logOutFunc ? (
                <span
                  className="logoutButton"
                  title={"Logout"}
                  onClick={props.logOutFunc}
                >
                  <i className="fas fa-door-closed fa-lg" />
                </span>
              ) : (
                <span />
              )}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

Header.defaultProps = {
  loggedIn: false
};

export default Header;
