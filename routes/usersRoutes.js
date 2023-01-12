const express = require('express');
const passport = require('passport');
const { checkAuthenticated, checkNotAuthenticated } = require('../utilities/utility')
const { pool } = require('../config/dbConfig')
const bcrypt = require('bcrypt');

const usersRouter = express.Router();

/* usersRouter.get('/register', checkAuthenticated, (req, res) => {
    res.render('register');
});

usersRouter.get('/login', checkAuthenticated, (req, res) => {
    res.render('login');
});

usersRouter.get('/dashboard', checkNotAuthenticated, (req, res) => {
    const name = req.user.name;
    const userImage = req.user._json;
    res.render('dashboard', {
        user: (typeof name === 'string') ? req.user.name : req.user.displayName,
        image: userImage?.picture ? userImage.picture : '',
    });
}); */

usersRouter.post('/logout', (req, res) => {
    req.session.destroy();
    res.status(200).json({message: 'You have logged out'});

    //res.redirect("http://localhost:3000");

    /* req.flash('success_msg', 'You have logged out');
    req.session.destroy();
    res.redirect("http://localhost:3000"); */

    /* req.logout(function(err) {
        if (err) { 
            return next(err); 
        };
        res.send({message: 'You have logged out'});
    }); */ 
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
        //Form validation has passed

        let hashedPassword = await bcrypt.hash(password, 10);
        console.log(hashedPassword);

        pool.query(
            'SELECT * FROM users WHERE email = $1', [email], 
            (err, results) => {
                if(err) {
                    throw err;
                }

                console.log(results.rows);

                if(results.rows.length > 0) {
                    errors.push('Email already registered! ');
                    res.send({ errors })
                } else {
                    pool.query(
                        'INSERT INTO users (email, password) VALUES ($1, $2) RETURNING id, password', [email, hashedPassword], (err, results) => {
                            if(err) {
                                throw err;
                            }
                            console.log(results.rows);
                            //req.flash('success_msg', 'You are now registered. Please log in.');
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
    console.log({
        email,

    });

    let errors = [];

    if(!email || !firstName || !lastName || !companyName) {
        errors.push('Please enter all fields. ');
    };

    if(errors.length > 0) {
        res.send({ errors })
    } else {
        //Form validation has passed

        pool.query(
            'SELECT * FROM users WHERE email = $1', [email], 
            (err, results) => {
                if(err) {
                    throw err;
                }



                 else {
                    //console.log(results.rows);

                    pool.query(
                        'UPDATE users SET firstname = $1, lastname = $2, companyname = $3 WHERE email = $4 RETURNING *', [firstName, lastName, companyName, email], (err, results) => {
                            if(err) {
                                throw err;
                            }
                            const user = results.rows;
                            //req.flash('success_msg', 'You are now registered. Please log in.');
                            res.send({user});
                        }
                    )
                }
            }
        )
    }

});

//TODO: UPDATE PROFILE ROUTE REQUIRED!      

usersRouter.post('/login', passport.authenticate('local',  { failureRedirect: "loginfail" }), (req, res) =>{ 
    

    const account = (req.session.passport.user)
    console.log(account)

    const response = {
        id: account.id,
        email: account.email,
        firstName: account.firstname,
        lastName: account.lastname,
        companyName: account.companyname,
    }
    console.log(response)
    res.send(response)
});

usersRouter.get('/loginfail', function(req, res){
    res.status(401).json({message: 'Invalid Credentials'});
});

module.exports = usersRouter;
