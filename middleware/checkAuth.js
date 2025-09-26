const jwt = require('jsonwebtoken')


module.exports = async( req,res,next)=>{


try
{


const token = req.headers.authorization.split(" ")[1];
await jwt.verify(token,  'gunjan online classess 123')
next()

}
catch(err)
{
    console.log(err)
    return res.status(500).json({
        error : 'invalid token'
    })
}

}