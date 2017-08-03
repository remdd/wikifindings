var mongoose = require("mongoose");
var Finding = require("./models/finding");
var Comment = require("./models/comment");
var User = require("./models/user");

var seed_comments = [
	{
		_id: "507f1f77bcf86cd799439012",
		text: "This is great!  Really interesting.",
		author: {
			id: "597e2b2c73edab2348f49be5",
			username: "Robin"
		},
		datePosted: "2017-06-15"
	}
]

var seed_findings = [
	{
		_id: "507f1f77bcf86cd799439011",
		title: "Honeybees that get damaged wings become less choosy about the flowers that they visit.",
		category: { _id: "59810dd9934669c15fdc160f" },
		subjectGroup: { _id: "59811755934669c15fdc1611" },
		subject: { _id: "5980df95190bde783ce4a062" },
		keywords: ["Pollination"],
		keywords_lower: ["pollination"],
		background: "The wings of insects get worn as they get older, but the effects on their behaviour of this is largely unstudied.\n \nThe reason it might be important is that it might affect both how well workers do at collecting nectar and pollen for the colony, and how well plants are pollinated. It might therefore affect the survival of populations of both bees and plants. \n \nPrevious studies have shown that having worn wings forces bees to flap their wings faster to fly. Therefore there could be increased costs of flight that mean behaviour should change.",
		findings: "We followed honeybees that we individually marked as they foraged on patches of lavender flowers. \n \nWing damage over time appeared to show some effect of positive feedback. That is, it looks like having wing damage makes more wing damage more likely. \n \nWe found that honeybees with wings that were damaged, either naturally or by experimental manipulation, tended to be less choosy about which flowers they visited. Bees with worn wings tended to visit lower quality flowers than bees with pristine wings. \n \nHowever, wing damage did not seem to affect how long bees stayed on flowers or flying between flowers",
		implications: "Honeybees are important pollinators of crops and other flowering plants. Therefore their choices about which flowers to visit have implications for crop yield and the future of wild plant populations. \n \nOther work has shown that bees wings get worn by collisions with plant parts. So we might expect bees to avoid collisions with plant parts by visiting flowers that are in the open and not surrounded by plant parts. \n \nIn highly dense crop fields, such a behaviour would reduce the pollination of flowers and so reduce crop yield.",
		image: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1d/European_honey_bee_extracts_nectar.jpg/1280px-European_honey_bee_extracts_nectar.jpg",
		postAuthor: { username: "Dr Andrew Higginson" },
		datePosted: "2017-06-14",
		citation: "Higginson AD, Barnard CJ (2004) Accumulating wing damage affects foraging decisions in honeybees (Apis mellifera L.). Ecological Entomology 29:52-59",
		citationDOI: "10.1111/j.0307-6946.2004.00573.x",
		comments: [ "507f1f77bcf86cd799439012" ]
	},
	{
		title: "Regeneration of premolar enamel found to be accelerated by daily application of hydrochloric acid toothpaste.",
		category: { _id: "5981aa6bc421ae7b6c0d9ee4" },
		subjectGroup: { _id: "5981d952100e6b3064f949b7" },
		subject: { _id: "5982f97805326f1fd0d49337" },
		keywords: ["Teeth", "Acid", "pH", "Water", "Toothpaste", "Hydrochloric acid"],
		keywords_lower: ["teeth", "acid", "ph", "water", "toothpaste", "hydrochloric acid"],
		background: "We are all connected; To each other, biologically. To the earth, chemically. To the rest of the universe atomically. Problems look mighty small from 150 miles up. A Chinese tale tells of some men sent to harm a young girl who, upon seeing her beauty, become her protectors rather than her violators. That's how I felt seeing the Earth for the first time. I could not help but love and cherish her.",
		findings: "As I stand out here in the wonders of the unknown at Hadley, I sort of realize there’s a fundamental truth to our nature, Man must explore . . . and this is exploration at its greatest. Spaceflights cannot be stopped. This is not the work of any one man or even a group of men. It is a historical process which mankind is carrying out in accordance with the natural laws of human development.",
		implications: "The Earth was small, light blue, and so touchingly alone, our home that must be defended like a holy relic. The Earth was absolutely round. I believe I never knew what the word round meant until I saw Earth from space. What was most significant about the lunar voyage was not that man set foot on the Moon but that they set eye on the earth.",
		image: "https://www.plaksmacker.com/UserFiles/Images/Products/10203.jpg",
		postAuthor: { username: "Fran Pickle" },
		datePosted: "2017-03-17",
		citation: "Sagan C (2003) Cosmic photon time reversal headfuck voodoo study. Cosmology 12:68-69",
		citationLink: "https://en.wikipedia.org/wiki/Carl_Sagan",
		citationDOI: "2347234v 23423 43m 234 1234"
	},
	{
		title: "New measurements of perchlorate distribution on Mars from Mars Express Orbiter suggest lower chance of stability of liquid surface water in the recent geological past.",
		category: { _id: "59810dd9934669c15fdc160f" },
		subjectGroup: { _id: "598114fa934669c15fdc1610" },
		subject: { _id: "5982f576fde5f346a0220daa" },
		keywords: ["Mars", "perchlorates", "Mars Express", "water", "life on Mars", "exobiology"],
		keywords_lower: ["mars", "perchlorates", "mars express", "water", "life on mars", "exobiology"],
		background: "Emerged into consciousness prime number inconspicuous motes of rock and gas, Drake Equation dream of the mind's eye globular star cluster another world tesseract, extraordinary claims require extraordinary evidence astonishment. Worldlets Flatland rich in mystery, trillion, as a patch of light, dream of the mind's eye, a billion trillion white dwarf rogue, Apollonius of Perga, a billion trillion, light years Drake Equation",
		findings: "cosmic ocean how far away from which we spring explorations trillion with pretty stories for which there's little good evidence, Flatland paroxysm of global death? Dream of the mind's eye, venture great turbulent clouds corpus callosum! Emerged into consciousness, take root and flourish.",
		implications: "Rogue courage of our questions. Shores of the cosmic ocean great turbulent clouds network of wormholes brain is the seed of intelligence, from which we spring, Vangelis, extraplanetary finite but unbounded billions upon billions cosmic fugue Orion's sword, white dwarf sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam dispassionate extraterrestrial observer kindling the energy hidden in matter.",
		image: "http://media-channel.nationalgeographic.com/media/uploads/photos/content/video/2016/10/04/778945603828_Mars_BigThinker_Mars101.mov.00_01_00_21.Still001.jpg",
		postAuthor: { username: "Carl Sagan" },
		datePosted: "2016-12-08",
		citation: "Sagan C (2003) Mars Express perchlorate distribution study. Planetary science 17: 12-36",
		citationLink: "http://saganipsum.com/?p=10&latin=1",
		citationDOI: "2349793845729387457298345"
	},
	{
		title: "New photon mass measurements suggest that time is in fact flowing backwards and we are all our grand-daughters' grandmothers",
		category: { _id: "59810dd9934669c15fdc160f" },
		subjectGroup: { _id: "598114fa934669c15fdc1610" },
		subject: { _id: "5980f775190bde783ce4a063" },
		keywords: ["Time", "Mindfuck", "Cosmic", "Mars", "photon"],
		keywords_lower: ["time", "mindfuck", "cosmic", "mars", "photon"],
		background: "We are all connected; To each other, biologically. To the earth, chemically. To the rest of the universe atomically. Problems look mighty small from 150 miles up. A Chinese tale tells of some men sent to harm a young girl who, upon seeing her beauty, become her protectors rather than her violators. That's how I felt seeing the Earth for the first time. I could not help but love and cherish her.",
		findings: "As I stand out here in the wonders of the unknown at Hadley, I sort of realize there’s a fundamental truth to our nature, Man must explore . . . and this is exploration at its greatest. Spaceflights cannot be stopped. This is not the work of any one man or even a group of men. It is a historical process which mankind is carrying out in accordance with the natural laws of human development.",
		implications: "The Earth was small, light blue, and so touchingly alone, our home that must be defended like a holy relic. The Earth was absolutely round. I believe I never knew what the word round meant until I saw Earth from space. What was most significant about the lunar voyage was not that man set foot on the Moon but that they set eye on the earth.",
		image: "http://www.youwall.com/wallpapers/201307/cosmos-wallpaper.jpg",
		postAuthor: { username: "Carl Sagan" },
		datePosted: "2015-08-01",
		citation: "Sagan C (2003) Cosmic photon time reversal headfuck voodoo study. Cosmology 12:68-69",
		citationLink: "https://en.wikipedia.org/wiki/Carl_Sagan",
		citationDOI: "2347234v 23423 43m 234 1234"
	},
	{
		title: "Reactionless sublight engine theory advancements raise exciting possibilities for outer solar system exploration.",
		category: { _id: "59810dd9934669c15fdc160f" },
		subjectGroup: { _id: "598114fa934669c15fdc1610" },
		subject: { _id: "5982f53afde5f346a0220da9" },
		keywords: ["Engine", "Saturn", "Jupiter", "Uranus", "Neptune", "Pluto", "Kuiper Belt", "Oort Cloud", "Solar System", "Spacecraft"],
		keywords_lower: ["engine", "saturn", "jupiter", "uranus", "neptune", "pluto", "kuiper belt", "oort cloud", "solar system", "spacecraft"],
		background: "Emerged into consciousness prime number inconspicuous motes of rock and gas, Drake Equation dream of the mind's eye globular star cluster another world tesseract, extraordinary claims require extraordinary evidence astonishment. Worldlets Flatland rich in mystery, trillion, as a patch of light, dream of the mind's eye, a billion trillion white dwarf rogue, Apollonius of Perga, a billion trillion, light years Drake Equation",
		findings: "cosmic ocean how far away from which we spring explorations trillion with pretty stories for which there's little good evidence, Flatland paroxysm of global death? Dream of the mind's eye, venture great turbulent clouds corpus callosum! Emerged into consciousness, take root and flourish.",
		implications: "Rogue courage of our questions. Shores of the cosmic ocean great turbulent clouds network of wormholes brain is the seed of intelligence, from which we spring, Vangelis, extraplanetary finite but unbounded billions upon billions cosmic fugue Orion's sword, white dwarf sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam dispassionate extraterrestrial observer kindling the energy hidden in matter.",
		image: "https://www.nasa.gov/sites/default/files/thumbnails/image/nh-pluto-charon.jpg",
		postAuthor: { username: "Dr Alan Blueberries" },
		datePosted: "2016-12-04",
		citation: "Sagan C (2003) Mars Express perchlorate distribution study. Planetary science 17: 12-36",
		citationLink: "http://saganipsum.com/?p=10&latin=1",
		citationDOI: "2349793845729387457298345"
	},
	{
		title: "Solar sail developments dramatically reduce travel time to inner solar system.",
		category: { _id: "59810dd9934669c15fdc160f" },
		subjectGroup: { _id: "598114fa934669c15fdc1610" },
		subject: { _id: "5982f53afde5f346a0220da9" },
		keywords: ["Engine", "Solar System", "Spacecraft", "Mars", "Venus", "Moon", "Mercury", "Asteroids"],
		keywords_lower: ["engine", "solar system", "spacecraft", "mars", "venus", "moon", "mercury", "asteroids"],
		background: "We are all connected; To each other, biologically. To the earth, chemically. To the rest of the universe atomically. Problems look mighty small from 150 miles up. A Chinese tale tells of some men sent to harm a young girl who, upon seeing her beauty, become her protectors rather than her violators. That's how I felt seeing the Earth for the first time. I could not help but love and cherish her.",
		findings: "As I stand out here in the wonders of the unknown at Hadley, I sort of realize there’s a fundamental truth to our nature, Man must explore . . . and this is exploration at its greatest. Spaceflights cannot be stopped. This is not the work of any one man or even a group of men. It is a historical process which mankind is carrying out in accordance with the natural laws of human development.",
		implications: "The Earth was small, light blue, and so touchingly alone, our home that must be defended like a holy relic. The Earth was absolutely round. I believe I never knew what the word round meant until I saw Earth from space. What was most significant about the lunar voyage was not that man set foot on the Moon but that they set eye on the earth.",
		image: "http://www.esa.int/var/esa/storage/images/esa_multimedia/images/2005/07/mariner_10_image_of_venus_cloud_tops/10179851-2-eng-GB/Mariner_10_image_of_Venus_cloud_tops_large.jpg",
		postAuthor: { username: "Dr Alan Blueberries" },
		datePosted: "2015-08-01",
		citation: "Sagan C (2003) Cosmic photon time reversal headfuck voodoo study. Cosmology 12:68-69",
		citationLink: "https://en.wikipedia.org/wiki/Carl_Sagan",
		citationDOI: "2347234v 23423 43m 234 1234"
	},	
	{
		title: "Canine teeth of minors found to grow ten times faster at night than in the day.",
		category: { _id: "5981aa6bc421ae7b6c0d9ee4" },
		subjectGroup: { _id: "5981d952100e6b3064f949b7" },
		subject: { _id: "5982f97805326f1fd0d49337" },
		keywords: ["Teeth", "Night", "Canines"],
		keywords_lower: ["teeth", "night", "canines"],
		background: "Emerged into consciousness prime number inconspicuous motes of rock and gas, Drake Equation dream of the mind's eye globular star cluster another world tesseract, extraordinary claims require extraordinary evidence astonishment. Worldlets Flatland rich in mystery, trillion, as a patch of light, dream of the mind's eye, a billion trillion white dwarf rogue, Apollonius of Perga, a billion trillion, light years Drake Equation",
		findings: "cosmic ocean how far away from which we spring explorations trillion with pretty stories for which there's little good evidence, Flatland paroxysm of global death? Dream of the mind's eye, venture great turbulent clouds corpus callosum! Emerged into consciousness, take root and flourish.",
		implications: "Rogue courage of our questions. Shores of the cosmic ocean great turbulent clouds network of wormholes brain is the seed of intelligence, from which we spring, Vangelis, extraplanetary finite but unbounded billions upon billions cosmic fugue Orion's sword, white dwarf sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam dispassionate extraterrestrial observer kindling the energy hidden in matter.",
		image: "http://media-channel.nationalgeographic.com/media/uploads/photos/content/video/2016/10/04/778945603828_Mars_BigThinker_Mars101.mov.00_01_00_21.Still001.jpg",
		postAuthor: { username: "Fran Pickle" },
		datePosted: "2015-06-30",
		citation: "Sagan C (2003) Mars Express perchlorate distribution study. Planetary science 17: 12-36",
		citationLink: "http://saganipsum.com/?p=10&latin=1",
		citationDOI: "2349793845729387457298345"
	},
	{
		title: "Some dragonflies fly clockwise, others anticlockwise.",
		category: { _id: "5981d82012e738367cc348e0" },
		subjectGroup: { _id: "5982f8a705326f1fd0d4932e" },
		subject: { _id: "5982f8c505326f1fd0d4932f" },
		keywords: ["Grasshopper", "Pollination", "Grasses"],
		keywords_lower: ["grasshopper", "pollination", "grasses"],
		background: "We are all connected; To each other, biologically. To the earth, chemically. To the rest of the universe atomically. Problems look mighty small from 150 miles up. A Chinese tale tells of some men sent to harm a young girl who, upon seeing her beauty, become her protectors rather than her violators. That's how I felt seeing the Earth for the first time. I could not help but love and cherish her.",
		findings: "As I stand out here in the wonders of the unknown at Hadley, I sort of realize there’s a fundamental truth to our nature, Man must explore . . . and this is exploration at its greatest. Spaceflights cannot be stopped. This is not the work of any one man or even a group of men. It is a historical process which mankind is carrying out in accordance with the natural laws of human development.",
		implications: "The Earth was small, light blue, and so touchingly alone, our home that must be defended like a holy relic. The Earth was absolutely round. I believe I never knew what the word round meant until I saw Earth from space. What was most significant about the lunar voyage was not that man set foot on the Moon but that they set eye on the earth.",
		image: "https://a-z-animals.com/media/animals/images/original/grasshopper7.jpg",
		postAuthor: { username: "Dr Donnie Tabasco" },
		datePosted: "2016-12-25",
		citation: "Sagan C (2003) Cosmic photon time reversal headfuck voodoo study. Cosmology 12:68-69",
		citationLink: "https://en.wikipedia.org/wiki/Carl_Sagan",
		citationDOI: "2347234v 23423 43m 234 1234"
	},
	{
		title: "Developments in Acid base chemistry lead to suprising new applications for Potassium Dihydroxide",
		category: { _id: "59810dd9934669c15fdc160f" },
		subjectGroup: { _id: "5982f68efde5f346a0220db0" },
		subject: { _id: "5982f7a105326f1fd0d49325" },
		keywords: ["Alkali", "Acid", "pH", "Water", "Potassium Dihydroxide"],
		keywords_lower: ["alkali", "acid", "ph", "water", "potassium dihydroxide"],
		background: "Emerged into consciousness prime number inconspicuous motes of rock and gas, Drake Equation dream of the mind's eye globular star cluster another world tesseract, extraordinary claims require extraordinary evidence astonishment. Worldlets Flatland rich in mystery, trillion, as a patch of light, dream of the mind's eye, a billion trillion white dwarf rogue, Apollonius of Perga, a billion trillion, light years Drake Equation",
		findings: "cosmic ocean how far away from which we spring explorations trillion with pretty stories for which there's little good evidence, Flatland paroxysm of global death? Dream of the mind's eye, venture great turbulent clouds corpus callosum! Emerged into consciousness, take root and flourish.",
		implications: "Rogue courage of our questions. Shores of the cosmic ocean great turbulent clouds network of wormholes brain is the seed of intelligence, from which we spring, Vangelis, extraplanetary finite but unbounded billions upon billions cosmic fugue Orion's sword, white dwarf sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam dispassionate extraterrestrial observer kindling the energy hidden in matter.",
		image: "http://www.online-sciences.com/wp-content/uploads/2014/10/alkali-metals-2.jpg",
		postAuthor: { username: "Dr Donnie Tabasco" },
		datePosted: "2016-07-01",
		citation: "Sagan C (2003) Mars Express perchlorate distribution study. Planetary science 17: 12-36",
		citationLink: "http://saganipsum.com/?p=10&latin=1",
		citationDOI: "2349793845729387457298345"
	},
	{
		title: "We found some Roman pots and pans it was ace",
		category: { _id: "59810dd9934669c15fdc160f" },
		subjectGroup: { _id: "598114fa934669c15fdc1610" },
		subject: { _id: "5982f85105326f1fd0d4932b" },
		keywords: ["Mars", "perchlorates", "Mars Express", "water", "life on Mars", "exobiology"],
		keywords_lower: ["mars", "perchlorates", "mars express", "water", "life on mars", "exobiology"],
		background: "Emerged into consciousness prime number inconspicuous motes of rock and gas, Drake Equation dream of the mind's eye globular star cluster another world tesseract, extraordinary claims require extraordinary evidence astonishment. Worldlets Flatland rich in mystery, trillion, as a patch of light, dream of the mind's eye, a billion trillion white dwarf rogue, Apollonius of Perga, a billion trillion, light years Drake Equation",
		findings: "cosmic ocean how far away from which we spring explorations trillion with pretty stories for which there's little good evidence, Flatland paroxysm of global death? Dream of the mind's eye, venture great turbulent clouds corpus callosum! Emerged into consciousness, take root and flourish.",
		implications: "Rogue courage of our questions. Shores of the cosmic ocean great turbulent clouds network of wormholes brain is the seed of intelligence, from which we spring, Vangelis, extraplanetary finite but unbounded billions upon billions cosmic fugue Orion's sword, white dwarf sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam dispassionate extraterrestrial observer kindling the energy hidden in matter.",
		image: "http://media-channel.nationalgeographic.com/media/uploads/photos/content/video/2016/10/04/778945603828_Mars_BigThinker_Mars101.mov.00_01_00_21.Still001.jpg",
		postAuthor: { username: "Carl Sagan" },
		datePosted: "2016-02-10",
		citation: "Sagan C (2003) Mars Express perchlorate distribution study. Planetary science 17: 12-36",
		citationLink: "http://saganipsum.com/?p=10&latin=1",
		citationDOI: "2349793845729387457298345"
	},
	{
		title: "Astronomy compels the soul to look upward, and leads us from this world to another.",
		category: { _id: "59810dd9934669c15fdc160f" },
		subjectGroup: { _id: "598114fa934669c15fdc1610" },
		subject: { _id: "5980f775190bde783ce4a063" },
		keywords: ["Time", "Mindfuck", "Cosmic", "Mars", "photon"],
		keywords_lower: ["time", "mindfuck", "cosmic", "mars", "photon"],
		background: "We are all connected; To each other, biologically. To the earth, chemically. To the rest of the universe atomically. Problems look mighty small from 150 miles up. A Chinese tale tells of some men sent to harm a young girl who, upon seeing her beauty, become her protectors rather than her violators. That's how I felt seeing the Earth for the first time. I could not help but love and cherish her.",
		findings: "As I stand out here in the wonders of the unknown at Hadley, I sort of realize there’s a fundamental truth to our nature, Man must explore . . . and this is exploration at its greatest. Spaceflights cannot be stopped. This is not the work of any one man or even a group of men. It is a historical process which mankind is carrying out in accordance with the natural laws of human development.",
		implications: "The Earth was small, light blue, and so touchingly alone, our home that must be defended like a holy relic. The Earth was absolutely round. I believe I never knew what the word round meant until I saw Earth from space. What was most significant about the lunar voyage was not that man set foot on the Moon but that they set eye on the earth.",
		image: "http://www.youwall.com/wallpapers/201307/cosmos-wallpaper.jpg",
		postAuthor: { username: "Dr Emma Melfi" },
		datePosted: "2015-08-01",
		citation: "Sagan C (2003) Cosmic photon time reversal headfuck voodoo study. Cosmology 12:68-69",
		citationLink: "https://en.wikipedia.org/wiki/Carl_Sagan",
		citationDOI: "2347234v 23423 43m 234 1234"
	},
	{
		title: "The sky is the limit only for those who aren't afraid to fly!",
		category: { _id: "5982f80c05326f1fd0d49329" },
		subjectGroup: { _id: "5982f81f05326f1fd0d4932a" },
		subject: { _id: "5982f88105326f1fd0d4932d" },
		keywords: ["Grasses", "Water"],
		keywords_lower: ["grasses", "water"],
		background: "Emerged into consciousness prime number inconspicuous motes of rock and gas, Drake Equation dream of the mind's eye globular star cluster another world tesseract, extraordinary claims require extraordinary evidence astonishment. Worldlets Flatland rich in mystery, trillion, as a patch of light, dream of the mind's eye, a billion trillion white dwarf rogue, Apollonius of Perga, a billion trillion, light years Drake Equation",
		findings: "cosmic ocean how far away from which we spring explorations trillion with pretty stories for which there's little good evidence, Flatland paroxysm of global death? Dream of the mind's eye, venture great turbulent clouds corpus callosum! Emerged into consciousness, take root and flourish.",
		implications: "Rogue courage of our questions. Shores of the cosmic ocean great turbulent clouds network of wormholes brain is the seed of intelligence, from which we spring, Vangelis, extraplanetary finite but unbounded billions upon billions cosmic fugue Orion's sword, white dwarf sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam dispassionate extraterrestrial observer kindling the energy hidden in matter.",
		image: "http://media-channel.nationalgeographic.com/media/uploads/photos/content/video/2016/10/04/778945603828_Mars_BigThinker_Mars101.mov.00_01_00_21.Still001.jpg",
		postAuthor: { username: "Dr Emma Melfi" },
		datePosted: "2016-12-08",
		citation: "Sagan C (2003) Mars Express perchlorate distribution study. Planetary science 17: 12-36",
		citationLink: "http://saganipsum.com/?p=10&latin=1",
		citationDOI: "2349793845729387457298345"
	},
	{
		title: "Pluto is actually very dissimilar to the Earth.",
		category: { _id: "59810dd9934669c15fdc160f" },
		subjectGroup: { _id: "598114fa934669c15fdc1610" },
		subject: { _id: "5982f576fde5f346a0220daa" },
		keywords: ["Time", "Pluto", "Cosmic", "Mars", "photon"],
		keywords_lower: ["time", "pluto", "cosmic", "mars", "photon"],
		background: "We are all connected; To each other, biologically. To the earth, chemically. To the rest of the universe atomically. Problems look mighty small from 150 miles up. A Chinese tale tells of some men sent to harm a young girl who, upon seeing her beauty, become her protectors rather than her violators. That's how I felt seeing the Earth for the first time. I could not help but love and cherish her.",
		findings: "As I stand out here in the wonders of the unknown at Hadley, I sort of realize there’s a fundamental truth to our nature, Man must explore . . . and this is exploration at its greatest. Spaceflights cannot be stopped. This is not the work of any one man or even a group of men. It is a historical process which mankind is carrying out in accordance with the natural laws of human development.",
		implications: "The Earth was small, light blue, and so touchingly alone, our home that must be defended like a holy relic. The Earth was absolutely round. I believe I never knew what the word round meant until I saw Earth from space. What was most significant about the lunar voyage was not that man set foot on the Moon but that they set eye on the earth.",
		image: "http://www.youwall.com/wallpapers/201307/cosmos-wallpaper.jpg",
		postAuthor: { username: "Dr Emma Melfi" },
		datePosted: "2015-08-01",
		citation: "Sagan C (2003) Cosmic photon time reversal headfuck voodoo study. Cosmology 12:68-69",
		citationLink: "https://en.wikipedia.org/wiki/Carl_Sagan",
		citationDOI: "2347234v 23423 43m 234 1234"
	},
	{
		title: "To go places and do things that have never been done before – that’s what living is all about.",
		category: { _id: "5982f80c05326f1fd0d49329" },
		subjectGroup: { _id: "5982f81f05326f1fd0d4932a" },
		subject: { _id: "5982f88105326f1fd0d4932d" },
		keywords: ["Genes", "water", "exobiology"],
		keywords_lower: ["genes", "water", "exobiology"],
		background: "Emerged into consciousness prime number inconspicuous motes of rock and gas, Drake Equation dream of the mind's eye globular star cluster another world tesseract, extraordinary claims require extraordinary evidence astonishment. Worldlets Flatland rich in mystery, trillion, as a patch of light, dream of the mind's eye, a billion trillion white dwarf rogue, Apollonius of Perga, a billion trillion, light years Drake Equation",
		findings: "cosmic ocean how far away from which we spring explorations trillion with pretty stories for which there's little good evidence, Flatland paroxysm of global death? Dream of the mind's eye, venture great turbulent clouds corpus callosum! Emerged into consciousness, take root and flourish.",
		implications: "Rogue courage of our questions. Shores of the cosmic ocean great turbulent clouds network of wormholes brain is the seed of intelligence, from which we spring, Vangelis, extraplanetary finite but unbounded billions upon billions cosmic fugue Orion's sword, white dwarf sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam dispassionate extraterrestrial observer kindling the energy hidden in matter.",
		image: "http://media-channel.nationalgeographic.com/media/uploads/photos/content/video/2016/10/04/778945603828_Mars_BigThinker_Mars101.mov.00_01_00_21.Still001.jpg",
		postAuthor: { username: "Dr Emma Melfi" },
		datePosted: "2012-11-11",
		citation: "Sagan C (2003) Mars Express perchlorate distribution study. Planetary science 17: 12-36",
		citationLink: "http://saganipsum.com/?p=10&latin=1",
		citationDOI: "2349793845729387457298345"
	},
	{
		title: "Encyclopaedia galactica realm of the galaxies explorations finite but unbounded, worldlets trillion stirred by starlight two ghostly white figures in coveralls",
		category: { _id: "59810dd9934669c15fdc160f" },
		subjectGroup: { _id: "598114fa934669c15fdc1610" },
		subject: { _id: "5980f775190bde783ce4a063" },
		keywords: ["Time", "Mindfuck", "Cosmic", "Mars", "photon"],
		keywords_lower: ["time", "mindfuck", "cosmic", "mars", "photon"],
		background: "We are all connected; To each other, biologically. To the earth, chemically. To the rest of the universe atomically. Problems look mighty small from 150 miles up. A Chinese tale tells of some men sent to harm a young girl who, upon seeing her beauty, become her protectors rather than her violators. That's how I felt seeing the Earth for the first time. I could not help but love and cherish her.",
		findings: "As I stand out here in the wonders of the unknown at Hadley, I sort of realize there’s a fundamental truth to our nature, Man must explore . . . and this is exploration at its greatest. Spaceflights cannot be stopped. This is not the work of any one man or even a group of men. It is a historical process which mankind is carrying out in accordance with the natural laws of human development.",
		implications: "The Earth was small, light blue, and so touchingly alone, our home that must be defended like a holy relic. The Earth was absolutely round. I believe I never knew what the word round meant until I saw Earth from space. What was most significant about the lunar voyage was not that man set foot on the Moon but that they set eye on the earth.",
		image: "http://www.youwall.com/wallpapers/201307/cosmos-wallpaper.jpg",
		postAuthor: { username: "Dr Emma Melfi" },
		datePosted: "2015-06-07",
		citation: "Sagan C (2003) Cosmic photon time reversal headfuck voodoo study. Cosmology 12:68-69",
		citationLink: "https://en.wikipedia.org/wiki/Carl_Sagan",
		citationDOI: "2347234v 23423 43m 234 1234"
	}

];

function seedDB() {

	//	Remove all comments
	Comment.remove({}, function(err) {
		if(err) {
			console.log(err);
		} else {
			console.log("Removed all comments");
			seed_comments.forEach(function(seed) {
				Comment.create(seed, function(err, finding) {
					if(err) {
						console.log(err);
					} else {
						console.log("Added a seed comment");
					}
				});
			});
		}
	});

	//	Remove all findings
	Finding.remove({}, function(err) {
		if(err) {
			console.log(err);
		} else {
			console.log("Removed all findings");
			seed_findings.forEach(function(seed) {
				Finding.create(seed, function(err, finding) {
					if(err) {
						console.log(err);
					} else {
						console.log("Added a seed finding");
					}
				});
			});
		}
	});

	//	Add some placeholder findings
}

module.exports = seedDB;