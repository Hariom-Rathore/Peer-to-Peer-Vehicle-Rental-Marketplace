//this file make for authenticate the user that user is login h ya nahi 
const isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.flash("error", "You must be logged in to create listing");
        return res.redirect("/login");
    }
    next();
};

module.exports = { isLoggedIn };