import fs from 'fs';
import path from 'path';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc, setDoc, terminate } from 'firebase/firestore';
import { User, StudentProfile, CompanyProfile, Job, Application, Interview, AnalyticsStats, Department, Notification } from '../src/types.js';

const DB_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DB_DIR, 'db.json');

// Initialize Firebase
let db: any = null;
try {
  const configPath = path.join(process.cwd(), 'firebase-applet-config.json');
  
  if (process.env.USE_FIRESTORE === 'true') {
    let firebaseConfig = null;
    
    // Check if config is provided via environment variable (easier for cloud platforms like Render)
    if (process.env.FIREBASE_CONFIG_JSON) {
      try {
        let jsonStr = process.env.FIREBASE_CONFIG_JSON;
        // Strip out any JavaScript variable assignment if the user accidentally pasted that
        if (jsonStr.includes('const firebaseConfig')) {
          jsonStr = jsonStr.replace(/const\s+firebaseConfig\s*=\s*/, '').replace(/;$/, '');
        }
        firebaseConfig = JSON.parse(jsonStr);
      } catch (err) {
        console.error('[Firebase] FIREBASE_CONFIG_JSON is invalid JSON. Ensure you only paste the JSON object starting with { and ending with }');
      }
    } 
    // Fallback to local file
    else if (fs.existsSync(configPath)) {
      firebaseConfig = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    }

    if (firebaseConfig) {
      const app = initializeApp(firebaseConfig);
      db = getFirestore(app);
      console.log('[Firebase] Initialized successfully');
    } else {
      console.error('[Firebase] Config missing. Provide FIREBASE_CONFIG_JSON env var or firebase-applet-config.json file.');
    }
  } else {
    console.log('[Firebase] Skipping Firestore initialization (USE_FIRESTORE is not set to true)');
  }
} catch (e) {
  console.error('[Firebase] Failed to initialize:', e);
}

export interface DatabaseSchema {
  users: User[];
  students: StudentProfile[];
  companies: CompanyProfile[];
  jobs: Job[];
  applications: Application[];
  interviews: Interview[];
  departments: Department[];
  notifications: Notification[];
}

