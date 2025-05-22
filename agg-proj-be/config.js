"use strict";

/** Shared config for application; can be required many places. */

import 'colors'

const PORT = +process.env.PORT || 3000;

// Use dev database, testing database, or via env var, production database

// WJB: Evaluate in 2021 if this should be increased to 13 for non-test use
const BCRYPT_WORK_FACTOR = process.env.NODE_ENV === "development" ? 1 : 12;

console.log("Agg Config:".green);
console.log("PORT:".yellow, PORT.toString());
console.log("BCRYPT_WORK_FACTOR".yellow, BCRYPT_WORK_FACTOR);
console.log("---");

module.exports = {
  PORT,
  BCRYPT_WORK_FACTOR
};