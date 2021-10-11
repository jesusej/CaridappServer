let express = require("express");
let mysql = require("mysql");
let cors = require("cors");
let bodyParser = require('body-parser');


let app = express();
let PORT = process.env.PORT || 3001;

app.use(express.json());

app.use(
  cors({
    origin: ["https://caridapp.herokuapp.com"],
    methods: ["GET", "POST"]
  })
);
app.use(bodyParser.urlencoded({ extended: true }));

let db = mysql.createPool({
  connectionLimit: 5,
  host: process.env.DB_URL,
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB
});

app.get('/', (req, res) => {
  console.log("Sending a 'Hello world!' to " + req.ip);
  res.status(200).send("Hello world!");
});

app.get('/users', (req, res) => {
  console.log("Sending all the users to " + req.ip);
  db.query(
    "SELECT * FROM user",
    (err, result) => {
      if(err){
        console.log(err);
      }
      else if(result.length > 0) {
        res.send(result);
      }
      else{
        res.send("There's no users in db");
      }
    }
  );
});

app.post('/user', (req, res) => {

  console.log("Register user request from " + req.ip);

  let username = req.body.username;
  let password = req.body.password;
  let role = req.body.role;

  if (username && password && (role || role === 0)){
    db.query(
      "INSERT INTO user (name, hashedPwd, role) VALUES (?, ?, ?)", [username, password, role],
      (err, result) => {
        if(err){
          console.log(err);
          res.send(err);
        }
        else {
          res.send("User " + username + " registered successfully");
        }
      }
    );
  } else {
    res.send("At least one of the variables was missing");
  }
})

app.post('/setDonation', (req, res) => {
  var lineArray = [];
  for(let line of req.body.lineArray){
    lineArray.push({
      upc: line.upc,
      expirationDate: line.expirationDate || null,
      quantity: line.quantity || null,
      unitaryCost: line.unitaryCost || null,
      originalQuantity: line.originalQuantity || null
    });
  }

  let donation = {
    status: (typeof req.body.status != "undefined" ? req.body.status : null),
    receptionDate: req.body.receptionDate || null,
    pickUpDate: req.body.pickUpDate || null,
    warehouse: req.body.warehouse || null,
    lineArray: lineArray
  }

  db.query("INSERT INTO donation (status, receptionDate, pickUpDate, warehouse) VALUES (?, ?, ?, ?)", [donation.status, donation.receptionDate, donation.pickUpDate, donation.warehouse],
  (err, result) => {
    if (err){
      console.log(err);
      res.send(err);
    } else {
      console.log("Donation registered at id " + result.insertId);
      
      let donationID = result.insertId;
      
      for(let line of lineArray){
        db.query("INSERT INTO line (upc, donationID, unitaryCost, productExpiration, originalQuantity, quantity) VALUES (?, ?, ?, ?, ?, ?)",
        [line.upc, donationID, line.unitaryCost, line.expirationDate, line.originalQuantity, line.quantity],
        (error) => {
          if(error){
            console.log("Error in line " + line.upc);
            console.log(error)
          }
        })
      }
    }
  });
  res.send(donation);
});

app.post('/import', (req, res) => {
  
  /*
  res.status(200);
  console.log(req.body);      // your JSON
  res.send(req.body);
  */

  //console.log("Register product request from " + req.ip);
  //res.status(200);
  //res.send(req.body);
  let productName = req.body.name;
  let descri = req.body.desc;
  let productUPC = req.body.upc;

  if (productName && descri && (productUPC || productUPC === 0)){
    db.query(
      "INSERT INTO product (itemName, description, upc) VALUES (?, ?, ?)", [productName, descri, productUPC],
      (err, result) => {
        if(err){
          console.log(err);
          res.send(err);
          
        }
        else {
          //res.send("Product " + productName + " registered successfully");
          res.status(200);
          res.send(req.body);
        }
      }
    );
  } else {
    res.send("At least one of the variables was missing");
  }
  
  
})

app.get('/import', (req, res) => {
  res.status(200);
  console.log(req.body);      // your JSON
  res.send(req.body);

    /*db.query(
      "INSERT INTO product (itemName) VALUES (?)", [nameP],
      (err, result) => {
        if(err){
          console.log(err);
          res.send(err);
        }
        else {
          res.send("User " + nameP + " registered successfully");
        }
      }
    );*/
    
})

app.get('/history', (req, res) => {
  
  //res.json([{name:'test', desc:'1.0'}, {name:'test2', desc:'2.0'}]);
  res.json({name:'test2', desc:'2.0'});
  res.status(200);
  /*db.query(
    "SELECT * FROM product",
    (err, result) => {
      if(err){
        console.log(err);
      }
      else if(result.length > 0) {
        res.send(result);
      }
      else{
        res.send("There's no products in db");
      }
    }
  );
  */
})


app.listen(PORT, () => {
  console.log("Working in port " + PORT);
});
