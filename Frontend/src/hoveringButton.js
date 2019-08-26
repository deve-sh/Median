import React from "react";
import { Link } from "react-router-dom";

export default function HoveringButton(props) {
  return (
    <Link to={props.link} title={"Create a new Post"}>
      <div id="hoveringButton">
        <i className="fas fa-plus" />
      </div>
    </Link>
  );
}
