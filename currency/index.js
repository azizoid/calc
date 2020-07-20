const express = require("express");
const PORT = process.env.PORT || 4100;

const helmet = require("helmet");
const cors = require("cors");

const fetch = require("node-fetch");
const xml2js = require("xml2js");
const _ = require("lodash");

const app = express();

app.use(cors());
app.use(helmet());
app.disable("x-powered-by");

app.get("/api", (req, res) => {
  fetch("https://www.ecb.europa.eu/stats/eurofxref/eurofxref-daily.xml")
    .then((response) => response.text())
    .then((text) => {
      xml2js.parseString(text, { explicitArray: false }, (err, result) => {
        if (err) {
          throw err;
        }
        let out = {
          date: result["gesmes:Envelope"]["Cube"].Cube.$.time,
        };
        const currencies = result["gesmes:Envelope"]["Cube"].Cube.Cube;
        out.data = _.map(currencies, (data) => ({
          code: "EUR" + data.$.currency,
          base: "EUR",
          target: data.$.currency,
          rate: data.$.rate * 1,
        }));
        res.status(200).json(out);
      });
    });
});

app.listen(PORT, () => {
  console.log(`App is running on 4100`);
});
