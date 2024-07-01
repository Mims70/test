const express = require('express');
const axios = require('axios');
const dotenv = require('dotenv');
dotenv.config(); // Load environment variables from .env file
const app = express();
const PORT = process.env.PORT || 3000; // Port for Heroku deployment or local development

// Endpoint handling
app.get('/api/hello', async (req, res) => {
  const visitorName = req.query.visitor_name || 'Guest';
  const clientIp = req.ip;

  try {
    // Step 1: Use IP geolocation API to get the location based on client's IP
    const locationResponse = await axios.get(`https://ipapi.co/${clientIp}/json/`);
    console.log('Location Response:', locationResponse.data);
    const { city } = locationResponse.data;

    if (!city) {
      throw new Error('City not found from IP geolocation');
    }

    // Step 2: Use weather API to get real-time weather information
    const weatherResponse = await axios.get(`http://api.weatherapi.com/v1/current.json?key=${process.env.WEATHER_API_KEY}&q=${city}&aqi=no`);
    const { temp_c } = weatherResponse.data.current;

    // Construct the response
    const response = {
      client_ip: clientIp,
      location: city,
      greeting: `Hello, ${visitorName}!, the temperature is ${temp_c} degrees Celsius in ${city}`
    };

    res.json(response);
  } catch (error) {
    console.error('Error fetching data:', error.response ? error.response.data : error.message);
    res.status(500).json({ error: 'Failed to fetch data' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
