// data.jsx — sample data for HMS. Medium realism: enough to feel real, not overwhelming.

const DEPARTMENTS = [
  { id: "CAR", name: "Cardiology", color: "accent" },
  { id: "NEU", name: "Neurology", color: "violet" },
  { id: "PED", name: "Pediatrics", color: "ok" },
  { id: "ORT", name: "Orthopedics", color: "warn" },
  { id: "GEN", name: "General Medicine", color: "accent" },
  { id: "EMR", name: "Emergency", color: "danger" },
];

const DOCTORS = [
  { id: "D-1042", name: "Dr. Amelia Okafor",    dept: "CAR", email: "a.okafor@hospital.org",   hue: 245 },
  { id: "D-1049", name: "Dr. Ravi Shankar",     dept: "CAR", email: "r.shankar@hospital.org",  hue: 170 },
  { id: "D-1067", name: "Dr. Helena Kravitz",   dept: "NEU", email: "h.kravitz@hospital.org",  hue: 295 },
  { id: "D-1072", name: "Dr. Marcus Laine",     dept: "NEU", email: "m.laine@hospital.org",    hue: 15 },
  { id: "D-1081", name: "Dr. Priya Sundaram",   dept: "PED", email: "p.sundaram@hospital.org", hue: 155 },
  { id: "D-1095", name: "Dr. Thomas Beaumont",  dept: "ORT", email: "t.beaumont@hospital.org", hue: 75 },
  { id: "D-1103", name: "Dr. Farah Yildiz",     dept: "GEN", email: "f.yildiz@hospital.org",   hue: 210 },
  { id: "D-1120", name: "Dr. Oliver Chen",      dept: "EMR", email: "o.chen@hospital.org",     hue: 25 },
];

const PATIENTS = [
  { id: "P-00412", name: "Eleanor Marsh",     dob: "1952-03-11", gender: "F", bloodType: "A+",  allergies: ["Penicillin", "Latex"], phone: "+1 (555) 203-4411", insurer: "Meridian Care", status: "admitted", mrn: "MRN-91204" },
  { id: "P-00538", name: "Tomás García",      dob: "1987-09-24", gender: "M", bloodType: "O-",  allergies: [], phone: "+1 (555) 308-2290", insurer: "BlueShield Nordic", status: "outpatient", mrn: "MRN-91338" },
  { id: "P-00604", name: "Yuki Tanaka",       dob: "2015-06-02", gender: "F", bloodType: "B+",  allergies: ["Sulfa drugs"], phone: "+1 (555) 402-1928", insurer: "PediaGuard", status: "outpatient", mrn: "MRN-91404" },
  { id: "P-00712", name: "Robert Whitfield",  dob: "1968-11-30", gender: "M", bloodType: "AB+", allergies: ["Aspirin", "Ibuprofen"], phone: "+1 (555) 501-8872", insurer: "Meridian Care", status: "admitted", mrn: "MRN-91512" },
  { id: "P-00819", name: "Amara Okonkwo",     dob: "1994-01-17", gender: "F", bloodType: "O+",  allergies: [], phone: "+1 (555) 617-4402", insurer: "NorthLine Health", status: "outpatient", mrn: "MRN-91619" },
  { id: "P-00903", name: "Henrik Sørensen",   dob: "1945-07-08", gender: "M", bloodType: "A-",  allergies: ["Codeine"], phone: "+1 (555) 705-3318", insurer: "Meridian Care", status: "admitted", mrn: "MRN-91703" },
  { id: "P-00981", name: "Sofia Mendes",      dob: "1980-04-22", gender: "F", bloodType: "A+",  allergies: ["Latex"], phone: "+1 (555) 811-6670", insurer: "BlueShield Nordic", status: "discharged", mrn: "MRN-91781" },
  { id: "P-01044", name: "Nathaniel Price",   dob: "2001-12-05", gender: "M", bloodType: "B-",  allergies: [], phone: "+1 (555) 902-5521", insurer: "NorthLine Health", status: "outpatient", mrn: "MRN-91844" },
  { id: "P-01127", name: "Isabella Moreau",   dob: "1973-02-14", gender: "F", bloodType: "AB-", allergies: ["Penicillin"], phone: "+1 (555) 104-7839", insurer: "Meridian Care", status: "admitted", mrn: "MRN-91927" },
  { id: "P-01203", name: "Declan O'Reilly",   dob: "1959-08-28", gender: "M", bloodType: "O+",  allergies: [], phone: "+1 (555) 215-9911", insurer: "Meridian Care", status: "outpatient", mrn: "MRN-92003" },
  { id: "P-01289", name: "Mei-Lin Zhou",      dob: "1998-10-03", gender: "F", bloodType: "O+",  allergies: [], phone: "+1 (555) 322-4410", insurer: "PediaGuard", status: "outpatient", mrn: "MRN-92089" },
  { id: "P-01356", name: "Jasper Nowak",      dob: "2012-05-19", gender: "M", bloodType: "A-",  allergies: ["Peanuts"], phone: "+1 (555) 440-1127", insurer: "PediaGuard", status: "outpatient", mrn: "MRN-92156" },
];

