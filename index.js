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

app.listen(PORT, () => {
  console.log("Working in port " + PORT);
});