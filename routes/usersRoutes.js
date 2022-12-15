const express = require('express');
const passport = require('passport');
const { checkAuthenticated, checkNotAuthenticated } = require('../utilities/utility')

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
    /* req.flash('success_msg', 'You have logged out');
    req.session.destroy();
    res.redirect('/users/login'); */

    req.logout(function(err) {
        if (err) { 
            return next(err); 
        };
        //req.flash('success_msg', 'You have logged out');
        res.send({message: 'You have logged out'});
    }); 
});

usersRouter.post('/register', async (req, res) => {
    let { name, email, password, password2 } = req.body;
    console.log({
        name,
        email,
        password,
        password2
    });

    let errors = [];

    if(!name || !email || !password || !password2) {
        errors.push({message: 'Please enter all fields'});
    };

    if(password.length < 6) {
        errors.push({message: 'Password should be at least 6 characters'});
    };

    if(password !== password2) {
        errors.push({message: 'Passwords do not match'});
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
                    errors.push({message: 'Email already registered'});
                    res.send({ errors })
                } else {
                    pool.query(
                        'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, password', [name, email, hashedPassword], (err, results) => {
                            if(err) {
                                throw err;
                            }
                            console.log(results.rows);
                            //req.flash('success_msg', 'You are now registered. Please log in.');
                            res.send({message: 'You are now registered'});
                        }
                    )
                }
            }
        )
    }

});

usersRouter.post('/login', passport.authenticate('local', {
    //successMessage: 'Logged in',
    //failureMessage: 'Not logged in'
    //successRedirect: '/users/dashboard',
    //failureRedirect: '/users/login',
    //failureFlash: true
}), (req, res) =>{
    const {email, password} = req.body;
    pool.query(
        'SELECT * FROM users WHERE email = $1', [email], (err, results) => {
            if (err) {
                throw err;
            }
            console.log(results.rows);

            if(results.rows.length > 0) {
                const user = results.rows[0];

                bcrypt.compare(password, user.password, (err, isMatch) => {
                    if(err) {
                        throw err
                    }
                    if(isMatch) {
                        return done(null, user);
                    } else {
                        return done(null, false, {message: 'Password is not correct'});
                    }
                });

            } else {
                return done(null, false, {message: 'Email is not registered'});
            }
        } 
    );
    res.send({message: 'Success'})
});

module.exports = usersRouter;
