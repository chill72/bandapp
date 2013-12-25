

exports.index = function(req, res){
    if(!req.session.uid){
        res.redirect("/login");
        return;
    }
    var MongoClient = require('mongodb').MongoClient;
    MongoClient.connect("mongodb://mongolab_chill:DBpass567@ds053728.mongolab.com:53728/bandapp", function(err, db) {
        if(err) { return console.dir(err); }
        var collection = db.collection('songs');
        collection.find({},{sort:'title'}).toArray(function(err, items) {
            var context = {};
            context.title = "Test Title";
            context.songs = items;
            context.songsString = JSON.stringify(context.songs);
            context.userName = req.session.name;
            context.a = req.session.admin;
            res.render('index', context);
        });

    });
};

exports.post = function(dir){
    return function(req, res){
        var fs = require("fs");
        var path = require("path");
        var join = path.join;
        var MongoClient = require('mongodb').MongoClient;
        MongoClient.connect("mongodb://mongolab_chill:DBpass567@ds053728.mongolab.com:53728/bandapp", function(err, db) {
            if(err) { return console.dir(err); }
            if(req.files.file1){
                var file1 = req.files.file1;
                var saveAs = join(dir, file1.name);
               fs.rename(file1.path, saveAs, function(err){
                    if(err) return console.dir(err);
                })
            }
            var collection = db.collection('songs');
            var newSong = {
                title: req.body.title,
                description: req.body.description,
                attachment: file1.name || "",
                youtube: req.body.youtube
            };
            collection.insert(newSong, {w:1}, function(err, result) {
                if(err) {
                    return console.dir(err);
                }
                //res.statusCode = 201;
                //res.send(JSON.stringify(result));
                res.redirect('/');
            });
        });
    }
};


