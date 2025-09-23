const express = require("express");
var cors = require("cors");
require("dotenv").config(); // Load .env variables
const fetch = require("./business-logic/Stream-Logic/fetch");
const AnimeFetch = require("./business-logic/Db-Logic/animelistfetch");
const AnimeInfoFetch = require("./business-logic/Db-Logic/animeinfo");
const app = express();
const PORT = process.env.PORT;
var quality = 0;
app.use(cors());
app.listen(PORT, () => {
  console.log(`Server is running  http://localhost:${PORT}`);
});
app.get("/", (req, res) => {
  res.send("hello");
});
app.get("/animeInfo", async (req, res) => {
  const name = req.query;
  console.log(name.name);
  const data = await AnimeInfoFetch(name.name);
  res.send(data);
});
app.get("/assets", async (req, res) => {
  res.json(await AnimeFetch());
});
app.get("/:disk/:name/:ep/:file", async (req, res) => {
  try {
    var p = req.params.file;
    if (p.charAt(0) == "i") {
      p =
        req.params.file.substring(0, 5) +
        quality +
        req.params.file.substring(6, req.params.file.length);
    }
    if (p.charAt(0) != "i" && p.charAt(0) != "o") {
      p =
        req.params.file.substring(0, 6) +
        quality +
        req.params.file.substring(7, req.params.file.length);
    }
    console.log(req.params);
    const path =
      req.params.disk + "/" + req.params.name + "/" + req.params.ep + "/" + p;
    console.log(path);
    const chunk = await fetch(path);
    chunk.data.pipe(res);
  } catch (e) {}
});
app.get("/:disk/:cat/:name/:ep/:file", async (req, res) => {
  try {
    var p = req.params.file;
    if (p.charAt(0) == "i") {
      p =
        req.params.file.substring(0, 5) +
        quality +
        req.params.file.substring(6, req.params.file.length);
    }
    if (p.charAt(0) != "i" && p.charAt(0) != "o") {
      p =
        req.params.file.substring(0, 6) +
        quality +
        req.params.file.substring(7, req.params.file.length);
    }
    const path =
      req.params.disk +
      "/" +
      req.params.cat +
      "/" +
      req.params.name +
      "/" +
      req.params.ep +
      "/" +
      p;
    const chunk = await fetch(path);
    chunk.data.pipe(res);
  } catch (e) {}
});
app.get("/file", async (req, res) => {
  try {
    console.log(req.query.name);
    const file = await fetch(req.query.name);
    file.data.pipe(res);
  } catch (e) {}
});
app.get("/quality/:id", (req, res) => {
  quality = req.params.id;
  console.log(quality);
  res.send(true);
});
