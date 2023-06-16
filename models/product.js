import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema({
	name: {
		type: String,
		required: true,
		unique: true,
	},
	url: {
		type: String,
		required: true,
		unique: true,
	},
	show: {
		type: Boolean,
		default: true,
	},
});

const Product = mongoose.model('Product', ProductSchema);

export default Product;
