const db = require('../config/connection');
const collection = require('../config/collection');
const { ObjectId } = require('mongodb');

const initialSeedProducts = [
    {
        name: "Greek Salad",
        category: "Salad",
        price: 120,
        rating: 4.8,
        isVeg: true,
        prepTime: "15-20 min",
        image: "pexels-ella-olsson-572949-1640777.jpg",
        description: "Fresh Mediterranean salad with crisp cucumber, cherry tomatoes, kalamata olives, red onion, and premium feta cheese."
    },
    {
        name: "Chicken Caesar Salad",
        category: "Salad",
        price: 150,
        rating: 4.6,
        isVeg: false,
        prepTime: "15-25 min",
        image: "pexels-iina-luoto-460132-1211887.jpg",
        description: "Tender grilled chicken breast served over crisp romaine lettuce with croutons, parmesan shavings, and house Caesar dressing."
    },
    {
        name: "Crispy Spring Rolls",
        category: "Rolls",
        price: 80,
        rating: 4.5,
        isVeg: true,
        prepTime: "10-15 min",
        image: "pexels-any-lane-5945771.jpg",
        description: "Golden fried spring rolls stuffed with seasoned glass noodles and shredded vegetables, served with sweet chili dip."
    },
    {
        name: "Chicken Shawarma Wrap",
        category: "Rolls",
        price: 130,
        rating: 4.9,
        isVeg: false,
        prepTime: "15-20 min",
        image: "pexels-ash-craig-122861-376464.jpg",
        description: "Flame-grilled spiced chicken with garlic toum, pickles, and crispy fries tightly wrapped in warm pita bread."
    },
    {
        name: "Fudge Chocolate Brownie",
        category: "Desserts",
        price: 90,
        rating: 4.7,
        isVeg: true,
        prepTime: "10-15 min",
        image: "istockphoto-1024561260-1024x1024.jpg",
        description: "Decadent warm Belgian chocolate brownie topped with rich dark chocolate drizzle and toasted walnuts."
    },
    {
        name: "Fresh Fruit Tart",
        category: "Desserts",
        price: 110,
        rating: 4.6,
        isVeg: true,
        prepTime: "10 min",
        image: "pexels-valeriya-1199957.jpg",
        description: "Buttery pastry crust layered with silky vanilla bean pastry cream and glazed seasonal berries."
    },
    {
        name: "Classic Club Sandwich",
        category: "Sandwich",
        price: 140,
        rating: 4.8,
        isVeg: false,
        prepTime: "15 min",
        image: "pexels-vanmalidate-769289.jpg",
        description: "Triple-layer sandwich stuffed with smoked turkey, crisp bacon, lettuce, tomato, fried egg, and herb mayo."
    },
    {
        name: "Artisan Grilled Cheese",
        category: "Sandwich",
        price: 100,
        rating: 4.4,
        isVeg: true,
        prepTime: "12 min",
        image: "pexels-xmtnguyen-699953.jpg",
        description: "Golden toasted sourdough loaded with sharp cheddar, mozzarella, and caramelized onion relish."
    }
];

module.exports = {
    addProduct: (product, callback) => {
        product.price = parseFloat(product.price) || 0;
        product.rating = parseFloat(product.rating) || 4.5;
        product.isVeg = product.isVeg === 'true' || product.isVeg === true;
        product.prepTime = product.prepTime || '20-25 min';
        
        db.get().collection(collection.PRODUCT_COLLECTION).insertOne(product).then((data) => {
            callback(data.insertedId);
        });
    },

    getAllProducts: (category = null) => {
        return new Promise(async (resolve, reject) => {
            try {
                let query = {};
                if (category && category !== 'All') {
                    query.category = { $regex: new RegExp('^' + category + '$', 'i') };
                }
                let products = await db.get().collection(collection.PRODUCT_COLLECTION).find(query).toArray();
                
                // Auto seed if database is empty
                if (products.length === 0 && !category) {
                    await db.get().collection(collection.PRODUCT_COLLECTION).insertMany(initialSeedProducts);
                    products = await db.get().collection(collection.PRODUCT_COLLECTION).find({}).toArray();
                }
                resolve(products);
            } catch (err) {
                reject(err);
            }
        });
    },

    searchProducts: (searchQuery, category = null) => {
        return new Promise(async (resolve, reject) => {
            try {
                let filter = {};
                if (searchQuery) {
                    filter.$or = [
                        { name: { $regex: searchQuery, $options: 'i' } },
                        { description: { $regex: searchQuery, $options: 'i' } },
                        { category: { $regex: searchQuery, $options: 'i' } }
                    ];
                }
                if (category && category !== 'All') {
                    filter.category = { $regex: new RegExp('^' + category + '$', 'i') };
                }
                let products = await db.get().collection(collection.PRODUCT_COLLECTION).find(filter).toArray();
                resolve(products);
            } catch (err) {
                reject(err);
            }
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
                    price: parseFloat(proDetails.price) || 0,
                    description: proDetails.description,
                    prepTime: proDetails.prepTime || '20-25 min',
                    rating: parseFloat(proDetails.rating) || 4.5,
                    isVeg: proDetails.isVeg === 'true' || proDetails.isVeg === true
                }
            }).then((response) => {
                resolve();
            });
        });
    },

    getAllOrders: () => {
        return new Promise(async (resolve, reject) => {
            try {
                let orders = await db.get().collection(collection.ORDER_COLLECTION).find().sort({ createdAt: -1 }).toArray();
                resolve(orders);
            } catch (err) {
                reject(err);
            }
        });
    },

    updateOrderStatus: (orderId, status) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.ORDER_COLLECTION).updateOne(
                { _id: new ObjectId(orderId) },
                { $set: { status: status } }
            ).then((res) => {
                resolve(res);
            });
        });
    },

    getAdminStats: () => {
        return new Promise(async (resolve, reject) => {
            try {
                const totalProducts = await db.get().collection(collection.PRODUCT_COLLECTION).countDocuments();
                const totalUsers = await db.get().collection(collection.DATA_COLLECTION).countDocuments();
                const orders = await db.get().collection(collection.ORDER_COLLECTION).find().toArray();
                const totalOrders = orders.length;
                const totalRevenue = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
                
                resolve({
                    totalProducts,
                    totalUsers,
                    totalOrders,
                    totalRevenue
                });
            } catch (err) {
                resolve({ totalProducts: 0, totalUsers: 0, totalOrders: 0, totalRevenue: 0 });
            }
        });
    }
};