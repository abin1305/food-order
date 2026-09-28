var express = require('express');
var router = express.Router();
const productHelper = require('../helpers/product-helpers');
const db = require('../config/connection');
const collection = require('../config/collection');
const { ObjectId } = require('mongodb');

/* GET admin dashboard. */
router.get('/', async function(req, res) {
  const stats = await productHelper.getAdminStats();
  const products = await productHelper.getAllProducts();
  const orders = await productHelper.getAllOrders();
  res.render('admin/dashboard', { 
    admin: true, 
    stats, 
    products: products.slice(0, 5), 
    orders: orders.slice(0, 5),
    title: 'Admin Dashboard | Tomato' 
  });
});

/* GET view products */
router.get('/products', (req, res) => {
  productHelper.getAllProducts().then((products) => {
    res.render('admin/view-products', { admin: true, products, title: 'Manage Products | Tomato Admin' });
  });
});

/* GET add product page */
router.get('/add-product', (req, res) => {
  res.render('admin/add-product', { admin: true, title: 'Add New Food Product | Tomato Admin' });
});

/* POST add product */
router.post('/add-product', (req, res) => {
  const product = req.body;
  productHelper.addProduct(product, (id) => {
    if (req.files && req.files.image) {
      let image = req.files.image;
      const imageName = id + '.jpg';
      image.mv('./public/product-images/' + imageName, (err) => {
        if (!err) {
          db.get().collection(collection.PRODUCT_COLLECTION).updateOne(
            { _id: new ObjectId(id) },
            { $set: { image: imageName } }
          ).then(() => {
            res.redirect('/admin/products');
          });
        } else {
          console.log('Image upload error:', err);
          res.redirect('/admin/products');
        }
      });
    } else {
      res.redirect('/admin/products');
    }
  });
});

/* GET edit product */
router.get('/edit-product/:id', async (req, res) => {
  let product = await productHelper.getProductDetails(req.params.id);
  res.render('admin/edit-product', { product, admin: true, title: 'Edit Product | Tomato Admin' });
});

/* POST edit product */
router.post('/edit-product/:id', (req, res) => {
  productHelper.updateProduct(req.params.id, req.body).then(() => {
    if (req.files && req.files.image) {
      let image = req.files.image;
      const imageName = req.params.id + '.jpg';
      image.mv('./public/product-images/' + imageName, (err) => {
        if (!err) {
          db.get().collection(collection.PRODUCT_COLLECTION).updateOne(
            { _id: new ObjectId(req.params.id) },
            { $set: { image: imageName } }
          ).then(() => {
            res.redirect('/admin/products');
          });
        } else {
          console.log('Image upload error:', err);
          res.redirect('/admin/products');
        }
      });
    } else {
      res.redirect('/admin/products');
    }
  });
});

/* GET delete product */
router.get('/delete-product/:id', (req, res) => {
  let proId = req.params.id;
  productHelper.deleteProduct(proId).then(() => {
    res.redirect('/admin/products');
  });
});

/* GET view customer orders */
router.get('/orders', async (req, res) => {
  let orders = await productHelper.getAllOrders();
  res.render('admin/orders', { admin: true, orders, title: 'Manage Customer Orders | Tomato Admin' });
});

/* POST update order status */
router.post('/update-order-status', (req, res) => {
  const { orderId, status } = req.body;
  productHelper.updateOrderStatus(orderId, status).then(() => {
    res.json({ status: true });
  });
});

module.exports = router;
