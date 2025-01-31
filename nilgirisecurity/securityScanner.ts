// import dotenv from 'dotenv';
// import axios from 'axios';
// import * as fs from 'fs';
// import * as path from 'path';
// import { exec, execSync } from 'child_process';
// import unzipper from 'unzipper';
// import * as readline from 'readline';
// import { Groq } from 'groq-sdk';
// import { generateHTML } from './generateHTML';

// dotenv.config();

// const GROQ_API_KEY = process.env.GROQ_API_KEY;
// const client = new Groq({
//     apiKey: GROQ_API_KEY
// });

// // Create readline interface
// const rl = readline.createInterface({
//     input: process.stdin,
//     output: process.stdout
// });

// // Promisify readline question
// const question = (query: string): Promise<string> => {
//     return new Promise((resolve) => {
//         rl.question(query, (answer) => {
//             resolve(answer);
//         });
//     });
// };

// // Function to parse and clean JSON data
// function parseJsonFile(filePath: string) {
//     try {
//         const fileContent = fs.readFileSync(filePath, 'utf8');

//         // Clean the JSON content
//         const cleanedContent = fileContent
//             .split('\n')
//             .filter(line => line.trim().startsWith('{'))
//             .map(line => {
//                 try {
//                     JSON.parse(line);
//                     return line;
//                 } catch {
//                     return null;
//                 }
//             })
//             .filter(line => line !== null)
//             .join('\n');

//         // Parse each line as a separate JSON object
//         const results = cleanedContent
//             .split('\n')
//             .map(line => JSON.parse(line))
//             .filter(item => item !== null);

//         // Create a summary object
//         const summary = {
//             totalRequests: results.length,
//             statusCodes: {} as Record<string, number>,
//             findings: results.map(result => ({
//                 url: result.url || result.target,
//                 status: result.status_code || result.status,
//                 contentLength: result.content_length || result.length,
//                 contentType: result.content_type || result.type
//             }))
//         };

//         // Count status codes
//         results.forEach(result => {
//             const status = result.status_code || result.status;
//             summary.statusCodes[status] = (summary.statusCodes[status] || 0) + 1;
//         });

//         return summary;
//     } catch (error) {
//         console.error('Error parsing JSON file:', error);
//         // Return a basic structure if parsing fails
//         return {
//             totalRequests: 0,
//             statusCodes: {},
//             findings: []
//         };
//     }
// }

// // Function to analyze with Groq
// async function analyzeWithGroq(scanData: any) {
//     try {
//         const prompt = `
// As a security expert, analyze this security scan results and provide a comprehensive security assessment in HTML table format.
// Focus on security implications of discovered endpoints and potential vulnerabilities.

// Scan Summary:
// - Total Requests: ${scanData.totalRequests}
// - Status Code Distribution: ${JSON.stringify(scanData.statusCodes)}
// - Discovered Endpoints: ${scanData.findings.length}

// Please format your analysis in this HTML table structure:
// <table border="1">
//   <tr>
//     <th>Finding Category</th>
//     <th>Risk Level</th>
//     <th>Description</th>
//     <th>Affected Endpoints</th>
//     <th>Recommendation</th>
//   </tr>
// </table>

// Detailed scan data: ${JSON.stringify(scanData.findings)}`;

//         const chatCompletion = await client.chat.completions.create({
//             messages: [
//                 {
//                     role: "system",
//                     content: "You are a senior security expert analyzing web security scan results. Provide detailed, actionable insights focused on security implications and specific remediation steps."
//                 },
//                 {
//                     role: "user",
//                     content: prompt
//                 }
//             ],
//             model: 'mixtral-8x7b-32768',
//             temperature: 0,
//         });

//         return chatCompletion.choices[0].message.content;
//     } catch (error) {
//         console.error('Error analyzing with Groq:', error);
//         return `<table border="1">
//                   <tr>
//                     <th>Error</th>
//                     <td>Failed to generate AI analysis. Please check the logs.</td>
//                   </tr>
//                 </table>`;
//     }
// }

// // Download Feroxbuster
// async function downloadFeroxbuster() {
//     console.log("Downloading Feroxbuster...");
//     const url = "https://github.com/epi052/feroxbuster/releases/latest/download/x86_64-windows-feroxbuster.exe.zip";
//     const response = await axios.get(url, { responseType: 'arraybuffer' });
//     fs.writeFileSync("feroxbuster.zip", response.data);
//     console.log("Download complete!");
// }

// // Unzip Feroxbuster
// async function unzipFeroxbuster() {
//     console.log("Unzipping Feroxbuster...");
//     return new Promise<void>((resolve) => {
//         fs.createReadStream("feroxbuster.zip")
//             .pipe(unzipper.Extract({ path: "feroxbuster" }))
//             .on('close', () => {
//                 console.log("Unzipping complete!");
//                 resolve();
//             });
//     });
// }

