const fs = require('fs');
const readline = require('readline');

const logPath = 'C:\\Users\\PC\\.gemini\\antigravity-ide\\brain\\7f44394b-3dcf-46a5-b82a-495d84d21e50\\.system_generated\\logs\\transcript.jsonl';

const rl = readline.createInterface({
  input: fs.createReadStream(logPath),
  crlfDelay: Infinity
});

rl.on('line', (line) => {
  try {
    const obj = JSON.parse(line);
    if (obj.step_index === 9207 || obj.step_index === 9209) {
      console.log(`Step Index: ${obj.step_index}, Source: ${obj.source}, Type: ${obj.type}, Length: ${line.length}`);
      console.log(obj.content.substring(0, 1000));
    }
  } catch(e) {}
});
