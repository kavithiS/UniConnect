const axios = require('axios');
axios.post('http://localhost:5000/api/projects/seed')
  .then(res => console.log('Seed Success:', res.data))
  .catch(err => console.log('Seed Error:', err.response ? err.response.data : err.message));
