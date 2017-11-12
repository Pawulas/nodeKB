const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

mongoose.connect('mongodb://localhost/nodekb');
let db = mongoose.connection;

// Check connection
db.once('open', function (){
	console.log('connected to mongodb');
});

// Check for db errors
db.on('error', function (err){
	console.log(err);
});

//init app
const app = express();

// Bring in Models
let Article = require('./models/article');

// load view engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// Setup body parser
app.use(bodyParser.urlencoded({ extended: false}));
app.use(bodyParser.json());

// Set public folder
app.use(express.static(path.join(__dirname, 'public')));

// home route
app.get('/', function (req, res) {
	Article.find({}, function (err, articles){
		if (err) {
			console.log(err);
		} else {
			res.render('index', {
				title: 'Articles',
				articles: articles
			});
		}
	});
});

app.get('/articles/add', function (req, res) {
	res.render('add_article', {
		title: 'Add article'
	});
});

// get single article
app.get('/article/:id', function (req, res){
	Article.findById(req.params.id, function (err, article){
		res.render('article', {
			article: article
		});
	});
});

// Add submit POST
app.post('/articles/add', function (req, res) {
	let article = new Article();
	article.title = req.body.title;
	article.author = req.body.author;
	article.body = req.body.body;

	article.save(function (err) {
		if (err) {
			console.log(err);
			return;
		} else {
			res.redirect('/');
		}
	});
});

// edit article
app.get('/article/edit/:id', function (req, res){
	Article.findById(req.params.id, function (err, article){
		res.render('edit_article', {
			title: "Edit article",
			article: article
		});
	});
});

// update article
app.post('/articles/edit/:id', function (req, resp){
	let article = {};

	article.title = req.body.title;
	article.author = req.body.author;
	article.body = req.body.body;

	let query = {_id: req.params.id}

	Article.update(query, article, function (err){
		if (err) {
			console.log(err);
		} else {
			resp.redirect('/');
		}
	});
});

app.delete('/article/:id', function (req, resp){
	let query = {_id: req.params.id};
	Article.remove(query, function (err) {
		console.log(err);
	});

	resp.send('Success');

});

// start server
app.listen(3000, function (){
	console.log("server started on 3000");
});