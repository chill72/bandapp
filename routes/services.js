

exports.deleteAttachment = function(dir){
    return function(req, res){
        var fs = require("fs");
        var path = require("path");
        var join = path.join;
        var mongodb = require('mongodb');
        var MongoClient = mongodb.MongoClient;
        MongoClient.connect("mongodb://mongolab_chill:DBpass567@ds053728.mongolab.com:53728/bandapp", function(err, db) {
            var songId = req.body.songId;
            var collection = db.collection('songs');
            var removeId = new mongodb.ObjectID(songId);
            collection.findOne({_id:removeId},function(err, document) {
                if(err) {
                    return console.dir(err);
                }
                if(document.attachment){
                    var deletePath = join(dir, document.attachment);
                    fs.unlink(deletePath, function(err){
                        if(err) {
                            console.log("error deleting file");
                            return console.dir(err);
                        }
                    });
                }
                collection.remove({_id: removeId }, {w:1}, function(err, result) {
                    if(err) {
                        return console.dir(err);
                    }
                });
                var commentscol = db.collection('comments');
                commentscol.remove({songId: songId }, {w:1}, function(err, result) {
                    if(err) {
                        return console.dir(err);
                    }
                    res.statusCode = 200;
                    //res.send(JSON.stringify(result));
                    res.end("delete operation successful")
                });
            });
        });
    }
};

exports.postComment = function(req, res){
    var mongodb = require('mongodb');
    var MongoClient = mongodb.MongoClient;
    MongoClient.connect("mongodb://mongolab_chill:DBpass567@ds053728.mongolab.com:53728/bandapp", function(err, db) {
        var collection = db.collection('comments');
        var newComment = {
            text:req.body.text,
            name:req.body.name,
            songId:req.body.songId,
            date: new Date()
        }
        collection.insert(newComment, {w:1}, function(err, result) {
            if(err) {
                return console.dir(err);
            }
            res.statusCode = 201;
            res.send(JSON.stringify(result));
        });
    });
}

exports.getComments = function(req,res){
    var mongodb = require('mongodb');
    var MongoClient = mongodb.MongoClient;
    MongoClient.connect("mongodb://mongolab_chill:DBpass567@ds053728.mongolab.com:53728/bandapp", function(err, db) {
        var comments = db.collection('comments');
        comments.find({songId:req.body.songId}).sort({date:-1}).toArray(function(err,commentItems){
            if(err) {
                return console.dir(err);
            }
            res.statusCode = 201;
            res.send(JSON.stringify(commentItems));
        });
    });
};