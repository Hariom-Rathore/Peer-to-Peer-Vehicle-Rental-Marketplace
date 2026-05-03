const express = require("express");
const router = express.Router();
const passport = require("passport");
const { saveRedirectUrl } = require("../utils/middleware.js");
const users = require("../controllers/user.js");

router.get("/signup", users.renderSignup);

router.post("/signup", users.signup);

//make a login form
router.get("/login", users.renderLogin);

//ye phle authnticate karega ki user  h ya nahi this make a passport middleware
router.post(
   "/login",
   saveRedirectUrl,
   passport.authenticate("local", {
      failureRedirect: "/login",
      failureFlash: true,
   }),
   users.loginRedirect
);
 
//this is for logedout and its pr
router.get("/logout", users.logout);

module.exports=router;