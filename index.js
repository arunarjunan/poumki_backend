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

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log(`User connected ${socket.id}`);
  socketConnect = socket
});
//mongoose.connect("mongodb://localhost:27017/poukmi", {

mongoose.connect("mongodb+srv://aruna3313:arun3313@poukmi.yswnsws.mongodb.net/poukmi?retryWrites=true&w=majority", {
  useNewUrlParser: true,
});

app.post("/insert", async (req, res) => {
  const user = new UserModel({
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    email: req.body.email,
  });
  try {
    await user.save();
    if (socketConnect) {
       socketConnect.emit("user_added");
    } else {
      console.log("socketConnect user failed");
    }
    res.status(200).send("user_added");
    
  } catch (err) {
    console.log(err);
  }
});

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


app.get("/delete", async (req, res) => {
    const id = req.query.id;
  
    UserModel.findByIdAndDelete(id, function (err, docs) {
        if (err){
            console.log(err)
            res.send("Error : "+err)
        }
        else{
          socketConnect.emit("user_added");
          res.status(200).send("Deleted : "+id);
        }
    });
  });

  app.get("/s3url", async (req, res) => {
    const url = await generateUploadURL();
    res.send({ url });
  });

  app.get("/test", async (req, res) => {
    res.status(200).send("Server working :");
  });

server.listen(3001, () => {
  console.log("Server runnning on port 3001...");
});
