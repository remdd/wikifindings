var express 		= require ('express'),
	app 			= express(),
	bodyParser 		= require('body-parser'),
	mongoose 		= require('mongoose');


//	Connects mongoose to db
mongoose.connect("mongodb://localhost/wikifindings", {useMongoClient: true});

//	Mongoose schema
var findingSchema = new mongoose.Schema({
	title: String,
	category: String,
	subject: String,
	keywords: Array,
	background: String,
	findings: String,
	implications: String,
	image: String,
	postAuthor: String,
	datePosted: Date
})

//	Compile 'finding' mongoose model from schema
var Finding = mongoose.model("Finding", findingSchema);

/*
Finding.create(
	{
		title: "Evidence of perchlorate bleaching on Mars suggests greater longevity of liquid surface water in the recent geological past.", 
		category: "Natural sciences",
		subject: "Planetary sciences",
		keywords: ["perchlorate", "mars", "water", "solar system", "astronomy", "planetary science"],
		background: "As we got further and further away, it [the Earth] diminished in size. Finally it shrank to the size of a marble, the most beautiful you can imagine. That beautiful, warm, living object looked so fragile, so delicate, that if you touched it with a finger it would crumble and fall apart. Seeing this has to change a man.", 
		findings: "I don't know what you could say about a day in which you have seen four beautiful sunsets.", 
		implications: "WAs I stand out here in the wonders of the unknown at Hadley, I sort of realize there’s a fundamental truth to our nature, Man must explore . . . and this is exploration at its greatest.", 
		image: "https://www.nasa.gov/sites/default/files/thumbnails/image/pia18614-main_sol3786b_l257atc.jpg",
		postAuthor: "Steven Hawkinson",
		datePosted: "2016-11-04"
	}, function(err, finding) {
		if(err) {
			console.log("Error!");
			console.log(err);
		} else {
			console.log("Successfully added Finding");
			console.log(finding);
		}
	});
Finding.create(
	{
		title: "Cotton Ray chromatology reveals unique lattice structure of potassium hydroxide.", 
		category: "Natural sciences",
		subject: "Chemistry",
		keywords: ["cotton ray chromatology", "potassium hydroxide", "crystallography", "lattice"],
		background: "That's not soon enough! You guys go on without me! I'm going to go… look for more stuff to steal! Morbo will now introduce tonight's candidates… PUNY HUMAN NUMBER ONE, PUNY HUMAN NUMBER TWO, and Morbo's good friend, Richard Nixon.", 
		findings: "Goodbye, friends. I never thought I'd die like this. But I always really hoped. Good news, everyone! There's a report on TV with some very bad news! Bender! Ship! Stop bickering or I'm going to come back there and change your opinions manually!", 
		implications: "Nay, I respect and admire Harold Zoid too much to beat him to death with his own Oscar.", 
		image: "https://cormsquare.com/Images/Product/20160326122824376/_03262016122824376_68436fc0-a9f2-4154-84d2-9b6fc0decac5.jpg",
		postAuthor: "Jane Bellingham",
		datePosted: "2017-02-08"
	}, function(err, finding) {
		if(err) {
			console.log("Error!");
			console.log(err);
		} else {
			console.log("Successfully added Finding");
			console.log(finding);
		}
	});
Finding.create(
	{
		title: "Detailed study of atmospheric methane distribution suggests stronger link with dairy agriculture than that previously accepted the by International Climatologist Forum.", 
		category: "Natural sciences",
		subject: "Planetary sciences",
		keywords: ["methane", "climate change", "dairy", "veganism"],
		background: "That's not soon enough! You guys go on without me! I'm going to go… look for more stuff to steal! Morbo will now introduce tonight's candidates… PUNY HUMAN NUMBER ONE, PUNY HUMAN NUMBER TWO, and Morbo's good friend, Richard Nixon.", 
		findings: "Goodbye, friends. I never thought I'd die like this. But I always really hoped. Good news, everyone! There's a report on TV with some very bad news! Bender! Ship! Stop bickering or I'm going to come back there and change your opinions manually!", 
		implications: "Nay, I respect and admire Harold Zoid too much to beat him to death with his own Oscar.", 
		image: "https://media.mnn.com/assets/images/2017/01/cow-in-pasture.jpg.838x0_q80.jpg",
		postAuthor: "Jeff Sensimilia",
		datePosted: "2017-03-22"
	}, function(err, finding) {
		if(err) {
			console.log("Error!");
			console.log(err);
		} else {
			console.log("Successfully added Finding");
			console.log(finding);
		}
	});
*/

//	Instructs Express to serve contents of public directory
app.use(express.static('public'));

//	Default use of body parser
app.use(bodyParser.urlencoded({extended: true}));

//	Sets default render to ejs (no need for ejs file extensions)
app.set('view engine', 'ejs');

//	Home route
app.get('/', function(req, res) {
	res.render('home');
});

//	INDEX route
app.get('/findings', function(req, res) {
	Finding.find({}, function(err, allFindings) {
		if(err) {
			console.log(err);
		} else {
			res.render("index", {findings: allFindings})
		}
	});
	// res.render('findings', {findings: findingDB});
});

//	'Subject' page
//	app.get('/f/:subjectName', function(req, res) {
//	var subjectName = req.params.subjectName;
//	res.send('Welcome to the ' + subjectName + ' wikifindings page.');
//	});

// app.get('/f/:finding/comments/:id/:title', function(req, res) {
// 	res.send('Comments page!')
// });

//	NEW - show form to create new campground
app.get('/findings/new', function(req, res) {
	res.render('new');
});

//	CREATE new finding route
app.post('/findings', function(req, res) {
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
		datePosted: datePosted
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
	res.render('show');
});

//	Fallback route
app.get('*', function(req, res) {
	res.send('404 page not found...')
});


app.listen(3000, process.env.IP, function() {
	console.log("Server started");
});
