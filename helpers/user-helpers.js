const db = require('../config/connection');
const collection = require('../config/collection');
const bcrypt = require('bcrypt');
const { ObjectId } = require('mongodb');
module.exports={

 signup: (userdata) => {
  return new Promise(async (resolve, reject) => {
    userdata.password = await bcrypt.hash(userdata.password, 10); // ✅ Correct
    const data = await db.get().collection(collection.DATA_COLLECTION).insertOne(userdata);
    resolve(data); // optional: return user ID
  });
},


    login: (userdata) => {
  return new Promise(async (resolve, reject) => {
    let user = await db.get().collection(collection.DATA_COLLECTION).findOne({ email: userdata.email });

    if (user) {
     

      const status = await bcrypt.compare(userdata.password, user.password);
      
      if (status) {
        console.log('✅ Password matched');
        resolve({ status: true, user , message: 'login sucessfull'});
       
      } else {
        console.log('❌ Invalid password');
        resolve({ status: false, message: 'Invalid password' });
         
      }
    } else {
      console.log('❌ No user found');
      resolve({ status: false, message: 'User not found' });
       
    }
  });
},

addToCart: (proId, userId) => {
    let proObj = {
        item: new ObjectId(proId),
        quantity: 1
    };
    return new Promise(async (resolve, reject) => {
        let userCart = await db.get().collection(collection.CART_COLLECTION).findOne({ user: new ObjectId(userId) });
        if (userCart) {
            let proExist = userCart.products.findIndex(product => product.item == proId);
            if (proExist != -1) {
                db.get().collection(collection.CART_COLLECTION).updateOne({ user: new ObjectId(userId), 'products.item': new ObjectId(proId) },
                    {
                        $inc: { 'products.$.quantity': 1 }
                    }).then(() => {
                        resolve();
                    });
            } else {
                db.get().collection(collection.CART_COLLECTION).updateOne({ user: new ObjectId(userId) },
                    {
                        $push: { products: proObj }
                    }).then((response) => {
                        resolve();
                    });
            }
        } else {
            let cartObj = {
                user: new ObjectId(userId),
                products: [proObj]
            };
            db.get().collection(collection.CART_COLLECTION).insertOne(cartObj).then((response) => {
                resolve();
            });
        }
    });
},

getCartProducts: (userId) => {
    return new Promise(async (resolve, reject) => {
        let cartItems = await db.get().collection(collection.CART_COLLECTION).aggregate([
            {
                $match: { user: new ObjectId(userId) }
            },
            {
                $unwind: '$products'
            },
            {
                $project: {
                    item: '$products.item',
                    quantity: '$products.quantity'
                }
            },
            {
                $lookup: {
                    from: collection.PRODUCT_COLLECTION,
                    localField: 'item',
                    foreignField: '_id',
                    as: 'product'
                }
            },
            {
                $project: {
                    item: 1, quantity: 1, product: { $arrayElemAt: ['$product', 0] }
                }
            }
        ]).toArray();
        resolve(cartItems);
    });
},

getCartCount: (userId) => {
    return new Promise(async (resolve, reject) => {
        let count = 0;
        let cart = await db.get().collection(collection.CART_COLLECTION).findOne({ user: new ObjectId(userId) });
        if (cart) {
            count = cart.products.length;
        }
        resolve(count);
    });
},

changeProductQuantity: (details) => {
    details.count = parseInt(details.count);
    details.quantity = parseInt(details.quantity);

    return new Promise((resolve, reject) => {
        if (details.count == -1 && details.quantity == 1) {
            db.get().collection(collection.CART_COLLECTION).updateOne({ _id: new ObjectId(details.cart) },
                {
                    $pull: { products: { item: new ObjectId(details.product) } }
                }).then((response) => {
                    resolve({ removeProduct: true });
                });
        } else {
            db.get().collection(collection.CART_COLLECTION).updateOne({ _id: new ObjectId(details.cart), 'products.item': new ObjectId(details.product) },
                {
                    $inc: { 'products.$.quantity': details.count }
                }).then((response) => {
                    resolve({ status: true });
                });
        }
    });
},

removeCartProduct: (details) => {
    return new Promise((resolve, reject) => {
        db.get().collection(collection.CART_COLLECTION).updateOne({ _id: new ObjectId(details.cart) },
            {
                $pull: { products: { item: new ObjectId(details.product) } }
            }).then((response) => {
                resolve({ removeProduct: true });
            });
    });
},

getTotalAmount: (userId) => {
    return new Promise(async (resolve, reject) => {
        let total = await db.get().collection(collection.CART_COLLECTION).aggregate([
            {
                $match: { user: new ObjectId(userId) }
            },
            {
                $unwind: '$products'
            },
            {
                $project: {
                    item: '$products.item',
                    quantity: '$products.quantity'
                }
            },
            {
                $lookup: {
                    from: collection.PRODUCT_COLLECTION,
                    localField: 'item',
                    foreignField: '_id',
                    as: 'product'
                }
            },
            {
                $project: {
                    item: 1, quantity: 1, product: { $arrayElemAt: ['$product', 0] }
                }
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: { $multiply: ['$quantity', '$product.price'] } }
                }
            }
        ]).toArray();
        if (total.length > 0) {
            resolve(total[0].total);
        } else {
            resolve(0);
        }
    });
}

}