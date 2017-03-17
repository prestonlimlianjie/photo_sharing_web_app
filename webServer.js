"use strict";

/* jshint node: true */

/*
 * This builds on the webServer of previous projects in that it exports the current
 * directory via webserver listing on a hard code (see portno below) port. It also
 * establishes a connection to the MongoDB named 'cs142project6'.
 *
 * To start the webserver run the command:
 *    node webServer.js
 *
 * Note that anyone able to connect to localhost:portNo will be able to fetch any file accessible
 * to the current user in the current directory or any of its children.
 *
 * This webServer exports the following URLs:
 * /              -  Returns a text status message.  Good for testing web server running.
 * /test          - (Same as /test/info)
 * /test/info     -  Returns the SchemaInfo object from the database (JSON format).  Good
 *                   for testing database connectivity.
 * /test/counts   -  Returns the population counts of the cs142 collections in the database.
 *                   Format is a JSON object with properties being the collection name and
 *                   the values being the counts.
 *
 * The following URLs need to be changed to fetch there reply values from the database.
 * /user/list     -  Returns an array containing all the User objects from the database.
 *                   (JSON format)
 * /user/:id      -  Returns the User object with the _id of id. (JSON format).
 * /photosOfUser/:id' - Returns an array with all the photos of the User (id). Each photo
 *                      should have all the Comments on the Photo (JSON format)
 *
 */

var mongoose = require('mongoose');
var async = require('async');
var session = require('express-session');
var bodyParser = require('body-parser');
var multer = require('multer');
var processFormBody = multer({storage: multer.memoryStorage()}).single('uploadedphoto');


// Load the Mongoose schema for User, Photo, Comment, and SchemaInfo
var User = require('./schema/user.js');
var Photo = require('./schema/photo.js');
var Comment = require('./schema/photo.js');
var SchemaInfo = require('./schema/schemaInfo.js');
var fs = require("fs");
const assert = require('assert');
const crypto = require('crypto');


var express = require('express');
var app = express();

// XXX - Your submission should work without this line
var cs142models = require('./modelData/photoApp.js').cs142models;

mongoose.connect('mongodb://localhost/cs142project6');

// We have the express static module (http://expressjs.com/en/starter/static-files.html) do all
// the work for us.
app.use(express.static(__dirname));
app.use(session({secret: 'secretKey', resave: false, saveUninitialized: false}));
app.use(bodyParser.json());


app.get('/', function (request, response) {
    response.send('Simple web server of files from ' + __dirname);
});

app.post('/admin/login', function (request, response){

    User.findOne({login_name:request.body.login_name, password:request.body.password}, function(err, userInfo){
        console.log(userInfo);
        if (err){
            // Query returned an error.  We pass it back to the browser with an Internal Service
            // Error (500) error code.
            console.error('error:', err);
            response.status(500).send(JSON.stringify(err));
            return; 
        }
        if (userInfo === null) {
            // Query didn't return an error but didn't find any User object - This
            // is also an internal error return. Return 400.
            response.status(400).send('No such user');
            return;
        }

        // We got the object - return it in JSON format.
        console.log('User ', userInfo);
        request.session.user_id = userInfo._id;
        response.status(200).send(JSON.stringify(userInfo));
    });
});


app.post('/admin/logout', function(request, response){
    if (request.session.user_id === undefined){
        response.status(401).send('User not logged in');
        return;
    }
    delete request.session.user_id;
    request.session.destroy(function (err){});
    response.status(200).send('User logged out successfully');
});

app.post('/lastactivity', function(request, response){
    if (request.session.user_id === undefined){
        response.status(401).send('User not logged in');
        return;
    }

    User.findOne({_id:request.session.user_id}, function(err, userInfo){
        console.log(userInfo);
        if (err){
            // Query returned an error.  We pass it back to the browser with an Internal Service
            // Error (500) error code.
            console.error('error:', err);
            response.status(500).send(JSON.stringify(err));
            return; 
        }
        if (userInfo === null) {
            // Query didn't return an error but didn't find any User object - This
            // is also an internal error return. Return 400.
            response.status(400).send('No such user');
            return;
        }

        // Update the lastActivityObject in the user.
        var newLastActivityObj = {lastActivity: request.body.lastActivity, lastWasPhoto: request.body.lastWasPhoto, lastPhotoName: request.body.lastPhotoName};
        userInfo.lastActivityObject = newLastActivityObj;
        userInfo.save();
        response.status(200).send("lastActivityObject updated");
    });

});

