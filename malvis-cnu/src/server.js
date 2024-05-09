const express = require("express");
const app = express();
const PORT = process.env.PORT || 8888;

app.get("/", (req, res) => {
  res.send({ message: "hello world!" });
});

app.get("/js", (req, res) => {
  res.json({ message: "hello javascript!" });
});

app.listen(PORT, () => {
  console.log(`Server on : http://localhost:${PORT}/`);
});
