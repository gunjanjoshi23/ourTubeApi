    const express = require('express')
    const Router = express.Router()
    const Comment = require('../models/Comment')
    const checkAuth = require('../middleware/checkAuth')
    const jwt = require('jsonwebtoken')
    const { default: mongoose } = require('mongoose')

    Router.post('/new-comment/:videoId', checkAuth, async (req, res) => {
        try {
            const verifiedUser = await jwt.verify(
                req.headers.authorization.split(" ")[1],
                'gunjan online classess 123',
            );
            console.log(verifiedUser)
            const newComment = new Comment({
                _id: new mongoose.Types.ObjectId,
                videoId: req.params.videoId,
                user_id: verifiedUser._id,
                commentText: req.body.commentText
            })
            const comment = await newComment.save()
            res.status(200).json({
                newComment: comment
            })

        }
        catch (err) {
            console.log(err)
            res.status(500).json({

                error: err
            })
        }
    })

    // Get all comments for any video
    Router.get('/:videoId', async (req, res) => {
        try {
            const videoObjectId = new mongoose.Types.ObjectId(req.params.videoId);

            const comments = await Comment.find({ videoId: videoObjectId })
                .populate('user_id', 'channelName logoUrl'); // selected fields from User

            res.status(200).json({
                commentList: comments
            });
        } catch (err) {
            console.log(err);
            res.status(500).json({
                error: err.message || err
            });
        }
    });


    // update comment
    Router.put('/:commentId', checkAuth, async (req, res) => {
    try {
        const verifiedUser = await jwt.verify(
        req.headers.authorization.split(" ")[1],
        'gunjan online classess 123'
        );

        const comment = await Comment.findById(req.params.commentId);
        if (!comment) {
        return res.status(404).json({ error: 'Comment not found' });
        }

        // ✅ Compare ObjectId as string
        if (comment.user_id.toString() !== verifiedUser._id) {
        return res.status(403).json({ error: 'Invalid user' });
        }

        comment.commentText = req.body.commentText;
        const updatedComment = await comment.save();

        res.status(200).json({ updatedComment });

    } catch (err) {
        console.log(err);
        res.status(500).json({ error: err.message || err });
    }
    });

    // delete comment
    Router.delete('/:commentId', checkAuth, async (req, res) => {
    try {
        const verifiedUser = await jwt.verify(
        req.headers.authorization.split(" ")[1],
        'gunjan online classess 123'
        );

        const comment = await Comment.findById(req.params.commentId);
        if (!comment) {
        return res.status(404).json({ error: 'Comment not found' });
        }

        // ✅ Compare ObjectId as string
        if (comment.user_id.toString() !== verifiedUser._id) {
        return res.status(403).json({ error: 'Invalid user' });
        }
        
        await Comment.findByIdAndDelete(req.params.commentId)
        res.status(200).json({ deletedData :'success..' });

    } catch (err) {
        console.log(err);
        res.status(500).json({ error: err.message || err });
    }
    });



    module.exports = Router