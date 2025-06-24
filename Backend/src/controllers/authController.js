const User = require("../models/User");
const express = require('express')
const jwt = require('jsonwebtoken');
const { upsertStreamUser } = require("../config/stream");

require('dotenv').config()

exports.signup = async (req, res) => {
  try {
    const { email, password, fullName } = req.body;

    //if  kuch missing ho

    if (!email || !password || !fullName) {

      return res.status(400).json({ message: "All fields are required" })
    }
    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be 6 characters" })
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {

      return res.status(400).json({ message: "Invalid email id" })
    }


    //exists already???
    const registeredUser = await User.findOne({ email });
    if (registeredUser) {
      res.status(500).json({
        status: false,
        message: "Already registered",
        registeredUser
      })
    }


    //new user k liye random profile k lye api
    // const idx = Math.floor(Math.random() * 100) + 1; // generate a num between 1-100
    // const randomAvatar = `https://avatar.iran.liara.run/public/${idx}.png`; (this stopped working because of iran-isr confligt i guess)
    const randomAvatar = "https://xsgames.co/randomusers/avatar.php?g=pixel"

    //nya user bnate h  ab
    try {

      const newUser = await User.create({
        email,
        fullName,
        password,
        profilePic: randomAvatar
      })


      //stream/video call me register krdo

      try {
        await upsertStreamUser({
          id: newUser._id.toString(),
          name: newUser.fullName,
          image: newUser.profilePic || ""
        })
      } catch (err) {
        return res.status(500).json({
          success: false,
          message: "error making stream user"
        })
      }

      //make token
      let token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET, {
        expiresIn: "7d"
      })



      //put in cookie
      res.cookie("jwt", token, {
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true,
        sameSite: "strict",
        secure: process.env.NODE_ENV === "production"

      })
      console.log(newUser);

      res.status(201).json({
        success: true,
        user: newUser
      })


    } catch (error) {
      console.log("Error in making user   ");
      return res.status(500).json({
        status: false,
        message: "Error signing up"
      })
    }

  } catch (err) {
    console.log("Error in signup controller");

    return res.status(500).json({
      status: false,
      message: "Error signing up",
      err

    })
  }


}


exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    //if  kuch missing ho
    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required" })
    }

    //already registered
    const registeredUser = await User.findOne({ email });
    if (!registeredUser) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password"
      })
    }

    //password same h?
    const isPasswordCorrect = await registeredUser.matchPassword(password);
    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password"
      })
    }


    //abtoken bnao
    const token = jwt.sign({ userId: registeredUser._id }, process.env.JWT_SECRET, {
      expiresIn: "7d"
    })
    res.cookie("jwt", token, {
      maxAge: 7 * 24 * 60 * 60 * 1000,
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production"

    })
    res.status(201).json({
      success: true,
      user: registeredUser
    })



  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error in looging in"
    })

  }
}

exports.logout = async (req, res) => {
  res.clearCookie("jwt")
  res.status(200).json({
    success: true,
    message: "Logout successful"
  })
}


exports.onboard = async (req, res) => {
  try {
    const userId = req.user._id.toString();
    console.log(userId);



    const { fullName, bio, nativeLanguage, learningLanguage, location } = req.body

    //agr kuch missing ho
    if (!fullName || !bio || !nativeLanguage || !learningLanguage || !location) {
      return res.status(400).json({
        message: "All fields are required",
        missingFields: [
          !fullName && "fullName",
          !bio && "bio",
          !nativeLanguage && "nativeLanguage",
          !learningLanguage && "learningLanguage",
          !location && "location",
        ].filter(Boolean),
      });
    }

    //update krdo dhundh ke
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        ...req.body,
        isOnboarded: true
      },
      { new: true }
    );
    //user mila hi ni
    if (!updatedUser) return res.status(404).json({ message: "User not found" });
    //stream service me bhi update krdo

    try {
      await upsertStreamUser({
        id: updatedUser._id.toString(),
        name: updatedUser.fullName,
        image: updatedUser.profilePic || "",
      });
      console.log(`Stream user updated after onboarding for ${updatedUser.fullName}`);
    } catch (streamError) {
      console.log("Error updating Stream user during onboarding:", streamError.message);
    }

    //response on success
    res.status(201).json({
      success: true,
      user: updatedUser
    })
  } catch (error) {
    console.error("Onboarding error:", error);
    res.status(500).json({ message: "Internal Server Error", error });
  }
}