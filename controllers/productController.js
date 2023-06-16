import Product from '../models/product.js';
import { StatusCodes } from 'http-status-codes';
import { PineconeClient } from '@pinecone-database/pinecone';

const pinecone = new PineconeClient();

// get one by id
const getOne = async (req, res) => {
  const product = await Product.findOne({
    _id: req.params._id,
  });
  res.successResponse(StatusCodes.OK, {
    data: product,
  });
};

//get all
const getAll = async (req, res) => {
  const products = await Product.find({ show: true });
  res.successResponse(StatusCodes.OK, {
    data: products,
  });
};

const create = async (req, res) => {
  // create slider
  const product = new Product(req.body);
  await product.save();
  res.successResponse(StatusCodes.CREATED, {
    data: product,
  });
};

const update = async (req, res) => {
  // update slider and update the current time
  const product = await Product.findByIdAndUpdate(req.params._id, req.body);
  await product.save();
  res.successResponse(StatusCodes.OK, {
    data: product,
  });
};

const remove = async (req, res) => {
  // remove slider
  const product = await Product.findByIdAndRemove(req.params._id);
  res.successResponse(StatusCodes.OK, {
    data: product,
  });
};

export { getOne, getAll, create, update, remove };
