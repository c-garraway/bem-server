const { pool } = require('../config/dbConfig')

function checkAuthenticated(req, res, next){
    if(req.isAuthenticated()){
        res.status(401).json({message: 'Already logged in', status: 'error'});
        return;
    }
    next();
}

function checkNotAuthenticated(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    res.status(401).json({message: 'Not authenticated to perform transaction', status: 'error'});
}

async function checkUserParam(req, res, next){
    const userID = parseInt(req.params.id).toString()
    const requestSessionID = req.session.passport.user.id

    if(userID === requestSessionID){
        return next();
    } else {
        try {
            const data = await pool.query('SELECT id FROM users WHERE useroauthid = $1', [requestSessionID]); 
        
            if (data.rows.length === 0) {
            return res.status(404).json({message: 'User Info Not Found', status: 'error'});
            };

            const user = data.rows[0];
            if(userID === user.id) {
                next();
            }
            return;
        } catch (error) {
            console.error(error);
            res.status(500).send({message: error});
        }
    }
    
    res.status(401).json({message: 'Not authorized to perform transaction', status: 'error'});
}

/* function checkUserBody(req, res, next){
    const { userID } = req.body
    const requestSessionID = req.session.passport.user.id
    console.log(userID, requestSessionID)
    if(userID === requestSessionID){
        return next();
    }
    res.status(401).json({message: 'Not authorized to perform transaction'});
} */

module.exports = {
    checkAuthenticated,
    checkNotAuthenticated,
    checkUserParam
}