const express = require('express');
const app = express();
const path = require('path');
const Bear = require('./bears.js');
const fs = require('fs');

bears = [];

app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));


app.use((req,res,next) => {
	console.log("Method: " + req.method + "\n" + "Path: " + req.path + "\n" + JSON.stringify(req.query));
	next();
});

app.set('view engine', 'hbs');

app.get('/', (req, res) => {
	res.render('home',{bear: bears}); 
});

app.get('/search', (req, res) => {
	let filteredBears = bears.slice();
	if (req.query.labelQ !== undefined && req.query.weightQ !== undefined) {
		filteredBears = filteredBears.filter((ele) => {
		  return ele.weight >= +req.query.weightQ &&
		         ele.label.includes(req.query.labelQ);
		});
	}
	else if (req.query.labelQ !== undefined && req.query.weightQ === undefined) {
		filteredBears = filteredBears.filter((ele) => {
		  return ele.label.includes(req.query.labelQ);
		});
	}
	else if (req.query.labelQ === undefined && req.query.weightQ !== undefined) {
		filteredBears = filteredBears.filter((ele) => {
		  return ele.weight >= +req.query.weightQ;
		});		
	}
	res.render('search',{bear: filteredBears}); 
});

app.get('/add', (req, res) => {
	res.render('add'); 
});

app.post('/add', (req, res) => { 
	let url = req.body.url;
	let newLabel = req.body.newLabel;
	let newWeight = req.body.newWeight;
	let newBear = new Bear(url,newLabel,+newWeight);
	bears.push(newBear);
	res.redirect('/'); 
});

const initial = (cb) => {
	let bearsPath = path.join(__dirname, 'labeled_bears');
	fs.readdir(bearsPath, (err, files) => { 
		if (err) {
			return;
		}
		else {
			let read = 0;
			let jsonFiles = files.filter((file) => {
			    return path.extname(file).toLowerCase() === '.json';
			});
			jsonFiles.forEach(file => {
				let filePath = path.join(bearsPath, file);
				fs.readFile(filePath, (err,data) => {
					if(err) {
						return;				 
					}
					else { 
						let imagePath = JSON.parse(data).imagePath;
						let label = JSON.parse(data).label;
						let weight = JSON.parse(data).weight;
						bears.push(new Bear(imagePath,label,weight));
						read++;
						if (read >= jsonFiles.length) {
	            			cb();
	          			} 
					} 
				});           		                                                                           
			});           
		} 
	});
}

function cb() {
	console.log(bears);
	app.listen(4000);
	console.log("Server started; type CTRL+C to shut down");
};

initial(cb);



