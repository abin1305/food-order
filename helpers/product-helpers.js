const db = require('../config/connection');
const collection = require('../config/collection');
const { ObjectId } = require('mongodb');

module.exports = {
    addProduct: (product, callback) => {
        console.log(product);
        db.get().collection(collection.PRODUCT_COLLECTION).insertOne(product).then((data) => {
            callback(data.insertedId);
        });
    },

    getAllProducts: () => {
        return new Promise(async (resolve, reject) => {
            let products = await db.get().collection(collection.PRODUCT_COLLECTION).find().toArray();
            resolve(products);
        });
    },

    deleteProduct: (prodId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.PRODUCT_COLLECTION).deleteOne({ _id: new ObjectId(prodId) }).then((response) => {
                resolve(response);
            });
        });
    },

    getProductDetails: (prodId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.PRODUCT_COLLECTION).findOne({ _id: new ObjectId(prodId) }).then((product) => {
                resolve(product);
            });
        });
    },

    updateProduct: (prodId, proDetails) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.PRODUCT_COLLECTION).updateOne({ _id: new ObjectId(prodId) }, {
                $set: {
                    name: proDetails.name,
                    category: proDetails.category,
                    price: proDetails.price,
                    description: proDetails.description
                }
            }).then((response) => {
                resolve();
            });
        });
    }
};