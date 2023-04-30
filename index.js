const bcrypt = require('bcrypt');
const saltRounds = 10;
const express = require('express');
const cors = require ('cors');
const jwt = require('jsonwebtoken');
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
var bodyParser = require("body-parser");
const app = express();
const port = process.env.PORT || 2223
const dotenv = require('dotenv');
const mongoClient = require('mongodb').MongoClient
dotenv.config();

process.env.TOKEN_SECRET;

var username = 'debian';
function generateAccessToken(username) {
  return jwt.sign(username, process.env.TOKEN_SECRET, { expiresIn: '1800s' });
}

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]
  console.log(req.ip)
                if(token == process.env.TOKEN_SECRET){
                        next()

                }
                else{
                        return res.status(401).send("Échec de la connection");
                }
}

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json())
app.listen(port, () => console.log('Listen on port ' + port))

app.use(cors());
var url = "mongodb://127.0.0.1:27017/?directConnection=true&serverSelectionTimeoutMS=2000&appName=mongosh+1";
app.get("/users", (req, res, authenticateToken) => {
  mongoClient.connect(url, function(err, db) {
    if (err) throw err
    var dbo = db.db("dev")
    dbo.collection("users").find({},{projection: {username:1}}).toArray(function(err, result) {
      if (err) throw err
      console.log(result)
      res.send(result)
    db.close()
    })
  })
})

app.get("/api/authenticate/:user/:password", authenticateToken, function(req, res){
    mongoClient.connect(url, function(err, db) {
      if (err) throw err
      var dbo = db.db("dev")
      var paramUser = req.params.user;
      var paramPassword = req.params.password;
      dbo.collection("users").find({username: paramUser, password:paramPassword}).toArray(function(err, result){
             if (err) throw err
             if (result != "") res.send(true)
             else res.send(false)
          db.close()
      })
    })
  })
  
  app.get("/api/getUser", authenticateToken, function(req, res){
    mongoClient.connect(url, function(err, db) {
      if (err) throw err
      var dbo = db.db("dev")
      dbo.collection("users").find({}, {projection: {'username':1}}).toArray(function(err, result) {
        if (err) throw err
        console.log(result)
        res.send(result)
        db.close()
      })
    })
  })
  
  app.get("/api/getTag", authenticateToken, function(req, res){
    mongoClient.connect(url, function(err, db) {
      if (err) throw err
      var dbo = db.db("dev")
      dbo.collection("users").find({}, {projection: {'31UID':1}}).toArray(function(err, result) {
        if (err) throw err
        console.log(result)
        res.send(result)
        db.close()
      })
    })
  })
  
  app.get("/api/getLogs", authenticateToken, function(req, res) {
    mongoClient.connect(url, function(err, db) {
      if (err) throw err
      var dbo = db.db("dev")
      dbo.collection("logs").find().sort({date:-1}).toArray(function(err, result) {
        if (err) throw err
        console.log(result)
        res.send(result)
        db.close()
      })
    })
  })
  
  app.get("/api/getSerrures", authenticateToken, function(req, res, next){
     mongoClient.connect(url, function(err, db) {
      if (err) throw err
      var dbo = db.db("dev")
      dbo.collection("serrure").find().toArray(function(err, result) {
        if (err) throw err
        console.log(result)
        res.send(result)
        db.close()
      })
    })
  })
  
  app.get("/api/saveToLogs/:user/:tag/:value/:date", authenticateToken, function(req, res) {
    mongoClient.connect(url, function(err, db){
      if (err) throw err
      var dbo = db.db("dev")
      var paramUser = req.params.user;
      var paramTag = req.params.tag;
      var paramValue = req.params.value;
      var paramDate = req.params.date
      console.log(paramUser, paramTag, paramValue, paramDate)
      var myObj = {user: paramUser ,tag: paramTag, value: paramValue, date: paramDate}
      dbo.collection("logs").insertOne(myObj, function(err, res) {
          if (err) throw err;
          console.log("1 document inserted");
          db.close();
    })
  
    })
  
  })
  
  app.get("/api/verifyTag/:tag",authenticateToken, function(req, res){
    mongoClient.connect(url, function(err, db) {
      if (err) throw err
      var param = req.params.tag;
      var IsFind = false;
      var dbo = db.db("dev")
      console.log(param)
      dbo.collection("users").find({'31UID': param}).toArray(function(err, result) {
          if (err) throw err
          console.log(result)
          if (result.length == 0){
             IsFind = false
          }
          else{
             IsFind = true
          }
          res.send(IsFind)
          db.close()
      })
    })
  
  })