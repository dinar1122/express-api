const jwt = require('jsonwebtoken')

const authToken = (req, res, next) => {
    console.log('auth token')
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]

    if (!token) {
        return res.status(401).json({error: 'unauthorized'})
    }

    jwt.verify(token, process.env.SECRET_KEY, (err, user) => {
        if(err) {
            return res.status(403).json({error: 'invalid token'})
        }
        req.user = user

        next()
    })
}
module.exports = {authToken}