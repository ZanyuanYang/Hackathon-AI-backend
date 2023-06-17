import express from 'express';
import {
  getOne,
  getAll,
  create,
  update,
  remove,
  pineconeQuery,
  pineconeCreate,
} from '../controllers/productController.js';

const router = express.Router();

router.route('/product').get(getAll).post(create);
router.route('/product/:_id').get(getOne).put(update).delete(remove);
// router.route('/product/pinecone/:user_id').get(pineconeQuery);
router.route('/product/pinecone').post(pineconeQuery);

export { router as productRouter };
