const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config()    // to use env(protected)
const cors = require('cors');      //  for fronted because port is different
const path = require('path');

const user_router = require('./routes/users_route');
const post_router = require('./routes/posts_route');
const like_router = require('./routes/likes.route');

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

app.use('/api/users', user_router);   // /api/users/.....
app.use('/api/posts', post_router);   // /api/posts/....
app.use('/api/posts', like_router);

app.all('*', (req, res, next) => {       // if The page is not found in route.
    res.json({status : http_status.ERROR, message : 'this resource is not available'});
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