// Start-of-week (Mon) for current week
function startOfWeek(d) {
  const x = new Date(d);
  const day = x.getDay();
  const diff = (day === 0 ? -6 : 1 - day);
  x.setDate(x.getDate() + diff);
  x.setHours(0,0,0,0);
  return x;
}

// Build appointments anchored to this week. Times in minutes-from-9am (business hours 09:00-17:00).
const WEEK_START = startOfWeek(new Date());
const fmtDate = (d) => {
  const x = new Date(d);
  return x.toISOString().slice(0,10);
};
const dayOf = (offset) => fmtDate(new Date(WEEK_START.getTime() + offset*86400000));

const APPT_TYPES = {
  consultation: { label: "Consultation", cls: "" },
  followup:     { label: "Follow-up",    cls: "type-followup" },
  checkup:      { label: "Check-up",     cls: "type-checkup" },
  procedure:    { label: "Procedure",    cls: "type-procedure" },
  urgent:       { label: "Urgent",       cls: "type-urgent" },
};

// startMin = minutes from 09:00; dur = minutes. So 9:30 = 30, 14:00 = 300
const APPOINTMENTS = [
  // Mon
  { id: "A-10421", day: 0, startMin: 0,   dur: 30, doctorId: "D-1042", patientId: "P-00412", type: "followup",     room: "C-201", notes: "Post-op review; BP monitoring" },
  { id: "A-10422", day: 0, startMin: 60,  dur: 45, doctorId: "D-1042", patientId: "P-00712", type: "consultation", room: "C-201", notes: "Chest pain workup" },
  { id: "A-10423", day: 0, startMin: 180, dur: 30, doctorId: "D-1067", patientId: "P-00903", type: "followup",     room: "N-114", notes: "Migraine follow-up" },
  { id: "A-10424", day: 0, startMin: 30,  dur: 30, doctorId: "D-1081", patientId: "P-00604", type: "checkup",      room: "P-08",  notes: "Annual pediatric" },
  { id: "A-10425", day: 0, startMin: 240, dur: 60, doctorId: "D-1095", patientId: "P-01127", type: "procedure",    room: "O-302", notes: "Knee injection" },
  { id: "A-10426", day: 0, startMin: 330, dur: 30, doctorId: "D-1049", patientId: "P-00538", type: "consultation", room: "C-203", notes: "Initial cardiology" },

  // Tue
  { id: "A-10427", day: 1, startMin: 30,  dur: 60, doctorId: "D-1042", patientId: "P-01127", type: "consultation", room: "C-201", notes: "Arrhythmia assessment" },
  { id: "A-10428", day: 1, startMin: 120, dur: 30, doctorId: "D-1067", patientId: "P-01289", type: "consultation", room: "N-114", notes: "Headache evaluation" },
  { id: "A-10429", day: 1, startMin: 210, dur: 45, doctorId: "D-1072", patientId: "P-00903", type: "followup",     room: "N-116", notes: "Seizure med review" },
  { id: "A-10430", day: 1, startMin: 300, dur: 30, doctorId: "D-1081", patientId: "P-01356", type: "checkup",      room: "P-08",  notes: "Allergy follow-up" },
  { id: "A-10431", day: 1, startMin: 360, dur: 30, doctorId: "D-1103", patientId: "P-01044", type: "consultation", room: "G-04",  notes: "General consult" },

  // Wed — TODAY (many)
  { id: "A-10432", day: 2, startMin: 0,   dur: 30, doctorId: "D-1042", patientId: "P-00819", type: "checkup",      room: "C-201", notes: "Pre-employment screen" },
  { id: "A-10433", day: 2, startMin: 45,  dur: 45, doctorId: "D-1042", patientId: "P-00412", type: "followup",     room: "C-201", notes: "Post-admission" },
  { id: "A-10434", day: 2, startMin: 150, dur: 30, doctorId: "D-1042", patientId: "P-01203", type: "consultation", room: "C-201", notes: "Hypertension" },
  { id: "A-10435", day: 2, startMin: 60,  dur: 30, doctorId: "D-1067", patientId: "P-00538", type: "consultation", room: "N-114", notes: "Vertigo" },
  { id: "A-10436", day: 2, startMin: 180, dur: 60, doctorId: "D-1067", patientId: "P-00981", type: "procedure",    room: "N-201", notes: "EEG" },
  { id: "A-10437", day: 2, startMin: 30,  dur: 30, doctorId: "D-1081", patientId: "P-01289", type: "consultation", room: "P-08",  notes: "Asthma check" },
  { id: "A-10438", day: 2, startMin: 270, dur: 45, doctorId: "D-1081", patientId: "P-01356", type: "followup",     room: "P-08",  notes: "Allergy panel review" },
  { id: "A-10439", day: 2, startMin: 300, dur: 30, doctorId: "D-1095", patientId: "P-00712", type: "consultation", room: "O-302", notes: "Back pain" },
  { id: "A-10440", day: 2, startMin: 105, dur: 30, doctorId: "D-1095", patientId: "P-01044", type: "followup",     room: "O-302", notes: "Post-fracture" },
  { id: "A-10441", day: 2, startMin: 210, dur: 30, doctorId: "D-1103", patientId: "P-00412", type: "checkup",      room: "G-04",  notes: "General f/u" },
  { id: "A-10442", day: 2, startMin: 360, dur: 30, doctorId: "D-1120", patientId: "P-00903", type: "urgent",       room: "E-01",  notes: "Chest discomfort" },

  // Thu
  { id: "A-10443", day: 3, startMin: 30,  dur: 45, doctorId: "D-1042", patientId: "P-00538", type: "followup",     room: "C-201", notes: "Stress test results" },
  { id: "A-10444", day: 3, startMin: 150, dur: 30, doctorId: "D-1049", patientId: "P-01127", type: "consultation", room: "C-203", notes: "Second opinion" },
  { id: "A-10445", day: 3, startMin: 240, dur: 60, doctorId: "D-1067", patientId: "P-00903", type: "procedure",    room: "N-201", notes: "Lumbar puncture" },
  { id: "A-10446", day: 3, startMin: 60,  dur: 30, doctorId: "D-1081", patientId: "P-00604", type: "checkup",      room: "P-08",  notes: "Growth check" },
  { id: "A-10447", day: 3, startMin: 330, dur: 30, doctorId: "D-1081", patientId: "P-01356", type: "consultation", room: "P-08",  notes: "Rash" },
  { id: "A-10448", day: 3, startMin: 180, dur: 45, doctorId: "D-1095", patientId: "P-01044", type: "followup",     room: "O-302", notes: "Physio plan" },
  { id: "A-10449", day: 3, startMin: 300, dur: 30, doctorId: "D-1103", patientId: "P-00819", type: "consultation", room: "G-04",  notes: "Travel vaccines" },

  // Fri
  { id: "A-10450", day: 4, startMin: 30,  dur: 30, doctorId: "D-1042", patientId: "P-01289", type: "consultation", room: "C-201", notes: "Palpitations" },
  { id: "A-10451", day: 4, startMin: 120, dur: 60, doctorId: "D-1067", patientId: "P-00712", type: "procedure",    room: "N-201", notes: "EEG" },
  { id: "A-10452", day: 4, startMin: 210, dur: 30, doctorId: "D-1081", patientId: "P-01044", type: "checkup",      room: "P-08",  notes: "Sports physical" },
  { id: "A-10453", day: 4, startMin: 60,  dur: 30, doctorId: "D-1095", patientId: "P-00981", type: "followup",     room: "O-302", notes: "Post-surgery" },
  { id: "A-10454", day: 4, startMin: 300, dur: 45, doctorId: "D-1103", patientId: "P-01203", type: "consultation", room: "G-04",  notes: "Cholesterol" },
];

