var express = require ('express');
var app = express();
var bodyParser = require('body-parser');
//	var Countable = require('countable');

//	Instructs Express to serve contents of public directory
app.use(express.static('public'));

//	Default use of body parser
app.use(bodyParser.urlencoded({extended: true}));

//	Sets default render to ejs (no need for ejs file extensions)
app.set('view engine', 'ejs');




var findingDB = [
	{	
		title: "Evidence of perchlorate bleaching on Mars suggests greater longevity of liquid surface water in the recent geological past.", 
		category: "Natural sciences",
		subject: "Planetary physics",
		background: "As we got further and further away, it [the Earth] diminished in size. Finally it shrank to the size of a marble, the most beautiful you can imagine. That beautiful, warm, living object looked so fragile, so delicate, that if you touched it with a finger it would crumble and fall apart. Seeing this has to change a man.", 
		findings: "I don't know what you could say about a day in which you have seen four beautiful sunsets.", 
		implications: "WAs I stand out here in the wonders of the unknown at Hadley, I sort of realize there’s a fundamental truth to our nature, Man must explore . . . and this is exploration at its greatest.", 
		tags: ["perchlorate", "mars", "water", "solar system", "astronomy", "planetary science"],
		authors: ["Steve Hawkins"],
		datePosted: "2016-11-04",
		datePublished: "2014-07-01"
	},
	{	
		title: "Detailed study of atmospheric methane distribution suggests stronger link with dairy agriculture than that previously accepted the by International Climatologist Forum.", 
		category: "Natural sciences",
		subject: "Climatology",
		background: "That's not soon enough! You guys go on without me! I'm going to go… look for more stuff to steal! Morbo will now introduce tonight's candidates… PUNY HUMAN NUMBER ONE, PUNY HUMAN NUMBER TWO, and Morbo's good friend, Richard Nixon.", 
		findings: "Goodbye, friends. I never thought I'd die like this. But I always really hoped. Good news, everyone! There's a report on TV with some very bad news! Bender! Ship! Stop bickering or I'm going to come back there and change your opinions manually!", 
		implications: "Nay, I respect and admire Harold Zoid too much to beat him to death with his own Oscar.", 
		tags: ["methane", "climate change", "dairy", "veganism"],
		authors: ["Dr Sarah Bellingham", "Antonio Guevara", "Mohammad Gupta"],
		datePosted: "2017-03-22",
		datePublished: "2017-01-08"
	},
	{	
		title: "Cotton Ray chromatology reveals unique lattice structure of potassium hydroxide.", 
		category: "Natural sciences",
		subject: "Chemistry",
		background: "That's not soon enough! You guys go on without me! I'm going to go… look for more stuff to steal! Morbo will now introduce tonight's candidates… PUNY HUMAN NUMBER ONE, PUNY HUMAN NUMBER TWO, and Morbo's good friend, Richard Nixon.", 
		findings: "Goodbye, friends. I never thought I'd die like this. But I always really hoped. Good news, everyone! There's a report on TV with some very bad news! Bender! Ship! Stop bickering or I'm going to come back there and change your opinions manually!", 
		implications: "Nay, I respect and admire Harold Zoid too much to beat him to death with his own Oscar.", 
		tags: ["cotton ray chromatology", "potassium hydroxide", "crystallography", "lattice"],
		authors: ["Dr Tony Gubbins"],
		datePosted: "2017-02-08",
		datePublished: "2016-07-27"
	}
];

var optgroups = {
	astronomy: ["Astrometry", "Cosmology", "Extragalactic astronomy", "Galactic astronomy", "Planetary science", "Stellar astronomy"],
	biology: ["Anatomy", "Astrobiology", "Biochemistry", "Bioengineering", "Bioethics", "Biogeography", "Bioinformatics"],
	chemistry: ["Acid-base chemistry", "Analytical chemistry", "Astrochemistry", "Biochemistry", "Colloidal chemistry", "Crystallography"],
	earth_sciences: ["Atmospheric sciences", "Ecology", "Environmental science", "Geodesy", "Geography"],
	physics: ["Applied and interdisciplinary physics", "Atomic physics", "Computational physics", "Condensed matter physics", "Experimental physics", "Mechanics"]
}

var optgroups_natural_sciences = ["Astronomy", "Biology", "Chemistry", "Earth sciences", "Physics"];

//	Home route
app.get('/', function(req, res) {
	res.render('home');
});

app.get('/findings', function(req, res) {
	res.render('findings', {findings: findingDB});
})

//	'Subject' page
//	app.get('/f/:subjectName', function(req, res) {
//	var subjectName = req.params.subjectName;
//	res.send('Welcome to the ' + subjectName + ' wikifindings page.');
//	});

// app.get('/f/:finding/comments/:id/:title', function(req, res) {
// 	res.send('Comments page!')
// });

app.get('/findings/new', function(req, res) {
	res.render('new', {optgroups_natural_sciences: optgroups_natural_sciences, optgroups: optgroups});
});


//	Fallback route
app.get('*', function(req, res) {
	res.send('404 page not found...')
});


//	Create new finding route
app.post('/findings', function(req, res) {
	var title = req.body.title;
	var subject = req.body.subject;
	var background = req.body.background;
	var findings = req.body.findings;
	var implications = req.body.implications;
	var newFinding = {title: title, subject: subject, background: background, findings: findings, implications: implications};
	findingDB.push(newFinding);
	res.redirect('/findings');
});


app.listen(3000, process.env.IP, function() {
	console.log("Server started");
});
