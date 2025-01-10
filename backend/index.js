import express from 'express';
import cron from 'node-cron';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt'; 
import User from './models/User.js'; 
import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs';
import multer from 'multer';
import path from 'path';
import cors from 'cors';
import Task from './models/Task.js';
import { authMiddleware } from './middleware/authMiddleware.js';
import jwt from "jsonwebtoken";
import RewardTiers from "./models/RewardTiers.js"

dotenv.config(); 
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json()); 
app.use(cors({
    origin: 'http://localhost:3000', // Your frontend's origin
    optionsSuccessStatus: 200, // Some legacy browsers choke on 204
  }));




// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI, {
    ssl: true,
    tls: true, 
  })
  .then(() => console.log('Connected to MongoDB'))
  .catch((error) => console.error('MongoDB connection error:', error));




// Configure Multer storage
const storage = multer.diskStorage({
  destination: './uploads/',
  filename: function (req, file, cb) {
    cb(null, 'IMAGE-' + Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 1000000 }, // Limit file size to 1MB
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  },
}).single('image');
function checkFileType(file, cb) {
  // Allowed extensions
  const filetypes = /jpeg|jpg|png|gif/;
  // Check extension
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  // Check mime
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb('Error: Images Only!');
  }
}


const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
const prompt = `Analyze the attached image and identify all items that are types of trash or contribute to carbon emissions. For each item, provide:

    - The name of the item.
    - A brief description.
    - An estimated quantity (if possible).
    - The typical weight of the item (in kilograms).
    - The estimated carbon emission factor of the material (in kg CO₂e/kg).
    - The total carbon emissions for the item, calculated as:
      Total Carbon Emissions = Quantity × Weight × Carbon Emission Factor.

    Return the response strictly in JSON format without any additional characters, titles, or formatting:

    [
        {
            "item": "Plastic Bottle",
            "description": "A clear plastic bottle, likely used for water or soda.",
            "quantity": 2,
            "weight": 0.025,
            "carbonEmissionFactor": 2.5,
            "totalCarbonEmissions": 0.125
        },
        {
            "item": "Small Aluminum Foil Plate",
            "description": "A small disposable aluminum foil plate.",
            "quantity": 1,
            "weight": 0.01,
            "carbonEmissionFactor": 8.24,
            "totalCarbonEmissions": 0.0824
        }
    ]
`;


// Image upload route
// app.post('/upload', (req, res) => {
//     upload(req, res, async (err) => {
//       if (err) {
//         res.status(400).json({ msg: err });
//       } else {
//         if (req.file == undefined) {
//           res.status(400).json({ msg: 'No File Selected!' });
//         } else {
//           try {
//             // **Step 1: Read and encode the image**
//             const imagePath = req.file.path;
//             const imageBuffer = fs.readFileSync(imagePath);
//             const imageBase64 = imageBuffer.toString('base64');
  
//             const image = {
//               inlineData: {
//                 data: imageBase64,
//                 mimeType: req.file.mimetype,
//               },
//             };
  
//             // **Step 2: Generate content using Gemini API**
//             const result = await model.generateContent([prompt, image]);
  
//             // **Step 3: Handle the response**
//             const responseText = result.response.text();
//             let jsonString = responseText.trim();
  
//             // Clean up JSON string if needed
//             if (jsonString.startsWith('```') && jsonString.endsWith('```')) {
//               jsonString = jsonString.substring(7, jsonString.length - 3).trim();
//             }
  
//             let items;
//             try {
//               items = JSON.parse(jsonString);
//               console.log('Parsed items:', items);
  
//               // **Filter the items to include only 'item' and 'totalCarbonEmissions'**
//               const filteredItems = items.map((item) => ({
//                 item: item.item,
//                 totalCarbonEmissions: item.totalCarbonEmissions,
//               }));
  
//               // Return the filtered items to the frontend
//               res.json({ items: filteredItems });
  
//             } catch (error) {
//               console.error('Error parsing JSON:', error);
//               res.status(500).json({ msg: 'Error parsing JSON from Gemini API.' });
//             }
  