const ROOMS = [
  { id: "C-201", ward: "Cardiology",  type: "Private",  gender: "F", bed: "bed-1", patientId: "P-00412", since: "2026-04-14", cleanStatus: "ok" },
  { id: "C-202", ward: "Cardiology",  type: "Private",  gender: "M", bed: "bed-1", patientId: "P-00712", since: "2026-04-16", cleanStatus: "ok" },
  { id: "C-203", ward: "Cardiology",  type: "Shared",   gender: "F", bed: "bed-1", patientId: null,      since: null, cleanStatus: "ok" },
  { id: "C-204", ward: "Cardiology",  type: "Shared",   gender: "M", bed: "bed-1", patientId: "P-00903", since: "2026-04-17", cleanStatus: "ok" },
  { id: "C-205", ward: "Cardiology",  type: "Shared",   gender: "M", bed: "bed-2", patientId: null,      since: null, cleanStatus: "ok" },
  { id: "C-206", ward: "Cardiology",  type: "Private",  gender: "any", bed: "bed-1", patientId: null,    since: null, cleanStatus: "cleaning" },
  { id: "N-114", ward: "Neurology",   type: "Private",  gender: "F", bed: "bed-1", patientId: "P-01127", since: "2026-04-15", cleanStatus: "ok" },
  { id: "N-115", ward: "Neurology",   type: "Shared",   gender: "M", bed: "bed-1", patientId: null,      since: null, cleanStatus: "ok" },
  { id: "N-116", ward: "Neurology",   type: "Shared",   gender: "M", bed: "bed-2", patientId: null,      since: null, cleanStatus: "ok" },
  { id: "N-201", ward: "Neurology",   type: "ICU",      gender: "any", bed: "bed-1", patientId: null,    since: null, cleanStatus: "ok" },
  { id: "P-08",  ward: "Pediatrics",  type: "Shared",   gender: "any", bed: "bed-1", patientId: null,    since: null, cleanStatus: "ok" },
  { id: "P-09",  ward: "Pediatrics",  type: "Private",  gender: "any", bed: "bed-1", patientId: null,    since: null, cleanStatus: "ok" },
  { id: "P-10",  ward: "Pediatrics",  type: "Private",  gender: "any", bed: "bed-1", patientId: null,    since: null, cleanStatus: "maint" },
  { id: "O-302", ward: "Orthopedics", type: "Private",  gender: "F", bed: "bed-1", patientId: null,     since: null, cleanStatus: "ok" },
  { id: "O-303", ward: "Orthopedics", type: "Shared",   gender: "M", bed: "bed-1", patientId: null,      since: null, cleanStatus: "ok" },
  { id: "G-04",  ward: "General",     type: "Shared",   gender: "F", bed: "bed-1", patientId: null,      since: null, cleanStatus: "ok" },
  { id: "G-05",  ward: "General",     type: "Shared",   gender: "M", bed: "bed-1", patientId: null,      since: null, cleanStatus: "ok" },
  { id: "E-01",  ward: "Emergency",   type: "Trauma",   gender: "any", bed: "bed-1", patientId: null,    since: null, cleanStatus: "ok" },
];

