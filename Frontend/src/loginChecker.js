function checkLogin() {
  if (localStorage.getItem("f-token")) {
    return true;
  }
  return false;
}

export default checkLogin;
