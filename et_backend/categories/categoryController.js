import { query } from '../config/db.js';

export const getCategories = async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await query(
      `SELECT id, category_name, category_type, cat_icon, cat_colour, is_system, created_at
       FROM categories
       WHERE is_system = true OR user_id = $1
       ORDER BY category_name ASC`,
      [userId]
    );

    return res.status(200).json({
      success: true,
      categories: result.rows
    });
  } catch (err) {
    console.error('[GetCategories Error]:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch categories.' });
  }
};

export const createCategory = async (req, res) => {
  try {
    const userId = req.user.id;
    const { category_name, category_type, cat_icon, cat_colour } = req.body;

    if (!category_name || category_name.trim().length === 0) {
      return res.status(400).json({ success: false, message: 'Category name is required.' });
    }

    const insertSql = `
      INSERT INTO categories (user_id, category_name, category_type, cat_icon, cat_colour, is_system)
      VALUES ($1, $2, $3, $4, $5, false)
      RETURNING id, category_name, category_type, cat_icon, cat_colour, is_system, created_at
    `;
    const result = await query(insertSql, [
      userId,
      category_name.trim(),
      (category_type || 'expense').trim().toLowerCase(),
      cat_icon || 'Tag',
      cat_colour || '#4382DF'
    ]);

    return res.status(201).json({
      success: true,
      message: 'Category created successfully.',
      category: result.rows[0]
    });
  } catch (err) {
    console.error('[CreateCategory Error]:', err);
    return res.status(500).json({ success: false, message: 'Failed to create category.' });
  }
};
