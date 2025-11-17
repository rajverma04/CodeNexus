const validator = require("validator");

const validate = (data) => {
    const mandatoryField = ["firstName", "emailId", "password"];

    const isAllowed = mandatoryField.every((k) => Object.keys(data).includes(k));       // Object.keys(): make an array of containing keys only from data
    if(!isAllowed) {
        throw new Error ("Some Field Missing");
    }

    if(!validator.isEmail(data.emailId)) {
        throw new Error ("Invalid Email");
    }

    if(!validator.isStrongPassword(data.password)) {
        throw new Error ("Weak Password");
    }
}

module.exports = validate