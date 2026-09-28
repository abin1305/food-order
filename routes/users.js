var express = require('express');
var router = express.Router();
const userHelper = require('../helpers/user-helpers');
const productHelper = require('../helpers/product-helpers');

const verifyLogin = (req, res, next) => {
  if (req.session.userLoggedIn) {
    next();
  } else {
    res.redirect('/login');
  }
};

/* GET home page with product list & category filter */
router.get('/', async (req, res) => {
  let user = req.session.user;
  let cartCount = null;
  if (user) {
    cartCount = await userHelper.getCartCount(req.session.user._id);
  }

  const selectedCategory = req.query.category || 'All';
  const searchQuery = req.query.search || '';

  let products;
  if (searchQuery || (selectedCategory && selectedCategory !== 'All')) {
    products = await productHelper.searchProducts(searchQuery, selectedCategory);
  } else {
    products = await productHelper.getAllProducts();
  }

  res.render('index', { 
    products, 
    user, 
    cartCount, 
    selectedCategory, 
    searchQuery,
    title: 'Tomato | Delicious Food Delivered Fast' 
  });
});

/* GET search & category page */
router.get('/search', async (req, res) => {
  let user = req.session.user;
  let cartCount = null;
  if (user) {
    cartCount = await userHelper.getCartCount(req.session.user._id);
  }

  const query = req.query.q || '';
  const category = req.query.category || 'All';

  const products = await productHelper.searchProducts(query, category);

  res.render('user/search', {
    products,
    user,
    cartCount,
    query,
    category,
    title: 'Search Dishes | Tomato'
  });
});

/* API endpoint for live search suggestions */
router.get('/api/search', async (req, res) => {
  const query = req.query.q || '';
  const category = req.query.category || 'All';
  const products = await productHelper.searchProducts(query, category);
  res.json({ products });
});

router.get('/login', (req, res) => {
  if (req.session.userLoggedIn) {
    res.redirect('/');
  } else {
    res.render('user/login', { layout: false, loginErr: req.session.userLoginErr });
    req.session.userLoginErr = false;
  }
});

router.get('/signup', (req, res) => {
  if (req.session.userLoggedIn) {
    res.redirect('/');
  } else {
    res.render('user/signup', { layout: false });
  }
});

router.post('/signup', async (req, res) => {
  try {
    const userid = await userHelper.signup(req.body);
    req.session.user = {
      _id: userid.insertedId,
      name: req.body.name,
      email: req.body.email
    };
    req.session.userLoggedIn = true;
    res.redirect('/');
  } catch (err) {
    console.error("Signup error:", err);
    res.redirect('/signup');
  }
});

router.post('/login', async (req, res) => {
  const response = await userHelper.login(req.body);
  if (response.status) {
    req.session.user = response.user;
    req.session.userLoggedIn = true;
    res.redirect('/');
  } else {
    req.session.userLoginErr = response.message;
    res.redirect('/login');
  }
});

router.get('/logout', (req, res) => {
  req.session.user = null;
  req.session.userLoggedIn = false;
  res.redirect('/');
});

router.get('/cart', verifyLogin, async (req, res) => {
  let products = await userHelper.getCartProducts(req.session.user._id);
  let total = await userHelper.getTotalAmount(req.session.user._id);
  let cartCount = await userHelper.getCartCount(req.session.user._id);
  res.render('user/cart', { products, user: req.session.user, total, cartCount, title: 'Your Shopping Cart | Tomato' });
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

router.post('/change-product-quantity', verifyLogin, (req, res) => {
  userHelper.changeProductQuantity(req.body).then(async (response) => {
    response.total = await userHelper.getTotalAmount(req.session.user._id);
    response.cartCount = await userHelper.getCartCount(req.session.user._id);
    res.json(response);
  });
});

router.post('/remove-cart-product', verifyLogin, (req, res) => {
  userHelper.removeCartProduct(req.body).then(async (response) => {
    response.total = await userHelper.getTotalAmount(req.session.user._id);
    response.cartCount = await userHelper.getCartCount(req.session.user._id);
    res.json(response);
  });
});

/* Checkout / Order placement routes */
router.get('/place-order', verifyLogin, async (req, res) => {
  let total = await userHelper.getTotalAmount(req.session.user._id);
  let cartCount = await userHelper.getCartCount(req.session.user._id);
  if (total === 0) {
    return res.redirect('/cart');
  }
  res.render('user/checkout', { total, user: req.session.user, cartCount, title: 'Checkout | Tomato' });
});

router.post('/place-order', verifyLogin, async (req, res) => {
  let products = await userHelper.getCartProducts(req.session.user._id);
  let totalPrice = await userHelper.getTotalAmount(req.session.user._id);

  if (products.length === 0 || totalPrice === 0) {
    return res.redirect('/cart');
  }

  req.body.userId = req.session.user._id;

  userHelper.placeOrder(req.body, products, totalPrice).then((orderId) => {
    res.json({ status: true, orderId: orderId });
  });
});

router.get('/order-success/:id', verifyLogin, async (req, res) => {
  let order = await userHelper.getOrderDetails(req.params.id);
  let cartCount = await userHelper.getCartCount(req.session.user._id);
  res.render('user/order-success', { order, user: req.session.user, cartCount, title: 'Order Confirmed | Tomato' });
});

router.get('/orders', verifyLogin, async (req, res) => {
  let orders = await userHelper.getUserOrders(req.session.user._id);
  let cartCount = await userHelper.getCartCount(req.session.user._id);
  res.render('user/orders', { orders, user: req.session.user, cartCount, title: 'My Orders | Tomato' });
});

module.exports = router;