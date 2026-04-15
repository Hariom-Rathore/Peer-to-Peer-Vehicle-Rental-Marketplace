//this file make for authenticate the user that user is login h ya nahi 
const isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) { //this function predefined into the passport
    //redirectUrl save becoze after the changes or some work this is come on the same page
    req.session.redirectUrl=req.originalUrl;
        req.flash("error", "You must be logged in to create listing");
        return res.redirect("/login");
    }
    next();
};

module.exports = { isLoggedIn };


//redirecturl is not a
module.exports.saveRedirectUrl=(req,res,next)=>{
    if(req.session.redirectUrl){
        res.locals.redirectUrl=req.session.redirectUrl;
    }
    next();
};