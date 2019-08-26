import React from "react";
import Header from "./header";
import Footer from "./footer";
import { AJAX } from "lesser.js";
import checkLogin from "./loginChecker";

// Useful Functions.

function getQueryP() {
  // Function to get a query parameter from the URL.

  let currentUrl = window.location;

  currentUrl = new URL(currentUrl);

  let pid = currentUrl.searchParams.get("pid");

  if (pid) return pid;

  return "";
}

export default class PostPage extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      postId: 0,
      loggedIn: false,
      username: "",
      errorMessage: "",
      post: { title: "", content: "Loading ...", created: "" }
    };

    this.logOut = this.logOut.bind(this);
  }

  componentDidMount() {
    // Check if the user is logged In.

    document.title = "Median - Post";

    this.setState({
      loggedIn: checkLogin()
    });

    // Make an AJAX Call to the backend to get the post and the userId.

    let pid = getQueryP();

    if (pid) {
      AJAX(
        "GET",
        process.env.REACT_APP_BACKEND + "/getpost?pid=" + pid,
        req => {
          let json = JSON.parse(req.response);

          if (req.status !== 200) {
            // If an error occured while retreiving the Post.

            this.setState({
              errorMessage: json.error,
              post: { title: "", content: "", created: "" }
            });
          } else {
            // If the request was successful.

            this.setState({
              post: {
                title: unescape(json.postTitle),
                content: unescape(json.postContent),
                created: unescape(json.created)
              }
            });

            let userid = json.userid;

            // Now making another AJAX Request to get the details of the user.

            AJAX(
              "GET",
              process.env.REACT_APP_BACKEND + "/getusername?userid=" + userid,
              req => {
                let json = JSON.parse(req.response);

                if (req.status !== 200) {
                  this.setState({
                    errorMessage: json.error
                  });
                } else {
                  this.setState({
                    username: json.username
                  });

                  document.title = "Median - " + this.state.post.title;
                }
              }
            );
          }
        }
      );
    } else {
      this.setState({
        errorMessage: "Need Post ID to get the details of the Post.",
        post: { title: "", content: "", created: "" }
      });
    }
  }

  // Logout Function

  logOut() {
    if (checkLogin()) {
      localStorage.removeItem("f-token");

      this.setState({
        loggedIn: false
      });
    }
  }

  render() {
    return (
      <React.Fragment>
        <Header loggedIn={checkLogin()} logOutFunc={this.logOut} />
        <div id="postPage">
          {this.state.errorMessage ? (
            <div className="alert alert-danger">{this.state.errorMessage}</div>
          ) : (
            ""
          )}
          <div id="postTitle">{this.state.post.title}</div>
          <div id="createdAt">{this.state.post.created}</div>
          <br />- By <span id="userName">{this.state.username}</span>
          <br />
          <br />
          <div
            id="postContent"
            dangerouslySetInnerHTML={{ __html: this.state.post.content }}
          />
        </div>
        <Footer />
      </React.Fragment>
    );
  }
}
