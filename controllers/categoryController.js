import { Category } from '../models/categoryModel.js';

export const createCategory = async (req, res) => {
    try {
        const { name, slug, description, termGroup } = req.body;

        const newCategory = new Category({
            name,
            slug,
            description,
            termGroup,
        });

        await newCategory.save();
        res.status(201).json(newCategory);

    } catch (error) {
        res.status(500).json({ message: 'Error creating category', error: error.message });
    }
};

export const getCategories = async (req, res) => {
    try {
        const categories = await Category.find();
        // res.status(200).json(categories);
        res.status(200).json({ categories, id: categories._id });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching categories', error: error.message });
    }
};
