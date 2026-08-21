import re

with open('src/components/EmployeeDocuments.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace("experience: ['employeeName', 'designation', 'joiningDate', 'lastWorkingDate']", "experience: ['employeeName', 'emailAddress', 'designation', 'joiningDate', 'lastWorkingDate']")
content = content.replace("{ label: 'Email Address (Optional)', key: 'emailAddress', type: 'email' }", "{ label: 'Email Address', key: 'emailAddress', type: 'email' }")
content = content.replace("if (type !== 'experience' && type !== 'receipt' && fields.emailAddress", "if (type !== 'receipt' && fields.emailAddress")

with open('src/components/EmployeeDocuments.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
