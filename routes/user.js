

exports.getLogin = function(req, res){
    res.render('login', {"message":""});
}
exports.getNewUser = function(req, res){
    if(!req.session.admin){
        //res.redirect("/");
        res.statusCode = 403;
        res.end("403 Forbidden")
        return;
    }
    res.render('newuser', {"message":""});
}

exports.postLogin = function(req, res){
    var MongoClient = require('mongodb').MongoClient;
    MongoClient.connect("mongodb://mongolab_chill:DBpass567@ds053728.mongolab.com:53728/bandapp", function(err, db) {
        if(err) { return console.dir(err); }
        var email = req.body.email;
        var password = req.body.p;
        var collection = db.collection('users');
        collection.findOne({email:email},function(err, document) {
            if(!document || document.password != password) {
                var context = {
                    "message":"Incorrect email or password",
                    "messageType":"error",
                    "email":email
                }
                res.render('login',context);
                return;
            }
            //validated - write cookie
            req.session.uid = email;
            req.session.name = document.name;
            req.session.admin = document.admin;
            res.redirect("/");
        });
    });
}
exports.postNewUser = function(req, res){
    var MongoClient = require('mongodb').MongoClient;
    MongoClient.connect("mongodb://mongolab_chill:DBpass567@ds053728.mongolab.com:53728/bandapp", function(err, db) {
        if(err) { return console.dir(err); }
        var collection = db.collection('users');
        collection.findOne({email:req.body.email},function(err, document) {
            if(document) {
                var context = {
                    "message":"User email already exists",
                    "messageType":"error",
                    "name":req.body.name
                }
                res.render('newuser',context);
                return;
            }
            var newUser = {
                email:req.body.email,
                name:req.body.name,
                password:req.body.p,
                admin:req.body.a
            }
            collection.insert(newUser, {w:1}, function(err, result) {
                if(err) {
                    return console.dir(err);
                }
                res.statusCode = 201;
                res.render('newuser',{"message":"User created successfully","messageType":"success"});
            });
        });
    });
}
