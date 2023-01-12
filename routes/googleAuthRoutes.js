const express = require('express');
const passport = require('passport');
const { pool } = require('../config/dbConfig');
const { checkAuthenticated, checkNotAuthenticated } = require('../utilities/utility')

//TODO: create Class without need to import passport

const googleRouter = express.Router();

googleRouter.post('/logout', (req, res) => {
    /* req.flash('success_msg', 'You have logged out');
    req.session.destroy();
    res.redirect('/users/login'); */

    /* req.logout(function(err) {
        if (err) { 
            return next(err); 
        };
        res.send({message: 'You have logged out'});
    }); */ 
    req.logout();
    res.redirect("http://localhost:3000/main");
});

googleRouter.get('/getUser', async (req, res) => {
    const user = req.user;
    const email = user?._json.email;

    //console.log(req.user);
    if(req.user) {
        try {
            const data = await pool.query('SELECT id, email, firstname, lastname, companyname, avatar FROM users WHERE email = $1', [email]); 
        
            if (data.rows.length === 0) {
            return res.status(404).json({message: 'Entity Not Found'});
            //return res.sendStatus(404);
            //res.status(401).json({message: 'Invalid Credentials'});
            };

            const user = data.rows[0];
        
            res.status(200).send(user);
            
        } catch (error) {
            console.error(error);
            res.status(403).send({message: error.detail});
        }
    }
});

/* googleRouter.get('/success', async (req, res) => {
    if(req.user) {
        res.status(200).json({
            success: true,
            message: "successful",
            user: req.user
        })
    }
}); */

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
        //successRedirect: '/success' 
    }),
    function(req, res) {
        // Successful authentication, redirect home.
        console.log('Login Success');
        const gUser = req.user._json;
        console.log(gUser);

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
                        'INSERT INTO users (firstname, lastname, email, useroauthid, avatar) VALUES ($1, $2, $3, $4, $5)', [gUser.given_name, gUser.family_name, gUser.email, gUser.sub, gUser.picture], (err, results) => {
                            if(err) {
                                throw err;
                            }
                            //res.send({message: 'added user to database'})
                            //res.send({googleUser});
                            res.redirect("http://localhost:3000/main");
                            
                        }
                    );

                } else {
                    //console.log('user is in the database')
                    //console.log(gUser)
                    //return res.send(gUser.email);
                    //getGoogleUser(googleUser);
                    res.redirect("http://localhost:3000/main");
                    
                }
            }
        )
        //return res.json({user: gUser.email});
    }
);

module.exports = googleRouter;