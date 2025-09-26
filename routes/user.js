const express = require('express');
const Router = express.Router();
const bcrypt = require('bcrypt');
const cloudinary = require('cloudinary').v2;
require('dotenv').config();
const User = require('../models/User');
const  mongoose  = require('mongoose');
const jwt = require('jsonwebtoken');
const checkAuth = require('../middleware/checkAuth');


// Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET
});

// Signup Route
Router.post('/signup', async (req, res) => {
  try {

  const users = await  User.find({email:req.body.email})
  if (users.length>0)
  {
    return res.status(500).json({
      error : 'email already register'
    })
  }
    // Hash password
    const hashCode = await bcrypt.hash(req.body.password, 10);

    // Upload image (ensure express-fileupload is set in server.js)
    const uploadedImage = await cloudinary.uploader.upload(req.files.logo.tempFilePath);
    
     const newUser = new User({
        _id:new mongoose.Types.ObjectId,
        channelName:req.body.channelName,
        email:req.body.email,
        phone:req.body.phone,
        password:hashCode,
        logoUrl:uploadedImage.secure_url,
        logoId:uploadedImage.public_id
     })
    const user =  await newUser.save()
    res.status(200).json({
        newUser:user
    })
    

    res.status(200).json({
      message: 'Signup successful',
      imageUrl: uploadedImage.secure_url
    });
                    
  
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: err.message
    });
  }
});


Router.post ('/login',async (req,res)=>{
  try
  {
     console.log(req.body)
    const users = await   User.find({email:req.body.email})
    console.log(users)
    if (users.length == 0)
    {
      return res.status(500).json({
        error :' email is not registered....'
      })
    }

   const isValid = await bcrypt.compare(req.body.password,users[0].password)
   console.log(isValid)

  if (!isValid)
  {
    return res.status(200).json({
      error :'invalid password'
    })
  }
    
   const token = jwt.sign({
    _id:users[0]._id,
    channelName:users[0].channelName,
    email:users[0].email,
    phone:users[0].phone,
    logoId:users[0].logoId

   },
  'gunjan online classess 123',
  {
    expiresIn:'365d'
  }
)

res.status(200).json({
      _id:users[0]._id,
    channelName:users[0].channelName,
    email:users[0].email,
    phone:users[0].phone,
    logoId:users[0].logoId,
    logoUrl:users[0].logoUrl,
    token:token,
    subscribers:users[0].subscribers,
    subscribedChannels:users[0].subscribedChannels


})

  }
  catch(err)
  {
    console.log(err)
    res.status(500).json({
      error:'something is wrong'
    })  
  }
})

// subscribed api
Router.put('/subscribe/:userBId',checkAuth,async (req,res)=>{
  try
  {
    const userA = await jwt.verify(req.headers.authorization.split(" ")[1], 'gunjan online classess 123',)
  console.log(userA)
 const userB = await User.findById(req.params.userBId)
 console.log(userB)
 if(userB.subscribedBy.includes(userA._id))
 {
  return res.status(500).json({
 error:'already subscribed...'
  })
 }
//  console.log('not subscribed')
userB.subscribers += 1;
userB.subscribedBy.push(userA._id)
await userB.save()

const userAFullInformation = await User.findById(userA._id)
userAFullInformation.subscribedChannels.push(userB._id)
await userAFullInformation.save()


res.status(200).json({
  message:'subscribed'
})

  }

  
  catch(err)
  {
    console.log(err)
    res.status(500).json({
      error:error
    })
  }



})

// unsubscribe api
Router.put('/unsubscribe/:userBId', checkAuth, async (req, res) => {
  try {
    const userA = await jwt.verify(
      req.headers.authorization.split(" ")[1],
      'gunjan online classess 123'
    );

    const userB = await User.findById(req.params.userBId);
    if (!userB) {
      return res.status(404).json({ error: "User not found" });
    }

    console.log(userA);
    console.log(userB);

    // ✅ Correct condition
    if (userB.subscribedBy.includes(userA._id)) {
      // unsubscribe logic
      userB.subscribers = Math.max(0, userB.subscribers - 1); // prevent negative
      userB.subscribedBy = userB.subscribedBy.filter(
        (userId) => userId.toString() !== userA._id
      );
      await userB.save();

      const userAFullInformation = await User.findById(userA._id);
      userAFullInformation.subscribedChannels = userAFullInformation.subscribedChannels.filter(
        (userId) => userId.toString() !== userB._id.toString()
      );
      await userAFullInformation.save();

      return res.status(200).json({
        message: "Unsubscribed successfully",
      });
    } else {
      return res.status(400).json({
        error: "You are not subscribed to this channel",
      });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      error: "Something went wrong",
    });
  }
});


module.exports = Router;
