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
      expirationDate: line.expirationDate,
      quantity: line.quantity,
      unitaryCost: line.unitaryCost,
      originalQuantity: line.originalQuantity
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

app.get('/getTopProducts', (req, res) => {

  db.query(
      "SELECT upc, itemName, description, unitaryWeight FROM product LIMIT 5",
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
        "SELECT line.lineID, product.itemName, donation.pickUpDate, line.upc, line.donationID, line.unitaryCost, line.productExpiration, line.originalQuantity FROM line JOIN product ON line.upc=product.upc JOIN donation ON donation.donationID = line.donationID WHERE pickUpDate IS NOT NULL;",
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
  let dona_ID = req.body.donationID;
  let quant = req.body.originalQuantity;
  let uCost = req.body.unitaryCost;
  let prodExp = req.body.productExpiration;
  let pickUp = req.body.pickUpDate;

  //let sql = 'UPDATE line SET unitaryCost=?, originalQuantity=? WHERE lineID=?';
  let sql = 'UPDATE line, donation SET line.originalQuantity = ?, line.unitaryCost = ?, line.productExpiration = ?, donation.pickUpDate = ? WHERE line.lineID = ? AND donation.donationID = ?';
  let data = [quant, uCost, prodExp, pickUp, Line_ID, dona_ID];

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
      "INSERT INTO shop (nameD, shopAddress, deliveryAddress, rfc, telephone, email) VALUES (?, ?, ?, ?, ?, ?)", [nameDonator, adressPhysic, adressRfc, rfcDonator, phoneDonator, emailDonator],
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

app.put('/verifyLine', (req, res) => {
  
  let Line_ID = req.body.lineID;
  let dona_ID = req.body.donationID;
  let quant_rec = req.body.quantity;
  let prodExp = req.body.productExpiration;

  //let sql = 'UPDATE line SET unitaryCost=?, originalQuantity=? WHERE lineID=?';
  let sql = 'UPDATE line, donation SET line.quantity = ?, line.productExpiration = ? WHERE line.lineID = ? AND donation.donationID = ?';
  let data = [quant_rec, prodExp, Line_ID, dona_ID];

  if (Line_ID && dona_ID){
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


app.get('/historyDonation', (req, res) => {

  db.query(
      "SELECT donation.donationID, donation.pickUpDate, donation.warehouse FROM donation WHERE pickUpDate IS NOT NULL;",
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

app.put('/verifyDonation', (req, res) => {
  
  let dona_ID = req.body.donationID;
  let warehouse = req.body.warehouse;

  //let sql = 'UPDATE line SET unitaryCost=?, originalQuantity=? WHERE lineID=?';
  let sql = 'UPDATE donation SET donation.warehouse = ? WHERE donation.donationID = ?';
  let data = [warehouse, dona_ID];

  if (dona_ID){
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
    )
  } else {
    res.send("At least one of the variables was missing");
 }
})

  
/* Routes for Driver */

app.get('/getDonations', (req, res) => {

  db.query(
    "SELECT donationID, nameD, deliveryAddress FROM donation, shop WHERE status IS NULL AND donation.shopID = shop.shopID;", (err, result) => {
      if(err){
        console.log(err)
        res.send(err)
      }
      else if (result.length > 0) {
        res.status(200)
        res.send(result)
      }
      else {
        res.send("Donations empty")
      }
    }
  )
})

app.put('/updateDonationStatus', (req, res) => {

  let idDonation = req.body.idDonation;

  db.query(
    "UPDATE donation SET status = 0 WHERE (donationID = ?)", [idDonation], (err, result) => {
      if(err){
        console.log(err);
        res.send(err);
      }
      else{
        res.status(200);
        res.send("Status of donation with id " + idDonation + " updated with 0");
      }
    }
  )

})

app.listen(PORT, () => {
  console.log("Working in port " + PORT);
});
