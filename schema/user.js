"use strict";
/*
 *  Defined the Mongoose Schema and return a Model for a User
 */
/* jshint node: true */

var mongoose = require('mongoose');

var favoriteSchema = new mongoose.Schema({
    date_time: {type: Date, default: Date.now}, // The date and time when the photo was favorited.
    photo_id: mongoose.Schema.Types.ObjectId,    //  The user object of the user who favorited the comment.
    file_name: String, // The file name of the photo
    created_date_time: {type: Date, default: Date.now} // The date the photo was uploaded
});

var lastActivitySchema = new mongoose.Schema({
    lastActivity: {type: String, default: "Created user"}, // The type of last activity
    lastWasPhoto: {type: Boolean, default: false}, // Boolean to state if last activity was a photo upload
    lastPhotoName: {type: String, default: ""} // String of the last photo name
});

// create a schema
var userSchema = new mongoose.Schema({
    id: String,     // Unique ID identifying this user
    first_name: String, // First name of the user.
    last_name: String,  // Last name of the user.
    location: String,    // Location  of the user.
    description: String,  // A brief user description
    occupation: String,    // Occupation of the user.
    login_name: String,	// Login name of the user.
    password: String, // Password of the user.
    favArray: [favoriteSchema], // Array of favoriteSchema objects
    lastActivityObject: lastActivitySchema
});

// the schema is useless so far
// we need to create a model using it
var User = mongoose.model('User', userSchema);

// make this available to our users in our Node applications
module.exports = User;
