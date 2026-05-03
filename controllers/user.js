const User = require("../models/user.js");
const ExpressError = require("../utils/ExpressError.js");

module.exports.renderSignup = (req, res) => {
  res.render("users/signup.ejs");
};

module.exports.signup = async (req, res, next) => {
  try {
    let { username, email, password } = req.body;
    const newUser = new User({ email, username });
    const registeredUser = await User.register(newUser, password);

    req.login(registeredUser, (err) => {
      if (err) {
        return next(err);
      }
      req.flash("success", "welcome to wanderlust !");
      res.redirect("/listings");
    });
  } catch (err) {
    if (err && err.name === "UserExistsError") {
      req.flash("error", "Username already exists. Please choose another username.");
      return res.redirect("/signup");
    }

    next(err);
  }
};

module.exports.renderLogin = (req, res) => {
  res.render("users/login.ejs");
};

module.exports.loginRedirect = async (req, res) => {
  req.flash("success", "welcome back to wanderlust");
  const redirectUrl = res.locals.redirectUrl || "/listings";
  res.redirect(redirectUrl);
};

module.exports.logout = (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    req.flash("success", "you are looged out!");
    res.redirect("/listings");
  });
};
