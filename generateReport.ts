export const generateHTML = (scanData: any, aiAnalysis: any,) => {
    const htmlReport = `
<!DOCTYPE html>
<html>
<head>
    <title>Security Scan Analysis Report</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
        }
        h1, h2 {
            color: #2c3e50;
        }
        .summary {
            background-color: #f8f9fa;
            padding: 20px;
            border-radius: 5px;
            margin-bottom: 20px;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
        }
        th, td {
            border: 1px solid #ddd;
            padding: 12px;
            text-align: left;
        }
        th {
            background-color: #f8f9fa;
            color: #2c3e50;
        }
    </style>
</head>
<body>
    <h1>Security Scan Analysis Report</h1>
    
    <div class="summary">
        <h2>Scan Summary</h2>
        <p>Total Requests: ${scanData.totalRequests}</p>
        <p>Status Codes Distribution:</p>
        <ul>
            ${Object.entries(scanData.statusCodes)
            .map(([code, count]) => `<li>Status ${code}: ${count} requests</li>`)
            .join('\n')}
        </ul>
    </div>

    <h2>AI Security Analysis</h2>
    ${aiAnalysis}

    <h2>Detailed Findings</h2>
    <table border="1">
        <tr>
            <th>URL</th>
            <th>Status</th>
            <th>Content Length</th>
            <th>Content Type</th>
        </tr>
        ${scanData.findings
            .map((finding: any) => `
                <tr>
                    <td>${finding.url}</td>
                    <td>${finding.status}</td>
                    <td>${finding.contentLength}</td>
                    <td>${finding.contentType || 'N/A'}</td>
                </tr>
            `)
            .join('\n')}
    </table>
</body>
</html>`;

    return htmlReport;
}   
