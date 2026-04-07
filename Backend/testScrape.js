const axios = require('axios');
const cheerio = require('cheerio');

async function testGFG(username) {
    try {
        const { data } = await axios.get(`https://geeks-for-geeks-api.vercel.app/${username}`);
        console.log("GFG API Solved:", data.totalProblemsSolved);
        console.log("GFG Data:", data);
    } catch (e) {
        console.log("GFG Error:", e.message);
    }
}

async function testHR(username) {
    try {
        const { data } = await axios.get(`https://www.hackerrank.com/rest/hackers/${username}/scores_metric`);
        console.log("HR API Data:", data);
    } catch (e) {
        console.log("HR Error:", e.message);
    }
}

testGFG("manas");
testHR("abhay"); // using common usernames just to verify API shape
