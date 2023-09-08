import { Post } from '../models/postModel.js';

export const createPost = async (req, res) => {
    try {
        const { post_author, post_title, post_content, post_image, post_status, category } = req.body;

        const newPost = new Post({
            post_author,
            post_title,
            post_content,
            post_status,
            post_image,
            category,
        });

        await newPost.save();
        res.status(201).json(newPost);
    } catch (error) {
        res.status(500).json({ message: 'Error creating post', error: error.message });
    }
};

export const updatePost = async (req, res) => {
    try {
        const postId = req.params.postId;
        const { post_author, post_title, post_content, post_image, post_status, category } = req.body;

        const updatedPost = await Post.findByIdAndUpdate(
            postId,
            {
                post_author,
                post_title,
                post_content,
                post_status,
                post_image,
                category,
            },
            { new: true }
        );

        res.status(200).json(updatedPost);
    } catch (error) {
        res.status(500).json({ message: 'Error updating post', error: error.message });
    }
};

export const getPosts = async (req, res) => {
    try {
        const posts = await Post.find().populate('category').exec();
        res.status(200).json(posts);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching posts', error: error.message });
    }
};

export const getPostsByCategory = async (req, res) => {
    try {
        const categoryId = req.params.categoryId;
        const posts = await Post.find({ category: categoryId }).populate('category').exec();
        res.status(200).json(posts);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching posts by category', error: error.message });
    }
};

export const deletePost = async (req, res) => {
    try {
        const postId = req.params.postId;

        const existingPost = await Post.findById(postId);

        if (!existingPost) {
            return res.status(404).json({ message: 'Post not found' });
        }

        await Post.findByIdAndRemove(postId);

        res.status(200).json({ message: 'Post deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting post', error: error.message });
    }
};
