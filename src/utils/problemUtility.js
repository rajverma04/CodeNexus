const axios = require("axios")

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
        url: 'https://judge0-ce.p.rapidapi.com/submissions/batch',
        params: {
            base64_encoded: 'true'
        },
        headers: {
            'x-rapidapi-key': '63104b9bf3msh8cd90f05a1f9f61p118226jsne962255f49d0',
            'x-rapidapi-host': 'judge0-ce.p.rapidapi.com',
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

module.exports = { getLanguageById, submitBatch };



