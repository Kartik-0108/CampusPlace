import express from 'express';
import path from 'path';
import bcrypt from 'bcryptjs';
import cors from 'cors';
import { createServer as createViteServer } from 'vite';
import { loadDatabase, saveDatabase, getAnalytics, initDatabase } from './db.ts';
import { User, StudentProfile, CompanyProfile, Job, Application, Interview } from '../src/types.ts';

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;

  app.use(cors());
  app.use(express.json({ limit: '10mb' }));

  // Wait for database initialization (Firestore or local)
  await initDatabase();
  
  // Get sync reference for API routes
  let dbState = loadDatabase();

  // Helper middleware to get authenticated user from header
  const getAuthUser = (req: express.Request): User | null => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }
    const token = authHeader.split(' ')[1]; // Simplistic token is just userId
    dbState = loadDatabase();
    const user = dbState.users.find(u => u.id === token);
    return user || null;
  };

  // API ROUTES

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date() });
  });

  // Auth Register
  app.post('/api/auth/register', async (req, res) => {
    const { email, password, name, role, details } = req.body;

    if (!email || !password || !name || !role) {
      res.status(400).json({ success: false, message: 'Missing required fields' });
      return;
    }

    dbState = loadDatabase();

    // Check if email already registered
    const existingUser = dbState.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existingUser) {
      res.status(400).json({ success: false, message: 'Email already registered' });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const userId = 'usr_' + Math.random().toString(36).substr(2, 9);
    const newUser: User = { id: userId, email, role, name, passwordHash };
    dbState.users.push(newUser);

    if (role === 'student') {
      const newStudent: StudentProfile = {
        userId,
        name,
        email,
        rollNumber: details?.rollNumber || 'STU' + Math.floor(1000 + Math.random() * 9000),
        department: details?.department || 'Computer Science', departmentId: 'dept_1',
        cgpa: parseFloat(details?.cgpa || '0.0'),
        tenthPercentage: parseFloat(details?.tenthPercentage || '0.0'),
        twelfthPercentage: parseFloat(details?.twelfthPercentage || '0.0'),
        backlogs: parseInt(details?.backlogs || '0'),
        skills: details?.skills || [],
        projects: details?.projects || [],
        resumeUrl: details?.resumeUrl || '',
        placedStatus: 'Unplaced'
      };
      dbState.students.push(newStudent);
    } else if (role === 'company') {
      const newCompany: CompanyProfile = {
        userId,
        name,
        email,
        industry: details?.industry || 'Technology',
        website: details?.website || '',
        location: details?.location || '',
        description: details?.description || '',
        isApproved: false // Admin must approve companies by default!
      };
      dbState.companies.push(newCompany);
    }

    saveDatabase(dbState);
    const { passwordHash: _ph, ...userWithoutPassword } = newUser;
    res.json({ success: true, user: userWithoutPassword });
  });

  // Auth Login
  app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ success: false, message: 'Email and password are required' });
      return;
    }

    dbState = loadDatabase();
    const user = dbState.users.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (!user) {
      res.status(401).json({ success: false, message: 'Invalid email or password' });
      return;
    }

    // Default mock users don't have passwords yet, so allow login for demo purposes
    // In production, we'd force password reset
    let isValid = false;
    if (user.passwordHash) {
      isValid = await bcrypt.compare(password, user.passwordHash);
    } else if (password === 'password') {
       // fallback for mock accounts
       isValid = true;
    }

    if (!isValid) {
      res.status(401).json({ success: false, message: 'Invalid email or password' });
      return;
    }

    const { passwordHash: _ph, ...userWithoutPassword } = user;
    res.json({ success: true, user: userWithoutPassword });
  });

  // Auth Me (get current user details)
  app.get('/api/auth/me', (req, res) => {
    const user = getAuthUser(req);
    if (!user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    dbState = loadDatabase();

    let profile: any = null;
    if (user.role === 'student') {
      profile = dbState.students.find(s => s.userId === user.id) || null;
    } else if (user.role === 'company') {
      profile = dbState.companies.find(c => c.userId === user.id) || null;
    }

    res.json({ success: true, user, profile });
  });

  // GET Students (Admin can list all, filter by criteria)
  app.get('/api/students', (req, res) => {
    const user = getAuthUser(req);
    if (!user || (user.role !== 'admin' && user.role !== 'company')) {
      res.status(403).json({ success: false, message: 'Access denied' });
      return;
    }

    dbState = loadDatabase();
    let result = dbState.students;

    const { minCgpa, department, placedStatus } = req.query;
    if (minCgpa) {
      result = result.filter(s => s.cgpa >= parseFloat(minCgpa as string));
    }
    if (department) {
      result = result.filter(s => s.department === department);
    }
    if (placedStatus) {
      result = result.filter(s => s.placedStatus === placedStatus);
    }

    res.json({ success: true, students: result });
  });

  // GET Single Student Profile
  app.get('/api/students/:userId', (req, res) => {
    const user = getAuthUser(req);
    if (!user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    dbState = loadDatabase();
    const student = dbState.students.find(s => s.userId === req.params.userId);

    if (!student) {
      res.status(404).json({ success: false, message: 'Student profile not found' });
      return;
    }

    res.json({ success: true, student });
  });

  // PUT Student Profile (Student updates themselves)
  app.put('/api/students/:userId', (req, res) => {
    const user = getAuthUser(req);
    if (!user || (user.role !== 'admin' && user.id !== req.params.userId)) {
      res.status(403).json({ success: false, message: 'Access denied' });
      return;
    }

    dbState = loadDatabase();
    const index = dbState.students.findIndex(s => s.userId === req.params.userId);

    if (index === -1) {
      res.status(404).json({ success: false, message: 'Student not found' });
      return;
    }

    const currentProfile = dbState.students[index];
    const updatedProfile: StudentProfile = {
      ...currentProfile,
      ...req.body,
      // Protect sensitive fields from self-mutation unless admin
      userId: currentProfile.userId,
      email: currentProfile.email,
      placedStatus: user.role === 'admin' ? req.body.placedStatus : currentProfile.placedStatus,
      placementCompany: user.role === 'admin' ? req.body.placementCompany : currentProfile.placementCompany,
      placementPackage: user.role === 'admin' ? req.body.placementPackage : currentProfile.placementPackage,
    };

    dbState.students[index] = updatedProfile;
    saveDatabase(dbState);

    res.json({ success: true, student: updatedProfile });
  });

  // GET Companies
  app.get('/api/companies', (req, res) => {
    const user = getAuthUser(req);
    if (!user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    dbState = loadDatabase();
    res.json({ success: true, companies: dbState.companies });
  });

  // PUT Approve Company (Admin only)
  app.put('/api/companies/:userId/approve', (req, res) => {
    const user = getAuthUser(req);
    if (!user || user.role !== 'admin') {
      res.status(403).json({ success: false, message: 'Admin access required' });
      return;
    }

    dbState = loadDatabase();
    const company = dbState.companies.find(c => c.userId === req.params.userId);

    if (!company) {
      res.status(404).json({ success: false, message: 'Company not found' });
      return;
    }

    company.isApproved = true;
    saveDatabase(dbState);

    res.json({ success: true, company });
  });

  // GET Jobs
  app.get('/api/jobs', (req, res) => {
    dbState = loadDatabase();
    res.json({ success: true, jobs: dbState.jobs });
  });

  // POST Job
  app.post('/api/jobs', (req, res) => {
    const user = getAuthUser(req);
    if (!user || (user.role !== 'company' && user.role !== 'admin')) {
      res.status(403).json({ success: false, message: 'Access denied' });
      return;
    }

    dbState = loadDatabase();
    
    let companyName = req.body.companyName;
    let companyId = user.id;

    if (user.role === 'company') {
      const company = dbState.companies.find(c => c.userId === user.id);
      if (!company) {
        res.status(404).json({ success: false, message: 'Company profile not found' });
        return;
      }
      if (!company.isApproved) {
        res.status(403).json({ success: false, message: 'Your company profile is pending approval by the placement department.' });
        return;
      }
      companyName = company.name;
    }

    const { title, description, requirements, cgpaCutoff, backlogsAllowed, packageAmount, jobType, location, lastDateToApply, companyLogo, allowedDepartments, workMode, hrContact, selectionProcess, numberOfRounds, status } = req.body;

    if (!title || !description || cgpaCutoff === undefined || backlogsAllowed === undefined || !packageAmount || !jobType || !location || !lastDateToApply) {
      res.status(400).json({ success: false, message: 'Missing required fields' });
      return;
    }

    const newJob: Job = {
      id: 'job_' + Math.random().toString(36).substr(2, 9),
      companyId: user.role === 'admin' ? 'admin_created' : companyId,
      companyName: companyName || 'Unknown Company',
      companyLogo,
      title,
      description,
      requirements: Array.isArray(requirements) ? requirements : [requirements].filter(Boolean),
      cgpaCutoff: parseFloat(cgpaCutoff),
      backlogsAllowed: parseInt(backlogsAllowed),
      packageAmount: parseFloat(packageAmount),
      jobType,
      location,
      workMode: workMode || 'On-Site',
      allowedDepartments: allowedDepartments || [],
      postedDate: new Date().toISOString().split('T')[0],
      lastDateToApply,
      hrContact,
      selectionProcess,
      numberOfRounds: numberOfRounds ? parseInt(numberOfRounds) : undefined,
      status: status || 'Open'
    };

    dbState.jobs.push(newJob);
    
    if (newJob.status === 'Open') {
      dbState.notifications = dbState.notifications || [];
      // Notify eligible students (simulation: just notify everyone for now)
      dbState.students.forEach(s => {
        if (!newJob.allowedDepartments.length || newJob.allowedDepartments.includes(s.departmentId || s.department)) {
          dbState.notifications.push({
            id: 'notif_' + Math.random().toString(36).substr(2, 9),
            userId: s.userId,
            title: 'New Placement Drive',
            message: `${newJob.companyName} is hiring for ${newJob.title}.`,
            type: 'info',
            isRead: false,
            createdAt: new Date().toISOString()
          });
        }
      });
    }

    saveDatabase(dbState);

    res.json({ success: true, job: newJob });
  });

  // PUT Job status/updates
  app.put('/api/jobs/:id', (req, res) => {
    const user = getAuthUser(req);
    if (!user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    dbState = loadDatabase();
    const index = dbState.jobs.findIndex(j => j.id === req.params.id);
    if (index === -1) {
      res.status(404).json({ success: false, message: 'Job drive not found' });
      return;
    }

    const job = dbState.jobs[index];
    if (user.role !== 'admin' && job.companyId !== user.id) {
      res.status(403).json({ success: false, message: 'Access denied' });
      return;
    }

    dbState.jobs[index] = {
      ...job,
      ...req.body,
      id: job.id,
      companyId: job.companyId,
      companyName: req.body.companyName || job.companyName
    };

    saveDatabase(dbState);
    res.json({ success: true, job: dbState.jobs[index] });
  });

  // GET Applications
  app.get('/api/applications', (req, res) => {
    const user = getAuthUser(req);
    if (!user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    dbState = loadDatabase();
    let result = dbState.applications;

    if (user.role === 'student') {
      result = result.filter(a => a.studentId === user.id);
    } else if (user.role === 'company') {
      // Find all jobs by this company
      const companyJobs = dbState.jobs.filter(j => j.companyId === user.id).map(j => j.id);
      result = result.filter(a => companyJobs.includes(a.jobId));
    }

    // Attach latest student resumeUrl, cgpa, and skills to applications
    result = result.map(app => {
      const student = dbState.students.find(s => s.userId === app.studentId);
      if (student) {
        return {
          ...app,
          studentResumeUrl: student.resumeUrl || app.studentResumeUrl,
          studentCgpa: student.cgpa,
          studentSkills: student.skills, // Include skills dynamically just in case
        };
      }
      return app;
    });

    res.json({ success: true, applications: result });
  });

  // POST Create Application (Automated Eligibility Checking!)
  app.post('/api/applications', (req, res) => {
    const user = getAuthUser(req);
    if (!user || user.role !== 'student') {
      res.status(403).json({ success: false, message: 'Only students can apply' });
      return;
    }

    const { jobId } = req.body;
    if (!jobId) {
      res.status(400).json({ success: false, message: 'Job ID is required' });
      return;
    }

    dbState = loadDatabase();
    
    // Check if already applied
    const existingApp = dbState.applications.find(a => a.jobId === jobId && a.studentId === user.id);
    if (existingApp) {
      res.status(400).json({ success: false, message: 'You have already applied for this placement drive.' });
      return;
    }

    const job = dbState.jobs.find(j => j.id === jobId);
    if (!job) {
      res.status(404).json({ success: false, message: 'Job drive not found' });
      return;
    }

    if (job.status !== 'Open') {
      res.status(400).json({ success: false, message: 'Applications for this job drive are closed.' });
      return;
    }

    const student = dbState.students.find(s => s.userId === user.id);
    if (!student) {
      res.status(404).json({ success: false, message: 'Student profile not found. Please complete your profile.' });
      return;
    }

    // AUTOMATED ELIGIBILITY CHECKING LOGIC
    if (student.cgpa < job.cgpaCutoff) {
      res.status(400).json({
        success: false,
        message: `Eligibility failed: CGPA requirement is ${job.cgpaCutoff}, but your CGPA is ${student.cgpa}.`
      });
      return;
    }

    if (student.backlogs > job.backlogsAllowed) {
      res.status(400).json({
        success: false,
        message: `Eligibility failed: Maximum allowed backlogs is ${job.backlogsAllowed}, but you have ${student.backlogs}.`
      });
      return;
    }

    const newApp: Application = {
      id: 'app_' + Math.random().toString(36).substr(2, 9),
      jobId: job.id,
      studentId: user.id,
      studentName: student.name,
      studentRollNumber: student.rollNumber,
      studentDepartment: student.department,
      studentCgpa: student.cgpa,
      studentResumeUrl: student.resumeUrl || 'https://example.com/resumes/dummy.pdf',
      jobTitle: job.title,
      companyName: job.companyName,
      appliedDate: new Date().toISOString().split('T')[0],
      status: 'Applied',
      remarks: 'Automated eligibility checks PASSED. Awaiting company review.'
    };

    dbState.applications.push(newApp);
    saveDatabase(dbState);

    res.json({ success: true, application: newApp });
  });

  // PUT Update Application Status (Selected automatic placement update!)
  app.put('/api/applications/:id/status', (req, res) => {
    const user = getAuthUser(req);
    if (!user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    dbState = loadDatabase();
    const appIndex = dbState.applications.findIndex(a => a.id === req.params.id);
    if (appIndex === -1) {
      res.status(404).json({ success: false, message: 'Application not found' });
      return;
    }

    const application = dbState.applications[appIndex];
    const job = dbState.jobs.find(j => j.id === application.jobId);

    // Verify company matches or admin
    if (user.role !== 'admin' && (!job || job.companyId !== user.id)) {
      res.status(403).json({ success: false, message: 'Access denied' });
      return;
    }

    const { status, remarks } = req.body;
    if (!status) {
      res.status(400).json({ success: false, message: 'Status is required' });
      return;
    }

    application.status = status;
    if (remarks) {
      application.remarks = remarks;
    }

    // AUTOMATED PLACEMENT RECORDS UPDATE
    // If student is SELECTED, automatically update student profile as Placed!
    if (status === 'Placed' || status === 'Selected') {
      const studentIndex = dbState.students.findIndex(s => s.userId === application.studentId);
      if (studentIndex !== -1) {
        dbState.students[studentIndex].placedStatus = 'Placed';
        dbState.students[studentIndex].placementCompany = application.companyName;
        dbState.students[studentIndex].placementPackage = job ? job.packageAmount : 0;
      }
    }
    
    // Add Notification
    dbState.notifications = dbState.notifications || [];
    dbState.notifications.push({
      id: 'notif_' + Math.random().toString(36).substr(2, 9),
      userId: application.studentId,
      title: 'Application Update',
      message: `Your application for ${application.companyName} is now ${status}.`,
      type: status === 'Placed' || status === 'Selected' ? 'success' : status === 'Rejected' ? 'error' : 'info',
      isRead: false,
      createdAt: new Date().toISOString()
    });

    saveDatabase(dbState);
    res.json({ success: true, application });
  });

  // GET Interviews
  app.get('/api/interviews', (req, res) => {
    const user = getAuthUser(req);
    if (!user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    dbState = loadDatabase();
    let result = dbState.interviews;

    if (user.role === 'student') {
      result = result.filter(i => i.studentId === user.id);
    } else if (user.role === 'company') {
      result = result.filter(i => i.companyId === user.id);
    }

    res.json({ success: true, interviews: result });
  });

  // POST Schedule Interview (Company only)
  app.post('/api/interviews', (req, res) => {
    const user = getAuthUser(req);
    if (!user || user.role !== 'company') {
      res.status(403).json({ success: false, message: 'Company access required' });
      return;
    }

    const { applicationId, dateTime, mode, linkOrVenue } = req.body;
    if (!applicationId || !dateTime || !mode || !linkOrVenue) {
      res.status(400).json({ success: false, message: 'Missing required fields' });
      return;
    }

    dbState = loadDatabase();
    const application = dbState.applications.find(a => a.id === applicationId);
    if (!application) {
      res.status(404).json({ success: false, message: 'Application not found' });
      return;
    }

    // Schedule interview
    const newInterview: Interview = {
      id: 'int_' + Math.random().toString(36).substr(2, 9),
      applicationId,
      studentId: application.studentId,
      studentName: application.studentName,
      companyId: user.id,
      companyName: application.companyName,
      jobTitle: application.jobTitle,
      dateTime,
      mode,
      linkOrVenue,
      status: 'Scheduled'
    };

    // Update application state to Interviewing
    application.status = 'Interview';
    application.remarks = `Interview scheduled for ${newInterview.dateTime}. Mode: ${newInterview.mode}`;

    dbState.interviews.push(newInterview);
    saveDatabase(dbState);

    res.json({ success: true, interview: newInterview });
  });

  // PUT Update Interview status
  app.put('/api/interviews/:id', (req, res) => {
    const user = getAuthUser(req);
    if (!user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    dbState = loadDatabase();
    const index = dbState.interviews.findIndex(i => i.id === req.params.id);
    if (index === -1) {
      res.status(404).json({ success: false, message: 'Interview schedule not found' });
      return;
    }

    const interview = dbState.interviews[index];
    if (user.role !== 'admin' && interview.companyId !== user.id) {
      res.status(403).json({ success: false, message: 'Access denied' });
      return;
    }

    dbState.interviews[index] = {
      ...interview,
      ...req.body,
      id: interview.id,
      applicationId: interview.applicationId,
      studentId: interview.studentId,
      companyId: interview.companyId
    };

    saveDatabase(dbState);
    res.json({ success: true, interview: dbState.interviews[index] });
  });

  // GET Analytics (Admin only)
  app.get('/api/analytics', (req, res) => {
    const user = getAuthUser(req);
    if (!user || user.role !== 'admin') {
      res.status(403).json({ success: false, message: 'Admin access required' });
      return;
    }

    dbState = loadDatabase();
    const stats = getAnalytics(dbState);
    res.json({ success: true, stats });
  });

  // GET Departments
  app.get('/api/departments', (req, res) => {
    dbState = loadDatabase();
    res.json({ success: true, departments: dbState.departments });
  });

  // POST Department (Admin only)
  app.post('/api/departments', (req, res) => {
    const user = getAuthUser(req);
    if (!user || user.role !== 'admin') {
      res.status(403).json({ success: false, message: 'Admin access required' });
      return;
    }
    const { name, code } = req.body;
    if (!name || !code) {
      res.status(400).json({ success: false, message: 'Name and Code required' });
      return;
    }
    dbState = loadDatabase();
    const newDept = { id: 'dept_' + Math.random().toString(36).substr(2, 9), name, code };
    dbState.departments.push(newDept);
    saveDatabase(dbState);
    res.json({ success: true, department: newDept });
  });
  
  // DELETE Department (Admin only)
  app.delete('/api/departments/:id', (req, res) => {
    const user = getAuthUser(req);
    if (!user || user.role !== 'admin') {
      res.status(403).json({ success: false, message: 'Admin access required' });
      return;
    }
    dbState = loadDatabase();
    dbState.departments = dbState.departments.filter(d => d.id !== req.params.id);
    saveDatabase(dbState);
    res.json({ success: true });
  });

  // GET Notifications
  app.get('/api/notifications', (req, res) => {
    const user = getAuthUser(req);
    if (!user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }
    dbState = loadDatabase();
    const notifications = (dbState.notifications || []).filter(n => n.userId === user.id).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    res.json({ success: true, notifications });
  });

  // PUT Mark Notification as read
  app.put('/api/notifications/:id/read', (req, res) => {
    const user = getAuthUser(req);
    if (!user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }
    dbState = loadDatabase();
    dbState.notifications = dbState.notifications || [];
    const notif = dbState.notifications.find(n => n.id === req.params.id && n.userId === user.id);
    if (notif) {
      notif.isRead = true;
      saveDatabase(dbState);
    }
    res.json({ success: true });
  });
  
  // PUT Mark all Notifications as read
  app.put('/api/notifications/read-all', (req, res) => {
    const user = getAuthUser(req);
    if (!user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }
    dbState = loadDatabase();
    dbState.notifications = dbState.notifications || [];
    dbState.notifications.forEach(n => {
      if (n.userId === user.id) n.isRead = true;
    });
    saveDatabase(dbState);
    res.json({ success: true });
  });


  // VITE DEV / PRODUCTION MIDDLEWARE INTEGRATION

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[SPMS SERVER] running on http://localhost:${PORT} with Node ${process.version}`);
  });
}

startServer().catch(err => {
  console.error('[SPMS SERVER] Failed to start:', err);
});
