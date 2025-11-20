const getLanguageById = require("../utils/problemUtility")

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
            const submissions = visibleTestCases.map((input, output) => ({
                source_code: completeCode,
                language_id: languageId,
                stdin: input,
                expected_output: output,
            }))
            const submitResult = await submitBatch(submissions);
        }
    } catch (err) {

    }
}


