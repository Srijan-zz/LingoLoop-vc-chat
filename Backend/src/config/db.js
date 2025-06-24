const mongoose = require('mongoose')

require('dotenv').config();


exports. connectDb = async () => {
    try {
        const datab = await mongoose.connect(process.env.MONGO_URL, {
            // useUnifiedTopology: true
        })

        console.log("mongo connected");
    } catch (err) {
        console.log("Error connecting to mingo db: ", err);
        process.exit(1);

    }

}