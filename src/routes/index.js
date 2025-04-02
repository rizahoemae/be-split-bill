const auth = require("./auth.route");
const bill = require("./bill.route");
const storage = require("./storage.route");

const express = require("express");
const router = express.Router();
const { validateToken } = require("../middlewares/validate");
const defaultRoutes = [
  {
    path: "/auth",
    route: auth,
  },
  {
    path: "/bill",
    route: bill,
    middleware: validateToken(),
  },
  {
    path: "/storage",
    route: storage,
    middleware: validateToken(),
  },
];

defaultRoutes.forEach((route) => {
  if (route.middleware) {
    router.use(route.path, route.middleware, route.route);
  } else {
    router.use(route.path, route.route);
  }
});

module.exports = router;
