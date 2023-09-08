import express from "express";
import multer from "multer";
import { createPost, deletePost, getPosts, getPostsByCategory, updatePost } from "../controllers/postController.js";
import { createCategory, getCategories } from "../controllers/categoryController.js";
import fs from 'fs';

const router = express.Router();

const uploadDirectory = 'uploads/';

// Kiểm tra xem thư mục tồn tại chưa, nếu không thì tạo mới
if (!fs.existsSync(uploadDirectory)) {
    fs.mkdirSync(uploadDirectory);
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/"); // Thư mục lưu trữ hình ảnh
    },
    filename: (req, file, cb) => {
        const fileName = `${Date.now()}-${file.originalname}`;
        cb(null, fileName); // Tên file hình ảnh sau khi lưu
    },
});

const upload = multer({ storage });

router.get('/posts', getPosts);
router.post('/posts', upload.single('post_image'), createPost);
router.put('/posts/:postId', updatePost);
router.delete('/posts/:postId', deletePost);

// Routes cho Category
router.get('/categories', getCategories);

// {
//     "post_author": "Tên tác giả",
//     "post_name": "555",
//     "post_title": "Tiêu đề bài viết",
//     "post_content": "Nội dung bài viết",
//     "category": "64f05d937250b4dba64d50c5"
// }
router.post('/categories', createCategory);

// http://localhost:5000/wp-admin/posts/category/64f05d937250b4dba64d50c5
router.get('/posts/category/:categoryId', getPostsByCategory);

export default router;
