const express = require('express');
const passport = require('passport');
const { checkAuthenticated, checkNotAuthenticated } = require('../utilities/utility')
const { pool } = require('../config/dbConfig')

const cfRouter = express.Router();



module.exports = cfRouter;