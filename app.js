var express 				= require('express'),
	bodyParser 				= require('body-parser'),
	mongoose 				= require('mongoose'),
	methodOverride			= require('method-override'),
	User					= require('./models/user'),
	seedDB					= require('./seeds'),
	allSubjects				= require('./subjectList'),
	passport				= require('passport'),
	LocalStrategy			= require('passport-local'),
	passportLocalMongoose	= require('passport-local-mongoose'),
	expressSession			= require('express-session'),
	bcrypt					= require('bcrypt-nodejs'),				//	
	logger					= require('morgan'),					//	http request logger
	cookieParser			= require('cookie-parser'),				//	?
	dotenv					= require('dotenv'),					//	environment variable manager
	flash					= require('connect-flash'),				//	flash messages
	app 					= express();

var commentRoutes			= require('./routes/comments'),
	findingRoutes			= require('./routes/findings'),
	indexRoutes				= require('./routes/index');

//	Clears database & re-seeds with data from seed file
seedDB();

//	Configure DEV environment variables
dotenv.config({path: 'EVS.env'});				//	Loads environment variables file
console.log(process.env.SG_USER);

//	Connects mongoose to db
mongoose.connect("mongodb://localhost/wikifindings", {useMongoClient: true});

//	Instructs Express to serve contents of public directory
app.use(express.static('public'));

//	Morgan logger - send detail of http requests to console
app.use(logger('dev'));

//	Default use - need to read more!
app.use(cookieParser());

//	Flash message use
app.use(flash());

//	Express-session and Passport usage
app.use(expressSession({
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

//	Middleware to make req.user etc available to all routes
app.use(function(req, res, next){
	res.locals.currentUser = req.user;
	res.locals.allSubjects = allSubjects;
	res.locals.error = req.flash("error");
	res.locals.success = req.flash("success");
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
