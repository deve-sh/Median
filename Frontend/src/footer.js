import React from "react";

const Footer = props => {
  return (
    <footer>
      <div className="descBox row">
        <div className="col-8">
          Made by{" "}
          <a
            href="https://deve-sh.github.io"
            target="_blank"
            rel="noopener noreferrer"
          >
            Devesh
          </a>
          .
        </div>
        <div className="col-4" style={{ textAlign: "right" }}>
          <a
            href="https://github.com/deve-sh"
            target="_blank"
            rel="noopener noreferrer"
          >
            <i className="fab fa-github fa-lg" />
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
