const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  title:{type:String,require:true},
  description:{type:String,require},
  user_id:{type:String,require:true},
  videoUrl:{type:String,require:true},
  videoId:{type:String,require:true},
  thumbnaiUrl:{type:String,require:true},
  thumbnaiId:{type:String,require:true},
  category:{type:String,require:true},
  tags:[{type:String}],
  likes:{type:Number,default:0},
  dislike:{type:Number,default:0},
  views:{type:Number,default:0},
  likedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  dislikedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  // viewedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],


}, { timestamps: true });

// ✅ Correct export
module.exports = mongoose.model('Video', videoSchema);
