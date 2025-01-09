import express from 'express';
import axios from 'axios';
import morgan from "morgan";

const app = express();
app.use(express.json()); // Middleware to parse JSON request bodies

// Logging middleware to log to CLI
app.use(morgan("combined"));

// POST endpoint to forward data or make a GET request
app.post('/forward', async (req, res) => {
  const { url, data, method = 'POST' } = req.body;

  if (!url) {
    return res.status(400).json({ error: '"url" field is required.' });
  }

  try {
    // Extract headers from the incoming request
    const forwardedHeaders = req.headers;

    // Set up Axios request configuration
    const config = {
      url,
      method: method.toUpperCase(),
      headers: forwardedHeaders,
      ...(method.toUpperCase() === 'POST' && { data }), // Include data only for POST
    };

    // Make the HTTP request using Axios
    const response = await axios(config);
    console.log(response)

    // Return the response received from the forwarded request
    res.json({
      status: 'success',
      forwardedResponse: response.data,
    });
  } catch (error) {
    // Handle errors and return a meaningful response
    res.status(500).json({
      status: 'error',
      message: error.message,
      details: error.response?.data || 'No response data available',
    });
  }
});

app.use((req, res) => {
    return res.status(404).json({
      code: 404,
      response_code : "99",
      status: "failed",
      message: 'Endpoint not found',
      error: "An Error Occured!",
    });
  });

// Start the server on port 5001
const PORT = 5001;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`API server is running on port ${PORT}`);
});

