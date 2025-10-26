-- Insert Sample Users
INSERT INTO USERS (EMAIL, PASSWORD_HASH, F_NAME, L_NAME, DOB, INDUSTRY, COUNTRY, CITY, BIO, HEADLINE, STATUS) VALUES
('priya.sharma@email.com', 'hashed_password_1', 'Priya', 'Sharma', '1999-05-15', 'Software Development', 'India', 'Bangalore', 'BTech Computer Science student passionate about AI and Full Stack Development', 'Full Stack Developer | AI Enthusiast', 'active'),
('rahul.verma@email.com', 'hashed_password_2', 'Rahul', 'Verma', '1998-08-22', 'Data Science', 'India', 'Mumbai', 'Data Science student exploring ML and Analytics', 'Data Scientist | ML Engineer', 'active'),
('ananya.patel@email.com', 'hashed_password_3', 'Ananya', 'Patel', '2000-03-10', 'Web Development', 'India', 'Delhi', 'Frontend Developer specializing in React and UI/UX', 'Frontend Developer | React Specialist', 'active'),
('vikram.singh@email.com', 'hashed_password_4', 'Vikram', 'Singh', '1997-11-30', 'DevOps', 'India', 'Pune', 'DevOps Engineer interested in Cloud Computing and Automation', 'DevOps Engineer | Cloud Architect', 'active'),
('neha.reddy@email.com', 'hashed_password_5', 'Neha', 'Reddy', '1999-07-18', 'Cybersecurity', 'India', 'Hyderabad', 'Cybersecurity enthusiast and ethical hacker', 'Security Analyst | Ethical Hacker', 'active');

-- Insert Sample Connections
INSERT INTO CONNECTIONS (REQUEST_ID, RECEIVER_ID, STATUS, REQUESTED_AT, ACCEPTED_AT) VALUES
(1, 2, 'accepted', '2025-09-15 10:30:00', '2025-09-15 14:20:00'),
(1, 3, 'accepted', '2025-09-16 09:00:00', '2025-09-16 11:30:00'),
(2, 4, 'accepted', '2025-09-17 15:45:00', '2025-09-18 08:15:00'),
(3, 5, 'pending', '2025-10-01 12:00:00', NULL),
(4, 1, 'accepted', '2025-10-05 16:30:00', '2025-10-05 17:00:00');

-- Insert Sample Experience
INSERT INTO EXPERIENCE (USER_ID, COMPANY_NAME, JOB_TITLE, EMPLOYMENT_TYPE, LOCATION, JOB_DESCRIPTION, START_DATE, END_DATE, IS_CURRENT) VALUES
(1, 'Tech Innovations Pvt Ltd', 'Software Development Intern', 'Internship', 'Bangalore, India', 'Worked on full-stack development using Node.js, React, and MongoDB. Built RESTful APIs and responsive web applications.', '2024-06-01', '2024-08-31', FALSE),
(1, 'AI Startup Hub', 'AI Research Intern', 'Internship', 'Remote', 'Developed AI agents using LangChain and implemented RAG-based chatbots for customer support automation.', '2025-05-01', NULL, TRUE),
(2, 'DataCorp Analytics', 'Data Analyst Intern', 'Internship', 'Mumbai, India', 'Performed data analysis using SQL and Python. Created dashboards with Tableau and Power BI.', '2024-05-15', '2024-09-15', FALSE),
(3, 'WebDesign Studio', 'Frontend Developer', 'Freelance', 'Delhi, India', 'Designed and developed responsive websites using React, Tailwind CSS, and Figma prototypes.', '2024-01-10', NULL, TRUE),
(4, 'CloudOps Services', 'DevOps Intern', 'Internship', 'Pune, India', 'Worked with Docker, Kubernetes, and CI/CD pipelines using Jenkins and GitHub Actions.', '2024-07-01', '2024-12-31', FALSE);

