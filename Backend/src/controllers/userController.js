const User = require("../models/User");
const FriendRequest = require('../models/FriendRequest')


exports.getFriends = async (req, res) => {
    try {
        const user = await User.findById(req.user._id.toString())
            .select("friends")
            .populate("friends", "fullName profilePic nativeLanguage learningLanguage");

        res.status(200).json(user.friends);
    } catch (error) {
        console.error("Error in getMyFriends controller", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

exports.getRecommendedUsers = async (req, res) => {
    try {
        const currentUserId = req.user._id.toString();
        const currentUser = req.user;


        //apneaapko ni lena recommend me aur jo mere dost h unko b ni

        const recommendedUsers = await User.find({
            $and: [
                { _id: { $ne: currentUserId } },//current use rni hoga
                { _id: { $nin: currentUser.friends } },
                { isOnboarded: true }

            ]
        })


        return res.status(200).json(recommendedUsers)


    } catch (err) {
        console.log("Error in getRecommendation : ", err.message);
        return res.status(500).json({
            message: 'internal server error in getRecommendation'
        })
    }
}

exports.sendFriendRequest = async (req, res) => {
    try {
        const myId = req.user._id.toString();
        const { id: recipientId } = req.params;

        //prevent sending to yourself
        if (myId === recipientId) {
            return res.status(400).json({ message: "cannot send reques tto yourself" })
        }

        const recipient = await User.findById(recipientId)
        if (!recipient) {
            return res.status(401).json({ message: "recipient not found" })
        }

        if (recipient.friends.includes(myId)) {
            return res.status(400).json({ message: "you are already friends with this user" })
        }

        //check if a req already exist
        const existingRequest = await FriendRequest.findOne({
            $or: [
                { sender: myId, recipient: recipientId },
                { sender: recipientId, recipient: myId }
            ],

        });

        if (existingRequest) {
            return res.status(400).json({ message: "A request already exists between you and this user" })
        }


        const friendRequest = await FriendRequest.create({
            sender: myId,
            recipient: recipientId
        });

        res.status(200).json(friendRequest)
    } catch (error) {
        console.error("Error in sendFriendRequest controller", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

exports.acceptFriendRequest = async (req, res) => {
    try {
        const { id: requestId } = req.params;
 
        const friendRequest = await FriendRequest.findById(requestId);

        if (!friendRequest) {
            return res.status(404).json({ message: "Friend request not found" });
        }

        // Verify the current user is the recipient
        if (friendRequest.recipient.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "You are not authorized to accept this request" });
        }

        friendRequest.status = "accepted";
        await friendRequest.save(); 

        // add each user to the other's friends array
        // $addToSet: adds elements to an array only if they do not already exist.
        await User.findByIdAndUpdate(friendRequest.sender, {
            $addToSet: { friends: friendRequest.recipient },
        });

        await User.findByIdAndUpdate(friendRequest.recipient, {
            $addToSet: { friends: friendRequest.sender },
        });

        res.status(200).json({ message: "Friend request accepted" });
    } catch (error) {
        console.log("Error in acceptFriendRequest controller", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

exports.getFriendRequests= async(req, res)=> {
  try {
    
    const incomingReqs = await FriendRequest.find({
      recipient: req.user._id.toString(),
      status: "pending",
    }).populate("sender", "fullName profilePic nativeLanguage learningLanguage");

    const acceptedReqs = await FriendRequest.find({
      sender: req.user._id.toString(),
      status: "accepted",
    }).populate("recipient", "fullName profilePic");

    res.status(200).json({ incomingReqs, acceptedReqs });
  } catch (error) {
    console.log("Error in getPendingFriendRequests controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

exports.getOutgoingFriendReqs=async(req, res)=>{ 
  try {
    const outgoingRequests = await FriendRequest.find({
      sender: req.user._id.toString(),
      status: "pending",
    }).populate("recipient", "fullName profilePic nativeLanguage learningLanguage");

    res.status(200).json(outgoingRequests);
  } catch (error) {
    console.log("Error in getOutgoingFriendReqs controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}