app.post('/commentsOfPhoto/:photo_id', function (request, response){
    if (request.session.user_id === undefined){
        response.status(401).send('User not logged in');
        return;
    }

    Photo.findOne({_id:request.params.photo_id}, function (err, photo) {
        if (err){
            response.status(500).send(JSON.stringify(err));
            return;
        }
        if (photo === null){
            response.status(500).send(JSON.stringify(err));
            return; 
        }

        var newComment = {comment:request.body.comment, user_id:request.session.user_id};
        photo.comments.push(newComment);
        photo.save();
        response.status(200).send('Comment posted successfully');
    });
});


app.post('/likePhoto/:photo_id', function(request, response){
    if (request.session.user_id === undefined){
        response.status(401).send('User not logged in');
        return;
    }

    Photo.findOne({_id:request.params.photo_id}, function (err, photo) {
        if (err){
            response.status(500).send(JSON.stringify(err));
            return;
        }
        if (photo === null){
            response.status(400).send(JSON.stringify(err));
            return;
        }

        // Validation: ensure that the user hasn't already liked the photo before adding the user's id to the like array
        var index = photo.likes.indexOf(request.session.user_id);
        if (index === -1){
            photo.likes.push(request.session.user_id);
            photo.isLiked = true;
            photo.save();
            response.status(200).send(JSON.stringify(photo));
            return;
        }
        if (index !== -1){
            photo.likes.splice(index);
            photo.isLiked = false;
            photo.save();
            response.status(200).send(JSON.stringify(photo));
        }
    });

});

app.post('/favoritePhoto/:photo_id', function(request, response){
    if (request.session.user_id === undefined){
        response.status(401).send('User not logged in');
        return;
    }

    Photo.findOne({_id:request.params.photo_id}, function (err, photo) {
        if (err){
            response.status(500).send(JSON.stringify(err));
            return;
        }
        if (photo === null){
            response.status(400).send(JSON.stringify(err));
            return;
        }

        // Validation: ensure that the user hasn't already liked the photo before adding the user's id to the favorites array
        var index = photo.favorites.indexOf(request.session.user_id);
        if (index === -1){
            photo.favorites.push(request.session.user_id);
            photo.isFavorited = true;
            photo.save();
            response.status(200).send(JSON.stringify(photo));
        }
        else if (index !== -1){
            photo.favorites.splice(index);
            photo.isFavorited = false;
            photo.save();
            response.status(200).send(JSON.stringify(photo));
        }

        User.findOne({_id:request.session.user_id}, function (err, user){
            if (err){
                response.status(500).send(JSON.stringify(err));
                return;
            }
            if (user === null){
                response.status(400).send(JSON.stringify(err));
                return;
            }

            //var userIndex = -1;
            for(var i = 0; i < user.favArray.length; i++) {
                if (String(user.favArray[i].photo_id).valueOf() === String(request.params.photo_id).valueOf()) {
                    //userIndex = i;
                    user.favArray.splice(i,1);
                    user.save();
                    console.log('User favarray after save: ' + user);
                    return;
                }
            }

            //if (userIndex === -1){
            var newFavSchema = {photo_id:request.params.photo_id, file_name: photo.file_name, created_date_time: photo.date_time};
            console.log(photo.date_time);
            user.favArray.push(newFavSchema);
            user.save();
            console.log('User favarray after save: ' + user);
            return;
            //}
            // if (userIndex !== -1){
            //     user.favArray.splice(userIndex);
            //     user.save();
            //     console.log('User favarray after save: ' + user);
            // }

        });

    });
});


app.get('/favorites', function (request, response) {
    if (request.session.user_id === undefined){
        response.status(401).send('User not logged in');
        return;
    }

    var id = request.session.user_id;
    
    if (mongoose.Types.ObjectId.isValid(id)){

        User.findOne({_id:id}, {favArray: 1}, function(err, userFavArray){
            if (err){
                // Query returned an error.  We pass it back to the browser with an Internal Service
                // Error (500) error code.
                console.error('user favArray:', err);
                response.status(500).send(JSON.stringify(err));
                return; 
            }
            if (userFavArray === null) {
                // Query didn't return an error but didn't find any User object - This
                // is also an internal error return.
                response.status(400).send('Missing user favArray');
                return;
            }

            // We got the object - return it in JSON format.
            console.log(userFavArray);
            response.status(200).send(JSON.stringify(userFavArray));
        });
    } else {
        // If we know understand the parameter we return a (Bad Parameter) (400) status.
        response.status(400).send('Bad user id param ' + id);
    }
});

