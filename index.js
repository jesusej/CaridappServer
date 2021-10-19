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

app.post('/import', (req, res) => {
  
  let productUPC = req.body.upc;
  let productName = req.body.itemName;
  let descri = req.body.description;
  let prodWeight = req.body.unitaryWeight;

  if (productName && descri && prodWeight && (productUPC || productUPC === 0)){
    db.query(
      "INSERT INTO product (itemName, description, upc, unitaryWeight) VALUES (?, ?, ?, ?)", [productName, descri, productUPC, prodWeight],
      (err, result) => {
        if(err){
          console.log(err);
          res.send(err);
          
        }
        else {
          res.status(200);
          res.send(req.body);
        }
      }
    );
  } else {
    res.send("At least one of the variables was missing");
  }
  
  
})

app.get('/history', (req, res) => {

    db.query(
        "SELECT * FROM product",
        (err, result) => {
          if(err){
            console.log(err);
          }
          else if(result.length > 0) {
            res.send(result);
          }
          else{
            res.send("There's no registered products in db");
          }
        }
      );
})

app.get('/historyLine', (req, res) => {

    db.query(
        "SELECT line.lineID, product.itemName, donation.pickUpDate, line.upc, line.donationID, line.unitaryCost, line.productExpiration, line.originalQuantity FROM line JOIN product ON line.upc=product.upc JOIN donation ON donation.donationID = line.lineID;",
        (err, result) => {
          if(err){
            console.log(err);
          }
          else if(result.length > 0) {
            res.send(result);
          }
          else{
            res.send("There's no registered products in db");
          }
        }
      );
})



app.put('/updateLine', (req, res) => {
  
  let Line_ID = req.body.lineID;
  let uCost = req.body.unitaryCost;
  //let productExpiration = req.body.productExpiration;
  let quant = req.body.originalQuantity;

  let sql = 'UPDATE line SET unitaryCost=?, originalQuantity=? WHERE lineID=?';
  let data = [uCost, quant, Line_ID];

  if (Line_ID && uCost && (quant || quant === 0)){
    db.query(
      sql, data,
      (err, result) => {
        if(err){
          console.log(err);
          res.send(err);
          
        }
        else {
          res.status(200);
          res.send(req.body);
        }
      }
    );
  } else {
    res.send("At least one of the variables was missing");
  }
  
  
})

app.post('/setDonator', (req, res) => {
    
  let nameDonator = req.body.name;
  let adressPhysic = req.body.addressF;
  let adressRfc = req.body.addressR;
  let rfcDonator = req.body.rfc;
  let phoneDonator = req.body.phone;
  let emailDonator = req.body.email;

    db.query(
      "INSERT INTO product (nameD, shopAddress, deliveryAddress, rfc, telephone, email) VALUES (?, ?, ?, ?, ?, ?)", [nameDonator, adressPhysic, adressRfc, rfcDonator, phoneDonator, emailDonator],
      (err, result) => {
        if(err){
          console.log(err);
          res.send(err);
        }
        else {
          res.status(200);
          res.send(req.body);
        }
      }
    ); 
})


app.listen(PORT, () => {
  console.log("Working in port " + PORT);
});
