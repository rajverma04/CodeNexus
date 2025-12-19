require("dotenv").config();
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.CLIENT_ID);



async function verifyToken(token) {
    try {
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.CLIENT_ID,
        });
        const payload = ticket.getPayload();
        // console.log(payload)
        return payload;
    } catch (error) {
        throw new Error('Token verification failed');
    }
}


module.exports = verifyToken;