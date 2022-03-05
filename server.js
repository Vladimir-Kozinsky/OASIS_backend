const express = require('express');
const { default: mongoose } = require('mongoose');
// const cors = require('cors');
ATLAS_URI = "mongodb+srv://user1:user1@oasiscluster.wukey.mongodb.net/myFirstDatabase?retryWrites=true&w=majority"

const app = express();

// app.use(cors());
// app.use(express.json());

const port = process.env.PORT || 5000;
const uri = ATLAS_URI;
mongoose.connect(uri, { 
    useNewUrlParser: true, 
    //useCreateIndex: true 
});
const connection = mongoose.connection;

connection.once('open', () => {
    console.log("MongoDB database connection established successfully")
})

app.listen(port, () => {
    console.log(`Server is running on port: ${port}`)
})

