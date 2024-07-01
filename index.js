const express = require('express');
const axios = require('axios');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Trust proxies to correctly get client IP
app.set('trust proxy', true);

// Helper function to check if an IP address is private
const isPrivateIp = (ip) => {
    // IPv4 regex patterns for private addresses
    const privateIPv4Ranges = [
        /^127\./, // Loopback
        /^10\./, // Class A private
        /^172\.(1[6-9]|2[0-9]|3[0-1])\./, // Class B private
        /^192\.168\./, // Class C private
    ];

    // IPv6 loopback address
    if (ip === '::1' || ip === '::ffff:127.0.0.1') {
        return true;
    }

    // Check if the IPv4 address matches any private range
    return privateIPv4Ranges.some((pattern) => pattern.test(ip));
};

app.get('/api/hello', async (req, res) => {
    const visitor_name = req.query.visitor_name;
    let client_ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.ip;

    // Log the detected client IP address
    console.log(`Detected client IP: ${client_ip}`);

    // Use a public IP address for testing if the IP is private
    if (isPrivateIp(client_ip)) {
        client_ip = '8.8.8.8'; // Example public IP address (Google DNS)
    }

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
