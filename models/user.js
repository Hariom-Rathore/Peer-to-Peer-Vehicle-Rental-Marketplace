//This file for the make a scheam for user login information

const mongoose= require("mongoose");
const Schema=mongoose.Schema;
const passportLocalMongoose = require("passport-local-mongoose").default;

const userSchema= new Schema({
    email:{
        type:String,
        required:true
    },
})

userSchema.plugin(passportLocalMongoose);  //its automaticlay store hashed password and salt value into the username

module.exports=mongoose.model("user",userSchema);