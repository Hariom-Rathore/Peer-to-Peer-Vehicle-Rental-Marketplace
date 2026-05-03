const express = require("express");
const router = express.Router();
const passport = require("passport");
const { saveRedirectUrl } = require("../utils/middleware.js");
const users = require("../controllers/user.js");

router
   .route("/signup")
   .get(users.renderSignup)
   .post(users.signup);

router
   .route("/login")
   .get(users.renderLogin)
   .post(

      saveRedirectUrl,
      passport.authenticate("local", {
         failureRedirect: "/login",
         failureFlash: true,
      }),
      users.loginRedirect
   );




//this is for logedout and its pr
router.get("/logout", users.logout);

module.exports = router;