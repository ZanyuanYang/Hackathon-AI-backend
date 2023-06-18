import Product from '../models/product.js';
import { StatusCodes } from 'http-status-codes';
import { PineconeClient } from '@pinecone-database/pinecone';
import { Document } from 'langchain/document';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { PineconeStore } from 'langchain/vectorstores/pinecone';
import { VectorDBQAChain } from 'langchain/chains';
import { OpenAI } from 'langchain/llms/openai';
import { SystemMessagePromptTemplate } from 'langchain/prompts';
import { HumanChatMessage, SystemChatMessage } from 'langchain/schema';
import readline from 'readline';
import fs from 'fs';
import csv from 'csv-parser';
import { BufferMemory } from 'langchain/memory';
import { MemoryVectorStore } from 'langchain/vectorstores/memory';

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
  // const product = new Product(req.body);
  // await product.save();
  // res.successResponse(StatusCodes.CREATED, {
  //   data: product,
  // });
  // const fileStream = fs.createReadStream(
  //   '/Users/jayingyoung/Desktop/hackathon/backend/controllers/nike_products.csv'
  // );
  //
  // const rl = readline.createInterface({
  //   input: fileStream,
  //   crlfDelay: Infinity,
  // });
  //
  // for await (const line of rl) {
  //   // Each line in the CSV file will be successively available here as `line`.
  //   console.log(`Line: ${line}`);
  // }

  const results = [];

  fs.createReadStream(
    '/Users/jayingyoung/Desktop/hackathon/backend/controllers/nike_products.csv'
  )
    .pipe(csv())
    .on('data', (data) => results.push(data))
    .on('end', () => {
      results.forEach(async (row) => {
        const product = new Product({
          name: row['Product Name'],
          productLink: row['Product Link'],
          imageLink: row['Image Link'],
          productPrice: row['Product Price'],
          productDescription: row['Product Description'],
        });
        await product.save();
      });
    });
  res.successResponse(StatusCodes.OK, {
    data: 'success',
  });
};

const update = async (req, res) => {
  // update slider and update the current time
  const product = await Product.findByIdAndUpdate(req.params._id, req.body);
  await product.save();
  res.successResponse(StatusCodes.OK, {
    data: product,
  });
  // try {
  //   const results = [];
  //   fs.createReadStream('../../nike_products.csv')
  //     .pipe(csv())
  //     .on('data', (data) => results.push(data))
  //     .on('end', async () => {
  //       for (let row of results) {
  //         const product = new Product(row);
  //         console.log(product);
  //         // await product.save();
  //       }
  //       res.successResponse(StatusCodes.CREATED);
  //     });
  // } catch (error) {
  //   console.log(error);
  //   res.errorResponse(StatusCodes.INTERNAL_SERVER_ERROR, error);
  // }
};

const remove = async (req, res) => {
  // remove slider
  const product = await Product.findByIdAndRemove(req.params._id);
  res.successResponse(StatusCodes.OK, {
    data: product,
  });
};

const parseCSV = () => {
  return new Promise((resolve, reject) => {
    const results = [];
    const docs = [];

    fs.createReadStream(
      '/Users/jayingyoung/Desktop/hackathon/backend/controllers/nike_products.csv'
    )
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => {
        results.forEach((row) => {
          const document = new Document({
            metadata: {
              name: row['Product Name'],
              productLink: row['Product Link'],
              imageLink: row['Image Link'],
              productPrice: row['Product Price'],
              productDescription: row['Product Description'],
            },
            pageContent: row['Product Description'],
          });
          docs.push(document);
        });
        resolve(docs);
      })
      .on('error', (err) => {
        reject(err);
      });
  });
};

const pineconeCreate = async (req, res) => {
  const client = new PineconeClient();
  await client.init({
    apiKey: process.env.PINECONE_API_KEY,
    environment: process.env.PINECONE_ENVIRONMENT,
  });
  const pineconeIndex = client.Index(process.env.PINECONE_INDEX);

  // const results = [];
  // const docs = [];
  //
  // fs.createReadStream(
  //   '/Users/jayingyoung/Desktop/hackathon/backend/controllers/nike_products.csv'
  // )
  //   .pipe(csv())
  //   .on('data', (data) => results.push(data))
  //   .on('end', () => {
  //     results.forEach((row) => {
  //       const document = new Document({
  //         metadata: {
  //           name: row['Product Name'],
  //           productLink: row['Product Link'],
  //           imageLink: row['Image Link'],
  //           productPrice: row['Product Price'],
  //           productDescription: row['Product Description'],
  //         },
  //         pageContent: row['Product Description'],
  //       });
  //       docs.push(document);
  //     });
  //   });
  // console.log(docs);

  parseCSV()
    .then(async (docs) => {
      console.log(docs);
      const response = await PineconeStore.fromDocuments(
        docs,
        new OpenAIEmbeddings(),
        {
          pineconeIndex,
        }
      );
      res.successResponse(StatusCodes.OK, {
        data: response,
      });
    })
    .catch((err) => {
      console.error(err);
      res.successResponse(StatusCodes.OK, {
        data: 'fail',
      });
    });
};

const pineconeQuery = async (req, res) => {
  const client = new PineconeClient();
  await client.init({
    apiKey: process.env.PINECONE_API_KEY,
    environment: process.env.PINECONE_ENVIRONMENT,
  });
  const pineconeIndex = client.Index(process.env.PINECONE_INDEX);
  const vectorStore = await PineconeStore.fromExistingIndex(
    new OpenAIEmbeddings(),
    { pineconeIndex }
  );
  // const vectorStore = await MemoryVectorStore.fromExistingIndex(
  //   new OpenAIEmbeddings(),
  //   { pineconeIndex }
  // );

  /* Search the vector DB independently with meta filters */
  // const results = await vectorStore.similaritySearch('pinecone', 2, {
  //   brand: 'nike',
  // });
  // console.log(results);

  /* Use as part of a chain (currently no metadata filters) */
  const model = new OpenAI();
  const memory = new BufferMemory();
  const chain = VectorDBQAChain.fromLLM(model, vectorStore, {
    k: 3,
    returnSourceDocuments: true,
  });
  const response = await chain.call({
    query: req.body.input,
    // 'I want a adidas shoes which is MADE IN PART WITH RECYCLED MATERIALS',
  });
  res.successResponse(StatusCodes.OK, {
    data: response,
  });
  /*
  {
	text: ' A pinecone is the woody fruiting body of a pine tree.',
	sourceDocuments: [
	  Document {
		pageContent: 'pinecones are the woody fruiting body and of a pine tree',
		metadata: [Object]
	  }
	]
  }
  */
};

export {
  getOne,
  getAll,
  create,
  update,
  remove,
  pineconeCreate,
  pineconeQuery,
};
