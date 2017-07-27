var mongoose = require("mongoose");
var Finding = require("./models/finding");

var data = [
	{
		title: "Honeybees that get damaged wings become less choosy about the flowers that they visit.",
		category: "Natural sciences",
		subject: "Behavioural ecology",
		keywords: ["Pollination"],
		background: "The wings of insects get worn as they get older, but the effects on their behaviour of this is largely unstudied. The reason it might be important is that it might affect both how well workers do at collecting nectar and pollen for the colony, and how well plants are pollinated. It might therefore affect the survival of populations of both bees and plants. Previous studies have shown that having worn wings forces bees to flap their wings faster to fly. Therefore there could be increased costs of flight that mean behaviour should change.",
		findings: "We followed honeybees that we individually marked as they foraged on patches of lavender flowers. Wing damage over time appeared to show some effect of positive feedback. That is, it looks like having wing damage makes more wing damage more likely. We found that honeybees with wings that were damaged, either naturally or by experimental manipulation, tended to be less choosy about which flowers they visited. Bees with worn wings tended to visit lower quality flowers than bees with pristine wings. However, wing damage did not seem to affect how long bees stayed on flowers or flying between flowers",
		implications: "Honeybees are important pollinators of crops and other flowering plants. Therefore their choices about which flowers to visit have implications for crop yield and the future of wild plant populations. Other work has shown that bees wings get worn by collisions with plant parts. So we might expect bees to avoid collisions with plant parts by visiting flowers that are in the open and not surrounded by plant parts. In highly dense crop fields, such a behaviour would reduce the pollination of flowers and so reduce crop yield.",
		image: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1d/European_honey_bee_extracts_nectar.jpg/1280px-European_honey_bee_extracts_nectar.jpg",
		postAuthor: "Dr Andrew Higginson",
		datePosted: "2017-06-14",
		citation: "Higginson AD, Barnard CJ (2004) Accumulating wing damage affects foraging decisions in honeybees (Apis mellifera L.). Ecological Entomology 29:52-59",
		citationDOI: "10.1111/j.0307-6946.2004.00573.x"
	},
	{
		title: "New measurements of perchlorate distribution on Mars from Mars Express Orbiter suggest lower chance of stability of liquid surface water in the recent geological past.",
		category: "Natural sciences",
		subject: "Planetary science",
		keywords: ["Mars", "perchlorates", "Mars Express", "water", "life on Mars", "exobiology"],
		background: "Emerged into consciousness prime number inconspicuous motes of rock and gas, Drake Equation dream of the mind's eye globular star cluster another world tesseract, extraordinary claims require extraordinary evidence astonishment. Worldlets Flatland rich in mystery, trillion, as a patch of light, dream of the mind's eye, a billion trillion white dwarf rogue, Apollonius of Perga, a billion trillion, light years Drake Equation",
		findings: "cosmic ocean how far away from which we spring explorations trillion with pretty stories for which there's little good evidence, Flatland paroxysm of global death? Dream of the mind's eye, venture great turbulent clouds corpus callosum! Emerged into consciousness, take root and flourish.",
		implications: "Rogue courage of our questions. Shores of the cosmic ocean great turbulent clouds network of wormholes brain is the seed of intelligence, from which we spring, Vangelis, extraplanetary finite but unbounded billions upon billions cosmic fugue Orion's sword, white dwarf sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam dispassionate extraterrestrial observer kindling the energy hidden in matter.",
		image: "http://media-channel.nationalgeographic.com/media/uploads/photos/content/video/2016/10/04/778945603828_Mars_BigThinker_Mars101.mov.00_01_00_21.Still001.jpg",
		postAuthor: "Carl Sagan",
		datePosted: "2016-12-08",
		citation: "Sagan C (2003) Mars Express perchlorate distribution study. Planetary science 17: 12-36",
		citationLink: "http://saganipsum.com/?p=10&latin=1",
		citationDOI: "2349793845729387457298345"
	},
	{
		title: "New photon mass measurements suggest that time is in fact flowing backwards and we are all our grand-daughters' grandmothers",
		category: "Natural sciences",
		subject: "Cosmology",
		keywords: ["Time", "Mindfuck", "Cosmic", "Mars", "photon"],
		background: "We are all connected; To each other, biologically. To the earth, chemically. To the rest of the universe atomically. Problems look mighty small from 150 miles up. A Chinese tale tells of some men sent to harm a young girl who, upon seeing her beauty, become her protectors rather than her violators. That's how I felt seeing the Earth for the first time. I could not help but love and cherish her.",
		findings: "As I stand out here in the wonders of the unknown at Hadley, I sort of realize there’s a fundamental truth to our nature, Man must explore . . . and this is exploration at its greatest. Spaceflights cannot be stopped. This is not the work of any one man or even a group of men. It is a historical process which mankind is carrying out in accordance with the natural laws of human development.",
		implications: "The Earth was small, light blue, and so touchingly alone, our home that must be defended like a holy relic. The Earth was absolutely round. I believe I never knew what the word round meant until I saw Earth from space. What was most significant about the lunar voyage was not that man set foot on the Moon but that they set eye on the earth.",
		image: "http://www.youwall.com/wallpapers/201307/cosmos-wallpaper.jpg",
		postAuthor: "Carl Sagan",
		datePosted: "2015-08-01",
		citation: "Sagan C (2003) Cosmic photon time reversal headfuck voodoo study. Cosmology 12:68-69",
		citationLink: "https://en.wikipedia.org/wiki/Carl_Sagan",
		citationDOI: "2347234v 23423 43m 234 1234"
	}
];

function seedDB() {
	//	Remove all findings
	Finding.remove({}, function(err) {
		if(err) {
			console.log(err);
		} else {
			console.log("Removed all findings");
			data.forEach(function(seed) {
				Finding.create(seed, function(err, data) {
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