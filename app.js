const express = require("express");
const port = 3000;
const routes = require("./src/routes");
const sequelize = require("./src/config/db");
const redis = require("./src/config/redis");
const mode = process.env.NODE_ENV || "development";
const app = express();
app.use(express.json());
app.get("/test", (req, res) => {
  res.send("Hello World!");
});
app.use("/api", routes);

if (mode === "development") {
  sequelize.sync({ alter: true });
}

const { Item, Bill, User, BillShare } = sequelize.models;

Bill.hasMany(Item, { foreignKey: "item_id", as: "items" });
Item.belongsTo(Bill, {
  foreignKey: "bill_id",
});


Item.hasMany(BillShare, {
  foreignKey: "item_id",
  as: 'items'
});

BillShare.belongsTo(Item, {
  foreignKey: "item_id",
  as: 'items'
});

Bill.hasMany(BillShare, {
  foreignKey: 'bill_id', 
  as: 'participants'

})
BillShare.belongsTo(Bill, {
  foreignKey: 'bill_id', 
  as: 'participants'
})

User.hasMany(BillShare, {
  foreignKey: "user_id",
});
BillShare.belongsTo(User, {
  foreignKey: "user_id",
});
sequelize
  .authenticate()
  .then(async () => {
    await redis.connect();
    app.listen(port, () => {
      console.log(`Example app listening on port ${port}`);
    });
  })
  .catch((err) => {
    console.error("Database connection failed:", err);
  });

module.exports = app;
