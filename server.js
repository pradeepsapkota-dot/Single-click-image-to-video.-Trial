/* require('dotenv').config();
const express = require('express');
const { v2: cloudinary } = require('cloudinary');
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));


const app = express();
const PORT = 3000;


// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});


// Get Minimax config
const MINIMAX_GROUP_ID = process.env.MINIMAX_GROUP_ID;
const MINIMAX_API_KEY = process.env.MINIMAX_API_KEY;


// In-memory store to prevent duplicate processing
const processedTaskIds = new Set();


// Middleware
app.use(express.json());
app.use(express.static('public'));


// Serve main page
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});


// Start generation endpoint
app.post('/start-generation', async (req, res) => {
  console.log('🚀 START-GENERATION CALLED!');
  const { prompt } = req.body;

  try {
    const minimaxResponse = await fetch('https://api.minimax.io/v1/video_generation', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${MINIMAX_API_KEY}`,   // your API key from MiniMax
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'MiniMax-Hailuo-2.3',   // take the exact model name from the docs page
        prompt: prompt,
        duration: 6,                   // or the value you want, within allowed range
        resolution: '768P'             // match a supported resolution from docs
      })
    });

    console.log('Minimax status:', minimaxResponse.status);
    const text = await minimaxResponse.text();
    console.log('Raw response:', text.substring(0, 400));

    let data;
    try {
      data = JSON.parse(text);
    } catch {
      return res.status(400).json({ error: `API error ${minimaxResponse.status}: ${text.substring(0, 200)}` });
    }

    if (data.task_id) {
      res.json({ taskId: data.task_id });
    } else {
      res.status(400).json({
        error: data.base_resp?.status_msg || 'Failed to start Minimax task'
      });
    }
  } catch (error) {
    console.error('Minimax error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});



// Check status endpoint
app.get('/check-status', async (req, res) => {
    const { taskId } = req.query;

    if (!taskId) {
        return res.status(400).json({ error: 'No taskId provided' });
    }

    if (processedTaskIds.has(taskId)) {
        return res.json({ status: 'success' });
    }

    try {
        const statusResponse = await fetch(`https://api.minimax.chat/v1/files/video/task/${taskId}`, {
            headers: {
                'Authorization': `Bearer ${MINIMAX_API_KEY}`,
                'X-Group-ID': MINIMAX_GROUP_ID
            }
        });

        const statusData = await statusResponse.json();
        console.log('Status response:', statusData);

        if (statusData.status === 'success') {
            processedTaskIds.add(taskId);
            console.log(`Task ${taskId} successful, processing video...`);

            res.json({ status: 'success' }); // Simplified for now
        } else {
            res.json({ status: statusData.status || 'processing' });
        }
    } catch (error) {
        console.error('Status check error:', error);
        res.status(500).json({ error: 'Status check failed' });
    }
});


app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${3000}`);
}); */


// Add this to your server.js (Express.js assumed)

// COMPLETE server.js endpoint - ADD THIS TO YOUR EXISTING server.js

app.post('/api/generate-video', async (req, res) => {
    try {
        const { prompt } = req.body;
        
        if (!prompt || typeof prompt !== 'string') {
            return res.status(400).json({ 
                ok: false, 
                error: 'Valid prompt required' 
            });
        }

        // REPLACE THIS URL WITH A REAL WORKING HF SPACE
        // Find one at: https://huggingface.co/spaces?sort=trending&search=text-to-video
        const HF_SPACE_URL = "https://example-text2video.hf.space/run/predict";
        
        statusText.textContent = 'Calling AI service...';
        
        const response = await fetch(HF_SPACE_URL, {
            method: "POST",
            headers: { 
                "Content-Type": "application/json" 
            },
            body: JSON.stringify({
                data: [prompt]  // Standard Gradio/Space format
            })
        });

        if (!response.ok) {
            throw new Error(`AI service failed: ${response.status}`);
        }

        const result = await response.json();
        const videoInfo = result?.data?.[0];
        const videoUrl = videoInfo?.url || videoInfo?.data?.[0]?.url;

        if (!videoUrl) {
            throw new Error("No video generated by AI service");
        }

        res.json({
            ok: true,
            videoUrl: videoUrl
        });

    } catch (error) {
        console.error('Video generation error:', error);
        res.status(500).json({ 
            ok: false, 
            error: error.message 
        });
    }
});

