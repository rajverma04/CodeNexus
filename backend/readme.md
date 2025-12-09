# generate random jwt secret key:
    CMD:  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"  
    run in terminal(website: https://dev.to/tkirwa/generate-a-random-jwt-secret-key-39j4)



# get language id in judge0:
    https://ce.judge0.com/languages/

# judge0 documentation:
    https://ce.judge0.com/

# batch submission
    https://ce.judge0.com/#submissions-submission-post
    const axios = require('axios');

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
    submissions: [
      {
        language_id: 46,
        source_code: 'ZWNobyBoZWxsbyBmcm9tIEJhc2gK'
      },
      {
        language_id: 71,
        source_code: 'cHJpbnQoImhlbGxvIGZyb20gUHl0aG9uIikK'
      },
      {
        language_id: 72,
        source_code: 'cHV0cygiaGVsbG8gZnJvbSBSdWJ5IikK'
      }
    ]
  }
};

async function fetchData() {
	try {
		const response = await axios.request(options);
		console.log(response.data);
	} catch (error) {
		console.error(error);
	}
}

fetchData();

# status id
    [
  {
    "id": 1,
    "description": "In Queue"
  },
  {
    "id": 2,
    "description": "Processing"
  },
  {
    "id": 3,
    "description": "Accepted"
  },
  {
    "id": 4,
    "description": "Wrong Answer"
  },
  {
    "id": 5,
    "description": "Time Limit Exceeded"
  },
  {
    "id": 6,
    "description": "Compilation Error"
  },
  {
    "id": 7,
    "description": "Runtime Error (SIGSEGV)"
  },
  {
    "id": 8,
    "description": "Runtime Error (SIGXFSZ)"
  },
  {
    "id": 9,
    "description": "Runtime Error (SIGFPE)"
  },
  {
    "id": 10,
    "description": "Runtime Error (SIGABRT)"
  },
  {
    "id": 11,
    "description": "Runtime Error (NZEC)"
  },
  {
    "id": 12,
    "description": "Runtime Error (Other)"
  },
  {
    "id": 13,
    "description": "Internal Error"
  },
  {
    "id": 14,
    "description": "Exec Format Error"
  }
]

# axios

# page loading limits
  syntax: await Problem.find().skip().limit()
    const page = 2;
    const limit = 10;
    const skip = (page - 1) * limit;

    filter:
      await Problem.find({difficulty: "easy", tags: "array"})

      await Problem.find({
        votes: {$gte : 100},
        tags: {$in : ["array", "hashmap"]}
      })


    give all operator like: $gte, $in,, etc



    google OAuth key :  941434220306-sdnan53r9l0rjbbe381qnlcl4cvaatk3.apps.googleusercontent.com