"use strict";

/*
 * Defined the Mongoose Schema and return a Model for a Photo
 */

/* jshint node: true */

var mongoose = require('mongoose');

/*
 * Photo can have comments and we stored them in the Photo object itself using
 * this Schema:
 */
var commentSchema = new mongoose.Schema({
    comment: String,     // The text of the comment.
    date_time: {type: Date, default: Date.now}, // The date and time when the comment was created.
    user_id: mongoose.Schema.Types.ObjectId,    // 	The user object of the user who created the comment.
});

// var favoriteSchema = new mongoose.Schema({
//     date_time: {type: Date, default: Date.now}, // The date and time when the photo was favorited.
//     user_id: mongoose.Schema.Types.ObjectId,    //  The user object of the user who favorited the comment.
// });

// create a schema for Photo
var photoSchema = new mongoose.Schema({
    id: String,     // Unique ID identifying this user
    file_name: String, // 	Name of a file containing the actual photo (in the directory project6/images).
    date_time: {type: Date, default: Date.now}, // 	The date and time when the photo was added to the database
    user_id: mongoose.Schema.Types.ObjectId, // The user object of the user who created the photo.
    comments: [commentSchema], // Comment objects representing the comments made on this photo.
    likes: [String], // An array of the user ids by users who liked this photo
    isLiked: Boolean, // Check if the photo is liked by the current user
    favorites: [], //[favoriteSchema], // An array of user ids by users who favorited this photo
    isFavorited: Boolean, // Boolean to see if the photo is favorited by the current user
});

// the schema is useless so far
// we need to create a model using it
var Photo = mongoose.model('Photo', photoSchema);
//var Comment = mongoose.model('Comment', commentSchema);

// make this available to our photos in our Node applications
module.exports = Photo;
