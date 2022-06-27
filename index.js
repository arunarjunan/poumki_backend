const express = require("express");
const mongoose = require("mongoose");
const app = express();
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const generateUploadURL = require("./s3.js");

const server = http.createServer(app);

const UserModel = require("./models/User");

app.use(cors());
app.use(express.json());

var socketConnect;

// create socket connection
const io = new Server(server, {
  cors: {
    origin: "http://arunarjunan.co.in",
    methods: ["GET", "POST"],
  },
  transports:['websocket', 'htmlfile', 'xhr-multipart', 'xhr-polling']
});



io.on("connection", (socket) => {

  console.log(`User connected ${socket.id}`);
  socketConnect = socket
});

// MongoDb connection 
mongoose.connect("mongodb+srv://aruna3313:arun3313@poukmi.yswnsws.mongodb.net/poukmi?retryWrites=true&w=majority", {
  useNewUrlParser: true,
});

// Insert user data into DB
app.post("/insert", async (req, res) => {
  const user = new UserModel({
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    email: req.body.email,
  });
  try {
    await user.save();
    if (socketConnect) {
       socketConnect.broadcast.emit("user_added");
    } else {
      console.log("socketConnect user failed");
    }
    UserModel.find({}, function (err, result) {

    res.status(200).send({message:"user_added", data:result});
    });
    
  } catch (err) {
    console.log(err);
  }
});

// Get user data from DB
app.get("/read", async (req, res) => {
    UserModel.find({}, function (err, result) {
      if (err){
          console.log(err);
          res.status(400).send(err);
      }
      console.log("result",result)
      res.status(200).send(result);
  });
});

// Delete user data from DB
app.get("/delete", async (req, res) => {
    const id = req.query.id;
  
    UserModel.findByIdAndDelete(id, function (err, docs) {
        if (err){
            console.log(err)
            res.send("Error : "+err)
        }
        else{
          socketConnect.broadcast.emit("user_added");
          UserModel.find({}, function (err, result) {
            res.status(200).send({message:"user deleted", data:result});
            });
        }
    });
  });

  // Generate S3 bucket file path 
  app.get("/s3url", async (req, res) => {
    const url = await generateUploadURL();
    res.send({ url });
  });

server.listen(3001, () => {
  console.log("Server runnning on port 3001...");
});
