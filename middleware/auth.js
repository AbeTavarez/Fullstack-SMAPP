const jwt = require('jsonwebtoken');
const config = require('config');

module.exports = (req, res, next) => {
    // get token from header
    const token = req.header('x-auth-token');
    // check if there is No token
    if (!token) {
        return res.status(500).json({msg: 'No token, authorization denied.'})
    }

    // verify token
    try {
        const decoded = jwt.verify(token, config.get('jwtSecret'));
        console.log(decoded)
        req.user = decoded; // sets a prop (user) on the req object with the 
        next();
    } catch(err) {
        res.status(401).json({msg: 'Token is not valid'});
    }
}