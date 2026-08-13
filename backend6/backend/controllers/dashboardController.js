const db = require("../configer/db");

const queryAsync = (sql, params = []) => new Promise((resolve, reject) => {
    db.query(sql, params, (err, rows) => err ? reject(err) : resolve(rows));
});

// The Admin Home previously called four endpoints that did not exist, so every
// card silently showed 0. Keep the dashboard data together in one endpoint.
exports.getSummary = async (req, res) => {
    try {
        await queryAsync(`CREATE TABLE IF NOT EXISTS leaves (
            id INT AUTO_INCREMENT PRIMARY KEY,
            employee_id INT NOT NULL,
            employee_name VARCHAR(150) NOT NULL,
            type VARCHAR(50) NOT NULL,
            reason TEXT,
            date DATE NOT NULL,
            status VARCHAR(50) DEFAULT 'Pending',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`);

        const [employeeRows, presentRows, leaveRows, salaryRows, taskRows, recentEmployees, recentTasks] = await Promise.all([
            queryAsync('SELECT COUNT(*) AS total FROM employees'),
            queryAsync(`SELECT COUNT(DISTINCT employee_id) AS total FROM attendance
                        WHERE date = CURDATE() AND (check_in IS NOT NULL OR status IN ('IN', 'LATE', 'COMPLETED', 'HALF_DAY'))`),
            queryAsync(`SELECT COUNT(*) AS total FROM leaves WHERE status = 'Approved' AND date = CURDATE()`),
            queryAsync('SELECT COALESCE(SUM(monthly_salary), 0) AS total FROM employees'),
            queryAsync(`SELECT COUNT(*) AS total,
                SUM(CASE WHEN LOWER(status) IN ('completed', 'complete', 'done') THEN 1 ELSE 0 END) AS completed,
                SUM(CASE WHEN LOWER(status) IN ('pending', 'assigned', 'todo', 'in progress', 'in_progress') THEN 1 ELSE 0 END) AS pending
                FROM tasks`),
            queryAsync(`SELECT id, name, department, position, role_position FROM employees ORDER BY id DESC LIMIT 5`),
            queryAsync(`SELECT t.id, t.title, t.status, t.priority, t.task_date,
                COALESCE(e.name, 'Unassigned') AS assignee
                FROM tasks t LEFT JOIN employees e ON e.id = t.assignee_id ORDER BY t.id DESC LIMIT 5`)
        ]);

        res.json({
            success: true,
            counts: {
                employees: Number(employeeRows[0]?.total || 0),
                present: Number(presentRows[0]?.total || 0),
                onLeave: Number(leaveRows[0]?.total || 0),
                payroll: Number(salaryRows[0]?.total || 0),
                tasks: Number(taskRows[0]?.total || 0),
                completedTasks: Number(taskRows[0]?.completed || 0),
                pendingTasks: Number(taskRows[0]?.pending || 0)
            },
            recentEmployees,
            recentTasks
        });
    } catch (error) {
        console.error('Dashboard summary error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};




exports.createTask = (req, res) => {
    const {
        title,
        assign_to,
        status,
        remarks,
        extra_time,
        time_tracking
    } = req.body;

    const sql = `
        INSERT INTO tasks
        (
            title,
            assign_to,
            status,
            remarks,
            extra_time,
            time_tracking
        )
        VALUES (?, ?, ?, ?, ?, ?)
    `;

    db.query(
        sql,
        [
            title,
            assign_to,
            status,
            remarks,
            extra_time,
            time_tracking
        ],
        (err, result) => {
            if (err) {
                return res.status(500).json({
                    success: false,
                    message: err.message
                });
            }

            res.status(201).json({
                success: true,
                message: "Task Created Successfully",
                taskId: result.insertId
            });
        }
    );
};

exports.getDashboard = async (req, res) => {
    try {
        const todayTaskQuery = `
      SELECT COUNT(*) AS total
      FROM tasks
      WHERE DATE(created_at) = CURDATE()
    `;

        const weekProgressQuery = `
      SELECT COUNT(*) AS total
      FROM tasks
      WHERE YEARWEEK(created_at, 1) = YEARWEEK(CURDATE(), 1)
    `;

        const monthlyPerformanceQuery = `
      SELECT COUNT(*) AS total
      FROM tasks
      WHERE MONTH(created_at) = MONTH(CURDATE())
      AND YEAR(created_at) = YEAR(CURDATE())
    `;

        const todayTasks = await new Promise((resolve, reject) => {
            db.query(todayTaskQuery, (err, result) => {
                if (err) reject(err);
                else resolve(result[0].total);
            });
        });

        const weekProgress = await new Promise((resolve, reject) => {
            db.query(weekProgressQuery, (err, result) => {
                if (err) reject(err);
                else resolve(result[0].total);
            });
        });

        const monthlyPerformance = await new Promise((resolve, reject) => {
            db.query(monthlyPerformanceQuery, (err, result) => {
                if (err) reject(err);
                else resolve(result[0].total);
            });
        });

        const taskListQuery = `
      SELECT
        tasks.id,
        tasks.title,
        tasks.description,
        COALESCE(employees.name, '') AS assign_to,
        tasks.status,
        tasks.priority,
        tasks.task_date,
        tasks.hours,
        tasks.minutes,
        tasks.client_name
      FROM tasks
      LEFT JOIN employees ON tasks.assignee_id = employees.id
      ORDER BY tasks.id DESC
    `;



        db.query(taskListQuery, (err, tasks) => {
            if (err) {
                return res.status(500).json({
                    success: false,
                    message: err.message,
                });
            }

            res.status(200).json({
                success: true,
                todayTasks,
                weekProgress,
                monthlyPerformance,
                tasks,
            });
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

//
//
exports.getTaskById = (req, res) => {
    const { id } = req.params;

    db.query(
        "SELECT * FROM tasks WHERE id = ?",
        [id],
        (err, result) => {
            if (err) {
                return res.status(500).json({
                    success: false,
                    message: err.message
                });
            }

            if (result.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Task not found"
                });
            }

            res.status(200).json({
                success: true,
                data: result[0]
            });
        }
    );
};
//
///
///
exports.updateTask = (req, res) => {
    const { id } = req.params;

    const {
        title,
        assign_to,
        status,
        remarks,
        extra_time,
        time_tracking
    } = req.body;

    const sql = `
        UPDATE tasks
        SET
            title = ?,
            assign_to = ?,
            status = ?,
            remarks = ?,
            extra_time = ?,
            time_tracking = ?
        WHERE id = ?
    `;

    db.query(
        sql,
        [
            title,
            assign_to,
            status,
            remarks,
            extra_time,
            time_tracking,
            id
        ],
        (err, result) => {
            if (err) {
                return res.status(500).json({
                    success: false,
                    message: err.message
                });
            }

            res.status(200).json({
                success: true,
                message: "Task Updated Successfully"
            });
        }
    );
};
///
///
//
exports.deleteTask = (req, res) => {
    const { id } = req.params;

    db.query(
        "DELETE FROM tasks WHERE id = ?",
        [id],
        (err, result) => {
            if (err) {
                return res.status(500).json({
                    success: false,
                    message: err.message
                });
            }

            res.status(200).json({
                success: true,
                message: "Task Deleted Successfully"
            });
        }
    );
};
