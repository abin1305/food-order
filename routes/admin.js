var express = require('express');
var router = express.Router();
const productHelper = require('../helpers/product-helpers');
const db = require('../config/connection');
const collection = require('../config/collection');
const { ObjectId } = require('mongodb');

/* GET home page. */
router.get('/', function(req,res) {
  res.render('admin/items',{ admin: true });
});

router.get('/add-product', (req, res) => {
  res.render('admin/add-product', { admin: true });
});

router.post('/add-product', (req, res) => {
  const product = req.body;
  productHelper.addProduct(product, (id) => {
    if (req.files && req.files.image) {
      let image = req.files.image;
      const imageName = id + '.jpg';
      image.mv('./public/product-images/' + imageName, (err, done) => {
        if (!err) {
          // Update product with image filename
          db.get().collection(collection.PRODUCT_COLLECTION).updateOne(
            { _id: new ObjectId(id) },
            { $set: { image: imageName } }
          ).then(() => {
            res.redirect('/admin/products');
          });
        } else {
          console.log(err);
          res.redirect('/admin/products');
        }
      });
    } else {
      res.redirect('/admin/products');
    }
  });
});

router.get('/products', (req, res) => {
  productHelper.getAllProducts().then((products) => {
    res.render('admin/view-products', { admin: true, products });
  });
});

router.get('/delete-product/:id', (req, res) => {
  let proId = req.params.id;
  productHelper.deleteProduct(proId).then((response) => {
    res.redirect('/admin/products');
  });
});

router.get('/edit-product/:id', async (req, res) => {
  let product = await productHelper.getProductDetails(req.params.id);
  res.render('admin/edit-product', { product, admin: true });
});

router.post('/edit-product/:id', (req, res) => {
  productHelper.updateProduct(req.params.id, req.body).then(() => {
    if (req.files && req.files.image) {
      let image = req.files.image;
      const imageName = req.params.id + '.jpg';
      image.mv('./public/product-images/' + imageName, (err, done) => {
        if (!err) {
          // Update product with new image filename
          db.get().collection(collection.PRODUCT_COLLECTION).updateOne(
            { _id: new ObjectId(req.params.id) },
            { $set: { image: imageName } }
          ).then(() => {
            res.redirect('/admin/products');
          });
        } else {
          console.log(err);
          res.redirect('/admin/products');
        }
      });
    } else {
      res.redirect('/admin/products');
    }
  });
});

module.exports = router;