// Initial seed data
const initialData: DatabaseSchema = {
  departments: [
    { id: 'dept_cs', name: 'Computer Science', code: 'CS' },
    { id: 'dept_it', name: 'Information Technology', code: 'IT' },
    { id: 'dept_ce', name: 'Computer Engineering', code: 'CE' },
    { id: 'dept_mech', name: 'Mechanical Engineering', code: 'ME' },
    { id: 'dept_ee', name: 'Electrical Engineering', code: 'EE' },
    { id: 'dept_ce_civil', name: 'Civil Engineering', code: 'CE' }
  ],
  notifications: [],
  users: [
    { id: 'usr_admin1', email: 'admin@college.edu', role: 'admin', name: 'System Administrator' },
    { id: 'usr_stud1', email: 'john@college.edu', role: 'student', name: 'John Doe' },
    { id: 'usr_stud2', email: 'priya@college.edu', role: 'student', name: 'Priya Sharma' },
    { id: 'usr_stud3', email: 'amit@college.edu', role: 'student', name: 'Amit Verma' },
    { id: 'usr_stud4', email: 'sid@college.edu', role: 'student', name: 'Siddharth Patel' },
    { id: 'usr_comp1', email: 'recruiter@google.com', role: 'company', name: 'Google Recruiter' },
    { id: 'usr_comp2', email: 'recruiter@tesla.com', role: 'company', name: 'Tesla Recruiter' },
    { id: 'usr_comp4', email: 'recruiter@infosys.com', role: 'company', name: 'Infosys Recruiter' }
  ],
  students: [
    {
      userId: 'usr_stud1',
      name: 'John Doe',
      email: 'john@college.edu',
      rollNumber: 'CS2023041',
      departmentId: 'dept_cs',
      department: 'Computer Science',
      cgpa: 8.45,
      tenthPercentage: 88.5,
      twelfthPercentage: 91.2,
      backlogs: 0,
      skills: ['React', 'TypeScript', 'Node.js', 'Express', 'Tailwind CSS', 'SQL'],
      projects: [
        {
          title: 'Campus Recruitment Portal',
          description: 'A full-stack placement tracking system with real-time analytics and student-employer matchmaking.',
          url: 'https://github.com/johndoe/campus-recruit'
        },
        {
          title: 'Smart Health Monitoring',
          description: 'IoT-based dashboard for checking real-time patient biometrics using WebSockets.',
          url: 'https://github.com/johndoe/smart-health'
        }
      ],
      resumeUrl: 'https://example.com/resumes/john_doe.pdf',
      placedStatus: 'Unplaced'
    },
    {
      userId: 'usr_stud2',
      name: 'Priya Sharma',
      email: 'priya@college.edu',
      rollNumber: 'IT2023089',
      departmentId: 'dept_it',
      department: 'Information Technology',
      cgpa: 9.12,
      tenthPercentage: 92.0,
      twelfthPercentage: 94.5,
      backlogs: 0,
      skills: ['Java', 'Spring Boot', 'PostgreSQL', 'Docker', 'Python', 'Machine Learning'],
      projects: [
        {
          title: 'E-Commerce Microservices',
          description: 'Scalable service-oriented architecture using Spring Cloud, Eureka, and Redis caching.',
          url: 'https://github.com/priya/micro-shop'
        }
      ],
      resumeUrl: 'https://example.com/resumes/priya_sharma.pdf',
      placedStatus: 'Placed',
      placementCompany: 'Google Inc',
      placementPackage: 22.5
    },
    {
      userId: 'usr_stud3',
      name: 'Amit Verma',
      email: 'amit@college.edu',
      rollNumber: 'CE2023012',
      departmentId: 'dept_ce',
      department: 'Computer Engineering',
      cgpa: 7.82,
      tenthPercentage: 81.0,
      twelfthPercentage: 83.2,
      backlogs: 0,
      skills: ['C++', 'Python', 'Django', 'MongoDB', 'Docker'],
      projects: [
        {
          title: 'AI Code Assistant',
          description: 'Fine-tuned LLM interface for code auto-completion and documentation generation.'
        }
      ],
      resumeUrl: 'https://example.com/resumes/amit_verma.pdf',
      placedStatus: 'Placed',
      placementCompany: 'Tesla Motors',
      placementPackage: 14.0
    },
    {
      userId: 'usr_stud4',
      name: 'Siddharth Patel',
      email: 'sid@college.edu',
      rollNumber: 'ME2023105',
      departmentId: 'dept_mech',
      department: 'Mechanical Engineering',
      cgpa: 8.10,
      tenthPercentage: 85.4,
      twelfthPercentage: 80.8,
      backlogs: 1,
      skills: ['SolidWorks', 'MATLAB', 'AutoCAD', 'Python', 'Ansys'],
      projects: [
        {
          title: 'Automated Solar Tracker',
          description: 'Designed a dual-axis solar tracking system using Arduino and light-dependent resistors.'
        }
      ],
      resumeUrl: 'https://example.com/resumes/sid_patel.pdf',
      placedStatus: 'Unplaced'
    }
  ],
  companies: [
    {
      userId: 'usr_comp1',
      name: 'Google Inc',
      email: 'recruiter@google.com',
      industry: 'Technology & Cloud',
      website: 'https://google.com',
      location: 'Mountain View, CA / Bangalore',
      description: 'Google LLC is an American multinational technology company focusing on artificial intelligence, search engine technology, online advertising, cloud computing, computer software, quantum computing, e-commerce, and consumer electronics.',
      isApproved: true
    },
    {
      userId: 'usr_comp2',
      name: 'Tesla Motors',
      email: 'recruiter@tesla.com',
      industry: 'Automotive & Energy',
      website: 'https://tesla.com',
      location: 'Austin, TX / Pune',
      description: 'Tesla, Inc. is an American multinational automotive and clean energy company headquartered in Austin, Texas, which designs and manufactures electric vehicles, battery energy storage from home to grid-scale, solar panels and solar roof tiles.',
      isApproved: true
    },
    {
      userId: 'usr_comp4',
      name: 'Infosys',
      email: 'recruiter@infosys.com',
      industry: 'Consulting & IT Services',
      website: 'https://infosys.com',
      location: 'Bangalore, India',
      description: 'Infosys Limited is an Indian multinational information technology company that provides business consulting, information technology and outsourcing services.',
      isApproved: false
    }
  ],
  jobs: [
    {
      id: 'job_google1',
      companyId: 'usr_comp1',
      companyName: 'Google Inc',
      title: 'Software Engineer - Frontend',
      description: '<p>Join Google as a Software Engineer inside our cloud console group. You will build highly responsive interfaces, work with modern frontend tech, and optimize system-wide components.</p>',
      requirements: ['Solid understanding of React and TypeScript', 'Strong data structure fundamentals', 'Experience with Tailwind CSS and performance tuning'],
      cgpaCutoff: 8.5,
      backlogsAllowed: 0,
      allowedDepartments: ['dept_cs', 'dept_it', 'dept_ce'],
      packageAmount: 22.5,
      jobType: 'Full-Time',
      location: 'Bangalore, India',
      workMode: 'Hybrid',
      postedDate: '2026-08-01',
      lastDateToApply: '2026-08-15',
      status: 'Open'
    },
    {
      id: 'job_tesla1',
      companyId: 'usr_comp2',
      companyName: 'Tesla Motors',
      title: 'Robotics Software Intern',
      description: '<p>Tesla is looking for robotics interns to support our Gigafactory automation loops. Work with motor drivers, control algorithms, and Python visual tracking pipelines.</p>',
      requirements: ['Excellent C++ and Python skills', 'Coursework or project experience in robotics / control systems', 'Familiarity with ROS (Robot Operating System)'],
      cgpaCutoff: 7.5,
      backlogsAllowed: 1,
      allowedDepartments: ['dept_cs', 'dept_ce', 'dept_mech', 'dept_ee'],
      packageAmount: 14.0,
      jobType: 'Internship',
      location: 'Austin, TX / Pune',
      workMode: 'On-Site',
      postedDate: '2026-08-02',
      lastDateToApply: '2026-08-20',
      status: 'Open'
    }
  ],
  applications: [
    {
      id: 'app_priya_google',
      jobId: 'job_google1',
      studentId: 'usr_stud2',
      studentName: 'Priya Sharma',
      studentRollNumber: 'IT2023089',
      studentDepartment: 'Information Technology',
      studentCgpa: 9.12,
      studentResumeUrl: 'https://example.com/resumes/priya_sharma.pdf',
      jobTitle: 'Software Engineer - Frontend',
      companyName: 'Google Inc',
      appliedDate: '2026-08-02',
      status: 'Placed',
      remarks: 'Outstanding performance across all coding rounds. Offered 22.5 LPA.'
    },
    {
      id: 'app_amit_tesla',
      jobId: 'job_tesla1',
      studentId: 'usr_stud3',
      studentName: 'Amit Verma',
      studentRollNumber: 'CE2023012',
      studentDepartment: 'Computer Engineering',
      studentCgpa: 7.82,
      studentResumeUrl: 'https://example.com/resumes/amit_verma.pdf',
      jobTitle: 'Robotics Software Intern',
      companyName: 'Tesla Motors',
      appliedDate: '2026-08-03',
      status: 'Placed',
      remarks: 'Strong embedded system knowledge and passionate presentation of his solar project.'
    },
    {
      id: 'app_john_google',
      jobId: 'job_google1',
      studentId: 'usr_stud1',
      studentName: 'John Doe',
      studentRollNumber: 'CS2023041',
      studentDepartment: 'Computer Science',
      studentCgpa: 8.45,
      studentResumeUrl: 'https://example.com/resumes/john_doe.pdf',
      jobTitle: 'Software Engineer - Frontend',
      companyName: 'Google Inc',
      appliedDate: '2026-08-02',
      status: 'Shortlisted',
      remarks: 'Selected for technical interview rounds.'
    }
  ],
  interviews: []
};