const MEDICATIONS = [
  { id: "M-1001", name: "Amoxicillin 500mg",   class: "Antibiotic",    price: 12.40, stock: 847,  reorder: 200, interacts: ["Penicillin"] },
  { id: "M-1002", name: "Lisinopril 10mg",     class: "ACE Inhibitor", price: 8.20,  stock: 1240, reorder: 300 },
  { id: "M-1003", name: "Metformin 850mg",     class: "Antidiabetic",  price: 6.80,  stock: 2104, reorder: 500 },
  { id: "M-1004", name: "Atorvastatin 20mg",   class: "Statin",        price: 14.10, stock: 89,   reorder: 150, interacts: [] },
  { id: "M-1005", name: "Ibuprofen 400mg",     class: "NSAID",         price: 3.10,  stock: 4820, reorder: 800, interacts: ["Ibuprofen","NSAID"] },
  { id: "M-1006", name: "Warfarin 5mg",        class: "Anticoagulant", price: 22.40, stock: 312,  reorder: 100 },
  { id: "M-1007", name: "Salbutamol Inhaler",  class: "Bronchodilator",price: 18.90, stock: 44,   reorder: 80 },
  { id: "M-1008", name: "Paracetamol 500mg",   class: "Analgesic",     price: 2.40,  stock: 6340, reorder: 1000 },
  { id: "M-1009", name: "Ceftriaxone 1g IV",   class: "Antibiotic",    price: 34.50, stock: 212,  reorder: 80,  interacts: ["Penicillin"] },
  { id: "M-1010", name: "Codeine 30mg",        class: "Opioid",        price: 11.20, stock: 178,  reorder: 60,  interacts: ["Codeine"] },
  { id: "M-1011", name: "Aspirin 81mg",        class: "Antiplatelet",  price: 1.80,  stock: 3210, reorder: 500, interacts: ["Aspirin"] },
  { id: "M-1012", name: "Insulin Glargine",    class: "Hormone",       price: 48.70, stock: 18,   reorder: 50 },
];