// // Run Feroxbuster
// function runFeroxbuster(url: string, wordlistPath: string) {
//     const feroxbusterPath = path.join("feroxbuster", "feroxbuster.exe");
//     const command = `${feroxbusterPath} -u ${url} -w ${wordlistPath} --json -o feroxbuster_report.json`;
//     console.log(`Running Feroxbuster: ${command}`);
//     execSync(command, { stdio: 'inherit' });
// }

// // Generate Reports
// async function generateReports() {
//     const jsonReportPath = "feroxbuster_report.json";
//     const securityReportPath = "security_analysis.html";

//     if (!fs.existsSync(jsonReportPath)) {
//         console.error("Error: JSON report file not found!");
//         return;
//     }

//     // Parse the JSON data
//     console.log("Parsing scan results...");
//     const scanData = parseJsonFile(jsonReportPath);

//     // Get AI analysis
//     console.log("Analyzing results with Groq AI...");
//     const aiAnalysis = await analyzeWithGroq(scanData);

//     // Generate HTML Report

//     const htmlReport = generateHTML(scanData, aiAnalysis);

//     fs.writeFileSync(securityReportPath, htmlReport);
//     console.log(`Security analysis report generated: ${securityReportPath}`);
// }

// // Main execution
// async function main() {
//     try {
//         if (!GROQ_API_KEY) {
//             throw new Error('GROQ_API_KEY environment variable is not set');
//         }

//         // Check if Feroxbuster exists
//         if (!fs.existsSync("feroxbuster")) {
//             await downloadFeroxbuster();
//             await unzipFeroxbuster();
//         }

//         const url = await question("Enter the URL of the website to scan: ");

//         if (!url.startsWith('http://') && !url.startsWith('https://')) {
//             throw new Error('Invalid URL. Please include http:// or https://');
//         }

//         // Download wordlist
//         const wordlistUrl = "https://raw.githubusercontent.com/danielmiessler/SecLists/master/Discovery/Web-Content/common.txt";
//         const wordlistPath = "common.txt";

//         if (!fs.existsSync(wordlistPath)) {
//             console.log("Downloading wordlist...");
//             const response = await axios.get(wordlistUrl);
//             fs.writeFileSync(wordlistPath, response.data);
//             console.log("Wordlist downloaded.");
//         }

//         // Run Feroxbuster
//         runFeroxbuster(url, wordlistPath);

//         // Generate reports
//         await generateReports();

//     } catch (error) {
//         console.error("An error occurred:", error instanceof Error ? error.message : String(error));
//     } finally {
//         rl.close();
//     }
// }

// main();




import dotenv from 'dotenv';
import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';
import unzipper from 'unzipper';
import * as readline from 'readline';
import { OpenAI } from 'openai';
import { platform } from 'os';
import { generateHTML } from './generateReport';

dotenv.config();

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

if (!OPENAI_API_KEY) {
    console.error('Error: OPENAI_API_KEY is not set in the environment variables.');
    process.exit(1);
}

const openai = new OpenAI({
    apiKey: OPENAI_API_KEY,
});

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

const question = (query: string): Promise<string> => {
    return new Promise((resolve) => {
        rl.question(query, (answer) => {
            resolve(answer);
        });
    });
};

function parseJsonFile(filePath: string) {
    try {
        const fileContent = fs.readFileSync(filePath, 'utf8');
        const lines = fileContent.split('\n');
        const results = [];

        for (const line of lines) {
            if (line.trim()) {
                try {
                    const parsed = JSON.parse(line.trim());
                    if (parsed) {
                        results.push(parsed);
                    }
                } catch (parseError) {
                    console.warn(`Warning: Skipping invalid JSON line: ${line.substring(0, 50)}...`);
                }
            }
        }

        const summary = {
            totalRequests: results.length,
            statusCodes: {} as Record<string, number>,
            findings: results.map(result => ({
                url: result.url || result.target || '',
                status: result.status_code || result.status || 0,
                contentLength: result.content_length || result.length || 0,
                contentType: result.content_type || result.type || '',
            })),
        };

        results.forEach(result => {
            const status = result.status_code || result.status || 0;
            summary.statusCodes[status] = (summary.statusCodes[status] || 0) + 1;
        });

        return summary;
    } catch (error) {
        console.error('Error reading or parsing JSON file:', error);
        return {
            totalRequests: 0,
            statusCodes: {},
            findings: [],
        };
    }
}

async function analyzeWithOpenAI(scanData: any, retries = 3): Promise<string> {
    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            const analysis = `Please analyze these security scan results and provide insights:
                Total Requests: ${scanData.totalRequests}
                Status Code Distribution: ${JSON.stringify(scanData.statusCodes)}
                Notable Findings: ${scanData.findings.length > 0 ? JSON.stringify(scanData.findings.slice(0, 5)) : 'None'}`;

            const response = await openai.chat.completions.create({
                model: 'gpt-4',
                messages: [
                    {
                        role: 'system',
                        content: 'You are a security expert analyzing scan results and providing actionable insights.',
                    },
                    {
                        role: 'user',
                        content: analysis,
                    },
                ],
                max_tokens: 1000,
            });

            return response.choices[0]?.message?.content || 'No analysis generated.';
        } catch (error) {
            console.error(`Attempt ${attempt} failed:`, error);
            if (attempt === retries) {
                return 'Error: Unable to generate security analysis after multiple attempts.';
            }
            await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
        }
    }
    return 'Error: Unable to generate security analysis.';
}

