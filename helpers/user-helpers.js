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
}

}