const axios = require("axios");
require("dotenv").config();

const getLanguageById = (lang) => {
    const language = {
        "c++": 105,
        "java": 91,
        "javascript": 102
    }

    return language[lang.toLowerCase()];
}

const submitBatch = async (submissions) => {

    const options = {
        method: 'POST',
        url: process.env.JUDGE0_URL,
        params: {
            base64_encoded: 'false'         // judge0 expect data in encoded if base64 is set to true
        },
        headers: {
            'x-rapidapi-key': process.env.JUDGE0_KEY,
            'x-rapidapi-host': process.env.JUDGE0_HOST,
            'Content-Type': 'application/json'
        },
        data: {
            submissions
        }
    };

    async function fetchData() {
        try {
            const response = await axios.request(options);
            // console.log(response.data);
            return response.data;
        } catch (error) {
            console.error(error);
        }
    }

    return await fetchData();
}

const waiting = async (timer) => {
    setTimeout(() => {
        return 1;
    }, timer)
}

const submitToken = async (resultToken) => {

    const options = {
        method: 'GET',
        url: process.env.JUDGE0_URL,
        params: {
            tokens: resultToken.join(","),  // convert to string as judge0 required in string with comma separated
            base64_encoded: 'false',
            fields: '*'
        },
        headers: {
            'x-rapidapi-key': process.env.JUDGE0_KEY,
            'x-rapidapi-host': process.env.JUDGE0_HOST
        }
    };

    async function fetchData() {
        try {
            const response = await axios.request(options);
            // console.log(response.data);
            return response.data;
        } catch (error) {
            console.error(error);
        }
    }

    while (true) {  // if submission status_id < 2: data not received from judge0 again submit it
        const result = await fetchData();

        // checking status of batch submissions
        const isResultObtained = result.submissions.every((r) => r.status_id > 2);      // here submissions is from


        if (isResultObtained) {     // if greater then 2
            return result.submissions;
        }
        await waiting(1000);    // wait for 1 sec for another request 
    }
}


module.exports = { getLanguageById, submitBatch, submitToken };



// ! example of judge0 submission
// {        
//     "submissions": [
//         {
//             "language_id": 46,
//             "stdout": "hello from Bash\n",
//             "status_id": 3,
//             "stderr": null,
//             "token": "db54881d-bcf5-4c7b-a2e3-d33fe7e25de7"
//         }]
// }