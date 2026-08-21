import re
import os

filepath = r'C:\Users\Z\Desktop\NEW HR\backend6\backend\routes\employeeDocumentRoutes.js'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace("type !== 'experience' && type !== 'receipt'", "type !== 'receipt'")

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
