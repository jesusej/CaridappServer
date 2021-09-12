let express = require("express");
let mysql = require("mysql");
let cors = require("cors");

let app = express();

app.use(express.json());

app.use(
  cors({
    origin: [""],
    methods: ["GET", "POST"]
  })
);

let db = mysql.createConnection({
  host: "mysql://b55b70a1c78f8d:22d98064@us-cdbr-east-04.cleardb",
  user: "b55b70a1c78f8d",
  password: "22d98064",
  database: ""
});

app.listen(3001, () => {
  db.connect(function(err){
    if (err) throw err;
    console.log("Connected");
  })
  console.log("Working in port 3001");
});