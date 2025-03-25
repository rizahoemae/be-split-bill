const express = require("express");
const port = 3000;
const routes = require("./src/routes");
const sequelize = require("./src/config/db");
const app = express();
app.use(express.json());
app.get("/test", (req, res) => {
  res.send("Hello World!");
});
app.use("/api", routes);

sequelize.sync({ alter: true });

sequelize
  .authenticate()
  .then(() => {
    app.listen(port, () => {
      console.log(`Example app listening on port ${port}`);
    });
  })
  .catch((err) => {
    console.error("Database connection failed:", err);
  });


module.exports = app;
