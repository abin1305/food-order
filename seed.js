const db = require('./config/connection');
const collection = require('./config/collection');

const products = [
    {
        name: "Greek Salad",
        category: "Salad",
        price: 120,
        image: "pexels-ella-olsson-572949-1640777.jpg",
        description: "Fresh Greek salad with olives, feta cheese, tomatoes, and cucumber"
    },
    {
        name: "Chicken Caesar Salad",
        category: "Salad",
        price: 150,
        image: "pexels-iina-luoto-460132-1211887.jpg",
        description: "Crisp romaine lettuce with grilled chicken, parmesan cheese, and Caesar dressing"
    },
    {
        name: "Spring Rolls",
        category: "Rolls",
        price: 80,
        image: "pexels-any-lane-5945771.jpg",
        description: "Crispy vegetable spring rolls served with sweet chili sauce"
    },
    {
        name: "Chicken Shawarma Wrap",
        category: "Rolls",
        price: 130,
        image: "pexels-ash-craig-122861-376464.jpg",
        description: "Marinated chicken shawarma wrapped in pita bread with garlic sauce"
    },
    {
        name: "Chocolate Brownie",
        category: "Desserts",
        price: 90,
        image: "istockphoto-1024561260-1024x1024.jpg",
        description: "Rich chocolate brownie topped with vanilla ice cream"
    },
    {
        name: "Fruit Tart",
        category: "Desserts",
        price: 110,
        image: "pexels-valeriya-1199957.jpg",
        description: "Fresh fruit tart with custard filling and almond crust"
    },
    {
        name: "Club Sandwich",
        category: "Sandwich",
        price: 140,
        image: "pexels-vanmalidate-769289.jpg",
        description: "Triple decker sandwich with chicken, bacon, lettuce, and tomato"
    },
    {
        name: "Grilled Cheese Sandwich",
        category: "Sandwich",
        price: 100,
        image: "pexels-xmtnguyen-699953.jpg",
        description: "Melted cheese between toasted bread with tomato soup"
    }
];

async function seedDatabase() {
    try {
        await db.connect((err) => {
            if (err) {
                console.log('❌ DB connection error:', err);
            } else {
                console.log('✅ Database connected');
            }
        });

        // Wait for connection
        setTimeout(async () => {
            const result = await db.get().collection(collection.PRODUCT_COLLECTION).insertMany(products);
            console.log('✅ Products inserted:', result.insertedCount);
            process.exit(0);
        }, 2000);

    } catch (error) {
        console.error('❌ Error seeding database:', error);
        process.exit(1);
    }
}

seedDatabase();