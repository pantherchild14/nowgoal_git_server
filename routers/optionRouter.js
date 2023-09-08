import { createOrUpdateOption, deleteOptionByName, findOptionByName } from "../controllers/optionController.js";
import express from 'express';

const router = express.Router();

// Tìm một tùy chọn theo option_name
// GET
// http://localhost:5000/wp-admin/option/widget_related_posts_widget
router.get('/:optionName', async (req, res) => {
    try {
        const optionName = req.params.optionName;
        const option = await findOptionByName(optionName);

        if (!option) {
            return res.status(404).json({ message: 'Option not found' });
        }

        res.status(200).json(option);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching option by name', error: error.message });
    }
});

// Thêm mới một tùy chọn
// POST
// http://localhost:5000/wp-admin/option
// {
//     "option_name": "widget_related_posts_widget",
//     "option_value": "a:2:{i:2;a:1:{s:5:'title';s:13:'Related Posts';}s:12:'_multiwidget';i:1;}"
// }
router.post('/', async (req, res) => {
    try {
        const optionData = req.body;
        const option = await createOrUpdateOption(optionData);
        res.status(201).json(option);
    } catch (error) {
        res.status(500).json({ message: 'Error creating/updating option', error: error.message });
    }
});


// Xóa một tùy chọn theo option_name
// DELETE
// http://localhost:5000/wp-admin/option/widget_related_posts_widget
router.delete('/:optionName', async (req, res) => {
    try {
        const optionName = req.params.optionName;
        const result = await deleteOptionByName(optionName);

        if (result.deletedCount === 0) {
            return res.status(404).json({ message: 'Option not found' });
        }

        res.status(200).json({ message: 'Option deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting option', error: error.message });
    }
});

export default router;
