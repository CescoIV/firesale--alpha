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

/*
    GET REQUESTS
*/

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

/*
    POST REQUESTS
*/

// Create inventory product

app.post("/product", (req,res)=>{
    let newProduct = req.body;

    inventoryDB.insert(newProduct, (err,item)=>{
        if(err){
            res.status(500).send(err);
        }else{
            res.send(item);
        }
    });
});

/*
    DELETE REQUESTS
*/

//Delete inventory product

app.delete("/product/:productId", (req,res)=>{
    inventoryDB.remove({_id: req.params.productId},(err,itemRemoved)=>{
        if(err){
            res.status(500).send(err);
        }else{
            res.sendStatus(200);
        }
    });
});


/*
    PUT REQUESTS
*/

//Update an inventory product

app.put("/product",(req,res)=>{
    let id = req.body._id;

    inventoryDB.update({_id: id}, req.body, {}, (err, numReplaced, item)=>{
        if(err){
            res.status(500).send(err);
        }else{
            res.status(200).send(item);
        }
    });
});

// app.decrementInventory = function(products) {
//     async.eachSeries(products, function(transactionProduct, callback) {
//       inventoryDB.findOne({ _id: transactionProduct._id }, function(
//         err,
//         product
//       ) {
//         // catch manually added items (don't exist in inventory)
//         if (!product || !product.quantity_on_hand) {
//           callback();
//         } else {
//           var updatedQuantity =
//             parseInt(product.quantity_on_hand) -
//             parseInt(transactionProduct.quantity);
//           inventoryDB.update(
//             { _id: product._id },
//             { $set: { quantity_on_hand: updatedQuantity } },
//             {},
//             callback
//           );
//         }
//       });
//     });
// };