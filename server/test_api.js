const axios = require('axios');

const key = '76117e2a59msh67748b22c613ab9p1c31b1jsn5af37c2b975a';

async function testApi() {
  try {
    const res = await axios.get('https://v3.football.api-sports.io/status', {
      headers: {
        'x-rapidapi-key': key,
        'x-rapidapi-host': 'v3.football.api-sports.io'
      }
    });
    console.log('API-Football Status:', JSON.stringify(res.data, null, 2));
  } catch (e) {
    console.error('API-Football Error:', e.response ? e.response.status : e.message);
  }

  try {
    const res2 = await axios.get('https://free-api-live-football-data.p.rapidapi.com/v1/search/players?search=Kylian', {
      headers: {
        'x-rapidapi-key': key,
        'x-rapidapi-host': 'free-api-live-football-data.p.rapidapi.com'
      }
    });
    console.log('Free API Status:', res2.status);
  } catch (e) {
    console.error('Free API Error:', e.response ? e.response.status : e.message);
  }
}

testApi();
