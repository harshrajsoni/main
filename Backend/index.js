import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";
import cookieParser from "cookie-parser";
import { createServer } from "http";
import { Server } from "socket.io";
import userRouter from "./routes/userRouter.js";
import messageRouter from "./routes/message_Router.js";
import recruiterRouter from "./routes/recruiter_Router.js";
import collegeRouter from "./routes/college_Router.js";
import videoCallRequestRouter from "./routes/videoCallRequest_Router.js";
import studentRouter from "./routes/student_Router.js";

const app = express();
const server = createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true
  }
});


dotenv.config();

// middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: 'http://localhost:5173', // your frontend URL
  credentials: true
}));

const PORT = process.env.PORT || 3001;
const URI = process.env.MONGODB_URL;

// Socket.IO for video calling
const activeRooms = new Map();

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join-room', ({ roomId, userId, userType }) => {
    socket.join(roomId);

    if (!activeRooms.has(roomId)) {
      activeRooms.set(roomId, new Set());
    }
    activeRooms.get(roomId).add({ socketId: socket.id, userId, userType });

    socket.to(roomId).emit('user-joined', { userId, userType });
    console.log(`User ${userId} joined room ${roomId}`);
  });

  socket.on('offer', ({ roomId, offer, targetUserId }) => {
    socket.to(roomId).emit('offer', { offer, fromUserId: socket.userId });
  });

  socket.on('answer', ({ roomId, answer, targetUserId }) => {
    socket.to(roomId).emit('answer', { answer, fromUserId: socket.userId });
  });

  socket.on('ice-candidate', ({ roomId, candidate, targetUserId }) => {
    socket.to(roomId).emit('ice-candidate', { candidate, fromUserId: socket.userId });
  });

  socket.on('leave-room', ({ roomId, userId }) => {
    socket.leave(roomId);
    if (activeRooms.has(roomId)) {
      const roomUsers = activeRooms.get(roomId);
      roomUsers.forEach(user => {
        if (user.socketId === socket.id) {
          roomUsers.delete(user);
        }
      });
      if (roomUsers.size === 0) {
        activeRooms.delete(roomId);
      }
    }
    socket.to(roomId).emit('user-left', { userId });
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    // Clean up user from all rooms
    activeRooms.forEach((users, roomId) => {
      users.forEach(user => {
        if (user.socketId === socket.id) {
          users.delete(user);
          socket.to(roomId).emit('user-left', { userId: user.userId });
        }
      });
      if (users.size === 0) {
        activeRooms.delete(roomId);
      }
    });
  });
});



//for login and signup.
app.use('/api/user', userRouter);

//this is for message.
app.use('/api/message', messageRouter);

//this is for fetching all the colleges for recruiter
app.use('/api/recruiter', recruiterRouter);

//this will fetch all the the recruiters for college
app.use('/api/college', collegeRouter);

//this will fetch all the req. and schedule for video-call
app.use('/api/request-video-call', videoCallRequestRouter);

// ADD student router registration:
app.use('/api/student', studentRouter);


server.listen(PORT, () => {
  console.log(`Server is Running on port ${PORT}`);
  mongoose.connect(URI).then(() => {
    console.log("Connected to MongoDB");
  }).catch((err) => {
    console.log(err);
  });
});