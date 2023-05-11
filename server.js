const express = require('express');
const formData = require("express-form-data");
const cors = require('cors');
const os = require("os");
const bodyParser = require('body-parser');
const mongoose = require("mongoose");
const User = require("./model/user");
const bcrypt = require('bcryptjs');    
const {JWT_SECRET} = require("./config/jwtTokenKey");
require("dotenv").config(); 
require("./config/dbconfig")
const jwt = require("jsonwebtoken");
const Response = require("./classes/Response");
const cookieParser = require('cookie-parser')
const app = express();

const bcryptSalt = bcrypt.genSaltSync(10);

app.use(cors({
    credentials:true, 
    origin:'http://localhost:3000'
}));

app.use(express.json());
app.use(cookieParser())

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
        if(userDoc){
            const passOK = bcrypt.compareSync(password,userDoc.password)
            if(passOK){
                jwt.sign({email:userDoc.email,id:userDoc._id},JWT_SECRET,{},(err,token)=>{
                  if(err) throw err;
                  res.cookie('token',token).json(userDoc); 
                });
            }else{
                res.status(422).json("pass not Ok"); 
            }
        }else{
            res.json('not found')
        }
    }catch(err){
        console.log("e--------------",err) 
        res.json('not found',err)
    }
});

app.get('/profile',(req,res)=>{
    const {token} = req.cookies;
    if(token){
          jwt.verify(token,JWT_SECRET,{}, (err , user)=>{
            if(err) throw err;
            res.json(user);
          });
    }else{
        res.json(null);
    }
})

app.listen(4000, () => 
  console.log('Server listening on port 4000!'),
);
