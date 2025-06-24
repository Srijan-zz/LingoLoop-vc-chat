const mongoose = require('mongoose')
const bcrypt =require('bcryptjs')


const userSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
        minLength: 6
    },
    bio: {
        type: String,
        default: ""
    },
    profilePic: {
        type: String,
        default: ""
    },
    nativeLanguage: {
        type: String,
        default: "",
    },
    learningLanguage: {
        type: String,
        default: "",
    },
    location: {
        type: String,
        default: "",
    },
    isOnboarded: {
        type: Boolean,
        default: false, //after on
    },
    friends:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    ]

}, { timestamps: true });



//pre hook encrypt the password
userSchema.pre("save", async function(next){//save krne ke pehle ye chalega


    if(!this.isModified("password"))return next(); // if user hasnt modified it wont be rehashed

    
    try{
        const salt = await bcrypt.genSalt(10)
        this.password = await bcrypt.hash(this.password,salt); //bcrypt se hash krdiya password
        next();

    }catch(err){
        next(err)
    }
});


userSchema.methods.matchPassword = async function (enteredPassword) {
  const isPasswordCorrect = await bcrypt.compare(enteredPassword, this.password);
  return isPasswordCorrect;
};
// export default User;


module.exports = mongoose.model("User", userSchema)