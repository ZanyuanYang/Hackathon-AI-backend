import express from 'express';
import {
  getOne,
  getAll,
  create,
  update,
  remove,
} from '../controllers/productController.js';

const router = express.Router();

router.route('/product').get(getAll).post(create);
router.route('/product/:_id').get(getOne).put(update).delete(remove);

export { router as productRouter };
