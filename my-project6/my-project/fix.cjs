const fs = require('fs');

function fixGoalSetting() {
    let content = fs.readFileSync('src/components/GoalSetting.jsx', 'utf-8');
    content = content.replace(/const goals = \[[\s\S]*?\];/, '');
    content = content.replace('useState(goals)', 'useState([])');
    
    const calc = `  // Calculate Stats
  const totalGoals = goalsState.length;
  const completedGoals = goalsState.filter(g => g.status === 'Completed').length;
  const pendingGoals = goalsState.filter(g => g.status === 'Pending').length;
  const highPriority = goalsState.filter(g => g.priority === 'High').length;

  return (`
    content = content.replace('  return (', calc);
    
    content = content.replace(/<p className="text-gray-500">Total Goals<\/p>\s*<h2 className="text-4xl font-bold mt-2">\d+<\/h2>/, '<p className="text-gray-500">Total Goals</p>\n          <h2 className="text-4xl font-bold mt-2">{totalGoals}</h2>');
    content = content.replace(/<p className="text-gray-500">Completed<\/p>\s*<h2 className="text-4xl font-bold mt-2">\d+<\/h2>/, '<p className="text-gray-500">Completed</p>\n          <h2 className="text-4xl font-bold mt-2">{completedGoals}</h2>');
    content = content.replace(/<p className="text-gray-500">Pending<\/p>\s*<h2 className="text-4xl font-bold mt-2">\d+<\/h2>/, '<p className="text-gray-500">Pending</p>\n          <h2 className="text-4xl font-bold mt-2">{pendingGoals}</h2>');
    content = content.replace(/<p className="text-gray-500">High Priority<\/p>\s*<h2 className="text-4xl font-bold mt-2">\d+<\/h2>/, '<p className="text-gray-500">High Priority</p>\n          <h2 className="text-4xl font-bold mt-2">{highPriority}</h2>');
    
    fs.writeFileSync('src/components/GoalSetting.jsx', content);
}

function fixEmployeeReviews() {
    let content = fs.readFileSync('src/components/EmployeeReviews.jsx', 'utf-8');
    
    const calc = `  // Calculate Stats
  const totalReviews = reviewsState.length;
  const completedReviews = reviewsState.filter(r => r.status === 'Completed').length;
  const pendingReviews = reviewsState.filter(r => r.status === 'Pending').length;
  const avgRating = totalReviews > 0 ? (reviewsState.reduce((acc, r) => acc + Number(r.rating || 0), 0) / totalReviews).toFixed(1) : '0.0';

  return (`
    content = content.replace('  return (', calc);
    
    content = content.replace(/<p className="text-gray-500">Total Reviews<\/p>\s*<h2 className="text-4xl font-bold mt-2">\d+<\/h2>/, '<p className="text-gray-500">Total Reviews</p>\n          <h2 className="text-4xl font-bold mt-2">{totalReviews}</h2>');
    content = content.replace(/<p className="text-gray-500">Average Rating<\/p>\s*<h2 className="text-4xl font-bold mt-2">[\d\.]+<\/h2>/, '<p className="text-gray-500">Average Rating</p>\n          <h2 className="text-4xl font-bold mt-2">{avgRating}</h2>');
    content = content.replace(/<p className="text-gray-500">Completed Reviews<\/p>\s*<h2 className="text-4xl font-bold mt-2">\d+<\/h2>/, '<p className="text-gray-500">Completed Reviews</p>\n          <h2 className="text-4xl font-bold mt-2">{completedReviews}</h2>');
    content = content.replace(/<p className="text-gray-500">Pending Reviews<\/p>\s*<h2 className="text-4xl font-bold mt-2">\d+<\/h2>/, '<p className="text-gray-500">Pending Reviews</p>\n          <h2 className="text-4xl font-bold mt-2">{pendingReviews}</h2>');
    
    fs.writeFileSync('src/components/EmployeeReviews.jsx', content);
}

function fixPromotionTracking() {
    let content = fs.readFileSync('src/components/PromotionTracking.jsx', 'utf-8');
    
    const calc = `  // Calculate Stats
  const candidatesCount = promotionList.length;
  const eligibleCount = promotionList.filter(p => p.status === 'Eligible').length;
  const promotedCount = promotionList.filter(p => p.status === 'Approved' || p.status === 'Promoted').length;

  return (`
    content = content.replace('  return (', calc);
    
    content = content.replace(/<p className="text-gray-500">Candidates<\/p>\s*<h2 className="text-4xl font-bold mt-2">\d+<\/h2>/, '<p className="text-gray-500">Candidates</p>\n          <h2 className="text-4xl font-bold mt-2">{candidatesCount}</h2>');
    content = content.replace(/<p className="text-gray-500">Eligible<\/p>\s*<h2 className="text-4xl font-bold mt-2">\d+<\/h2>/, '<p className="text-gray-500">Eligible</p>\n          <h2 className="text-4xl font-bold mt-2">{eligibleCount}</h2>');
    content = content.replace(/<p className="text-gray-500">Promoted<\/p>\s*<h2 className="text-4xl font-bold mt-2">\d+<\/h2>/, '<p className="text-gray-500">Promoted</p>\n          <h2 className="text-4xl font-bold mt-2">{promotedCount}</h2>');
    
    fs.writeFileSync('src/components/PromotionTracking.jsx', content);
}

fixGoalSetting();
fixEmployeeReviews();
fixPromotionTracking();
console.log('Done');
