const express = require('express');
const mongoose = require('mongoose');



const app = express();

const port = 3002;

app.use(express.json());
app.use(express.urlencoded({extended: true}));

// create product schema
const productsSchema =  new mongoose.Schema({
    title: {
        type: String,
        required: [true, "product title is required"],
        minlength: [3, "minimum length of the product title should be 3"],
        maxlength: [20, "minimum length of the product title should be 20"],
        trim: true,
        // enum: "iphone", "samsung"]
        // enum: {
        //     values: ["iphone", "samsung"],
        //     message: `{VALUE} is not supported`
        // }
        // lowercase: true,
        // upplercase: false,
    },
    price: {
        type: Number,
        required: true,
        min: 1,
        max: [50000, "maximum price of the product should be 50000"]
    },

    email: {
        type: String,
        unique: true,
    },

    description: {
        type: String,
        required: true,
    },
    rating: {
        type: Number,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// create product model
const Product = mongoose.model("Products", productsSchema);


  

app.get("/", (req, res)=> {
    res.send("welcome to home page")
});


//Create 
app.post('/product', async (req, res) => {
    try {
        // get data from reqest body
        const { title,price,description,rating } = req.body;
        
        const newProduct = new Product({
            title: title,
            price: price, 
            description: description,
            rating: rating
        })

        const productData = await newProduct.save();

        // const productData = await Product.insertMany([
        //     {
        //         title: "iphone 5",
        //         price: 70,
        //         description: "beautiful phone"
        //     },
        //     {
        //         title: "iphone 4",
        //         price: 20,
        //         description: "so beautiful"
        //     }
        // ]);

        res.status(201).send(productData);

    } catch (error) {
        res.status(500).send({message: error.message});
    }
});


app.put('/product/update/:id', async (req, res) => {
    try {
        const { title, price, rating, description } = req.body;

        const id = req.params.id;

        const product = await Product.findByIdAndUpdate(
            { _id: id }, 
            {
                $set: {
                    title: title,
                    price: price,
                    description: description,
                    rating: rating
                },
            },
            {new: true}
        );

        if(product){
            res.status(200).send({
                success: true,
                message: "Update Successfully",
                data: product
            });
        }else{
            res.status(404).send({
                message: "Product not found!"
            });
        }
    } catch (error) {
        res.status(500).send({message: error.message});
    }
});



// logical operatior
app.get('/get/product', async (req, res) => {
    try {
        const price = req.query.price;
        const rating = req.query.rating;
        let products;

        if(price && rating){
            products = await Product.find({ 
                $or: [
                    { price: { $gt: price } }, 
                    { rating: { $gt: rating } }
                ]
            }).sort({ price: 1 });
        }else{
            products = await Product.find().countDocuments();
        }

        if(products){
            res.status(200).send({
                success: true,
                message: "return all products",
                data: products
            });
        }else{
            res.status(404).send({
                message: "Product not found!"
            });
        }
    } catch (error) {
        res.status(500).send({message: error.message});
    }
});

//Red
app.get('/products', async (req, res) => {
    try {
        const products = await Product.find( {price: {$nin: [300, 750, 100]} });
        if(products){
            res.status(200).send(products);
        }else{
            res.status(404).send({
                message: "Product not found!"
            });
        }
    } catch (error) {
        res.status(500).send({message: error.message});
    }
});


//red by id
app.get('/product/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const product = await Product.findOne({_id: id},{title: 1,price: 1,description: 1});

        if(product){
            res.status(200).send(product);
        }else{
            res.status(404).send({
                message: "Product not found!"
            });
        }
    } catch (error) {
        res.status(500).send({message: error.message});
    }
});

app.delete('/product/:id', async (req, res)=> {
    try {
        const id = req.params.id;

        const product = await Product.findByIdAndDelete({ _id: id });

        if(product){
            res.status(200).send({
                success: true,
                message: "Delete Successfully",
                data: product
            });
        }else{
            res.status(404).send({
                message: "Product not found!"
            });
        }

    } catch (error) {
        res.status(500).send({message: error.message});
    }
});


const connectDB = async ()=> {
    try {
        await mongoose.connect('mongodb://127.0.0.1:27017/testProductDB')
        console.log("DBd is connected");
    } catch (error) {
        console.log("DB is not connected");
        console.log(error.message);
        process.exit(1);
    }
}

app.listen(port, async ()=> {
    console.log(`Server is running at http://localhost:${port}`)
    await connectDB();
});