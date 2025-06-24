const {StreamChat} = require("stream-chat")

require("dotenv").config();

const api_key= process.env.STREAM_API_KEY
const api_secret= process.env.STREAM_API_SECRET

if(!api_key || !api_secret){
    console.error(" stream key or secret missing")
}

const streamClient = StreamChat.getInstance(api_key,api_secret)  //instance bna liya


exports. upsertStreamUser = async (userData )=>{
    try{
        await streamClient.upsertUsers([userData])//update if created  and  create if not
        return userData
    }catch(err){
        console.error("error upserting stream user : ",err)

    }
}


exports.generateStreamToken = async(userId)=>{
    try{
        const userIdStr=userId.toString()
        return streamClient.createToken(userIdStr)
    }catch(err){
console.error("error generating  stream token for user: ", err);

    }
}

