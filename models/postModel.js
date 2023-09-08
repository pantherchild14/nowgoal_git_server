import mongoose from 'mongoose';

const postSchema = new mongoose.Schema({
    post_author: {
        type: String,
        required: true,
    },
    post_date: {
        type: Date,
        default: Date.now,
    },
    post_content: {
        type: String,
        required: true,
    },
    post_title: {
        type: String,
        required: true,
    },
    post_status: {
        type: String,
        default: 'draft',
    },
    post_image: {
        type: String,
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
    },
}, {
    timestamps: true
});

export const Post = mongoose.model('Post', postSchema);
