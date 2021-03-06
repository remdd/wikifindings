var express 					= require('express'),
	bodyParser 					= require('body-parser'),
	mongoose 						= require('mongoose'),
	methodOverride			= require('method-override'),
	User								= require('./models/user'),
	Category						= require('./models/category'),
	SubjectGroup				= require('./models/subjectgroup'),
	Subject 						= require('./models/subject'),
	passport						= require('passport'),
	LocalStrategy				= require('passport-local'),
	expressSession			= require('express-session'),
	bcrypt							= require('bcrypt-nodejs'),				//	
	logger							= require('morgan'),					//	http request logger
	cookieParser				= require('cookie-parser'),				//	?
	dotenv							= require('dotenv'),					//	environment variable manager
	flash								= require('connect-flash'),				//	flash messages
	mongoosePaginate 		= require('mongoose-paginate'),
	mongoDBStore				= require('connect-mongodb-session')(expressSession),	//	MongoDB sessions
	favicon							= require('serve-favicon'),
	path								= require('path'),						//	native Node module
	app 								= express();

var commentRoutes			= require('./routes/comments'),
	findingRoutes				= require('./routes/findings'),
	indexRoutes					= require('./routes/index'),
	adminRoutes					= require('./routes/admin'),
	userRoutes					= require('./routes/users'),
	subjectRoutes				= require('./routes/subjects'),
	threadMapRoutes			= require('./routes/threadMap');

//	Clears database & re-seeds with dummy data from seed file
// seedDB();

//	Configure DEV environment variables
dotenv.config({path: '.env'});				//	Loads environment variables file
console.log(process.env.SG_USER);

//	Connects mongoose to db
mongoose.Promise = global.Promise;			//	Re deprecation warning - need to look into implications
mongoose.connect(process.env.DBPATH);

//	Instructs Express to serve contents of public directory
process.env.PWD = process.cwd();
app.use(express.static(process.env.PWD + '/public'));

//	Serves Favicon
app.use(favicon('public/img/WFFavicon.png'));

//	Morgan logger - send detail of http requests to console
app.use(logger('dev'));

//	Default use - need to read more!
app.use(cookieParser());

//	Flash message use
app.use(flash());

//	MongoDBStore config
var store = new mongoDBStore(
	{
		uri: process.env.DBPATH + '?retryWrites=false',
		collection: 'sessions'
	}, function(err) {
		if(err) {
			console.log(err);
		}
	}
);
//	MongoDBStore start error catching
store.on('error', function(err) {
	if(err) {
		console.log(err);
	}
});

//	Express-session and Passport usage
var secure = process.env.COOKIES_HTTPS_ONLY === 'false' ? false : true;				//	Set to true to limit cookies to https only (***SET TRUE FOR PRODUCTION***)
console.log("Cookies on HTTPS only: " + secure);
app.use(expressSession({
	secret: process.env.EXP_KEY,
	store: store,																	//	Connects to MongoDBStore
	resave: true,																	//	Was false - need to research this, is 'true' a risk?
	saveUninitialized: true,											//	Was false - need to research this, is 'true' a risk?
	httpOnly: true,																//	Don't let browser javascript access cookies
	secure: secure 
}));
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy({
	usernameField: 'email',
	passwordField: 'password'
}, User.authenticate()));
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
	res.locals.error = req.flash("error");
	res.locals.success = req.flash("success");
	next();
});

//	Router
app.use(indexRoutes);
app.use(commentRoutes);
app.use("/findings", findingRoutes);
app.use(adminRoutes);
app.use("/users", userRoutes);
app.use("/subjects", subjectRoutes);
app.use("/threads", threadMapRoutes);

//	404 route
app.get('*', function(req, res) {
	res.render('404');
});

//	Start server
app.listen(process.env.PORT, process.env.IP, function() {
	console.log("Server started");
});