const BILLS = [
  { id: "INV-88412", patientId: "P-00412", date: "2026-04-14", amount: 2840.50, status: "pending",  items: [
    { label: "Admission — Cardiology Private (3 days)", amount: 1800.00 },
    { label: "Cardiac consultation × 2", amount: 440.00 },
    { label: "ECG & bloodwork", amount: 380.50 },
    { label: "Medications", amount: 220.00 },
  ]},
  { id: "INV-88413", patientId: "P-00712", date: "2026-04-16", amount: 1420.00, status: "partial",  paid: 500, items: [
    { label: "Admission — Cardiology Private (2 days)", amount: 1200.00 },
    { label: "ECG", amount: 180.00 },
    { label: "Medications", amount: 40.00 },
  ]},
  { id: "INV-88414", patientId: "P-00903", date: "2026-04-17", amount: 3215.00, status: "pending",  items: [
    { label: "Admission — Neurology Shared (2 days)", amount: 960.00 },
    { label: "Neurology consultation", amount: 240.00 },
    { label: "Lumbar puncture + lab", amount: 1820.00 },
    { label: "Medications", amount: 195.00 },
  ]},
  { id: "INV-88415", patientId: "P-00981", date: "2026-04-10", amount: 890.00,  status: "paid", items: [
    { label: "Outpatient procedure — EEG", amount: 720.00 },
    { label: "Post-op consultation", amount: 170.00 },
  ]},
  { id: "INV-88416", patientId: "P-01127", date: "2026-04-15", amount: 1980.00, status: "pending",  items: [
    { label: "Admission — Neurology Private (3 days)", amount: 1680.00 },
    { label: "Consultation", amount: 220.00 },
    { label: "Medications", amount: 80.00 },
  ]},
  { id: "INV-88417", patientId: "P-00538", date: "2026-04-12", amount: 320.00, status: "paid", items: [
    { label: "Outpatient consultation", amount: 220.00 },
    { label: "ECG", amount: 100.00 },
  ]},
];

const AMBULANCES = [
  { id: "AMB-04", reg: "HMH-204-B", status: "available", driver: "L. Vasquez",    lastDispatch: "2026-04-17 14:20", mileage: 48210 },
  { id: "AMB-07", reg: "HMH-207-A", status: "dispatched", driver: "R. Karim",     lastDispatch: "Now — en route",    mileage: 32980, eta: "8 min" },
  { id: "AMB-09", reg: "HMH-209-C", status: "available", driver: "M. Johansson",  lastDispatch: "2026-04-17 09:45", mileage: 61340 },
  { id: "AMB-12", reg: "HMH-212-A", status: "maintenance", driver: "—",            lastDispatch: "2026-04-15 11:30", mileage: 104800 },
  { id: "AMB-14", reg: "HMH-214-B", status: "dispatched", driver: "D. Patel",     lastDispatch: "Now — returning",   mileage: 27490, eta: "22 min" },
  { id: "AMB-16", reg: "HMH-216-A", status: "available", driver: "S. Delacroix",  lastDispatch: "2026-04-16 22:10", mileage: 18220 },
];

const ACTIVITY = [
  { kind: "ok", t: "2 min ago", text: <>Bill <b>INV-88415</b> marked paid for Sofia Mendes — discharge cleared</> },
  { kind: "accent", t: "8 min ago", text: <>Appointment <b>A-10432</b> booked with Dr. Okafor for Amara Okonkwo</> },
  { kind: "warn", t: "14 min ago", text: <>Stock low: <b>Insulin Glargine</b> (18 units, reorder at 50)</> },
  { kind: "accent", t: "21 min ago", text: <>Patient <b>P-01356</b> registered — Jasper Nowak (Pediatrics)</> },
  { kind: "danger", t: "38 min ago", text: <>Allergy conflict prevented: Penicillin → Eleanor Marsh</> },
  { kind: "", t: "1 h ago", text: <>Ambulance <b>AMB-07</b> dispatched to 1840 Oak St</> },
  { kind: "ok", t: "1 h ago", text: <>Room <b>C-206</b> released — cleaning requested</> },
  { kind: "accent", t: "2 h ago", text: <>Prescription signed: Lisinopril 10mg for Declan O'Reilly</> },
];

// Export
Object.assign(window, {
  DEPARTMENTS, DOCTORS, PATIENTS, APPOINTMENTS, APPT_TYPES,
  ROOMS, MEDICATIONS, BILLS, AMBULANCES, ACTIVITY,
  WEEK_START, dayOf,
});
