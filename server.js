const express = require('express');
const app = express();
//const cookieSession = require('cookie-session');
const { pool, connectionString } = require('./config/dbConfig')
const bcrypt = require('bcrypt');
const session = require('express-session');
//const flash = require('express-flash');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const LocalStrategy = require('passport-local').Strategy;
const cors = require('cors');
//const morgan = require('morgan');
const helmet = require('helmet');

const PORT = process.env.EXPRESS_PORT || 4000;

const authenticateLocalUser = (email, password, done) => {
    
    pool.query(
        'SELECT * FROM users WHERE email = $1', [email], (err, results) => {
            if (err) {
                throw err;
            }

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
};

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL
    },
    function(accessToken, refreshToken, profile, cb) {
        //console.log(profile);
        cb(null, profile);

        //save user at this point
    }
));

passport.use(
    new LocalStrategy(
        {
            usernameField: 'email',
            passwordField: 'password'
        },
        authenticateLocalUser
    )
);

passport.serializeUser((user, done) => {
    done(null, user)
});

passport.deserializeUser((user, done) => {
    done(null, user)
});

app.use(express.urlencoded({extended: false}));
app.use(express.json());
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    methods: "GET, POST, PUT, DELETE",
    credentials: true,
}));
//app.use(morgan('tiny'))
/* app.use(cookieSession({
    name: 'session',
    keys: ['test'],
    maxAge: 24 * 60 * 60 * 1000
})) */
const conObject = {
    connectionString,
    //ssl: { rejectUnauthorized: false }
};

app.use(session({
    store: new (require('connect-pg-simple')(session))({
        conObject,
    }),
    secret: process.env.SESSION_SECRET,
    saveUninitialized: false,
    resave: false,
    cookie: { 
        secure: process.env.NODE_ENV === 'development' ? false : true,
        httpOnly: process.env.NODE_ENV === 'development' ? false : true,
        sameSite: process.env.NODE_ENV === 'development' ? false : 'none',
        maxAge: 24 * 60 * 60 * 1000
     } // 24 hours
}));

app.enable('trust proxy');
app.use(passport.initialize());
app.use(passport.session());
app.use(helmet());

const googleRouter = require('./routes/googleAuthRoutes');
app.use('/google', googleRouter);

const usersRouter = require('./routes/usersRoutes');
app.use('/users', usersRouter);

const entityRouter = require('./routes/entityRoutes');
app.use('/entities', entityRouter);

const dORouter = require('./routes/doRoutes');
app.use('/do', dORouter);

const bnRouter = require('./routes/bnRoutes');
app.use('/bn', bnRouter);

const bnFilingsRouter = require('./routes/bnFilingsRoutes');
app.use('/bnf', bnFilingsRouter);

const cFilingsRouter = require('./routes/cFilingsRoutes');
app.use('/cf', cFilingsRouter);

const cjRouter = require('./routes/cjRoutes');
app.use('/cj', cjRouter);

app.listen(PORT, ()=>{
    console.log(`Server running on port ${PORT}`)
});
