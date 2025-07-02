const axios = require('axios');

const API_BASE_URL = 'http://localhost:3000/api/v1';

async function testRegistration() {
    try {
        console.log('Testing user registration...');

        // Register a new user
        const registerResponse = await axios.post(`${API_BASE_URL}/auth/register`, {
            name: 'Test Owner',
            email: 'testowner@example.com',
            password: 'password123'
        });

        console.log('Registration successful:', registerResponse.data);

        const token = registerResponse.data.token;
        console.log('Token received:', token ? 'Yes' : 'No');

        // Test property creation with the token
        console.log('\nTesting property creation...');
        const propertyResponse = await axios.post(`${API_BASE_URL}/properties`, {
            property_name: 'Test Property',
            address: '123 Test Street'
        }, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        console.log('Property creation successful:', propertyResponse.data);

    } catch (error) {
        console.error('Error:', error.response ? error.response.data : error.message);
    }
}

testRegistration(); 