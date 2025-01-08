const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config() 
const cors = require('cors');     
const path = require('path');

const user_router = require('./routes/users_route');
const post_router = require('./routes/posts_route');
const like_router = require('./routes/likes.route');
const comment_router = require('./routes/comments.route'); 

const http_status = require('./utils/http_status');




const app = express();
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));      // photo // http://localhost:6000/uploads/name.png 
// Image extension needs editing


const url = process.env.URL;
mongoose.connect(url)
    .then(() => console.log("Connected to MongoDB"))
    .catch(err => console.error("Could not connect to MongoDB", err));

app.use(express.json())
app.use(cors());    

app.use('/api/users', user_router);   //  ../login , ../register => generate_token
app.use('/api/posts', post_router);   // ../main , ../my_profile => get_posts or del_posts or update
app.use('/api/posts', like_router);   // ../main/like or unlike , ../my_profile/like or unlike 
app.use('/api/posts', comment_router);  // ../main/comment  , ../my_profile/comment  => del or add 



app.all('*', (req, res, next) => {       // if The page is not found in route.
    res.status(404).json({status : http_status.ERROR, message : 'Not Found'});
});

// global error handler 
app.use((err, req, res, next) => {
    const statusCode = err.status_code || 500;
    const statusText = err.status_text || "Internal Server error"; 
    const message = err.message || "An unexpected error occurred.";

    res.status(statusCode).json({
        status: statusText,
        message: message
    });
});

app.listen(process.env.PORT, () => {
    console.log(`listening on port ${process.env.PORT}`);
});