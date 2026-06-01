const fs = require('fs');
const readline = require('readline');
const path = require('path');

const logPath = 'C:\\Users\\PC\\.gemini\\antigravity-ide\\brain\\7f44394b-3dcf-46a5-b82a-495d84d21e50\\.system_generated\\logs\\transcript.jsonl';
const outPath = path.join(__dirname, 'extracted_ticket_lookup.csv');

const rl = readline.createInterface({
  input: fs.createReadStream(logPath),
  crlfDelay: Infinity
});

rl.on('line', (line) => {
  try {
    const obj = JSON.parse(line);
    if (obj.step_index === 9020) {
      console.log('Found step 9020!');
      // Extract the content of the VIEW_FILE
      let fileContent = obj.content;
      // The content has a header/prefix from VIEW_FILE tool:
      // "Created At: ... \nCompleted At: ... \nFile Path: ... \nTotal Lines: ... \nTotal Bytes: ... \nShowing lines 1 to 170\nThe following code has been modified to include a line number before every line, in the format: <line_number>: <original_line>. Please note that any changes targeting the original code should remove the line number, colon, and leading space.\n1: ... \n2: ... "
      // We need to parse this prefix out and strip the line numbers "<line_number>: "
      
      const lines = fileContent.split('\n');
      const csvLines = [];
      let inCsvContent = false;
      
      for (let l of lines) {
        if (!inCsvContent) {
          if (l.startsWith('1: ')) {
            inCsvContent = true;
          } else {
            continue;
          }
        }
        
        if (inCsvContent) {
          // Remove the "<number>: " prefix. The line format is "<number>: <original_line>"
          const match = l.match(/^(\d+): (.*)$/);
          if (match) {
            csvLines.push(match[2]);
          } else {
            // Check if it's the last lines or some overflow
            // If it doesn't match, maybe it's a newline within a quoted field that didn't get prefixed?
            // Actually, the VIEW_FILE tool prefixes EVERY line returned with line number.
            // If a line does not have a number, it could be the end of the text.
            if (l.trim() === 'The above content shows the entire, complete file contents of the requested file.') {
              break;
            }
            csvLines.push(l);
          }
        }
      }
      
      fs.writeFileSync(outPath, csvLines.join('\n'), 'utf8');
      console.log('Successfully wrote to extracted_ticket_lookup.csv');
    }
  } catch (err) {
    // ignore parse errors
  }
});
