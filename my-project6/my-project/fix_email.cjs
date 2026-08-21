const fs = require('fs');

let content = fs.readFileSync('src/components/TeamCollaboration.jsx', 'utf-8');

// Change grid columns from 3 to 2
content = content.replace('className="mb-6 grid gap-5 lg:grid-cols-3"', 'className="mb-6 grid gap-5 lg:grid-cols-2"');

// Remove the Email button
const btnStart = content.indexOf('<button\n                    type="button"\n                    onClick={() => navigate(\'/admin/communication-system/email\')}');
if (btnStart !== -1) {
    const btnEndStr = 'Click to open the Email Notifications UI.</p>\n                  </button>';
    const btnEnd = content.indexOf(btnEndStr, btnStart) + btnEndStr.length;
    content = content.slice(0, btnStart) + content.slice(btnEnd);
}

// Remove the Email form block
const emailBlockStartStr = "{(!isAdminCommunication || activeCommunicationPanel === 'email') && (";
const emailBlockStart = content.indexOf(emailBlockStartStr);
if (emailBlockStart !== -1) {
    // The email block is followed by `            </div>\n          )}\n\n          {(showChat) ? (`
    const nextBlockStr = '            </div>\n          )}\n\n          {(showChat) ? (';
    const emailBlockEnd = content.indexOf(nextBlockStr, emailBlockStart);
    if (emailBlockEnd !== -1) {
        content = content.slice(0, emailBlockStart) + content.slice(emailBlockEnd);
    }
}

fs.writeFileSync('src/components/TeamCollaboration.jsx', content);
console.log('Done');
