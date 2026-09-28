# 🍔 Food Ordering & Delivery Web Application

A full-stack, responsive web application for online food ordering built with **Node.js**, **Express.js**, **Handlebars (HBS)**, and **MongoDB**. 

This application provides a user-friendly platform for customers to browse food items, manage their cart, search for dishes, place orders, and track order history. It also features a comprehensive **Admin Portal** for managing menu items, inventory, and customer orders.

---

## 🚀 Features

### 👤 **User Portal**
- **User Authentication**: Secure Signup & Login with hashed passwords using `bcrypt`.
- **Food Catalog & Search**: Browse food items by categories or search for specific dishes.
- **Cart Management**: Add, update quantity, and remove items dynamically from the shopping cart.
- **Checkout & Order Placement**: Streamlined checkout process with order confirmation.
- **Order Tracking**: View past orders and track current order status.

### 🛠️ **Admin Portal**
- **Admin Dashboard**: Overview of food items, orders, and system metrics.
- **Product Management**: Add new dishes (with image uploads), update details, or delete items.
- **Order Management**: View customer orders and update fulfillment statuses.

---

## 🛠️ Tech Stack

| Domain | Technology |
| :--- | :--- |
| **Backend Framework** | Node.js, Express.js |
| **Database** | MongoDB |
| **View Engine** | Handlebars (`express-handlebars`, `hbs`) |
| **Session & Auth** | `express-session`, `bcrypt` |
| **File Uploads** | `express-fileupload` / `multer` |
| **Process Manager** | `nodemon` |

---

## 📂 Project Structure

```text
foodorder-website/
├── bin/                # Server startup scripts (www)
├── config/             # Database connection & configurations
│   ├── connection.js
│   └── collections.js
├── helpers/            # Business logic & DB helper functions
│   ├── product-helpers.js
│   └── user-helpers.js
├── public/             # Static assets (CSS, JS, images, uploads)
├── routes/             # Express routes
│   ├── admin.js        # Admin routes & handlers
│   └── users.js        # User routes & handlers
├── views/              # Handlebars view templates
│   ├── admin/          # Admin pages (dashboard, add/edit products, orders)
│   ├── user/           # User pages (cart, checkout, search, orders)
│   ├── layout/         # Base layout templates
│   └── partials/       # Header & footer components
├── app.js              # Express application setup
├── package.json        # Dependencies and scripts
└── seed.js             # Initial database seeding script
```

---

## ⚡ Prerequisites

Make sure you have the following installed on your machine:
- [Node.js](https://nodejs.org/) (v14 or higher)
- [MongoDB Community Server](https://www.mongodb.com/try/download/community) running locally on port `27017`

---

## ⚙️ Installation & Setup

1. **Clone the repository** (or download the source code):
   ```bash
   git clone https://github.com/your-username/foodorder-website.git
   cd foodorder-website
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Database**:
   Ensure MongoDB service is running locally at `mongodb://localhost:27017`.
   *(Optional)* Run the database seed script to populate sample data:
   ```bash
   node seed.js
   ```

4. **Start the Development Server**:
   ```bash
   npm start
   ```

5. **Open in Browser**:
   Navigate to [http://localhost:3000](http://localhost:3000) to access the application.
   - User Interface: `http://localhost:3000/`
   - Admin Portal: `http://localhost:3000/admin`

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
