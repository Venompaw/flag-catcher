var db = require('../models');
var passport = undefined;
var util = require('util');


exports.configure = function(params) {
    passport = params.passport;
}

exports.add = function(req, res) {
    db.User.findById(req.session.passport.user.id, function(err, user) {
        if (!err) {
            db.Game.create({}).success(function(game) {
                game.setCreator(user).success(function() { //saves the owner
                    var gamesUser = {
                        GameId: game.id,
                        team: (Math.floor(Math.random() * 2) == 1 ? 'a' : 'b'),
                        UserId: user.id
                    }
                    db.GamesUser.create(gamesUser).success(function() {
                        res.redirect('/viewgame/' + game.id);
                    });
                })
            })
        }
    })
}

exports.lobby = function(req, res) {
    db.Game.findAll({where: {isOver: 0, isRunning: 0}, include: [db.User]}).success(function(games) {
        //util.inspect(console.log(games));
        res.render(
            'lobby', {
                games: games,
                title: 'Lobby',
                //user:
            }
        )
    });
}

exports.viewgame = function(req, res) {
    db.Game.find({where: {id: req.params.id, isOver: 0, isRunning: 0},
        include: [db.User]}).success(function(game) {

            res.render(
                'viewgame', {
                    game: game.dataValues,
                    user: req.session.passport.user
                }
            );
        });
}

exports.joingame = function(req, res) {
    console.log('user ' + req.session.passport.user.id + ' is calling joinGame ' + req.params.id);
    db.Game.find({ where: { id: req.params.id, isOver: 0, isRunning: 0}, include: [db.User]})
        .success(function(game) {
            if (!game) {
                res.redirect('/lobby');
            }
            var teamA = 0;
            var teamB = 0;
            var userInRoom = false;
            game.users.forEach(function(user) {
                if (user.dataValues.id == req.session.passport.user.id) {
                    userInRoom = true;
                }
                if (user.dataValues.gamesUser.dataValues.team == 'a') {
                    teamA++;
                } else if (user.dataValues.gamesUser.dataValues.team == 'b') {
                    teamB++;
                }
            });
            if (userInRoom == false) {
                var gamesUser = {
                    GameId: req.params.id,
                    team: (teamB > teamA ? 'a' : 'b'),
                    UserId: req.session.passport.user.id
                }
                db.GamesUser.create(gamesUser).success(function() {
                    res.render(
                        'viewgame', {
                            game: game.dataValues,
                        }
                    );
                });
            }
            res.redirect('/viewgame/' + req.params.id);

        }).error(function(err) {
            res.redirect('/lobby');
        });

}