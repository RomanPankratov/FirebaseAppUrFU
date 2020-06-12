const admin = require("firebase-admin");
const express = require("express");
const app = express();
const port = 3000;
const bodyParser = require("body-parser")
const cors = require("cors");
const fs = require("fs"),
PNG = require("pngjs").PNG;;
const request = require("request");

const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://fir-app-urfu.firebaseio.com"
});

app.use(cors());
app.use(bodyParser.text());
app.listen(port, () => {
  console.log("Сервер запущен");
});

app.route("/validateToken")
  .get((req, res) => {
    console.log("Это гет запрос ", req.body);
    res.send("hello, world");
  });

app.route("/validateToken")
  .post((req, res) => {
    console.log("Тело запроса: ", req.body);
    let idToken = req.body;
    admin.auth().verifyIdToken(idToken)
        .then(decodedToken => {
            let uid = decodedToken.uid;
            console.log("decodedToken: ", decodedToken);
            console.log("Uid: ", uid);
            res.send(JSON.stringify({status: "success"}));
        })
        .catch(error => {
          res.status(401).send("Unauthorized request");
          console.log(error);
        });
  });

function transformToGrayscale(source){
  return new Promise((resolve, reject) => {
    fs.createReadStream(source)
    .pipe(
      new PNG({
        filterType: 4,
      })
    )
    .on("parsed", function () {
      for (var y = 0; y < this.height; y++) {
        for (var x = 0; x < this.width; x++) {
          var idx = (this.width * y + x) << 2;
          let mean = (this.data[idx] + this.data[idx+1] + this.data[idx+2]) / 3;
          this.data[idx] = Math.ceil(mean);
          this.data[idx + 1] = Math.ceil(mean);
          this.data[idx + 2] = Math.ceil(mean);
        }
      }
      this.pack().pipe(fs.createWriteStream("out.png").on("close", resolve));
    }); 
  });
}

app.post("/grayScale", (req, res) => {
  console.log("Тело запроса: ", req.body);
  let imgUrl = req.body;
  let source = "toGrayscale.png";
  download(imgUrl, source)
      .then( () => {
          console.log(typeof(source));
          transformToGrayscale(source)
              .then( () => {
                  res.sendFile(__dirname + "/out.png");
        })
    })
});

function download(uri, filename){
  return new Promise((resolve, reject) => {
    request.head(uri, function(err, res, body){
      request(uri)
       .pipe(fs.createWriteStream(filename))
       .on('close', resolve);
    });
  });
};
