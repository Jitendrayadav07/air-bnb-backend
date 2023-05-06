const express = require('express');
const formData = require("express-form-data");
const cors = require('cors');
const os = require("os");
const bodyParser = require('body-parser');
const mongoose = require("mongoose");
const User = require("./model/user");
const bcrypt = require('bcrypt');    
const {JWT_SECRET} = require("./config/jwtTokenKey");
require("dotenv").config(); 
require("./config/dbconfig")
const jwt = require("jsonwebtoken");
const Response = require("./classes/Response");
const app = express();

const bcryptSalt = bcrypt.genSaltSync(10);

app.use(cors({
    credentials:true, 
    origin:'http://localhost:3000'
}));

app.use(express.json());

app.get('/test',(req,res) =>{
    res.json('test ok');
});

app.post('/register', async (req,res) =>{
    const {name,email,password} = req.body;
    try{
        const userDoc = await User.create({
            name,
            email,
            password:bcrypt.hashSync(password, bcryptSalt),
        });
        res.status(200).send(Response.sendResponse(true, userDoc, null, 200));
    }catch(err){
        return res.status(500).send(Response.sendResponse(false, null, err, 500));
    }
});

app.post('/login', async (req,res) => {
    try{
        let {email,password} = req.body;
        let userDoc = await User.findOne({email});
        console.log("userDocdffffffffffffffffff",userDoc)
        if(!userDoc)

        return res.status(404).send(Response.sendResponse(false, null, "Email or Password Invalid", 404));

        let passwordMatch = await bcrypt.compare(password,userDoc.password)

        if (!passwordMatch)
        return res.status(404).send(Response.sendResponse(false, null, "Email or Password Invalid", 404));
        
        delete userDoc.password;
        // JWT Token creation
        const token = jwt.sign({email : userDoc.email ,id: userDoc._id},JWT_SECRET, { expiresIn: "24h"});

        userDoc['token'] = token;

        const user = {
            _id : userDoc._id,
            name : userDoc.name,
            email: userDoc.email,
        }
        res.status(200).send(Response.sendResponse(true, user, null, 200));
    }catch(err){
        console.log("e--------------",err) 
        return res.status(500).send(Response.sendResponse(false, null, err, 500));
    }
});

app.listen(4000, () => 
  console.log('Server listening on port 4000!'),
);
