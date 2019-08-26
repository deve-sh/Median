import React from "react";
import { Link } from "react-router-dom";

export default function Post(props) {
  return (
    <div className="post" pid={props.pid}>
      <Link to={"/post?pid=" + props.pid}>
        <div className="postTitle">{props.title}</div>
      </Link>
      <div className="postDesc">{props.desc}</div>
      <div className="postTime">
        {props.created}
        &nbsp;&nbsp;&nbsp;&nbsp;
        {props.deleteFunc ? (
          <span
            className="btn btn-danger"
            pid={props.pid}
            onClick={props.deleteFunc}
            title={"Delete Post"}
            style={{ cursor: "pointer" }}
          >
            <i className="fas fa-trash" />
          </span>
        ) : (
          ""
        )}
      </div>
    </div>
  );
}

Post.defaultProps = {
  pid: 0,
  created: "",
  deleteFunc: null,
  title: ""
};
