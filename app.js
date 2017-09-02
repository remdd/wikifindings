var express 					= require('express'),
	bodyParser 					= require('body-parser'),
	mongoose 					= require('mongoose'),
	methodOverride				= require('method-override'),
	User						= require('./models/user'),
	Category					= require('./models/category'),
	SubjectGroup				= require('./models/subjectgroup'),
	Subject 					= require('./models/subject'),
	passport					= require('passport'),
	LocalStrategy				= require('passport-local'),
	expressSession				= require('express-session'),
	bcrypt						= require('bcrypt-nodejs'),				//	
	logger						= require('morgan'),					//	http request logger
	cookieParser				= require('cookie-parser'),				//	?
	dotenv						= require('dotenv'),					//	environment variable manager
	flash						= require('connect-flash'),				//	flash messages
	mongoosePaginate 			= require('mongoose-paginate'),
	mongoDBStore				= require('connect-mongodb-session')(expressSession),	//	MongoDB sessions
	favicon						= require('serve-favicon'),
	app 						= express();

var commentRoutes				= require('./routes/comments'),
	findingRoutes				= require('./routes/findings'),
	indexRoutes					= require('./routes/index'),
	adminRoutes					= require('./routes/admin'),
	userRoutes					= require('./routes/users'),
	subjectRoutes				= require('./routes/subjects');

//	Clears database & re-seeds with data from seed file
// seedDB();

//	Configure DEV environment variables
dotenv.config({path: '.env'});				//	Loads environment variables file
console.log(process.env.SG_USER);

//	Connects mongoose to db
mongoose.Promise = global.Promise;			//	Re deprecation warning - need to look into implications
mongoose.connect(process.env.DBPATH, {useMongoClient: true});

//	Instructs Express to serve contents of public directory
app.use(express.static('public'));

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
		uri: process.env.DBPATH,
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
app.use(expressSession({
	secret: process.env.EXP_KEY,
	store: store,									//	Connects to MongoDBStore
	resave: true,									//	Was false - need to read into, is 'true' a risk?
	saveUninitialized: true,						//	Was false - need to read into, is 'true' a risk?
	httpOnly: true,									//	Don't let browser javascript access cookies
	secure: false									//	Set to true to limit cookies to https only (SET FOR PRODUCTION)
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

//	404 route
app.get('*', function(req, res) {
	res.render('404');
});


app.listen(process.env.PORT, process.env.IP, function() {
	console.log("Server started");
});
