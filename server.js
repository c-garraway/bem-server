const express = require('express');
const app = express();
const { pool, connectionString } = require('./config/dbConfig')
const bcrypt = require('bcrypt');
const session = require('express-session');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const LocalStrategy = require('passport-local').Strategy;
const cors = require('cors');
const helmet = require('helmet');

const PORT = process.env.EXPRESS_PORT || 4000;

const authenticateLocalUser = async (email, password, done) => {

    try {
        const userData = await pool.query('SELECT * FROM users WHERE email = $1', [email]); 

        if(userData.rows.length > 0 ) {
            const user = userData.rows[0];

            bcrypt.compare(password, user.password, (err, isMatch) => {
                if(err) {
                    throw err
                }
                if(isMatch) {
                    return done(null, user);
                } else {
                    return done(null, false);
                }
            });

        } else {
            return done(null, false);
        }

    } catch (error) {
        console.log(error)   
    }
};

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.NODE_ENV === 'development' ? process.env.GOOGLE_CALLBACK_URL_DEV : process.env.GOOGLE_CALLBACK_URL
    },
    function(request, accessToken, refreshToken, profile, done) {
        return done(null, profile);
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

if(process.env.NODE_ENV === 'development') {
    const morgan = require('morgan');
    app.use(morgan('tiny'))
}

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

const authRouter = require('./routes/authRoutes');
app.use('/auth', authRouter);

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

app.get('/', (req, res) =>{
    res.send('bem backend root')    
})

app.listen(PORT, ()=>{
    console.log(`Server running on port ${PORT}`)
});
