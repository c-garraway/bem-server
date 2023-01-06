const express = require('express');
const passport = require('passport');
const { pool } = require('../config/dbConfig');
const { checkAuthenticated, checkNotAuthenticated } = require('../utilities/utility')

//TODO: create Class without need to import passport

const googleRouter = express.Router();

googleRouter.get('/', checkAuthenticated, passport.authenticate('google', { 
    scope: ['profile', 'email'] })
);

//step 2: 
// on the server's redirect route add this successRedirect object with correct url. 
// Remember! it's your clients root url!!! 
/* router.get(
    '/google/redirect', 
    passport.authenticate('google',{
        successRedirect: "[your CLIENT root url/ example: http://localhost:3000]"
    })
) */


googleRouter.get('/callback', 
    passport.authenticate('google', { failureRedirect: 'users/login' }),
    function(req, res) {
        // Successful authentication, redirect home.
        console.log('Login Success');
        const gUser = req.user._json;
        

        // check for user in database
        pool.query(
            'SELECT * FROM users WHERE userOAuthID = $1', [gUser.sub], (err, results) => {
                if (err) {
                    throw err;
                }

                const googleUser = results.rows[0];

                if(googleUser === undefined || googleUser === null ) {
                    console.log('user is undefined')
                    pool.query(
                        'INSERT INTO users (name, email, useroauthid) VALUES ($1, $2, $3)', [gUser.name, gUser.email, gUser.sub], (err, results) => {
                            if(err) {
                                throw err;
                            }
                            //res.send({message: 'added user to database'})
                            //res.send({googleUser});
                            res.redirect("http://localhost:3000/register");
                            
                        }
                    );

                } else {
                    console.log('user is in the database')
                    //res.send({googleUser});
                    res.redirect("http://localhost:3000/loggedin");
                    
                }
            }
        )
    }
);

module.exports = googleRouter;