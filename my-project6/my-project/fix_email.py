import re

with open('src/components/TeamCollaboration.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Change grid columns
content = re.sub(r'className="mb-6 grid gap-5 lg:grid-cols-3"', 'className="mb-6 grid gap-5 lg:grid-cols-2"', content)

# Remove the email button block
content = re.sub(r'<button[^>]*onClick=\{\(\) => navigate\(\'/admin/communication-system/email\'\)\}[^>]*>[\s\S]*?</button>', '', content)

# Find the start of the email block
email_start = "{(!isAdminCommunication || activeCommunicationPanel === 'email') && ("
idx_start = content.find(email_start)

if idx_start != -1:
    next_block = "{(showChat) ? ("
    idx_end = content.find(next_block, idx_start)
    if idx_end != -1:
        # We need to backtrack to remove the closing divs before {(showChat) ? (
        # Let's just find the first `</div>\n          )}\n\n          {(showChat) ? (`
        search_str = "            </div>\n          )}\n\n          {(showChat) ? ("
        idx_end_exact = content.find(search_str, idx_start)
        if idx_end_exact != -1:
            content = content[:idx_start] + content[idx_end_exact:]

with open('src/components/TeamCollaboration.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
