// Default Maintenance User Profile
export const DEFAULT_USER_PROFILE = {
  id: "EMP-102",
  name: "Alexander Vance",
  email: "a.vance@maintenx.ind",
  phone: "+1 (555) 392-8819",
  role: "Senior Reliability Technician & Maintenance Lead",
  department: "Plant Maintenance & Engineering",
  plant: "Plant 1 - North Facility",
  shift: "Shift A (06:00 - 14:30)",
  avatar: "AV",
  bio: "Senior Maintenance Specialist with 12+ years experience in rotary packaging machinery, condition monitoring, hydraulic loops, and predictive maintenance.",
  joinedDate: "March 2018",
  certifications: [
    { title: "CMRP (Certified Maintenance & Reliability Professional)", issuer: "SMRP", year: "2022", badge: "Gold" },
    { title: "ISO 18436 Vibration Analyst Cat II", issuer: "Mobius Institute", year: "2023", badge: "Blue" },
    { title: "NFPA 70E Arc Flash Electrical Safety", issuer: "OSHA Training", year: "2024", badge: "Red" },
    { title: "Level 4 Lockout / Tagout (LOTO) Master", issuer: "FlowState Safety", year: "2025", badge: "Green" }
  ],
  skills: [
    { name: "Vibration Spectral Analysis", level: "Expert (95%)" },
    { name: "Laser Shaft Alignment", level: "Expert (92%)" },
    { name: "Hydraulic System Diagnostics", level: "Advanced (88%)" },
    { name: "PLC Diagnostics (Siemens/Rockwell)", level: "Advanced (85%)" },
    { name: "Rotary Packaging Machinery", level: "Master (98%)" },
    { name: "Root Cause Failure Analysis (RCFA)", level: "Advanced (90%)" }
  ],
  assignedAssets: ["FM-001 (Rotary Filler)", "AC-505 (Air Compressor)", "PK-401 (Fanuc Palletizer)"],
  activeWorkOrdersCount: 2,
  completedWOsThisYear: 142,
  pmComplianceContribution: "98.4%",
  preferences: {
    emailAlerts: true,
    smsUrgentAlerts: true,
    soundNotifications: true,
    autoRefreshIntervalSecs: 5,
    darkMode: true
  }
};
