import re

with open('src/components/TeamCollaboration.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

idx_start = content.find("{(!isAdminCommunication || activeCommunicationPanel === 'email') && (")
if idx_start != -1:
    idx_end = content.find("{(showChat) ? (", idx_start)
    if idx_end != -1:
        # We need to backtrack to keep the enclosing tags intact. 
        # But wait, looking at the previous grep:
        #                 </div>
        #               )}
        #             </div>
        #           )}
        #
        #           {(showChat) ? (
        
        # Let's just find the last `            </div>\n          )}` before `{(showChat)`
        fragment = content[idx_start:idx_end]
        # We want to keep everything from the last `</div>\n          )}\n`
        # Actually, let's just use regex to remove the block between `activeCommunicationPanel === 'email'` and the end of that conditional.
        # It's better to just find `              )}` that closes the email block.
        pass

# A simpler way: The email block ends where the next outer block closes.
# But it's risky with string manipulation. I will just replace the inner content with an empty string, or `null`.

content = re.sub(
    r"\{\(\!isAdminCommunication \|\| activeCommunicationPanel === 'email'\) && \([\s\S]*?\{emailHistory\.map\([\s\S]*?</div>\s*</div>\s*\)\}\s*</div>\s*\)\}",
    "", 
    content
)

with open('src/components/TeamCollaboration.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