async function downloadFeroxbuster(): Promise<string> {
    const os = platform();
    let downloadUrl: string;
    let filename: string;

    switch (os) {
        case 'win32':
            downloadUrl = 'https://github.com/epi052/feroxbuster/releases/latest/download/x86_64-windows-feroxbuster.exe.zip';
            filename = 'feroxbuster.exe';
            break;
        case 'darwin':
            downloadUrl = 'https://github.com/epi052/feroxbuster/releases/latest/download/x86_64-macos-feroxbuster.zip';
            filename = 'feroxbuster';
            break;
        case 'linux':
            downloadUrl = 'https://github.com/epi052/feroxbuster/releases/latest/download/x86_64-linux-feroxbuster.zip';
            filename = 'feroxbuster';
            break;
        default:
            throw new Error(`Unsupported operating system: ${os}`);
    }

    const zipPath = path.join(process.cwd(), 'feroxbuster.zip');

    try {
        console.log('Downloading Feroxbuster...');
        const response = await axios({
            method: 'get',
            url: downloadUrl,
            responseType: 'stream'
        });

        const writer = fs.createWriteStream(zipPath);
        response.data.pipe(writer);

        await new Promise((resolve, reject) => {
            writer.on('finish', resolve);
            writer.on('error', reject);
        });

        return zipPath;
    } catch (error) {
        console.error('Error downloading Feroxbuster:', error);
        throw error;
    }
}

async function unzipFeroxbuster(zipPath: string): Promise<string> {
    const extractPath = process.cwd();
    const executablePath = path.join(extractPath, platform() === 'win32' ? 'feroxbuster.exe' : 'feroxbuster');

    try {
        console.log('Extracting Feroxbuster...');
        await fs.createReadStream(zipPath)
            .pipe(unzipper.Extract({ path: extractPath }))
            .promise();

        if (platform() !== 'win32') {
            execSync(`chmod +x ${executablePath}`);
        }

        fs.unlinkSync(zipPath);
        return executablePath;
    } catch (error) {
        console.error('Error extracting Feroxbuster:', error);
        throw error;
    }
}

function runFeroxbuster(url: string, wordlistPath: string, executablePath: string): void {
    try {
        console.log('Running Feroxbuster scan...');
        const command = `"${executablePath}" -u ${url} -w ${wordlistPath} --json -o feroxbuster_report.json --silent`;

        console.log(`Executing command: ${command}`);
        execSync(command, {
            stdio: 'inherit',
            encoding: 'utf8'
        });
    } catch (error) {
        console.error('Error running Feroxbuster:', error);
        throw error;
    }
}

async function generateReports() {
    const jsonReportPath = 'feroxbuster_report.json';
    const securityReportPath = 'security_analysis.json';

    if (!fs.existsSync(jsonReportPath)) {
        console.error('Error: JSON report file not found!');
        return;
    }

    console.log('Parsing scan results...');
    const scanData = parseJsonFile(jsonReportPath);

    if (scanData.totalRequests === 0) {
        console.error('Error: No valid scan results found in the report file.');
        return;
    }

    console.log('Analyzing results with OpenAI...');
    const aiAnalysis = await analyzeWithOpenAI(scanData);

    const analysisReport = {
        scanSummary: scanData,
        aiAnalysis: aiAnalysis,
        generatedAt: new Date().toISOString(),
    };

    fs.writeFileSync(securityReportPath, JSON.stringify(analysisReport, null, 2));
    console.log(`Security analysis report generated: ${securityReportPath}`);
}

async function main() {
    try {
        const url = await question('Enter the URL of the website to scan: ');
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            throw new Error('Invalid URL. Please include http:// or https://');
        }

        const wordlistUrl = 'https://raw.githubusercontent.com/danielmiessler/SecLists/master/Discovery/Web-Content/common.txt';
        const wordlistPath = 'common.txt';

        if (!fs.existsSync(wordlistPath)) {
            console.log('Downloading wordlist...');
            const response = await axios.get(wordlistUrl, { responseType: 'text' });
            fs.writeFileSync(wordlistPath, response.data);
            console.log('Wordlist downloaded.');
        }

        const zipPath = await downloadFeroxbuster();
        const executablePath = await unzipFeroxbuster(zipPath);

        runFeroxbuster(url, wordlistPath, executablePath);

        await generateReports();
    } catch (error) {
        console.error('An error occurred:', error instanceof Error ? error.message : String(error));
    } finally {
        rl.close();
    }
}

main();
