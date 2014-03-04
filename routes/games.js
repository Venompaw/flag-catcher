var db = require('../models')
var passport = undefined;
var util = require('util');


exports.configure = function(params) {
    passport = params.passport;
}

exports.add = function(req, res) {
    db.User.findById(req.session.passport.user, function(err, user) {
        if (!err) {
            db.Game.create({}).success(function(game) {
                game.setCreator(user).success(function() { //saves the owner
                    game.setUsers([user]).success(function() { //saves the user in the join table
                        res.redirect('/account');
                    })
                })
            })
        }
    })
}

exports.lobby = function(req, res) {

}