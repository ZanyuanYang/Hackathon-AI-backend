import Product from '../models/product.js';
import { StatusCodes } from 'http-status-codes';
import { PineconeClient } from '@pinecone-database/pinecone';
import { Document } from 'langchain/document';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { PineconeStore } from 'langchain/vectorstores/pinecone';
import { VectorDBQAChain } from 'langchain/chains';
import { OpenAI } from 'langchain/llms/openai';

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

const pineconeCreate = async (req, res) => {
  const client = new PineconeClient();
  await client.init({
    apiKey: process.env.PINECONE_API_KEY,
    environment: process.env.PINECONE_ENVIRONMENT,
  });
  const pineconeIndex = client.Index(process.env.PINECONE_INDEX);
  const docs = [
    new Document({
      metadata: {
        brand: 'nike',
        name: 'Nike Pegasus 40',
        description:
          'A springy ride for every run, the Peg’s familiar, just-for-you feel returns to help you accomplish your goals. This version has the same responsiveness and neutral support you love, but with improved comfort in those sensitive areas of your foot, like the arch and toes. Whether you’re logging long marathon miles, squeezing in a speed session before the sun goes down or hopping into a spontaneous group jaunt, it’s still the established road runner you can put your faith in, day after day, run after run.',
      },
      pageContent:
        'A springy ride for every run, the Peg’s familiar, just-for-you feel returns to help you accomplish your goals. This version has the same responsiveness and neutral support you love, but with improved comfort in those sensitive areas of your foot, like the arch and toes. Whether you’re logging long marathon miles, squeezing in a speed session before the sun goes down or hopping into a spontaneous group jaunt, it’s still the established road runner you can put your faith in, day after day, run after run.',
    }),
    new Document({
      metadata: {
        brand: 'nike',
        name: 'Nike Pegasus FlyEase SE',
        description:
          'Let the Pegasus FlyEase help you ascend to new heights. Designed to offer a balanced and energized ride for every run, they provide a supportive sensation that helps your foot feel contained. Plus, Nike FlyEase technology acts as a strap, helping secure your fit and making these easy to take on and off. Zoom Air units in the forefoot and heel help add a pop to your stride as you transition from heel to toe. Sharp, bright hues complement dark-room color neutrals, speaking to an inclusive world where digital and physical coexist in harmony.',
      },
      pageContent:
        'Let the Pegasus FlyEase help you ascend to new heights. Designed to offer a balanced and energized ride for every run, they provide a supportive sensation that helps your foot feel contained. Plus, Nike FlyEase technology acts as a strap, helping secure your fit and making these easy to take on and off. Zoom Air units in the forefoot and heel help add a pop to your stride as you transition from heel to toe. Sharp, bright hues complement dark-room color neutrals, speaking to an inclusive world where digital and physical coexist in harmony.',
    }),
    new Document({
      metadata: {
        brand: 'adidas',
        name: 'SAMBA OG SHOES',
        description:
          'THE CLASSIC LOOK AND FEEL OF THE AUTHENTIC SAMBA.\n' +
          'Born on the soccer field, the Samba is a timeless icon of street style. These shoes stay true to their legacy with a soft leather upper and suede overlays.',
      },
      pageContent:
        'THE CLASSIC LOOK AND FEEL OF THE AUTHENTIC SAMBA.\n' +
        'Born on the soccer field, the Samba is a timeless icon of street style. These shoes stay true to their legacy with a soft leather upper and suede overlays.',
    }),
    new Document({
      metadata: {
        brand: 'adidas',
        name: 'STAN SMITH SHOES',
        description:
          'A SHOE COLLAB WITH ANDRÉ SARAIVA, MADE IN PART WITH RECYCLED MATERIALS.\n' +
          'adidas teams up once again with artist André Saraiva for a special collection inspired by love. These kids\' adidas shoes have a crisp synthetic leather upper that acts as the canvas for André\'s timeless medium of graffiti. Through this collection, André promotes the mantra "The World Needs Love," encouraging acceptance amongst us all. The "XO" graphic and shoelace charm bring this story to life in the most playful of ways for all of their adventures.\n' +
          '\n' +
          'Made with a series of recycled materials, this upper features at least 50% recycled content. This product represents just one of our solutions to help end plastic waste.',
      },
      pageContent:
        'A SHOE COLLAB WITH ANDRÉ SARAIVA, MADE IN PART WITH RECYCLED MATERIALS.\n' +
        'adidas teams up once again with artist André Saraiva for a special collection inspired by love. These kids\' adidas shoes have a crisp synthetic leather upper that acts as the canvas for André\'s timeless medium of graffiti. Through this collection, André promotes the mantra "The World Needs Love," encouraging acceptance amongst us all. The "XO" graphic and shoelace charm bring this story to life in the most playful of ways for all of their adventures.\n' +
        '\n' +
        'Made with a series of recycled materials, this upper features at least 50% recycled content. This product represents just one of our solutions to help end plastic waste.',
    }),
  ];

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

  /* Search the vector DB independently with meta filters */
  // const results = await vectorStore.similaritySearch('pinecone', 2, {
  //   brand: 'nike',
  // });
  // console.log(results);

  /* Use as part of a chain (currently no metadata filters) */
  const model = new OpenAI();
  const chain = VectorDBQAChain.fromLLM(model, vectorStore, {
    k: 2,
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
