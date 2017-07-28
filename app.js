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

var commentRoutes			= require('./routes/comments'),
	findingRoutes			= require('./routes/findings'),
	indexRoutes				= require('./routes/index');

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

//	Router
app.use(indexRoutes);
app.use(commentRoutes);
app.use("/findings", findingRoutes);

//	404 route
app.get('*', function(req, res) {
	res.render('404');
});


app.listen(3000, process.env.IP, function() {
	console.log("Server started");
});