-- Insert Sample Education
INSERT INTO EDUCATION (USER_ID, INSTITUTION_NAME, FIELD_OF_STUDY, DEGREE, DESCRIPTION, START_DATE, END_DATE) VALUES
(1, 'PES University', 'Computer Science Engineering', 'BTech', 'Pursuing BTech in CSE with focus on AI/ML and Full Stack Development. CGPA: 8.5/10', '2022-08-01', '2026-05-31'),
(2, 'IIT Bombay', 'Data Science and Engineering', 'BTech', 'Specialization in Machine Learning and Big Data Analytics. CGPA: 9.1/10', '2021-08-01', '2025-05-31'),
(3, 'Delhi Technological University', 'Information Technology', 'BTech', 'Focus on Web Development and UI/UX Design. CGPA: 8.7/10', '2022-08-01', '2026-05-31'),
(4, 'BITS Pilani', 'Computer Science', 'BTech', 'Specialization in Cloud Computing and DevOps. CGPA: 8.9/10', '2020-08-01', '2024-05-31'),
(5, 'NIT Warangal', 'Computer Science Engineering', 'BTech', 'Focus on Cybersecurity and Network Security. CGPA: 8.6/10', '2022-08-01', '2026-05-31');

-- Insert Sample Skills
INSERT INTO SKILLS (USER_ID, SKILL, PROFICIENCY_LVL) VALUES
(1, 'JavaScript', 'Advanced'),
(1, 'React', 'Advanced'),
(1, 'Node.js', 'Advanced'),
(1, 'Python', 'Intermediate'),
(1, 'LangChain', 'Intermediate'),
(1, 'Docker', 'Intermediate'),
(2, 'Python', 'Expert'),
(2, 'SQL', 'Advanced'),
(2, 'Machine Learning', 'Advanced'),
(2, 'Tableau', 'Intermediate'),
(3, 'HTML/CSS', 'Expert'),
(3, 'React', 'Advanced'),
(3, 'Tailwind CSS', 'Advanced'),
(3, 'Figma', 'Advanced'),
(4, 'Docker', 'Advanced'),
(4, 'Kubernetes', 'Advanced'),
(4, 'AWS', 'Intermediate'),
(4, 'Jenkins', 'Intermediate'),
(5, 'Cybersecurity', 'Advanced'),
(5, 'Ethical Hacking', 'Advanced'),
(5, 'Network Security', 'Intermediate');

-- Insert Sample Posts
INSERT INTO POSTS (USER_ID, TITLE, CONTENT, POST_TYPE, LIKES_COUNT, COMMENTS_COUNT) VALUES
(1, 'Just completed my first AI Agent project!', 'Built a comprehensive CRM agent using LangChain and Supabase. The agent can automate email responses and integrate with Slack. Check out my GitHub for the source code!', 'text', 45, 8),
(2, 'Data Science Tips for Beginners', 'Here are 5 essential tips for anyone starting their data science journey. Start with Python basics, learn SQL, master pandas...', 'article', 78, 12),
(3, 'New Portfolio Website Launch', 'Finally launched my portfolio website built with Next.js and Tailwind CSS. Would love to hear your feedback!', 'text', 34, 6),
(4, 'DevOps Best Practices', 'Sharing my learnings from implementing CI/CD pipelines. Automation is key to efficient software delivery...', 'article', 56, 9),
(5, 'Cybersecurity Awareness Month', 'October is Cybersecurity Awareness Month! Here are top 10 security practices everyone should follow...', 'text', 92, 15);

-- Insert Sample Post Likes
INSERT INTO POST_LIKES (POST_ID, USER_ID) VALUES
(1, 2), (1, 3), (1, 4),
(2, 1), (2, 3), (2, 5),
(3, 1), (3, 2), (3, 4),
(4, 1), (4, 2), (4, 5),
(5, 1), (5, 2), (5, 3), (5, 4);

-- Insert Sample Comments
INSERT INTO COMMENTS (POST_ID, USER_ID, CONTENT, LIKES_COUNT) VALUES
(1, 2, 'This looks amazing! Would love to collaborate on a similar project.', 5),
(1, 3, 'Great work! How long did it take to build?', 3),
(2, 1, 'Very helpful tips. Thanks for sharing!', 7),
(3, 4, 'The design is clean and professional. Well done!', 4),
(5, 1, 'Important reminder. Security should always be a priority.', 6);

-- Insert Sample Comment Likes
INSERT INTO COMMENT_LIKES (COMMENT_ID, USER_ID) VALUES
(1, 1), (1, 3), (1, 4),
(2, 1), (2, 2),
(3, 2), (3, 3), (3, 5),
(4, 1), (4, 2), (4, 3),
(5, 2), (5, 3), (5, 4), (5, 5);

