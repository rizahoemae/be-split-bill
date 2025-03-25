const auth = require("./auth.route");
const express = require("express");
const router = express.Router();

const defaultRoutes = [
  {
    path: "/auth",
    route: auth,
  },
];

defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

module.exports = router;
