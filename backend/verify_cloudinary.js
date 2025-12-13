require('dotenv').config();
const cloudinary = require('cloudinary').v2;

const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

console.log("\n--- CLOUDINARY CREDENTIAL CHECK ---");
console.log(`Cloud Name: '${cloudName}'`);
console.log(`API Key:    '${apiKey}'`);

if (!apiSecret) {
    console.error("ERROR: CLOUDINARY_API_SECRET is missing or empty!");
} else {
    const len = apiSecret.length;
    const start = apiSecret.substring(0, 4);
    const end = apiSecret.substring(len - 4);
    console.log(`API Secret: '${start} ... ${end}' (Length: ${len})`);

    // Test Signature Generation
    const timestamp = Math.round(new Date().getTime() / 1000);
    const params = { timestamp: timestamp, public_id: 'test_id' };
    const signature = cloudinary.utils.api_sign_request(params, apiSecret.trim());
    console.log("Test Signature generated locally:", signature);
}
console.log("-----------------------------------\n");

console.log("INSTRUCTIONS:");
console.log("1. Go to your Cloudinary Dashboard (https://console.cloudinary.com/console/dashboard)");
console.log("2. Check if the Cloud Name and API Key match EXACTLY.");
console.log("3. Check if your API Secret starts with '" + (apiSecret ? apiSecret.substring(0, 4) : "???") + "' and ends with '" + (apiSecret ? apiSecret.substring(apiSecret.length - 4) : "???") + "'.");
console.log("4. Ensure there are no spaces inside the quotes in your .env file.");
