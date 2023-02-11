function checkAuthenticated(req, res, next){
    if(req.isAuthenticated()){
        res.status(401).json({message: 'Already logged in'});
        return;
    }
    next();
}

function checkNotAuthenticated(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    res.status(401).json({message: 'Not authenticated to perform transaction'});
}

function checkUserParam(req, res, next){
    const userID = parseInt(req.params.id).toString()
    const requestSessionID = req.session.passport.user.id
    if(userID === requestSessionID){
        return next();
    }
    res.status(401).json({message: 'Not authorized to perform transaction'});
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