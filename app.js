var express 		= require('express'),
	bodyParser 		= require('body-parser'),
	mongoose 		= require('mongoose'),
	methodOverride	= require('method-override'),
	Finding 		= require('./models/finding'),
	Comment 		= require('./models/comment'),
	seedDB			= require('./seeds'),
	passport		= require('passport'),
	app 			= express();


seedDB();
//	Connects mongoose to db
mongoose.connect("mongodb://localhost/wikifindings", {useMongoClient: true});

//	Instructs Express to serve contents of public directory
app.use(express.static('public'));

//	Default use of body parser
app.use(bodyParser.urlencoded({extended: true}));

//	Use method-override to look for _method in URL to convert to specified request (PUT or DELETE)
app.use(methodOverride("_method"));

//	Sets default render to ejs (no need for ejs file extensions)
app.set('view engine', 'ejs');

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
app.get('/findings/new', function(req, res) {
	res.render('findings/new');
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

//	CREATE comment on finding
app.get('/findings/:id/comments/new', function(req, res) {
	Finding.findById(req.params.id, function(err, finding) {
		if(err) {
			console.log(err);
		} else {
			res.render("comments/new", {finding: finding});
		}
	});
});

app.post('/findings/:id/comments', function(req, res) {
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









//	Fallback route
app.get('*', function(req, res) {
	res.send('404 page not found...')
});


app.listen(3000, process.env.IP, function() {
	console.log("Server started");
});
