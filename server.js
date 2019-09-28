const express = require("express");
const connectDB = require("./config/db");
const PORT = process.env.PORT || 5000; //PORT is a Heroku env var

const app = express();
connectDB();

app.get("/", (req, res) => res.send("API Running"));
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
