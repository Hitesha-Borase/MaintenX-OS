// Labour / Manage People Data linked to database
export const INITIAL_EMPLOYEES = [];

export const LABOUR_DATA = {
  plannedLabour: 0,
  actualLabour: 0,
  availableLabour: 0,
  labourAllocationDirect: 0,
  labourAllocationIndirect: 0,
  labourUtilization: 0,
  labourProductivity: 0,
  labourProductivityTarget: 0,
  labourProductivityTrend: "0%",
  shifts: [],
  lines: []
};

export const LIVE_HB_RECORDS = [];

export const SKILLS_LIST = [];

export const TRAINING_PROGRAMS = [];

export const PRODUCTIVITY_METRICS = {
  averageProductivity: "0%",
  labourUtilization: "0%",
  overallUnitsPerHour: 0,
  targetUnitsPerHour: 0,
  totalHoursWorked: 0,
  totalOutputUnits: 0,
  byShift: [],
  byLine: [],
  trend: []
};

export const SHIFT_SCHEDULES = [];

export const SKILLS_MATRIX = [];
