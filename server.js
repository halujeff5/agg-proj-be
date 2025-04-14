"use strict";

const app = require("./app");


app.listen(3001, '0.0.0.0', function () {
  console.log(`Started on http://0.0.0.0:3001`);
});