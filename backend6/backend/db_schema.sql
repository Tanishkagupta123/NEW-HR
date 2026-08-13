-- Minimal schema for hrms database

CREATE DATABASE IF NOT EXISTS hrms6;
USE hrms6;

CREATE TABLE IF NOT EXISTS admin (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  password VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS employees (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  email VARCHAR(255),
  phone_number VARCHAR(50),
  department VARCHAR(150),
  position VARCHAR(150),
  role_position VARCHAR(150),
  joining_date DATE,
  password VARCHAR(255) NOT NULL,
  employee_code VARCHAR(100),
  profile_pic VARCHAR(255),
  aadhaar_file VARCHAR(255),
  pan_file VARCHAR(255),
  certificate_file VARCHAR(255),
  monthly_salary DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS attendance (
  id INT AUTO_INCREMENT PRIMARY KEY,
  employee_id INT NOT NULL,
  emp_id VARCHAR(255),
  student_id VARCHAR(255),
  employee_name VARCHAR(255),
  date DATE NOT NULL,
  year INT,
  month INT,
  day VARCHAR(20),
  status VARCHAR(50),
  attendance_status VARCHAR(50),
  mode VARCHAR(50),
  lat DECIMAL(10,7),
  lon DECIMAL(10,7),
  check_in TIME,
  check_out TIME,
  late_fine DECIMAL(10,2) DEFAULT 0,
  final_salary DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_attendance_employee_date (employee_id, date)
);

CREATE TABLE IF NOT EXISTS projects (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tasks (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  project_id INT,
  assignee_id INT,
  status VARCHAR(50) DEFAULT 'todo',
  task_date DATE,
  hours INT DEFAULT 0,
  minutes INT DEFAULT 0,
  priority VARCHAR(50) DEFAULT 'Normal',
  client_name VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE SET NULL,
  FOREIGN KEY (assignee_id) REFERENCES employees(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS leaves (
  id INT AUTO_INCREMENT PRIMARY KEY,
  employee_id INT NOT NULL,
  employee_name VARCHAR(150) NOT NULL,
  type VARCHAR(50) NOT NULL,
  reason TEXT,
  date DATE NOT NULL,
  status VARCHAR(50) DEFAULT 'Pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
);

-- Performance reviews table
CREATE TABLE IF NOT EXISTS performance_reviews (
  id INT AUTO_INCREMENT PRIMARY KEY,
  employee_id INT NOT NULL,
  reviewer_id INT NOT NULL,
  rating DECIMAL(3,2) NOT NULL,
  comments TEXT,
  review_date DATE,
  department VARCHAR(150),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
);

-- Certificates table for certificate management system
CREATE TABLE IF NOT EXISTS certificates (
  id INT AUTO_INCREMENT PRIMARY KEY,
  recipient_name VARCHAR(150) NOT NULL,
  recipient_email VARCHAR(255) NOT NULL,
  certificate_type VARCHAR(100) NOT NULL,
  issued_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  certificate_path VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_recipient_email (recipient_email),
  INDEX idx_issued_date (issued_date)
);