//             // **Step 4: Delete the image after processing**
//             fs.unlinkSync(imagePath);
//           } catch (error) {
//             console.error('Error processing image:', error);
//             res.status(500).json({ msg: 'Server Error' });
//           }
//         }
//       }
//     });
//   });




// Set up Multer storage for initial trash images
const uploadTrash = multer({
    storage: multer.diskStorage({
      destination: './uploads/trash/',
      filename: (req, file, cb) => {
        cb(null, 'TRASH-' + Date.now() + path.extname(file.originalname));
      },
    }),
  }).single('image');
  
  // User uploads initial trash image
  app.post('/upload-trash', authMiddleware, uploadTrash, async (req, res) => {
    try {
      const userId = req.user.id;
      const { latitude, longitude } = req.body;
      const imagePath = req.file.path;
  
      // Read and encode the image
      const imageBuffer = fs.readFileSync(imagePath);
      const imageBase64 = imageBuffer.toString('base64');
      const image = {
        inlineData: {
          data: imageBase64,
          mimeType: req.file.mimetype,
        },
      };
  
      // Prompt to confirm if the image contains trash
      const prompt = `Analyze the attached image and identify all items that are types of trash or contribute to carbon emissions. For each item, provide:
  
      - The name of the item.
      - A brief description.
      - An estimated quantity (if possible).
      - The typical weight of the item (in kilograms).
      - The estimated carbon emission factor of the material (in kg CO₂e/kg).
      - The total carbon emissions for the item, calculated as:
        Total Carbon Emissions = Quantity × Weight × Carbon Emission Factor.
  
      Return the response strictly in JSON format without any additional characters, titles, or formatting:
  
      [
          {
              "item": "Plastic Bottle",
              "description": "A clear plastic bottle, likely used for water or soda.",
              "quantity": 2,
              "weight": 0.025,
              "carbonEmissionFactor": 2.5,
              "totalCarbonEmissions": 0.125
          },
          {
              "item": "Small Aluminum Foil Plate",
              "description": "A small disposable aluminum foil plate.",
              "quantity": 1,
              "weight": 0.01,
              "carbonEmissionFactor": 8.24,
              "totalCarbonEmissions": 0.0824
          }
      ]
  `;
  
      // Use generateContent method from the Google Generative AI client
      const result = await model.generateContent([prompt, image]);
  
      // Handle the response
      let responseText = result.response.text().trim();
  
      // Clean up JSON string if needed
      if (responseText.startsWith('```') && responseText.endsWith('```')) {
        responseText = responseText.substring(7, responseText.length - 3).trim();
      }
  
      let items;
      try {
        items = JSON.parse(responseText);
        console.log('Parsed items:', items);
  
        // Filter the items to include only 'item' and 'totalCarbonEmissions'
        const filteredItems = items.map((item) => ({
          item: item.item,
          totalCarbonEmissions: item.totalCarbonEmissions,
        }));
  
        // Create task
        const task = new Task({
          userId,
          initialImage: req.file.filename,
          initialImageAnalysisData: items, // Store the full analysis data
          location: {
            type: 'Point',
            coordinates: [parseFloat(longitude), parseFloat(latitude)],
          },
          status: 'pending',
        });
        await task.save();
  
        // Return the filtered items and task ID to the frontend
        res.json({
          msg: 'Trash confirmed. Would you like to dispose of it?',
          taskId: task._id,
          items: filteredItems,
        });
  
      } catch (error) {
        console.error('Error parsing JSON:', error);
        res.status(500).json({ msg: 'Error parsing JSON from Gemini API.' });
      }
    } catch (error) {
      console.error('Error processing image:', error);
      res.status(500).json({ msg: 'Server Error' });
    }
  });





  app.post('/accept-task/:taskId', authMiddleware, async (req, res) => {
    try {
      const userId = req.user.id;
      const { taskId } = req.params;
  
      const task = await Task.findById(taskId);
  
      if (!task || task.status !== 'pending' || !task.userId.equals(userId)) {
        return res.status(400).json({ msg: 'Task not available or unauthorized.' });
      }
  
      task.status = 'accepted';
      task.acceptedAt = new Date();
      await task.save();
  
      res.json({ msg: 'Task accepted. Please dispose of the trash within 20 minutes.' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ msg: 'Server Error' });
    }
  });

  // Set up Multer storage for disposal images
