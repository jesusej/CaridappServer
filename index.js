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

let db = mysql.createConnection({
  host: process.env.DB_URL,
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB
});

app.get('/', (req, res) => {
  res.send("Hello world!", 200);
});

app.get('/users', (req, res) => {
  db.query(
    "SELECT * FROM user",
    (err, result) => {
      if(err){
        console.log(err);
      }
      else if(result.length > 0) {
        console.log(result);
        res.send(result);
      }
      else{
        res.send("There's no users in db");
      }
    }
  );
});

app.post('/user', (req, res) => {

  let username = req.body.username;
  let password = req.body.password;
  let role = req.body.role;

  db.query(
    "INSERT INTO user (name, hashedPassword, role) VALUES (?, ?, ?)", [username, password, role],
    (err, result) => {
      if(err){
        console.log(err);
      }
      else {
        res.send("Usuario registrado exitosamente");
      }
    }
  );
})

app.listen(PORT, () => {
  db.connect(function(err){
    if (err) throw err;
    console.log("Connected");
  })
  console.log("Working in port ${PORT}");
});