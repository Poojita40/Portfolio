const fs = require('fs');
const pdf = require('pdf-parse');

const dataBuffer = fs.readFileSync('JV_s_Resume_Template__2_.pdf');

pdf(dataBuffer).then(function(data) {
    fs.writeFileSync('resume_text.txt', data.text);
    console.log("Pages:", data.numpages);
    console.log("Resume text successfully written to resume_text.txt!");
    console.log("\n--- PREVIEW ---");
    console.log(data.text.substring(0, 1500));
}).catch(error => {
    console.error("Error parsing PDF:", error);
});
