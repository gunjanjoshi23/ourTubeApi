const express = require('express');
const Router = express.Router();
const checkAuth = require('../middleware/checkAuth')
const jwt = require('jsonwebtoken')
const cloudinary = require('cloudinary').v2
const Video = require('../models/Video')
const mongoose = require('mongoose');



cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET
});


Router.post('/upload', checkAuth, async (req, res) => {

    try {
        const token = req.headers.authorization.split(" ")[1];
        const user = await jwt.verify(token, 'gunjan online classess 123')
        //   console.log(user)
        //   console.log(req.body)
        //   console.log(req.files.video)
        //   console.log(req.files.thumbnail)

        const uploadedVideo = await cloudinary.uploader.upload(req.files.video.tempFilePath, {
            resource_type: 'video'
        })
        const uploadedThumbnail = await cloudinary.uploader.upload(req.files.thumbnail.tempFilePath)

        const newVideo = new Video({
            _id: new mongoose.Types.ObjectId,
            title: req.body.title,
            description: req.body.description,
            user_id: user._id,
            videoUrl: uploadedVideo.secure_url,
            videoId: uploadedVideo.public_id,
            thumbnaiUrl: uploadedThumbnail.secure_url,
            thumbnaiId: uploadedThumbnail.public_id,
            category: req.body.category,
            tags: req.body.tags.split(","),


        })
        const newUploadedVideoData = await newVideo.save()
        res.status(200).json({
            newVideo: newUploadedVideoData
        })


    }
    catch (err) {

        console.log(err)
        res.status(500).json({
            error: err
        })

    }

})

// update video detail
Router.put('/:videoId', checkAuth, async (req, res) => {

    try {
        const verifiedUser = await jwt.verify(req.headers.authorization.split(" ")[1], 'gunjan online classess 123',)
        const video = await Video.findById(req.params.videoId)
        console.log(video)
        if (video.user_id == verifiedUser._id) {

            //update video detalis
            if (req.files) {
                //update thumbnail and text data
                await cloudinary.uploader.destroy(video.thumbnaiId)
                const updatedThumbnail = await cloudinary.uploader.upload(req.files.thumbnail.tempFilePath)
                const updatedData = {
                    title: req.body.title,
                    description: req.body.description,
                    category: req.body.category,
                    tags: req.body.tags.split(","),
                    thumbnaiUrl: updatedThumbnail.secure_url,
                    thumbnaiId: updatedThumbnail.public_id,

                }
                const updatedVideoDetalis = await Video.findByIdAndUpdate(req.params.videoId, updatedData, { new: true })
                res.status(200).json({
                    updatedVideo: updatedVideoDetalis
                })
            }
            else {
                const updatedData = {
                    title: req.body.title,
                    description: req.body.description,
                    category: req.body.category,
                    tags: req.body.tags.split(","),

                }
                const updatedVideoDetalis = await Video.findByIdAndUpdate(req.params.videoId, updatedData, { new: true })
                res.status(200).json({
                    updatedVideo: updatedVideoDetalis
                })

            }
        }
        else {
            return res.status(500).json({
                error: 'you have no permision'
            })
        }

    }
    catch (err) {
        console.log(err);
        res.status(500).json({
            error: err
        })

    }

})

//delete api
Router.delete('/:videoId', checkAuth, async (req, res) => {
    try {
        const verifiedUser = await jwt.verify(req.headers.authorization.split(" ")[1], 'gunjan online classess 123',)
        console.log(verifiedUser)
        const video = await Video.findById(req.params.videoId)
        if (video.user_id == verifiedUser._id) {
            //delete video, thumbnail and data from databash
            await cloudinary.uploader.destroy(video.videoId,{resource_type:'video'})
            await cloudinary.uploader.destroy(video.thumbnaiId)
            const deletedResponse = await Video.findByIdAndDelete(req.params.videoId);
            res.status(200).json({
                deletedResponse
            });

        }
        else {
            return res.status(500).json({
                error: 'you are not delete this video..'
            })
        }
        
    }
    catch (err) {
        console.log(err);
        res.status(500).json({
            error: err
        })
    }

})

//video like api
Router.put('/like/:videoId', checkAuth, async (req, res) => {
    try {
        const verifiedUser = await jwt.verify(
            req.headers.authorization.split(" ")[1],
            'gunjan online classess 123',
        );
        console.log(verifiedUser);

        const video = await Video.findById(req.params.videoId); // ✅ fixed
        console.log(video);
        if(video.likedBy.includes(verifiedUser._id))
            {
                return res.status(500).json({
                    error:'already liked'
                })
            }
          
         if(video.dislikedBy.includes(verifiedUser._id))
            {
              video.dislike -=1;
              video.dislikedBy = video.dislikedBy.filter(userId=>userId.toString() != verifiedUser._id)
            }

            video.likes += 1;
            video.likedBy.push(verifiedUser._id)
            await video.save();
            
           res.status(200).json({
            message: "Video found",
            video
        });

    } 
    catch (err) {
        console.log(err);
        res.status(500).json({
            error: err.message
        });
    }
});

//dislike api
Router.put('/dislike/:videoId', checkAuth, async (req, res) => {
    try {
        const verifiedUser = await jwt.verify(
            req.headers.authorization.split(" ")[1],
            'gunjan online classess 123',
        );
        console.log(verifiedUser);

        const video = await Video.findById(req.params.videoId); // ✅ fixed
        console.log(video);
        if(video.dislikedBy.includes(verifiedUser._id))
            {
                return res.status(500).json({
                    error:'already disliked'
                })
            }

              if(video.likedBy.includes(verifiedUser._id))
            {
              video.like -=1;
              video.likedBy = video.likedBy.filter(userId=>userId.toString() != verifiedUser._id)
            }


            video.dislike += 1;
            video.dislikedBy.push(verifiedUser._id)
            await video.save();
            
           res.status(200).json({
            message: "disliked",
            video
        });

    } 
    catch (err) {
        console.log(err);
        res.status(500).json({
            error: err.message
        });
    }
});

//viws api
Router.put('/views/:videoId', async(req,res)=>{
    try
    {
        const video = await Video.findById(req.params.videoId)
        console.log(video)
        video.views += 1;
        await video.save();

        res.status(200).json({
            message:'ok'

            })
        
    }
    catch(err)
    {
        console.log(err)
        res.status(500).json({
            error:err
        })
    }
})


module.exports = Router;
