const Problem = require("../models/problems");
const { getLanguageById, submitBatch, submitToken } = require("../utils/problemUtility")

const createProblem = async (req, res) => {
    const { title, description, difficulty,
        tags, visibleTestCases, hiddenTestCases,
        startCode, problemCreator, referenceSolution } = req.body;

    try {
        // source_code
        // language_id
        // stdin from visibleTestCases
        // expected_output
        for (const { language, completeCode } of referenceSolution) {
            const languageId = getLanguageById(language);

            // create batch for code submission in array
            const submissions = visibleTestCases.map((testcase) => ({
                source_code: completeCode,
                language_id: languageId,
                stdin: testcase.input,
                expected_output: testcase.output,
            }))
            const submitResult = await submitBatch(submissions);
            console.log(submitResult)
            const resultToken = submitResult.map((value) => value.token);       // return token for batch submission

            const testResult = await submitToken(resultToken);
            console.log(testResult);

            for (const test of testResult) {
                if (test.status_id != 3) {       // if error is present
                    return res.status(400).send("Error Occured")
                }
            }
        }

        // now we can store in database as there is no error now
        await Problem.create({
            ...req.body,
            problemCreator: req.result._id      // problem creater userId
        })

        res.status(201).send("Problem Saved Successfully");
    } catch (err) {
        res.status(400).send("Error: " + err);
    }
}

module.exports = createProblem;
