const express = require('express');
const passport = require('passport');
const { checkAuthenticated, checkNotAuthenticated } = require('../utilities/utility')
const { pool } = require('../config/dbConfig')
const bcrypt = require('bcrypt');

const usersRouter = express.Router();



usersRouter.post('/login', checkAuthenticated, passport.authenticate('local',  { failureRedirect: "fail" }), (req, res) =>{ 
    res.status(200).json({message: 'You have logged in successfully'});
});

usersRouter.get('/fail', function(req, res){
    res.status(401).json({message: 'Invalid Credentials', status: 'error'});
});

usersRouter.post('/logout', checkNotAuthenticated, function(req, res, next){
    req.logout(function(err) {
      if (err) { return next(err); }
      res.status(200).json({message: 'You have logged out'});
    });
});

usersRouter.get('/getUser', checkNotAuthenticated, async (req, res) => {
    const user = req.session.passport.user;
    const email = user.email;

    if(req.user) {
        try {
            const data = await pool.query('SELECT id, email, firstname, lastname, companyname, avatar FROM users WHERE email = $1', [email]); 
        
            if (data.rows.length === 0) {
            return res.status(404).json({message: 'User Info Not Found', status: 'error'});
            };

            const user = data.rows[0];
        
            res.status(200).send(user);
            
        } catch (error) {
            console.error(error);
            res.status(500).send({message: error});
        }
    } else {
        res.status(404).json({message: 'User Not Found', status: 'error'});}
});

usersRouter.post('/register', async (req, res) => {
    let { email, password, password2 } = req.body;

    let errors = [];

    if(!email || !password || !password2) {
        errors.push('Please enter all fields! ');
    };

    if(password.length < 6) {
        errors.push('Password should be at least 6 characters! ');
    };

    if(password !== password2) {
        errors.push('Passwords do not match! ');
    }

    if(errors.length > 0) {
        res.send({ errors })
    } else {
        let hashedPassword = await bcrypt.hash(password, 10);
        pool.query(
            'SELECT * FROM users WHERE email = $1', [email], 
            (err, results) => {
                if(err) {
                    throw err;
                }
                if(results.rows.length > 0) {
                    errors.push('Email already registered! ');
                    res.send({ errors })
                } else {
                    pool.query(
                        'INSERT INTO users (email, password) VALUES ($1, $2) RETURNING id, password', [email, hashedPassword], (err, results) => {
                            if(err) {
                                throw err;
                            }
                            res.send({email: email});
                        }
                    )
                }
            }
        )
    }

});

usersRouter.put('/addProfile', async (req, res) => {
    let { email, firstName, lastName, companyName } = req.body;

    let errors = [];

    if(!email || !firstName || !lastName || !companyName) {
        errors.push('Please enter all fields. ');
    };

    if(errors.length > 0) {
        res.send({ errors })
    } else {
        pool.query(
            'SELECT * FROM users WHERE email = $1', [email], 
            (err, results) => {
                if(err) {
                    throw err;
                } else {
                    pool.query(
                        'UPDATE users SET firstname = $1, lastname = $2, companyname = $3 WHERE email = $4 RETURNING *', [firstName, lastName, companyName, email], (err, results) => {
                            if(err) {
                                throw err;
                            }
                            const user = results.rows;
                            res.send({user});
                        }
                    )
                }
            }
        )
    }

});

module.exports = usersRouter;
