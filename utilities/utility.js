function checkAuthenticated(req, res, next){
    if(req.isAuthenticated()){
        return res.redirect('http://localhost:3000');
    }
    next();
}

function checkNotAuthenticated(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect('http://localhost:3000/login');
}

module.exports = {
    checkAuthenticated,
    checkNotAuthenticated
}