app.post('/photos/new', function (request, response) {
    
    processFormBody(request, response, function (err) {
            if (err || !request.file) {
                response.status(400).send(JSON.stringify(err));
                // XXX -  Insert error handling code here.
                return;
            }
            // request.file has the following properties of interest
            //      fieldname      - Should be 'uploadedphoto' since that is what we sent
            //      originalname:  - The name of the file the user uploaded
            //      mimetype:      - The mimetype of the image (e.g. 'image/jpeg',  'image/png')
            //      buffer:        - A node Buffer containing the contents of the file
            //      size:          - The size of the file in bytes

            // XXX - Do some validation here.
            if (request.file.fieldname !== 'uploadedphoto'){
                console.log('Invalid request.file.fieldname');
                response.status(400).send(JSON.stringify(err));
                return;
            }

            // We need to create the file in the directory "images" under an unique name. We make
            // the original file name unique by adding a unique prefix with a timestamp.
            var timestamp = new Date().valueOf();
            var filename = 'U' +  String(timestamp) + request.file.originalname;

            fs.writeFile("./images/" + filename, request.file.buffer, function (err) {
                if (err){
                    console.log(err);
                    response.status(400).send(JSON.stringify(err));
                    return;
                }
              // XXX - Once you have the file written into your images directory under the name
              // filename you can create the Photo object in the database
                function doneCallback(err, newPhoto) {
                    assert (!err);
                    console.log('Created photo object with ID', newPhoto._id);
                    response.status(200).send(JSON.stringify(newPhoto));
                }

                Photo.create({ file_name: filename, user_id: request.session.user_id, comments: [], likes: [], isLiked: false, favorites: [], isFavorited: false}, doneCallback);


            });
        });
});

app.post('/user', function (request, response){

    User.findOne({login_name:request.body.login_name}, function(err, userInfo){
        
        function doneCallBack(err, newUserInfo) {
            assert (!err);
            console.log('Created user with login name', newUserInfo);
            response.status(200).send(JSON.stringify(newUserInfo));
        }
        
        if (err){
            // Query returned an error.  We pass it back to the browser with an Internal Service
            // Error (500) error code.
            console.error('error:', err);
            response.status(500).send(JSON.stringify(err));
            return; 
        }
        if (userInfo === null) {
            // var timestamp = new Date().valueOf();
            // var userID = 'U' +  String(timestamp) + request.body.first_name;
            // If the user doesn't exist, we can proceed to make a new user.

            User.create({login_name:request.body.login_name, password:request.body.password, first_name: request.body.first_name, last_name: request.body.last_name, location: request.body.location, description: request.body.description, occupation: request.body.occupation, favArray: [], lastActivityObject:{lastActivity:'Created user', lastWasPhoto:false, lastPhotoName:''}}, doneCallBack);
            
            return;
        }

        // User already exists.
        response.status(400).send(JSON.stringify("User already exists"));
        return;
    });
});

/*
 * Use express to handle argument passing in the URL.  This .get will cause express
 * To accept URLs with /test/<something> and return the something in request.params.p1
 * If implement the get as follows:
 * /test or /test/info - Return the SchemaInfo object of the database in JSON format. This
 *                       is good for testing connectivity with  MongoDB.
 * /test/counts - Return an object with the counts of the different collections in JSON format
 */
app.get('/test/:p1', function (request, response) {

    // Express parses the ":p1" from the URL and returns it in the request.params objects.
    console.log('/test called with param1 = ', request.params.p1);

    var param = request.params.p1 || 'info';

    if (param === 'info') {
        // Fetch the SchemaInfo. There should only one of them. The query of {} will match it.
        SchemaInfo.find({}, function (err, info) {
            if (err) {
                // Query returned an error.  We pass it back to the browser with an Internal Service
                // Error (500) error code.
                console.error('Doing /user/info error:', err);
                response.status(500).send(JSON.stringify(err));
                return;
            }
            if (info.length === 0) {
                // Query didn't return an error but didn't find the SchemaInfo object - This
                // is also an internal error return.
                response.status(500).send('Missing SchemaInfo');
                return;
            }

            // We got the object - return it in JSON format.
            console.log('SchemaInfo', info[0]);
            response.end(JSON.stringify(info[0]));
        });
    } else if (param === 'counts') {
        // In order to return the counts of all the collections we need to do an async
        // call to each collections. That is tricky to do so we use the async package
        // do the work.  We put the collections into array and use async.each to
        // do each .count() query.
        var collections = [
            {name: 'user', collection: User},
            {name: 'photo', collection: Photo},
            {name: 'schemaInfo', collection: SchemaInfo}
        ];
        async.each(collections, function (col, done_callback) {
            col.collection.count({}, function (err, count) {
                col.count = count;
                done_callback(err);
            });
        }, function (err) {
            if (err) {
                response.status(500).send(JSON.stringify(err));
            } else {
                var obj = {};
                for (var i = 0; i < collections.length; i++) {
                    obj[collections[i].name] = collections[i].count;
                }
                response.end(JSON.stringify(obj));

            }
        });
    } else {
        // If we know understand the parameter we return a (Bad Parameter) (400) status.
        response.status(400).send('Bad param ' + param);
    }
});

