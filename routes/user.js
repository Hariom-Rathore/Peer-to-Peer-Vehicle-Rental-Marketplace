const express = require("express");
const router = express.Router();
const User = require("../models/user.js");
const passport =require("passport"); 
const { saveRedirectUrl } = require("../utils/middleware.js");

router.get("/signup",(req,res)=>{
   res.render("users/signup.ejs"); 
});

router.post("/signup", async(req,res,next)=>{
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
});

//make a login form
router.get("/login",(req,res)=>{
   res.render("users/login.ejs");
});

//ye phle authnticate karega ki user  h ya nahi this make a passport middleware
router.post("/login",saveRedirectUrl,passport.authenticate("local",{
   failureRedirect:"/login",
failureFlash:true,}),
async(req,res)=>{
req.flash("success","welcome back to wanderlust");
const redirectUrl = res.locals.redirectUrl || "/listings";
res.redirect(redirectUrl);//it is use because when i click soething after this again its come this path
}
);
 
//this is for logedout and its pr
router.get("/logout",(req,res,next)=>{
   req.logout((err)=>{
if(err){
 return  next(err);
}req.flash("success","you are looged out!");
res.redirect("/listings");
   })
})

module.exports=router;