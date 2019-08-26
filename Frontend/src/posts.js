import React, { useState, useEffect } from "react";
import less from "lesser.js";
import checkLogin from "./loginChecker";
import Header from "./header";
import Post from "./postComp";
import Footer from "./footer";
import HoveringButton from "./hoveringButton";

const PostList = () => {
  // State Variables and their Updaters using React Hooks.

  const [state, setState] = useState({
    posts: [],
    page: 1,
    next: false,
    prev: false
  });

  const [loggedIn, logger] = useState(false);

  // Logout Function

  const Logout = e => {
    if (checkLogin()) {
      // If the user is indeed logged in.
      // Remove the token from the localStorage.

      localStorage.removeItem("f-token");
      logger(false); // Update the state.
    }
  };

  const nextPosts = () => {
    // Function to make an api call for getting next page posts.

    less.AJAX(
      "GET",
      process.env.REACT_APP_BACKEND + "/posts?page=" + (Number(state.page) + 1),
      req => {
        if (req.status === 200) {
          let reqJSON = JSON.parse(req.response);

          if (reqJSON.posts !== undefined) {
            if (reqJSON.posts.length <= 0) {
              setState({
                posts: "No Posts found.",
                next: false,
                prev: false
              });
            } else {
              let reactPosts = reqJSON.posts.map((post, count) => (
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
                />
              ));

              setState({
                posts: reactPosts,
                next: reqJSON.next,
                prev: reqJSON.prev,
                page: reqJSON.page
              });
            }
          } else return;
        } else {
          return;
        }
      }
    );
  };

  const previousPosts = () => {
    // Function to make an AJAX Call to get previos page posts.
    // I know its repetitive. Shut up. I will correct this when I get time.

    if (state.page > 1) {
      less.AJAX(
        "GET",
        process.env.REACT_APP_BACKEND +
          "/posts?page=" +
          (Number(state.page) - 1),
        req => {
          if (req.status === 200) {
            let reqJSON = JSON.parse(req.response);

            if (reqJSON.posts !== undefined) {
              if (reqJSON.posts.length <= 0) {
                setState({
                  posts: "No Posts found.",
                  next: false,
                  prev: false
                });
              } else {
                let reactPosts = reqJSON.posts.map((post, count) => (
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
                  />
                ));

                setState({
                  posts: reactPosts,
                  next: reqJSON.next,
                  prev: reqJSON.prev,
                  page: reqJSON.page
                });
              }
            } else return;
          } else {
            return;
          }
        }
      );
    }
  };

  useEffect(() => {
    document.title = "Median - Posts";
    logger(checkLogin());
    // Make an AJAX Call to the backend to get all the posts.

    less.AJAX("GET", process.env.REACT_APP_BACKEND + "/posts", req => {
      if (req.status === 200) {
        let reqJSON = JSON.parse(req.response);

        if (reqJSON.posts !== undefined) {
          if (reqJSON.posts.length <= 0) {
            setState({ posts: "No Posts found.", next: false, prev: false });
          } else {
            let reactPosts = reqJSON.posts.map((post, count) => (
              <Post
                pid={post.postid}
                key={count}
                title={unescape(post.postTitle)}
                desc={
                  unescape(post.postContent).length > 100
                    ? unescape(post.postContent)
                        .replace(/<\/?[^>]+(>|$)/g, " ")
                        .slice(0, 100) + "..."
                    : unescape(post.postContent).replace(/<\/?[^>]+(>|$)/g, " ")
                }
                created={post.created}
              />
            ));

            setState({
              posts: reactPosts,
              next: reqJSON.next,
              prev: reqJSON.prev,
              page: reqJSON.page
            });
          }
        } else {
          setState({
            posts: "Sorry, an error occured while fetching the posts.",
            next: false,
            prev: false
          });
        }
      } else {
        setState({
          posts: "Sorry, an error occured while fetching the posts.",
          next: false,
          prev: false
        });
      }
    });
  }, []);

  return (
    <div id="postsPage">
      <Header loggedIn={loggedIn} logOutFunc={Logout} />
      <br />
      <br />
      <div className="postsContainer">
        {state.posts === "No Posts found." ? (
          <div style={{ textAlign: "center", marginTop: "6rem" }}>
            <div className="bigIcon">
              <i className="fas fa-file-alt fa-3x" />
            </div>
            <br />
            <br />
            No Post Found
          </div>
        ) : (
          state.posts
        )}
        <br />
        <div className="navButtons" style={{ textAlign: "center" }}>
          {state.prev ? (
            <div
              onClick={previousPosts}
              style={{ cursor: "pointer" }}
              className="prevButton btn btn-info"
            >
              <i className="fas fa-arrow-left" />
            </div>
          ) : (
            ""
          )}
          &nbsp; &nbsp;
          {state.next ? (
            <div
              onClick={nextPosts}
              style={{ cursor: "pointer" }}
              className="nextButton btn btn-info"
            >
              <i className="fas fa-arrow-right" />
            </div>
          ) : (
            ""
          )}
        </div>

        <HoveringButton link={"/create"} />
      </div>
      <br />
      <Footer />
    </div>
  );
};

export default PostList;