/*
 * URL /user/list - Return all the User object.
 */
app.get('/user/list', function (request, response) {
    if (request.session.user_id === undefined){
        response.status(401).send('User not logged in');
        return;
    }

    console.log("Print userList");

    // .find({})) -- this means that all documents are to be retrieved
    // {_id:1} -- 1 means that the id field is to be retrieved, 0 means an implicit suppression
    User.find({}, {_id:1, first_name:1, last_name:1, lastActivityObject:1}, function (err, individualUser) {
        if (err) {
            // Query returned an error.  We pass it back to the browser with an Internal Service
            // Error (500) error code.
            console.error('Doing /user/info error:', err);
            response.status(500).send(JSON.stringify(err));
            return;
        }
        if (individualUser.length === 0) {
            // Query didn't return an error but didn't find any User object - This
            // is also an internal error return.
            response.status(500).send('Missing users in userList');
            return;
        }

        // We got the object - return it in JSON format.
        console.log('UserList', individualUser);
        response.status(200).send(JSON.stringify(individualUser));
    });
});


/*
 * URL /user/:id - Return the information for User (id)
 */
app.get('/user/:id', function (request, response) {
    if (request.session.user_id === undefined){
        response.status(401).send('User not logged in');
        return;
    }

    var id = request.params.id;
    
    if (mongoose.Types.ObjectId.isValid(id)){

        User.findOne({_id:id}, {_id:1, first_name:1, last_name:1, location:1, description:1, occupation:1, favArray: 1, lastActivityObject:1}, function(err, userInfo){
            if (err){
                // Query returned an error.  We pass it back to the browser with an Internal Service
                // Error (500) error code.
                console.error('/user/' + id + ' error:', err);
                response.status(500).send(JSON.stringify(err));
                return; 
            }
            if (userInfo === null) {
                // Query didn't return an error but didn't find any User object - This
                // is also an internal error return.
                response.status(500).send('Missing user info');
                return;
            }

            // We got the object - return it in JSON format.
            console.log('User ' + id, userInfo);
            response.status(200).send(JSON.stringify(userInfo));
        });
    } else {
        // If we know understand the parameter we return a (Bad Parameter) (400) status.
        response.status(400).send('Bad user id param ' + id);
    }
});
    

/*
 * URL /photosOfUser/:id - Return the Photos for User (id)
 */
app.get('/photosOfUser/:id', function (request, response) {
    if (request.session.user_id === undefined){
        response.status(401).send('User not logged in');
        return;
    }

    var id = request.params.id;
    if (mongoose.Types.ObjectId.isValid(id)){

        var photosArray = [];
        Photo.find({user_id:id}, {_id:1, user_id:1, comments:1, file_name:1, date_time:1, likes:1, favorites:1}, function (err, photos) {

            async.each(photos, function(photo, done_callback_photo) {
                console.log('Photo processed');
                var newPhoto = {_id:photo._id, user_id:photo.user_id, file_name:photo.file_name, date_time:photo.date_time, likes:photo.likes, isLiked:photo.likes.includes(request.session.user_id), favorites:photo.favorites, isFavorited:photo.favorites.includes(request.session.user_id)};
                var newComments = [];
                async.each(photo.comments, function(comment, done_callback_comment) {

                    // Create the user object
                    User.findOne({_id:comment.user_id},{_id:1, first_name:1, last_name:1}, function (err, individualUser) {
                        if (err) {
                            // Query returned an error.  We pass it back to the browser with an Internal Service
                            // Error (500) error code.
                            console.error('Doing /user/info error:', err);
                            response.status(500).send(JSON.stringify(err));
                            return;
                        }
                        if (individualUser === undefined) {
                            // Query didn't return an error but didn't find any User object - This
                            // is also an internal error return.
                            response.status(500).send('Missing users in userList');
                            return;
                        }

                        // We got the object - return it in JSON format.
                        var newComment = {_id: comment._id, date_time: comment.date_time, comment: comment.comment, user:individualUser};
                        newComments.push(newComment);
                        done_callback_comment();
                    });

                }, function (err) {
                    if (err){
                        console.log('A photo failed to process');
                    }
                    else {
                        newPhoto.comments = newComments;
                        photosArray.push(newPhoto);
                        console.log('All photo processed');
                        done_callback_photo();
                    }
                });

            }, function (err) {
                if (err){
                    console.log('A photo comment failed to process');
                }
                else {
                    response.status(200).send(JSON.stringify(JSON.parse(JSON.stringify(photosArray))));
                }

            });
        });
    } else {
        response.status(400).send('Bad user id param ' + id);
    }
});



var server = app.listen(3000, function () {
    var port = server.address().port;
    console.log('Listening at http://localhost:' + port + ' exporting the directory ' + __dirname);
});


