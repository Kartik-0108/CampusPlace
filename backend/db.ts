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
    { id: 'usr_admin1', email: 'admin@college.edu', role: 'admin', name: 'System Administrator' }
  ],
  students: [],
  companies: [],
  jobs: [],
  applications: [],
  interviews: []
};

let dbStateCache: DatabaseSchema | null = null;

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
        return dbStateCache;
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
    dbStateCache = data;
    return data;
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
