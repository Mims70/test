const express = require('express');
const axios = require('axios');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/api/hello', async (req, res) => {
    const visitor_name = req.query.visitor_name;
    const client_ip = req.ip;

    try {
        const locationResponse = await axios.get(`http://ip-api.com/json/${client_ip}`);
        const locationData = locationResponse.data;
        console.log(locationData); // Log the response

        const city = locationData.city;

        if (!city) {
            return res.status(400).json({ error: 'Could not determine city from IP' });
        }

        const weatherResponse = await axios.get(`http://api.weatherapi.com/v1/current.json?key=${process.env.WEATHER_API_KEY}&q=${city}`);
        const weatherData = weatherResponse.data;
        const temperature = weatherData.current.temp_c;

        res.json({
            client_ip: client_ip,
            location: city,
            greeting: `Hello, ${visitor_name}!, the temperature is ${temperature} degrees Celsius in ${city}`
        });
    } catch (error) {
        console.error(error.message || error); // Log the error message
        res.status(500).json({ error: 'Something went wrong' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
