var app = require("express")(),
    server = require("http").Server(app),
    bodyParser = require("body-parser"),
    Datastore = require("nedb"),
    async = require("async");

app.use(bodyParser.json());

module.exports = app;

//Create the database

var inventoryDB = new Datastore({
    filename: "./server/databases/inventory.db",
    autoload: true,
});

//GET inventory
app.get("/", (req,res)=>{
    res.send("Inventory API");
});

//GET a product from inventor by _id

app.get("/product/:productId", (req,res)=>{
    if(!req.params.productId){
        res.status(500).send("ID field is required");
    }else{
        inventoryDB.findOne({_id: req.params.productId}, (err, item)=>{
            res.send(item);
        });
    }
});

//GET all inventory products

app.get("/products", (req,res)=>{
    inventoryDB.find({}, (err, items)=>{
        res.send(items);
    })
});