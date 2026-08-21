import fs from 'fs';

function processFile(filename, replaceRegexes) {
    let content = fs.readFileSync(filename, 'utf-8');
    for (const [regex, replacement] of replaceRegexes) {
        content = content.replace(regex, replacement);
    }
    fs.writeFileSync(filename, content);
}

// GoalSetting
processFile('src/components/GoalSetting.jsx', [
    [/const goals = \[[^]*?\];\s*export default function/m, 'export default function'],
    [/useState\(goals\)/, 'useState([])'],
    [/<p className="text-gray-500">Total Goals<\/p>\s*<h2 className="text-4xl font-bold mt-2">\d+<\/h2>/, '{/* Total Goals Card */}\n          <p className="text-gray-500">Total Goals</p>\n          <h2 className="text-4xl font-bold mt-2">{goalsState.length}</h2>'],
    [/<p className="text-gray-500">Completed<\/p>\s*<h2 className="text-4xl font-bold mt-2">\d+<\/h2>/, '<p className="text-gray-500">Completed</p>\n          <h2 className="text-4xl font-bold mt-2">{goalsState.filter(g => g.status === "Completed").length}</h2>'],
    [/<p className="text-gray-500">Pending<\/p>\s*<h2 className="text-4xl font-bold mt-2">\d+<\/h2>/, '<p className="text-gray-500">Pending</p>\n          <h2 className="text-4xl font-bold mt-2">{goalsState.filter(g => g.status === "Pending").length}</h2>'],
    [/<p className="text-gray-500">High Priority<\/p>\s*<h2 className="text-4xl font-bold mt-2">\d+<\/h2>/, '<p className="text-gray-500">High Priority</p>\n          <h2 className="text-4xl font-bold mt-2">{goalsState.filter(g => g.priority === "High").length}</h2>']
]);

// EmployeeReviews
processFile('src/components/EmployeeReviews.jsx', [
    [/<p className="text-gray-500">Total Reviews<\/p>\s*<h2 className="text-4xl font-bold mt-2">\d+<\/h2>/, '{/* Total Reviews Card */}\n          <p className="text-gray-500">Total Reviews</p>\n          <h2 className="text-4xl font-bold mt-2">{reviewsState.length}</h2>'],
    [/<p className="text-gray-500">Average Rating<\/p>\s*<h2 className="text-4xl font-bold mt-2">[\d\.]+<\/h2>/, '<p className="text-gray-500">Average Rating</p>\n          <h2 className="text-4xl font-bold mt-2">{reviewsState.length > 0 ? (reviewsState.reduce((acc, r) => acc + Number(r.rating || 0), 0) / reviewsState.length).toFixed(1) : "0.0"}</h2>'],
    [/<p className="text-gray-500">Completed Reviews<\/p>\s*<h2 className="text-4xl font-bold mt-2">\d+<\/h2>/, '<p className="text-gray-500">Completed Reviews</p>\n          <h2 className="text-4xl font-bold mt-2">{reviewsState.filter(r => r.status === "Completed").length}</h2>'],
    [/<p className="text-gray-500">Pending Reviews<\/p>\s*<h2 className="text-4xl font-bold mt-2">\d+<\/h2>/, '<p className="text-gray-500">Pending Reviews</p>\n          <h2 className="text-4xl font-bold mt-2">{reviewsState.filter(r => r.status === "Pending").length}</h2>']
]);

// PromotionTracking
processFile('src/components/PromotionTracking.jsx', [
    [/<p className="text-gray-500">Candidates<\/p>\s*<h2 className="text-4xl font-bold mt-2">\d+<\/h2>/, '{/* Candidates Card */}\n          <p className="text-gray-500">Candidates</p>\n          <h2 className="text-4xl font-bold mt-2">{promotionList.length}</h2>'],
    [/<p className="text-gray-500">Eligible<\/p>\s*<h2 className="text-4xl font-bold mt-2">\d+<\/h2>/, '<p className="text-gray-500">Eligible</p>\n          <h2 className="text-4xl font-bold mt-2">{promotionList.filter(p => p.status === "Eligible").length}</h2>'],
    [/<p className="text-gray-500">Promoted<\/p>\s*<h2 className="text-4xl font-bold mt-2">\d+<\/h2>/, '<p className="text-gray-500">Promoted</p>\n          <h2 className="text-4xl font-bold mt-2">{promotionList.filter(p => p.status === "Approved" || p.status === "Promoted").length}</h2>']
]);

console.log("Done");
