var express = require('express');
var router = express.Router();
const userHelper = require('../helpers/user-helpers');
/* GET users listing. */
router.get('/', (req, res) => {
  res.render('index'); // uses main.hbs + index.hbs content
});

router.get('/login', (req, res) => {
  res.render('user/login', { layout: false });
});

router.get('/signup', (req, res) => {
  res.render('user/signup', { layout: false });
});

router.get('/cart', (req, res) => {
  res.render('user/cart', );
});

router.post('/signup',async(req,res)=>{
  
  await userHelper.signup(req.body).then(userid=>{
  
    res.redirect('/')
  })
  

})
router.post('/login', async (req, res) => {
  await userHelper.login(req.body).then(response => {
   

    if (response.status) {
     
      res.redirect('/');
      console.log('login sucessful')
    } else {
      res.redirect('/login');
       console.log('login failed')
    }
  });
});




module.exports = router; 