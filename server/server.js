const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const { Server } = require("socket.io");
const http = require("http");
const multer = require("multer");
const path = require("path");

mongoose.connect("mongodb+srv://satish:satish123@chat.xn2dv.mongodb.net/chatDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const Message = mongoose.model("Message", {
  _id: { type: String, required: true },
  senderId: String,
  receiverId: String,
  text: String,
  image: String,
  video: String,
  createdAt: { type: Date, default: Date.now },
});

const app = express();
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({ storage });

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);
  
  socket.on("sendMessage", async (data) => {
    const message = new Message(data);
    await message.save();
    io.emit("receiveMessage", message);
  });

  socket.on("disconnect", () => console.log("User disconnected:"));
});

app.get("/messages/:senderId/:receiverId", async (req, res) => {
  const { senderId, receiverId } = req.params;
  const messages = await Message.find({
    $or: [
      { senderId, receiverId },
      { senderId: receiverId, receiverId: senderId },
    ],
  }).sort("createdAt");
  res.json(messages);
});

app.post("/upload", upload.single("file"), (req, res) => {
  res.json({ url: `uploads/${req.file.filename}` });
});

server.listen(5000, () => console.log("Server running on port 5000"));