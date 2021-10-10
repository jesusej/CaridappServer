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
      "INSERT INTO user (name, hashedPassword, role) VALUES (?, ?, ?)", [username, password, role],
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
  var productArray = [];
  for(let product of req.body.productArray){
    productArray.push({
      upc: product.upc,
      expirationDate: product.expirationDate || null,
      quantity: product.quantity || null,
      unitaryCost: product.unitaryCost || null,
      originalQuantity: product.originalQuantity || null
    });
  }

  let donation = {
    status: (typeof req.body.status != "undefined" ? req.body.status : null),
    receptionDate: req.body.receptionDate || null,
    pickUpDate: req.body.pickUpDate || null,
    warehouse: req.body.warehouse || null,
    productArray: productArray
  }

  db.query("INSERT INTO donation (status, receptionDate, pickUpDate, warehouse) VALUES (?, ?, ?, ?)", [donation.status, donation.receptionDate, donation.pickUpDate, donation.warehouse],
  (err, result) => {
    if (err){
      console.log(err);
      res.send(err);
    } else {
      console.log("Donation registered at id " + result.insertId);
      
      let donationID = result.insertId;
      
      for(let product of productArray){
        db.query("INSERT INTO line (upc, donationID, unitaryCost, productExpiration, originalQuantity, quantity) VALUES (?, ?, ?, ?, ?, ?)",
        [product.upc, donationID, product.unitaryCost, product.expirationDate, product.originalQuantity, product.quantity],
        (error) => {
          if(error){
            console.log("Error in product " + product.upc);
            console.log(error)
          }
        })
      }
    }
  });
  res.send(donation);
});

app.listen(PORT, () => {
  console.log("Working in port " + PORT);
});