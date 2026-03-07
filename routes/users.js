var express = require('express');
var router = express.Router();
const userHelper = require('../helpers/user-helpers');
const productHelper = require('../helpers/product-helpers');

/* GET users listing. */
router.get('/', async (req, res) => {
  let user = req.session.user;
  let cartCount = null;
  if (user) {
    cartCount = await userHelper.getCartCount(req.session.user._id);
  }
  productHelper.getAllProducts().then((products) => {
    res.render('index', { products, user, cartCount });
  });
});

router.get('/login', (req, res) => {
  if (req.session.user) {
    res.redirect('/');
  } else {
    res.render('user/login', { layout: false, "loginErr": req.session.userLoginErr });
    req.session.userLoginErr = false;
  }
});

router.get('/signup', (req, res) => {
  res.render('user/signup', { layout: false });
});

router.post('/signup', async (req, res) => {
  await userHelper.signup(req.body).then((userid) => {
    req.session.user = req.body;
    req.session.user._id = userid.insertedId;
    res.redirect('/');
  });
});

router.post('/login', async (req, res) => {
  await userHelper.login(req.body).then((response) => {
    if (response.status) {
      req.session.user = response.user;
      req.session.userLoggedIn = true;
      res.redirect('/');
    } else {
      req.session.userLoginErr = response.message;
      res.redirect('/login');
    }
  });
});

router.get('/logout', (req, res) => {
  req.session.user = null;
  req.session.userLoggedIn = false;
  res.redirect('/');
});

router.get('/cart', async (req, res) => {
  if (req.session.userLoggedIn) {
    let products = await userHelper.getCartProducts(req.session.user._id);
    let total = await userHelper.getTotalAmount(req.session.user._id);
    res.render('user/cart', { products, user: req.session.user, total });
  } else {
    res.redirect('/login');
  }
});

router.get('/add-to-cart/:id', async (req, res) => {
  if (req.session.userLoggedIn) {
    await userHelper.addToCart(req.params.id, req.session.user._id);
    const cartCount = await userHelper.getCartCount(req.session.user._id);
    res.json({ status: true, cartCount });
  } else {
    res.json({ status: false });
  }
});

router.post('/change-product-quantity', (req, res) => {
  userHelper.changeProductQuantity(req.body).then(async (response) => {
    response.total = await userHelper.getTotalAmount(req.body.user);
    res.json(response);
  });
});

router.post('/remove-cart-product', (req, res) => {
  userHelper.removeCartProduct(req.body).then((response) => {
    res.json(response);
  });
});

module.exports = router; 