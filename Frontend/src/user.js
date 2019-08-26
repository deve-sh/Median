import React, { useState, useEffect } from "react";
import Header from "./header";
import checkLogin from "./loginChecker";
import less from "lesser.js";
import Post from "./postComp";
import Footer from "./footer";
import { Link } from "react-router-dom";
import HoveringButton from "./hoveringButton";

const User = props => {
  // State Variables.

  const [isLoggedIn, logger] = useState(false);
  const [user, updateUser] = useState({}); // User Object.
  const [userPosts, postsUpdater] = useState({ posts: [] }); // State Variable to keep track of the posts of the user.
  const [currentPage, pageChanger] = useState(1); // State Variable to keep track of the page number.
  const [errorMessage, messager] = useState(""); // Any error message the user might have to show or see.

  useEffect(() => {
    // Scripts to run on the loading of the User Component.
    document.title = "Median - Dashboard";
    logger(checkLogin());

    // Making an AJAX Call to get the info about the user.

    if (checkLogin() === true) {
      let token = localStorage.getItem("f-token");

      less.AJAX(
        "POST",
        process.env.REACT_APP_BACKEND + "/getuser",
        req => {
          const json = JSON.parse(req.response);

          if (req.status !== 200) {
            messager(json.error);
          } else {
            updateUser(json);

            // Now that we have the user, its time to get the posts of the user.
            // Starting from page 1.

            getPosts(1, token);
          }
        },
        JSON.stringify({ token })
      );
    } else {
      // Do nothing if the user isn't logged in.
      logOut(); // Log the user out and send them to the homepage.
    }
  }, []);

  const getPosts = async (page = 1, token = "") => {
    // Function to make an AJAX Call to the Backend to get the posts registered against the user.

    let payLoad = JSON.stringify({ token, page });

    await less.AJAX(
      "POST",
      process.env.REACT_APP_BACKEND + "/userposts",
      req => {
        let json = JSON.parse(req.response);

        if (req.status !== 200) {
          messager(json.error);

          setTimeout(() => {
            // Remove the error message after 5 seconds.
            messager("");
          }, 5000);
        } else {
          pageChanger(page);
          postsUpdater(json);
        }
      },
      payLoad
    );
  };

  const logOut = e => {
    if (checkLogin()) {
      // If the user is indeed logged in.
      // Remove the token from the localStorage.

      localStorage.removeItem("f-token");
      logger(false); // Update the state.
      window.location = "/";
    } else {
      logger(false);
      window.location = "/"; // User is already logged out and not supposed to be in.
    }
  };

  const getPreviousPosts = () => {
    // Function to  get next page of posts.

    const token = localStorage.getItem("f-token");

    if (currentPage > 1) {
      const page = currentPage - 1;

      let payLoad = JSON.stringify({ token, page });

      less.AJAX(
        "POST",
        process.env.REACT_APP_BACKEND + "/userposts",
        req => {
          let json = JSON.parse(req.response);

          if (req.status !== 200) {
            messager(json.error);

            setTimeout(() => {
              // Remove the error message after 5 seconds.
              messager("");
            }, 5000);
          } else {
            pageChanger(page);
            postsUpdater(json);
          }
        },
        payLoad
      );
    }
  };

  const deletePost = e => {
    // Function to delete a post.

    e.preventDefault();

    // Making an AJAX Call to delete the post.

    if (checkLogin()) {
      const token = localStorage.getItem("f-token");

      let pid = e.target.getAttribute("pid");

      if (!pid) {
        // The user most likely tapped the icon, which does not have a pid attribute.
        pid = e.target.parentElement.getAttribute("pid");
      }

      const payLoad = {
        token,
        pid
      };

      // Make a delete request to the backend to remove the post.

      if (window.confirm("Are you sure you want to delete this post?")) {
        less.AJAX(
          "DELETE",
          process.env.REACT_APP_BACKEND + "/deletepost",
          req => {
            let json = JSON.parse(req.response);

            if (req.status !== 200) {
              messager(json.error);

              setTimeout(() => {
                // Remove the error message after 5 seconds.
                messager("");
              }, 5000);
            } else {
              // Now make another request to get the updated list of posts.

              if (userPosts.posts.length === 1) {
                // If there was only one post on the current page.
                // Then get the previous page.

                // But check if the current page is not equal to 1.

                if (currentPage !== 1) {
                  getPreviousPosts();
                } else {
                  getPosts(1, token);
                }
              } else {
                getPosts(currentPage, token);
              }
            }
          },
          JSON.stringify(payLoad)
        );
      }
    }
  };

  const getNextPosts = () => {
    // Function to get next page of posts. If any.

    const token = localStorage.getItem("f-token");

    if (currentPage > 0) {
      const page = currentPage + 1;

      let payLoad = JSON.stringify({ token, page });

      less.AJAX(
        "POST",
        process.env.REACT_APP_BACKEND + "/userposts",
        req => {
          let json = JSON.parse(req.response);

          if (req.status !== 200) {
            messager(json.error);

            setTimeout(() => {
              // Remove the error message after 5 seconds.
              messager("");
            }, 5000);
          } else {
            pageChanger(page);
            postsUpdater(json);
          }
        },
        payLoad
      );
    }
  };

  return (
    <div id="user">
      <Header loggedIn={checkLogin()} logOutFunc={logOut} />
      {isLoggedIn ? (
        <div id="userContainer">
          {errorMessage ? (
            <div className="errorContainer alert alert-danger">
              {errorMessage}
            </div>
          ) : (
            ""
          )}
          Hey There {user.username}!
          <br />
          <br />
          You have {userPosts.totalPosts ? userPosts.totalPosts : "no"}{" "}
          {userPosts.totalPosts === 0
            ? "no posts"
            : userPosts.totalPosts > 1
            ? "posts"
            : "post"}
          .
          <br />
          <br />
          <Link to="/create" title={"Create a post"}>
            <button className="btn btn-success">
              <i className="fas fa-plus" />
              {"  "}&nbsp; Create Post
            </button>
          </Link>
          &nbsp; &nbsp;
          <Link to="/updatePass" title={"Update Password"}>
            <button className="btn btn-primary">
              <i className="fas fa-key" /> &nbsp; Change Password
            </button>
          </Link>
          <br />
          <br />
          <div id="postsContainer">
            {userPosts.posts.length > 0 ? (
              userPosts.posts.map((post, count) => (
                <Post
                  pid={post.postid}
                  key={count}
                  title={unescape(post.postTitle)}
                  desc={
                    unescape(post.postContent).length > 100
                      ? unescape(post.postContent)
                          .replace(/<\/?[^>]+(>|$)/g, " ")
                          .slice(0, 100) + "..."
                      : unescape(post.postContent).replace(
                          /<\/?[^>]+(>|$)/g,
                          " "
                        )
                  }
                  created={post.created}
                  deleteFunc={deletePost}
                />
              ))
            ) : (
              <div style={{ textAlign: "center", marginTop: "2rem" }}>
                <div className="bigIcon">
                  <i className="fas fa-file-alt fa-3x" />
                </div>
                <br />
                <br />
                No Post Found
              </div>
            )}
            <br />
            {/* Next and Prev Buttons depending on the state of posts. */}
            {/* Previous Page Button */}
            {userPosts.prev ? (
              <span
                className="btn btn-info"
                style={{ cursor: "pointer" }}
                onClick={getPreviousPosts}
              >
                <i className="fas fa-arrow-left" />
              </span>
            ) : (
              ""
            )}
            &nbsp;&nbsp;
            {/* Next Page Button */}
            {userPosts.next ? (
              <span
                className="btn btn-info"
                style={{ cursor: "pointer" }}
                onClick={getNextPosts}
              >
                <i className="fas fa-arrow-right" />
              </span>
            ) : (
              ""
            )}
            <HoveringButton link="/create" />
          </div>
        </div>
      ) : (
        "Unauthorised Access. Kindly Login to Continue."
      )}
      <Footer />
    </div>
  );
};

export default User;
