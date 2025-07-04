// 1. Import Express
import express from 'express';
import swagger from 'swagger-ui-express';
import dotenv from "dotenv";
import { createRequire } from 'module'; // ✅ Added
const require = createRequire(import.meta.url); // ✅ Added
const apiDocs = require('./swagger.json'); // ✅ Replaced assert JSON import

import productRouter from './src/features/product/product.routes.js';
import userRouter from './src/features/user/user.routes.js';
import jwtAuth from './src/middlewares/jwt.middleware.js';
import cartRouter from './src/features/cartItems/cartItems.routes.js';
import loggerMiddleware from './src/middlewares/logger.middleware.js';
import { ApplicationError } from './src/error-handler/applicationError.js';
import { connectToMongoDB } from './src/config/mongodb.js';
import orderRouter from './src/features/order/order.routes.js';
import { connectUsingMongoose } from './src/config/mongooseConfig.js';
import mongoose from 'mongoose';
import likeRouter from './src/features/like/like.routes.js';

// 2. Create Server
const server = express();

// Load environment variables
dotenv.config();

// CORS policy configuration
server.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'http://localhost:5500');
  res.header('Access-Control-Allow-Headers', '*');
  res.header('Access-Control-Allow-Methods', '*');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

server.use(express.json());

// Swagger Docs
server.use('/api-docs', swagger.serve, swagger.setup(apiDocs));

// Logger middleware
server.use(loggerMiddleware);

// API Routes
server.use('/api/orders', jwtAuth, orderRouter);
server.use('/api/products', jwtAuth, productRouter);
server.use('/api/cartItems', loggerMiddleware, jwtAuth, cartRouter);
server.use('/api/users', userRouter);
server.use('/api/likes', jwtAuth, likeRouter);

// Default route
server.get('/', (req, res) => {
  res.send('Welcome to Ecommerce APIs');
});

// Error handling middleware
server.use((err, req, res, next) => {
  console.log(err);
  if (err instanceof mongoose.Error.ValidationError) {
    return res.status(400).send(err.message);
  }
  if (err instanceof ApplicationError) {
    return res.status(err.code).send(err.message);
  }
  res.status(500).send('Something went wrong, please try later');
});

// 404 handler
server.use((req, res) => {
  res
    .status(404)
    .send('API not found. Please check our documentation at localhost:3200/api-docs');
});

// 5. Start Server
server.listen(3200, () => {
  console.log('Server is running at http://localhost:3200');
  connectUsingMongoose();
});