let dbStateCache: DatabaseSchema | null = null;

function seedIfNeeded(data: DatabaseSchema): DatabaseSchema {
  let modified = false;
  if (!data.students || data.students.length === 0) {
    data.students = initialData.students;
    modified = true;
  }
  if (!data.companies || data.companies.length === 0) {
    data.companies = initialData.companies;
    modified = true;
  }
  if (!data.users || data.users.length <= 1) {
    data.users = initialData.users;
    modified = true;
  }
  if (!data.jobs || data.jobs.length === 0) {
    data.jobs = initialData.jobs;
    modified = true;
  }
  if (!data.applications || data.applications.length === 0) {
    data.applications = initialData.applications;
    modified = true;
  }
  
  if (modified) {
    console.log('[Seed] Database populated with pre-loaded dummy data.');
    saveDatabase(data);
  }
  return data;
}

export async function initDatabase(): Promise<DatabaseSchema> {
  if (db) {
    try {
      console.log('[Firebase] Fetching state from Firestore...');
      const docSnap = await getDoc(doc(db, 'db', 'state'));
      if (docSnap.exists()) {
        dbStateCache = docSnap.data() as DatabaseSchema;
        
        // Ensure default arrays exist
        if (!dbStateCache.notifications) dbStateCache.notifications = [];
        if (!dbStateCache.departments) dbStateCache.departments = initialData.departments;
        
        console.log('[Firebase] State loaded from Firestore');
        return seedIfNeeded(dbStateCache);
      } else {
        console.log('[Firebase] No existing state found, creating default state');
        dbStateCache = initialData;
        await setDoc(doc(db, 'db', 'state'), initialData);
        return dbStateCache;
      }
    } catch (error) {
      console.error('[Firebase] Failed to fetch state from Firestore, falling back to local file', error);
      if (db) {
        try {
          await terminate(db);
        } catch (e) {
          // ignore terminate errors
        }
        db = null;
      }
      // Fallback
    }
  }

  // Local filesystem fallback
  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }

  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2), 'utf-8');
    dbStateCache = initialData;
    return initialData;
  }

  try {
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    const data = JSON.parse(raw) as DatabaseSchema;
    if (!data.notifications) data.notifications = [];
    if (!data.departments) data.departments = initialData.departments;
    dbStateCache = seedIfNeeded(data);
    return dbStateCache;
  } catch (error) {
    console.error('Error reading database file, resetting to defaults.', error);
    fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2), 'utf-8');
    dbStateCache = initialData;
    return initialData;
  }
}