const uploadDisposal = multer({
    storage: multer.diskStorage({
      destination: './uploads/dispose/',
      filename: (req, file, cb) => {
        cb(null, 'DISPOSE-' + Date.now() + path.extname(file.originalname));
      },
    }),
  }).single('image');
  



  app.post('/dispose/:taskId', authMiddleware, uploadDisposal, async (req, res) => {
    try {
      const userId = req.user.id;
      const { taskId } = req.params;
      const imagePath = req.file.path;
  
      const task = await Task.findById(taskId);
      console.log("userId: ", userId, "\ntaskId: ", taskId, "\nimagePath: ", imagePath, "\ntask: ", task )
      if (!task || task.status !== 'pending') {
        return res.status(400).json({ msg: 'Task not available or unauthorized.' });
      }
  
      // const timeElapsed = Date.now() - new Date(task.acceptedAt).getTime();
      // if (timeElapsed > 20 * 60 * 1000) {
      //   task.status = 'expired';
      //   await task.save();
      //   return res.status(400).json({ msg: 'Task has expired.' });
      // }
  
      // Read and encode the initial and disposal images
      const initialImagePath = `./uploads/trash/${task.initialImage}`;
      const initialImageBuffer = fs.readFileSync(initialImagePath);
      const initialImageBase64 = initialImageBuffer.toString('base64');
      const initialImage = {
        inlineData: {
          data: initialImageBase64,
          mimeType: req.file.mimetype,
        },
      };
  
      const disposalImageBuffer = fs.readFileSync(imagePath);
      const disposalImageBase64 = disposalImageBuffer.toString('base64');
      const disposalImage = {
        inlineData: {
          data: disposalImageBase64,
          mimeType: req.file.mimetype,
        },
      };
  
      // Prompt to confirm if the trash has been disposed
      const prompt = `Compare the two attached images. 
      The first image shows trash in an open space or location. 
      The second image shows the same location after the trash is disposed of. 
      The disposal should show the trash placed in a proper waste bin, recycling bin, or other appropriate disposal method. 
      Please determine whether the trash has been correctly disposed of in the second image. 
      Respond with "YES" if the trash is properly disposed of, or "NO" if the trash is still visible or improperly disposed of. `;
  
      const result = await model.generateContent([prompt, initialImage, disposalImage]);
  
      const responseText = result.response.text().trim().toUpperCase();
  
      if (responseText.includes('YES')) {
        // Update the task as completed
        task.disposedImage = req.file.filename;
        task.disposedUserId = userId;
        task.status = 'completed';
        await task.save();
  
        // Award points
        let pointsAwarded = 100; // Example points
        if (userId === task.userId.toString()) {
          // User A completed the task
          await User.findByIdAndUpdate(userId, { $inc: { points: pointsAwarded } });
        } else {
          // Another user completed the task
          const userAPoints = Math.floor(pointsAwarded * 0.2);
          const userBPoints = pointsAwarded - userAPoints;
  
          await User.findByIdAndUpdate(task.userId, { $inc: { points: userAPoints } });
          await User.findByIdAndUpdate(userId, { $inc: { points: userBPoints } });
        }
  
        res.json({ msg: 'Trash disposed of successfully. Points awarded.' });
  
        
        // fs.unlinkSync(initialImagePath);
        // fs.unlinkSync(imagePath);
      } else {
        // Disposal not confirmed
        fs.unlinkSync(imagePath);
        res.status(400).json({ msg: 'Disposal not confirmed by AI.' });
      }
    } catch (error) {
      console.error('Error processing disposal:', error);
      res.status(500).json({ msg: 'Server Error' });
    }
  });
  


  app.get('/available-tasks', authMiddleware, async (req, res) => {
    try {
      const tasks = await Task.find({ status: 'expired' }).select('-__v');
  
      res.json({ tasks });
    } catch (error) {
      console.error(error);
      res.status(500).json({ msg: 'Server Error' });
    }
  });



  app.post('/accept-community-task/:taskId', authMiddleware, async (req, res) => {
    try {
      const userId = req.user.id;
      const { taskId } = req.params;
  
      const task = await Task.findById(taskId);
  
      if (!task || task.status !== 'expired') {
        return res.status(400).json({ msg: 'Task not available.' });
      }
  
      task.status = 'accepted';
      task.acceptedAt = new Date();
      await task.save();
  
      res.json({ msg: 'Task accepted. Please dispose of the trash.' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ msg: 'Server Error' });
    }
  });

  app.get('/tasks/:taskId', authMiddleware, async (req, res) => {
    try {
      const { taskId } = req.params;
  
      // Query the MongoDB database for the task by its ID
      const task = await Task.findById(taskId).populate('userId', 'username email');
  
      if (!task || !task.initialImageAnalysisData) {
        return res.status(404).json({ msg: 'Task or analysis data not found' });
      }
  
      // Extract and map the relevant data
      const analysisData = task.initialImageAnalysisData.map(item => ({
        description: item.description,
        totalCarbonEmissions: item.totalCarbonEmissions,
      }));
  
      // Send the mapped data
      res.json({ analysisData });
    } catch (error) {
      console.error('Error retrieving task:', error);
      res.status(500).json({ msg: 'Server Error' });
    }
  });
  
  
  app.post('/redeem-reward/:rewardName', authMiddleware, async (req, res) => {
    try {
      const userId = req.user.id;
      const { rewardName } = req.params;
      
      const reward = RewardTiers.find(tier => tier.name === rewardName);
      if (!reward) {
        return res.status(400).json({ msg: 'Reward not found.' });
      }
  
      const user = await User.findById(userId);
      if (user.points < reward.points) {
        return res.status(400).json({ msg: 'Not enough points for this reward.' });
      }
  
      user.points -= reward.points;
      await user.save();
  
      const rewardCode = generateRewardCode();
  
      res.json({ rewardCode });
    } catch (error) {
      console.error(error);
      res.status(500).json({ msg: 'Server error' });
    }
  });
  
  function generateRewardCode() {
    return `REWARD-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
  }
  


// Register Route
app.post('/register', async (req, res) => {
    const { username, email, password } = req.body;
  
    try {
      // Check if user already exists
      let user = await User.findOne({ email });
      if (user) {
        return res.status(400).json({ msg: 'User already exists' });
      }
  
      // Hash the password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
  
      // Create a new user
      user = new User({
        username,
        email,
        password: hashedPassword,
      });
  
      // Save user to database
      await user.save();
  
      // Create JWT payload
      const payload = {
        user: {
          id: user.id,
        },
      };
  
      // Sign the token
      jwt.sign(
        payload,
        process.env.JWT_SECRET,
        { expiresIn: '1h' }, // Token expires in 1 hour
        (err, token) => {
          if (err) throw err;
          res.json({ token });
        }
      );
    } catch (error) {
      console.error(error);
      res.status(500).send('Server error');
    }
  });



// Login Route
app.post('/login', async (req, res) => {
    const { email, password } = req.body;
  
    try {
      // Check if user exists
      let user = await User.findOne({ email });
      if (!user) {
        return res.status(400).json({ msg: 'Invalid credentials' });
      }
  
      // Compare password
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ msg: 'Invalid credentials' });
      }
  
      // Create JWT payload
      const payload = {
        user: {
          id: user.id,
        },
      };
  
      // Sign the token
      jwt.sign(
        payload,
        process.env.JWT_SECRET,
        { expiresIn: '1d' }, // Token expires in 1 hour
        (err, token) => {
          if (err) throw err;
          res.json({ token });
        }
      );
    } catch (error) {
      console.error(error);
      res.status(500).send('Server error');
    }
  });


  app.get("/user", authMiddleware, async (req, res) => {
    try {
      const user = await User.findOne({ email: req.user.email });
  
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
  
      res.json({ points: user.points, email: user.email });
    } catch (error) {
      console.error("Error fetching user data:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  


app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});