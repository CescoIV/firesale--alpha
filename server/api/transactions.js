var app = require("express")(),
    server = require("http").Server(app),
    bodyParser = require("body-parser"),
    Datastore = require("nedb");

var Inventory = require('./inventory');

app.use(bodyParser.json());

// Create the db

var Transactions = new Datastore({
    filename: './server/databases/transactions.db',
    autoload: true,
});

/*
    GET REQUESTS
*/

//GET base url
app.get('/',(req,res)=>{
    res.send('Transactions API');
});

//GET all transactions
app.get('/all', (req,res)=>{
    Transactions.find({},(err,docs)=>{
        res.setEncoding(docs);
    });
});

//GET transactions from most recent date, up to a limit
app.get('/limit',(req,res)=>{
    let limit = req.query.limit;
    
    //Read the limit, if it exists, parse it 
    //into base 10, if not set it to 5
    limit ? parseInt(limit, 10) : limit = 5; 
    
    Transactions.find({}).limit(limit)
                .sort({date:-1})
                .exec((err,docs)=>{
                    err ? res.status(500).send(err) : res.send(docs);
                });
});

//GET total sales for the day

app.get('/day-total',(req,res)=>{
    let startDate, endDate;

    if(req.query.date){
        startDate = new Date(req.query.date);
        startDate.setHours(0,0,0,0);

        endDate = new Date(req.query.date);
        endDate.setHours(23,59,59,999);
    }else{
        startDate = new Date();
        startDate.setHours(0,0,0,0);

        endDate = new Date();
        endDate.setHours(23,59,59,999);
    }
    
    Transactions.find({ date:{
        $gte: startDate.toJSON(),
        $lte: endDate.toJSON(),
    }}, (err,docs)=>{
        let result = {
            date: startDate,
        }
        if(docs){
            let total = docs.reduce((p,c)=>{ return p + c.total}, 0.00);
        
            result.total = parseFloat(parseFloat(total).toFixed(2));
            res.send(result);
        }else{
            result.total = 0;
            res.send(result);
        }
    });
});

//GET transactions for a specific date

app.get('/by-date', function (req, res) {
	
	var startDate = new Date(2018, 2, 21)
	startDate.setHours(0,0,0,0)
	var endDate = new Date(2015, 2, 21)
	endDate.setHours(23,59,59,999)
	Transactions.find({ date: { $gte: startDate.toJSON(), $lte: endDate.toJSON() } }, function (err, docs) {
		if (docs)
			res.send(docs)
	});
});

// GET a single transaction
app.get('/:transactionId', function (req, res) {
	Transactions.find({ _id: req.params.transactionId }, function (err, doc) {
		if (doc)
			res.send(doc[0])
	});
});

/*
    POST REQUESTS
*/

// Add new transaction
app.post('/new', function (req, res) {
	var newTransaction = req.body
	
	Transactions.insert(newTransaction, function (err, transaction) {
		if (err) 
			res.status(500).send(err)
		else {
			res.sendStatus(200)
			Inventory.decrementInventory(transaction.products)
		} 
	})
})
