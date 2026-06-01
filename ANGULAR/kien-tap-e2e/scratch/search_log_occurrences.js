const fs = require('fs');
const readline = require('readline');

const logPath = 'C:\\Users\\PC\\.gemini\\antigravity-ide\\brain\\7f44394b-3dcf-46a5-b82a-495d84d21e50\\.system_generated\\logs\\transcript.jsonl';

const rl = readline.createInterface({
  input: fs.createReadStream(logPath),
  crlfDelay: Infinity
});

let lineNum = 0;
rl.on('line', (line) => {
  lineNum++;
  if (line.includes('testcases_customer_ticket_lookup')) {
    const isTruncated = line.includes('truncated');
    console.log(`Line ${lineNum}: contains ticket lookup, is truncated: ${isTruncated}, length: ${line.length}`);
    try {
      const obj = JSON.parse(line);
      console.log(`  Step Index: ${obj.step_index}, Source: ${obj.source}, Type: ${obj.type}`);
    } catch(e) {}
  }
});
