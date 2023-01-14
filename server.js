const express = require("express");
const MongoClient = require("mongodb").MongoClient;
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const multer = require("multer");
const fs = require("fs");
const csv = require("csv-parser");
var cors = require("cors");
const upload = multer({ dest: "uploads/" });

const app = express();

// Body parser middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());

mongoose.connect(
  "mongodb://himazmhmd:admin1234@ac-xgmqumx-shard-00-00.doosyor.mongodb.net:27017,ac-xgmqumx-shard-00-01.doosyor.mongodb.net:27017,ac-xgmqumx-shard-00-02.doosyor.mongodb.net:27017/?ssl=true&replicaSet=atlas-1twdph-shard-0&authSource=admin&retryWrites=true&w=majority",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
);

const db = mongoose.connection;
db.on("error", (error) => console.error(error));
db.once("open", () => console.log("Connected to MongoDB"));

//MongoDB Schemas

const emailSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
});

const Email = mongoose.model("Email", emailSchema);

const csvSchema = new mongoose.Schema({
  email: { type: String, ref: "Email", required: true },
  fileName: { type: String, required: true },
  data: { type: Object, required: true },
});

const CSV = mongoose.model("CSV", csvSchema);

// API Routes

app.post("/register", async (req, res) => {
  const email = req.body.email;
  const existingEmail = await Email.findOne(
    { email: email },
    { maxTimeMS: 30000 }
  );
  if (existingEmail) {
    res.status(200).send({ message: "Email already exists" });
  } else {
    // save the email to the database
    const newEmail = new Email({ email: email });
    console.log("newEmail" + newEmail);
    await newEmail.save();
    res.send({ message: "Email saved successfully" });
  }
});

app.post("/upload", upload.single("file"), (req, res) => {
  // console.log(req);
  const email = req.body.email;
  const results = [];
  fs.createReadStream(req.file.path)
    .pipe(csv())
    .on("data", (data) => results.push(data))
    .on("end", () => {
      // Connect to MongoDB and save the data
      mongoose.connect(
        "mongodb://himazmhmd:admin1234@ac-xgmqumx-shard-00-00.doosyor.mongodb.net:27017,ac-xgmqumx-shard-00-01.doosyor.mongodb.net:27017,ac-xgmqumx-shard-00-02.doosyor.mongodb.net:27017/?ssl=true&replicaSet=atlas-1twdph-shard-0&authSource=admin&retryWrites=true&w=majority",
        { useNewUrlParser: true }
      );
      const csv = new CSV({
        email: email,
        fileName: req.file.originalname,
        data: results,
      });

      csv.save((error) => {
        if (error) {
          res.status(500).send(error);
        } else {
          res.send({ message: "File saved successfully" });
        }
      });
    });
});

app.get("/fetch-csv-data", (req, res) => {
  console.log(req.query.email);
  CSV.find({ email: req.query.email }, (error, data) => {
    if (error) {
      res.status(500).send(error);
    } else {
      console.log("Data" + data);
      res.send(data);
    }
  });
});

const port = process.env.PORT || 5000;

app.listen(port, () => console.log(`Server running on port ${port}`));
