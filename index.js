const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

// Connect to MongoDB
// Connect to MongoDB without deprecated options
mongoose.connect("mongodb://localhost:27017/RestData", {
    useNewUrlParser: true, // useNewUrlParser is no longer needed but won't cause issues
    useUnifiedTopology: true // This option is now the default behavior
}).then(() => {
    console.log("Connected With MongoDB")
}).catch((err) => {
    console.log(err)
});

// Middleware to parse incoming request bodies
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json());

// Define Mongoose schema for Product model
const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    }
});

const Product = mongoose.model("Product", productSchema);

// POST route to create a new product
app.post('/api/v1/product/new', async (req, res) => {
    try {
        const { name, description, price } = req.body;
        if (!name || !description || !price) {
            return res.status(400).json({
                success: false,
                message: "Name, description, and price are required"
            });
        }

        const product = await Product.create({ name, description, price });

        res.status(201).json({
            success: true,
            product: {
                _id: product._id,
                name: product.name,
                description: product.description,
                price: product.price
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to create product",
            error: error.message
        });
    }
});

// Read a Product 

app.get('/api/v1/product', async (req,res) => {

    const products = await Product.find();

    res.status(200).json({
        success: true,
        products
    })
});

// Update a Product in Particular Id

app.put('/api/v1/product/:id', async (req, res) => {
    try {
        const productId = req.params.id.trim(); // Trim whitespace characters from ID
        const updatedProduct = req.body; // Assuming req.body contains the updated product data

        // Update the product using findByIdAndUpdate
        const product = await Product.findByIdAndUpdate(productId, updatedProduct, {
            new: true, // Return the updated document
            runValidators: true, // Run Mongoose validators on update
        });

        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }

        res.status(200).json({ success: true, product });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to update product", error: error.message });
    }
});

// Delete a Product in particular Id

app.delete('/api/v1/product/:id', async (req, res) => {
    try {
        const productId = await Product.findById(req.params.id);

        if (!productId) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        await Product.deleteOne({ _id: req.params.id }); // Use deleteOne to delete the product

        res.status(200).json({
            success: true,
            message: "Product is successfully deleted"
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to delete product",
            error: error.message
        });
    }
});


app.listen(port, () => {
    console.log("Server is currently running on Port: " + port);
});
