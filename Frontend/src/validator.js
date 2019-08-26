import less from "lesser.js";

export default function isValid(token) {
  // Function to check if a token is valid.
  // By making an AJAX Call to the appropriate backend route.

  const BACKEND = process.env.REACT_APP_BACKEND || "http://localhost";

  if (token) {
    const payLoad = JSON.stringify({ token });
    less.AJAX(
      "POST",
      BACKEND + "/validate",
      req => {
        if (req.status === 200) return true;
        // Valid Token.
        else return false; // Invalid Token.
      },
      payLoad
    );
  }

  return false; // Return false if the token is not passed.
}