-- NEW: Insert Sample Projects
INSERT INTO PROJECTS (USER_ID, PROJECT_TITLE, DESCRIPTION, TECHNOLOGIES_USED, PROJECT_URL, GITHUB_URL, START_DATE, END_DATE, IS_ONGOING) VALUES
(1, 'SEO Analytics SaaS Platform', 'Comprehensive SEO and website analysis platform with competitor analysis, backlink tracking, and Google Search Console integration. Features include website health scoring and technical SEO analysis.', 'Node.js, React, Next.js, Supabase, Google Cloud APIs, Lighthouse', 'https://seo-platform.example.com', 'https://github.com/user1/seo-platform', '2025-09-01', '2025-10-15', FALSE),
(1, 'AI CRM Agent System', 'Intelligent CRM agent built with LangChain that automates customer interactions, email responses, and Slack integration. Includes resume screening automation using LangGraph.', 'Python, LangChain, LangGraph, Supabase, Gradio, FastAPI', 'https://crm-agent.example.com', 'https://github.com/user1/crm-agent', '2025-06-01', '2025-06-30', FALSE),
(1, 'Team Banalo - Hackathon Team Formation', 'Platform enabling students to find teammates for hackathons, post project ideas, and collaborate. Features Google authentication and AI-powered team matching.', 'React, Vite, Tailwind CSS, Supabase, Docker', 'https://teambanalo.example.com', 'https://github.com/user1/team-banalo', '2025-06-15', '2025-07-05', FALSE),
(2, 'Customer Churn Prediction Model', 'Machine learning model to predict customer churn using Random Forest and XGBoost algorithms. Achieved 89% accuracy on test dataset.', 'Python, Scikit-learn, Pandas, Matplotlib, Jupyter', NULL, 'https://github.com/user2/churn-prediction', '2024-11-01', '2024-12-15', FALSE),
(3, 'E-Commerce Dashboard', 'Responsive admin dashboard for e-commerce platform with real-time analytics, inventory management, and order tracking.', 'React, TypeScript, Redux, Chart.js, Material-UI', 'https://ecommerce-dashboard.example.com', 'https://github.com/user3/ecommerce-dashboard', '2025-03-01', '2025-04-30', FALSE),
(4, 'Kubernetes Monitoring System', 'Custom monitoring solution for Kubernetes clusters with automated alerting and performance metrics visualization.', 'Python, Prometheus, Grafana, Kubernetes, Docker', NULL, 'https://github.com/user4/k8s-monitor', '2025-01-10', NULL, TRUE),
(5, 'Vulnerability Scanner Tool', 'Automated security vulnerability scanner for web applications. Detects SQL injection, XSS, and CSRF vulnerabilities.', 'Python, Flask, BeautifulSoup, SQLMap', NULL, 'https://github.com/user5/vuln-scanner', '2024-09-01', '2024-11-30', FALSE);

-- NEW: Insert Resume Templates
INSERT INTO RESUME_TEMPLATES (TEMPLATE_NAME, TEMPLATE_TYPE, PREVIEW_IMAGE_URL) VALUES
('Professional Classic', 'Classic', '/templates/classic-preview.jpg'),
('Modern Minimal', 'Modern', '/templates/modern-preview.jpg'),
('Creative Bold', 'Creative', '/templates/creative-preview.jpg'),
('Simple Elegant', 'Minimal', '/templates/minimal-preview.jpg');

-- NEW: Insert User Resume Settings
INSERT INTO USER_RESUME_SETTINGS (USER_ID, TEMPLATE_ID, INCLUDE_PROFILE_PIC, INCLUDE_BIO, INCLUDE_PROJECTS, SECTIONS_ORDER, COLOR_SCHEME, FONT_STYLE) VALUES
(1, 2, TRUE, TRUE, TRUE, '["education", "experience", "projects", "skills"]', '#2563eb', 'Inter'),
(2, 1, FALSE, TRUE, TRUE, '["education", "experience", "skills", "projects"]', '#000000', 'Arial'),
(3, 3, TRUE, TRUE, TRUE, '["experience", "projects", "skills", "education"]', '#8b5cf6', 'Poppins'),
(4, 2, TRUE, FALSE, TRUE, '["experience", "skills", "projects", "education"]', '#059669', 'Roboto'),
(5, 4, FALSE, TRUE, FALSE, '["education", "experience", "skills"]', '#dc2626', 'Open Sans');

-- NEW: Insert Project Collaborators
INSERT INTO PROJECT_COLLABORATORS (PROJECT_ID, USER_ID, ROLE) VALUES
(3, 1, 'Lead Developer'),
(3, 3, 'Frontend Developer'),
(5, 3, 'Full Stack Developer'),
(5, 1, 'Backend Consultant');
