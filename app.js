var express 				= require('express'),
	bodyParser 				= require('body-parser'),
	mongoose 				= require('mongoose'),
	methodOverride			= require('method-override'),
	Finding 				= require('./models/finding'),
	Comment 				= require('./models/comment'),
	User					= require('./models/user'),
	seedDB					= require('./seeds'),
	passport				= require('passport'),
	LocalStrategy			= require('passport-local'),
	passportLocalMongoose	= require('passport-local-mongoose'),
	expressSession			= require('express-session'),
	app 					= express();

//	Clears database & re-seeds with data from seed file
seedDB();

//	Connects mongoose to db
mongoose.connect("mongodb://localhost/wikifindings", {useMongoClient: true});

//	Instructs Express to serve contents of public directory
app.use(express.static('public'));

app.use(require("express-session")({
	secret: "Bryher Higgs-Boson",
	resave: false,
	saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//	Default use of body parser
app.use(bodyParser.urlencoded({extended: true}));

//	Use method-override to look for _method in URL to convert to specified request (PUT or DELETE)
app.use(methodOverride("_method"));

//	Sets default render to ejs (no need for ejs file extensions)
app.set('view engine', 'ejs');

//	Middleware to make req.user available to all routes
app.use(function(req, res, next){
	res.locals.currentUser = req.user;
	next();
});


//	ROUTES ***********************
//	Home route
app.get('/', function(req, res) {
	res.render('home');
});

//	REST routes for 'findings'
//	INDEX route
app.get('/findings', function(req, res) {
	Finding.find({}, function(err, allFindings) {
		if(err) {
			console.log(err);
		} else {
			res.render("findings/index", {findings: allFindings})
		}
	});
	// res.render('findings', {findings: findingDB});
});

//	NEW - show form to create new campground
app.get('/findings/new', isLoggedIn, function(req, res) {
	res.render('findings/new');
});

//	CREATE new finding route
app.post('/findings', isLoggedIn, function(req, res) {
	var title = req.body.newTitle;
	var category = req.body.newCategory;
	var subject = req.body.newSubject;
	var keywords = req.body.newKeywords;
	var background = req.body.newBackground;
	var findings = req.body.newFindings;
	var implications = req.body.newImplications;
	var image = req.body.newImageURL;
	var postAuthor = "John Doe";						// Placeholder
	var datePosted = Date.now();
	var citation = req.body.newOriginalCitation;
	var citationLink = req.body.newOriginalCitationLink;
	var citationDOI = req.body.newOriginalCitationDOI;

	var newFinding = {
		title: title, 
		category: category, 
		subject: subject, 
		keywords: keywords, 
		background: background, 
		findings: findings, 
		implications: implications, 
		image: image,
		postAuthor: postAuthor, 
		datePosted: datePosted,
		citation: citation,
		citationLink: citationLink,
		citationDOI: citationDOI
	};
	Finding.create(newFinding, function(err) {
		if(err) {
			console.log(err);
		} else {
			res.redirect('/findings');
		}
	})
});

//	SHOW info about a finding
app.get('/findings/:id', function(req, res) {
	Finding.findById(req.params.id).populate("comments").exec(function(err, shownFinding) {
		if(err) {
			console.log(err);
			res.redirect('/findings');
		} else {
			res.render('findings/show', {finding: shownFinding});
		}
	});
});

//	EDIT a finding
app.get('/findings/:id/edit', function(req, res) {
	Finding.findById(req.params.id, function(err, shownFinding) {
		if(err) {
			console.log(err);
			res.redirect('/findings');
		} else {
			res.render('findings/edit', {finding: shownFinding});
		}
	});
});

//	UPDATE a finding
app.put('/findings/:id', function(req, res) {
	Finding.findByIdAndUpdate(req.params.id, req.body.finding, function(err, updatedFinding) {
		if(err) {
			console.log(err);
			res.redirect('/findings');
		} else {
			res.redirect('/findings/' + req.params.id);
		}
	});
});

//	DELETE a finding
app.delete('/findings/:id', function(req, res) {
	Finding.findByIdAndRemove(req.params.id, function(err) {
		if(err) {
			console.log(err);
			res.redirect('/findings');
		} else {
			res.redirect('/findings');
		}
	})
});

//	*******************************************	//
//	COMMENT ROUTES

//	CREATE comment on finding
app.get('/findings/:id/comments/new', isLoggedIn, function(req, res) {
	Finding.findById(req.params.id, function(err, finding) {
		if(err) {
			console.log(err);
		} else {
			res.render("comments/new", {finding: finding});
		}
	});
});

app.post('/findings/:id/comments', isLoggedIn, function(req, res) {
	Finding.findById(req.params.id, function(err, finding) {
		if(err) {
			console.log(err);
			res.redirect('/findings/' + finding._id);
		} else {
			req.body.comment.datePosted = Date.now();
			Comment.create(req.body.comment, function(err, comment) {
				if(err) {
					console.log(err);
				} else {
					finding.comments.push(comment);
					finding.save();
					res.redirect('/findings/' + finding._id);
				}
			})
		}
	});
});

//	*******************************************	//
//	REGISTER ROUTES

app.get('/register', function(req, res) {
	res.render('users/register');
});

app.post('/register', function(req, res) {
	var newUser = new User({username: req.body.username});
	User.register(newUser, req.body.password, function(err, user) {
		if(err) {
			console.log(err);
			return res.render('users/register');
		}
		passport.authenticate('local')(req, res, function() {
			res.redirect('/findings');
		});
	});
});

//	LOGIN ROUTES
app.get('/login', function(req, res) {
	res.render('users/login');
})

app.post('/login', passport.authenticate('local', {
	successRedirect: '/findings',
	failureRedirect: '/login'
}), function(req, res) {

});

app.get('/logout', function(req, res) {
	req.logout();			// all that passport requires to end session
	res.redirect('/');
});

//	Fallback route
app.get('*', function(req, res) {
	res.send('404 page not found...')
});

//	Middleware function definition
function isLoggedIn(req, res, next) {
	if(req.isAuthenticated()) {
		return next();
	}
	res.redirect('/login');
}

function isLoggedInAsScientist(req, res, next) {
	if(req.isAuthenticated()) {
		return next();
	}
	res.redirect('/login');
}


app.listen(3000, process.env.IP, function() {
	console.log("Server started");
});
