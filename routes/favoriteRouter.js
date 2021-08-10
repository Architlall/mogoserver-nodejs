const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
var authenticate = require('../authenticate');
const Dishes = require('../models/dishes');
const user = require('../models/user');
const favorite = require('../models/favorite');
const Favorites = require('../models/favorite');
const favoriteRouter = express.Router();

favoriteRouter.use(express.json());

favoriteRouter.route('/')
.get(authenticate.verifyUser, (req,res,next) => {
    Favorites.find({})
    .populate('author')
    .populate('dishes')
    .then((favorite) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(favorite);
    }, (err) => next(err))
    .catch((err) => next(err));
})
.post(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    Favorites.create(req.body)
    .then((favorite) => {
        console.log('Dish Created ', favorite);
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        favorite.author = req.user._id;
	    favorite.dishes.push(req.body);
        res.json(favorite);
    }, (err) => next(err))
    .catch((err) => next(err));
})
.put(authenticate.verifyUser,  (req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /favorites');
})
.delete(authenticate.verifyUser, (req, res, next) => {
    Favorites.remove({})
    .then((resp) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(resp);
    }, (err) => next(err))
    .catch((err) => next(err));    
});



favoriteRouter.route('/dishes')
.all(authenticate.verifyUser)


.post(function (req, res, next) {
	Favorites.findOne({}, function (err, favorite) {
		if (err) throw err;
		for(var key in req.body) {
			var index = favorite.dishes.indexOf(req.body[key])
			console.log(index);
			if (index == -1){
				favorite.dishes.push(req.body)
				console.log('Favorite added!');
            };
         };	
        favorite.save(function (err, favorite) {
            if (err) throw err;
            console.log('Updated Favorites!');
            res.json(favorite);
        });
    });
 });


favoriteRouter.route('/dishes/:dishId')
.get(authenticate.verifyUser, (req,res,next) => {
    Favorites.findById(req.params.dishId)
    .populate('author')
    .then((favorite) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(favorite);
    }, (err) => next(err))
    .catch((err) => next(err));
})
.post(authenticate.verifyUser, (req, res, next) => {
    Favorites.create(req.params.dishId)
    .then((favorite) => {
        console.log('Dish Created ', favorite);
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        favorite.author = req.user._id;
	    favorite.dishes.push(req.body);
        res.json(favorite);
    }, (err) => next(err))
    .catch((err) => next(err));
})
.put(authenticate.verifyUser,(req, res, next) => {
    Favorites.findByIdAndUpdate(req.params.dishId, {
        $set: req.body
    }, { new: true })
    .then((favorite) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(favorite);
    }, (err) => next(err))
    .catch((err) => next(err));
})
.delete(function (req, res, next) {
	Favorites.findOne({}, function (err, favorite) {
		if (err) throw err;
		var index = favorite.dishes.indexOf(req.params.dishObjectId);
		favorite.dishes.splice(index, 1)
		  console.log('Favorite deleted!'); 
		favorite.save(function (err, favorite) {
			if (err) throw err;
            console.log('Updated Favorites!'); 
            res.json(favorite);;
        });
    });
});






module.exports = favoriteRouter;