export function loadDatabase(): DatabaseSchema {
  return dbStateCache || initialData;
}

export function saveDatabase(data: DatabaseSchema): void {
  dbStateCache = data;
  
  if (db) {
    // Save to Firestore asynchronously
    setDoc(doc(db, 'db', 'state'), data).catch(err => {
      console.error('[Firebase] Error saving to Firestore', err);
    });
  }
  
  // Also save locally as a backup
  try {
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving to local backup', err);
  }
}

// Analytics Generator
export function getAnalytics(dbState: DatabaseSchema): AnalyticsStats {
  const students = dbState.students;
  const companies = dbState.companies;
  const jobs = dbState.jobs;
  const apps = dbState.applications;

  const totalStudents = students.length;
  const placedStudents = students.filter(s => s.placedStatus === 'Placed').length;
  const unplacedStudents = totalStudents - placedStudents;
  const placementPercentage = totalStudents > 0 ? Math.round((placedStudents / totalStudents) * 100) : 0;

  const placedWithPkg = students.filter(s => s.placedStatus === 'Placed' && s.placementPackage);
  const averagePackage = placedWithPkg.length > 0
    ? Math.round((placedWithPkg.reduce((acc, s) => acc + (s.placementPackage || 0), 0) / placedWithPkg.length) * 10) / 10
    : 0;

  const highestPackage = placedWithPkg.length > 0
    ? Math.max(...placedWithPkg.map(s => s.placementPackage || 0))
    : 0;

  // Department Stats
  const departments = ['Computer Science', 'Information Technology', 'Electronics', 'Mechanical', 'Civil'];
  const departmentStats = departments.map(dept => {
    const deptStudents = students.filter(s => s.department === dept);
    const total = deptStudents.length;
    const placed = deptStudents.filter(s => s.placedStatus === 'Placed').length;
    
    const placedDept = deptStudents.filter(s => s.placedStatus === 'Placed' && s.placementPackage);
    const avgPkg = placedDept.length > 0
      ? Math.round((placedDept.reduce((acc, s) => acc + (s.placementPackage || 0), 0) / placedDept.length) * 10) / 10
      : 0;

    return {
      department: dept,
      total,
      placed,
      averagePackage: avgPkg
    };
  });

  // Company stats (grouped from applications where status = 'Placed')
  const selectedAppsByCompany: { [key: string]: { count: number, highestPackage: number } } = {};
  apps.filter(a => a.status === 'Placed').forEach(app => {
    // Find job to get package
    const job = jobs.find(j => j.id === app.jobId);
    const pkg = job ? job.packageAmount : 0;
    
    if (!selectedAppsByCompany[app.companyName]) {
      selectedAppsByCompany[app.companyName] = { count: 0, highestPackage: 0 };
    }
    selectedAppsByCompany[app.companyName].count += 1;
    selectedAppsByCompany[app.companyName].highestPackage = Math.max(selectedAppsByCompany[app.companyName].highestPackage, pkg);
  });

  const companyStats = Object.keys(selectedAppsByCompany).map(compName => ({
    companyName: compName,
    recruitedCount: selectedAppsByCompany[compName].count,
    packageAmount: selectedAppsByCompany[compName].highestPackage
  }));

  // Seed default items for companyStats if empty to make UI beautiful
  if (companyStats.length === 0) {
    companyStats.push(
      { companyName: 'Google Inc', recruitedCount: 1, packageAmount: 22.5 },
      { companyName: 'Tesla Motors', recruitedCount: 1, packageAmount: 14.0 }
    );
  }

  // Recent placements
  const recentPlacements = students
    .filter(s => s.placedStatus === 'Placed')
    .map(s => ({
      studentName: s.name,
      department: s.department,
      companyName: s.placementCompany || 'Unknown',
      packageAmount: s.placementPackage || 0
    }))
    .slice(-5);

  return {
    totalStudents,
    placedStudents,
    unplacedStudents,
    placementPercentage,
    averagePackage,
    highestPackage,
    departmentStats,
    companyStats,
    recentPlacements
  };
}
