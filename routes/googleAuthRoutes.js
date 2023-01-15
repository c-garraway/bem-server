const express = require('express');
const passport = require('passport');
const { pool } = require('../config/dbConfig');
const { checkAuthenticated, checkNotAuthenticated } = require('../utilities/utility')

const googleRouter = express.Router();

googleRouter.post('/logout', (req, res) => {
    req.logout();
    res.redirect("http://localhost:3000/main");
});

googleRouter.get('/getUser', async (req, res) => {
    const user = req.user;
    const email = user?._json.email;

    if(req.user) {
        try {
            const data = await pool.query('SELECT id, email, firstname, lastname, companyname, avatar FROM users WHERE email = $1', [email]); 
        
            if (data.rows.length === 0) {
            return res.status(404).json({message: 'Entity Not Found'});
            };

            const user = data.rows[0];
        
            res.status(200).send(user);
            
        } catch (error) {
            console.error(error);
            res.status(500).send({message: error});
        }
    }
});

googleRouter.get('/failed', async (req, res) => {
    
    res.status(401).json({
        success: false,
        message: "failed"
    });    
});


googleRouter.get('/', checkAuthenticated, passport.authenticate('google', { 
    scope: ['profile', 'email'] })
);

googleRouter.get('/callback', 
    passport.authenticate('google', { 
        failureRedirect: '/failed', 
    }),
    function(req, res) {
        // Successful authentication, redirect home.
        //console.log('Login Success');
        const gUser = req.user._json;
        //console.log(gUser);

        // check for user in database
        pool.query(
            'SELECT * FROM users WHERE userOAuthID = $1', [gUser.sub], (err, results) => {
                if (err) {
                    throw err;
                }

                const googleUser = results.rows[0];

                if(googleUser === undefined || googleUser === null ) {
                    //console.log('user is undefined')
                    pool.query(
                        'INSERT INTO users (firstname, lastname, email, useroauthid, avatar) VALUES ($1, $2, $3, $4, $5)', [gUser.given_name, gUser.family_name, gUser.email, gUser.sub, gUser.picture], (err, results) => {
                            if(err) {
                                throw err;
                            }
                            res.redirect("http://localhost:3000/main");
                            
                        }
                    );

                } else {
                    res.redirect("http://localhost:3000/main");
                    
                }
            }
        )
    }
);

module.exports = googleRouter;