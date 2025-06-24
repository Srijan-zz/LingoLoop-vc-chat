const express=require('express')
const {generateStreamToken} =require('../config/stream')

exports.getStreamToken=async(req, res)=> {
  try {
    const token =await generateStreamToken(req.user._id.toString());
    res.status(200).json({ token });
  } catch (error) {
    console.log("Error in getStreamToken controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}