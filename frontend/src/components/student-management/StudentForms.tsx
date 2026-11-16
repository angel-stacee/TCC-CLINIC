import { useState, type Dispatch, type FormEventHandler, type SetStateAction } from "react";
import { GraduationCap, BookOpen, Briefcase } from "lucide-react";
import { Modal, InputField, SelectField, DateOfBirthField } from "./FieldsAndModals";

export interface StudentFormValues { student_id: string; first_name: string; middle_name: string; last_name: string; course: string; year_level: string; section: string; sex: string; birth_date: string; contact_number: string; address: string; }
export interface StaffFormValues { staff_id: string; first_name: string; middle_name: string; last_name: string; position: string; department: string; sex: string; birth_date: string; contact_number: string; address: string; }
export interface FacultyFormValues { employee_id: string; first_name: string; middle_name: string; last_name: string; position: string; department: string; sex: string; birth_date: string; contact_number: string; address: string; }

const COURSES = ["BSIT", "BSBA", "MidWifery", "BSHM", "BLIS", "BSED", "BSCRIM"];
const YEAR_LEVELS = ["1st Year", "2nd Year", "3rd Year", "4th Year"];
const SECTIONS = [
    "Section A",
    "Section B",
    "Section C",
    "Section D",
    "Section E",
    "Section F",
    "1A", "1B", "1C", "1D",
    "2A", "2B", "2C", "2D",
    "3A", "3B", "3C", "3D",
    "4A", "4B", "4C", "4D",
];
const SEX_OPTIONS = ["Male", "Female"];

const FACULTY_POSITIONS = [
    "Instructor I",
    "Instructor II",
    "Instructor III",
    "Assistant Professor",
    "Associate Professor",
    "Professor",
    "Program Chair / Head",
    "College Dean",
    "Visiting Lecturer",
    "Part-Time Lecturer",
    "Faculty Member",
];

const STAFF_POSITIONS = [
    "Administrative Assistant",
    "Administrative Aide",
    "Office Clerk / Staff",
    "Guidance Counselor",
    "Clinic Nurse / Staff",
    "Security Officer / Guard",
    "Maintenance / Utility Staff",
    "IT / Technical Support Specialist",
    "Accounting Staff / Cashier",
    "Registrar Staff",
    "College Librarian / Library Staff",
    "Laboratory Custodian",
    "Staff Member",
];

const DEPARTMENTS = [
    "College of Information Technology (BSIT)",
    "College of Business Administration (BSBA)",
    "College of Hospitality Management (BSHM)",
    "College of Education (BSED)",
    "College of Criminal Justice Education (BSCRIM)",
    "College of Nursing & Midwifery",
    "Department of Library and Information Science (BLIS)",
    "Department of General Education",
    "Office of the College President",
    "Office of the College Registrar",
    "Health Services & Campus Clinic",
    "Office of Student Affairs & Services (OSAS)",
    "Guidance & Counseling Center",
    "Finance & Accounting Office",
    "Human Resource Management Office (HRMO)",
    "Management Information Systems (MIS / IT)",
    "College Library",
    "General Services & Maintenance",
    "Security & Safety Unit",
];

// All patient IDs (Student ID, Staff ID, Faculty Employee ID): strictly digits (numbers) only, no letters, no special characters!
const sanitizeNumericId = (val: string) => val.replace(/[^0-9]/g, "").slice(0, 15);

// Keydown handler allowing only numeric keys, control keys, and clipboard shortcuts
const allowOnlyDigitsKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (['Backspace', 'Delete', 'Tab', 'Escape', 'Enter', 'ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) {
        return;
    }
    if ((e.ctrlKey || e.metaKey) && ['a', 'c', 'v', 'x', 'z'].includes(e.key.toLowerCase())) {
        return;
    }
    if (!/^[0-9]$/.test(e.key)) {
        e.preventDefault();
    }
};

// Beforeinput handler for mobile / virtual keyboards and composition
const allowOnlyDigitsBeforeInput = (e: React.FormEvent<HTMLInputElement> & { data?: string }) => {
    if (e.data && !/^[0-9]+$/.test(e.data)) {
        e.preventDefault();
    }
};

// Disallow numbers and special characters for names (allows letters, spaces, hyphens, periods, apostrophes, and Philippine letters like ñ/Ñ)
const sanitizeName = (val: string) => val.replace(/[0-9]/g, "").replace(/[^a-zA-Z\sñÑ\-.']/g, "");

// Contact numbers: strictly digits (numbers) only, maximum of 11 numbers (e.g. 09123456789)
const sanitizePhone = (val: string) => val.replace(/[^0-9]/g, "").slice(0, 11);

// Date constraints
const TODAY = new Date().toISOString().split("T")[0];
const MIN_BIRTH_DATE = "1920-01-01";

// Helper to validate complete date
const validateBirthDate = (d: string) => {
    if (!d || d.trim() === "" || d.includes("--") || d.startsWith("-") || d.endsWith("-")) {
        return "Birth date is required. Please select a complete Month, Day, and Year.";
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(d)) return "Birth date is incomplete. Please select the full Month, Day, and 4-digit Year.";
    const [y, m, day] = d.split("-").map(Number);
    const currYear = new Date().getFullYear();
    if (y < 1920 || y > currYear) return `Birth year must be between 1920 and ${currYear}.`;
    if (m < 1 || m > 12) return "Invalid month in birth date.";
    if (day < 1 || day > 31) return "Invalid day in birth date.";
    const dObj = new Date(d);
    if (isNaN(dObj.getTime()) || dObj > new Date()) return "Birth date cannot be in the future.";
    return null;
};

type StudentFormsProps = {
    showStudentForm: boolean;
    editingStudent: boolean;
    closeStudentForm: () => void;
    handleStudentSubmit: React.FormEventHandler<HTMLFormElement>;
    studentForm: StudentFormValues;
    setStudentForm: React.Dispatch<React.SetStateAction<StudentFormValues>>;
    saving: boolean;
    showStaffForm: boolean;
    editingStaff: boolean;
    closeStaffForm: () => void;
    handleStaffSubmit: React.FormEventHandler<HTMLFormElement>;
    staffForm: StaffFormValues;
    setStaffForm: React.Dispatch<React.SetStateAction<StaffFormValues>>;
    showFacultyForm: boolean;
    editingFaculty: boolean;
    closeFacultyForm: () => void;
    handleFacultySubmit: React.FormEventHandler<HTMLFormElement>;
    facultyForm: FacultyFormValues;
    setFacultyForm: React.Dispatch<React.SetStateAction<FacultyFormValues>>;
    onSwitchCategory?: (cat: "student" | "faculty" | "staff") => void;
};

function PatientCategorySelector({
    activeCategory,
    onSelect,
}: {
    activeCategory: "student" | "faculty" | "staff";
    onSelect?: (cat: "student" | "faculty" | "staff") => void;
}) {
    if (!onSelect) return null;

    return (
        <div className="mb-5 rounded-2xl bg-[#f7f2eb] p-2 dark:bg-[#251f19] border border-[#e8dfd4] dark:border-[#382f25]">
            <div className="flex items-center justify-between px-2 pt-0.5 pb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
                    Patient Category
                </span>
                <span className="text-[11px] font-semibold text-[#8a6f50] dark:text-[#d3bca2]">
                    Select Record Type
                </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
                <button
                    type="button"
                    onClick={() => onSelect("student")}
                    className={`flex items-center justify-center gap-2 rounded-xl py-2.5 px-3 text-xs sm:text-sm font-bold transition-all ${
                        activeCategory === "student"
                            ? "bg-[#70091f] text-white shadow-md shadow-[#70091f]/20 scale-[1.01]"
                            : "bg-white/80 text-stone-600 hover:text-stone-900 hover:bg-white dark:bg-[#1a1612]/60 dark:text-stone-300 dark:hover:bg-[#1a1612]"
                    }`}
                >
                    <GraduationCap size={16} />
                    <span>Student</span>
                </button>
                <button
                    type="button"
                    onClick={() => onSelect("faculty")}
                    className={`flex items-center justify-center gap-2 rounded-xl py-2.5 px-3 text-xs sm:text-sm font-bold transition-all ${
                        activeCategory === "faculty"
                            ? "bg-[#70091f] text-white shadow-md shadow-[#70091f]/20 scale-[1.01]"
                            : "bg-white/80 text-stone-600 hover:text-stone-900 hover:bg-white dark:bg-[#1a1612]/60 dark:text-stone-300 dark:hover:bg-[#1a1612]"
                    }`}
                >
                    <BookOpen size={16} />
                    <span>Faculty</span>
                </button>
                <button
                    type="button"
                    onClick={() => onSelect("staff")}
                    className={`flex items-center justify-center gap-2 rounded-xl py-2.5 px-3 text-xs sm:text-sm font-bold transition-all ${
                        activeCategory === "staff"
                            ? "bg-[#70091f] text-white shadow-md shadow-[#70091f]/20 scale-[1.01]"
                            : "bg-white/80 text-stone-600 hover:text-stone-900 hover:bg-white dark:bg-[#1a1612]/60 dark:text-stone-300 dark:hover:bg-[#1a1612]"
                    }`}
                >
                    <Briefcase size={16} />
                    <span>Staff</span>
                </button>
            </div>
        </div>
    );
}

export function StudentForms({
    showStudentForm,
    editingStudent,
    closeStudentForm,
    handleStudentSubmit,
    studentForm,
    setStudentForm,
    saving,
    showStaffForm,
    editingStaff,
    closeStaffForm,
    handleStaffSubmit,
    staffForm,
    setStaffForm,
    showFacultyForm,
    editingFaculty,
    closeFacultyForm,
    handleFacultySubmit,
    facultyForm,
    setFacultyForm,
    onSwitchCategory,
}: StudentFormsProps) {
    const [localError, setLocalError] = useState("");

    const onStudentSubmit: FormEventHandler<HTMLFormElement> = (e) => {
        e.preventDefault();
        setLocalError("");
        if (!studentForm.student_id || studentForm.student_id.trim() === "" || !/^\d+$/.test(studentForm.student_id.trim())) {
            setLocalError("Please enter a valid Student ID (numbers only).");
            return;
        }
        const dateErr = validateBirthDate(studentForm.birth_date);
        if (dateErr) {
            setLocalError(dateErr);
            return;
        }
        handleStudentSubmit(e);
    };

    const onStaffSubmit: FormEventHandler<HTMLFormElement> = (e) => {
        e.preventDefault();
        setLocalError("");
        if (!staffForm.staff_id || staffForm.staff_id.trim() === "" || !/^\d+$/.test(staffForm.staff_id.trim())) {
            setLocalError("Please enter a valid Staff ID (numbers only).");
            return;
        }
        if (staffForm.birth_date) {
            const dateErr = validateBirthDate(staffForm.birth_date);
            if (dateErr) {
                setLocalError(dateErr);
                return;
            }
        }
        handleStaffSubmit(e);
    };

    const onFacultySubmit: FormEventHandler<HTMLFormElement> = (e) => {
        e.preventDefault();
        setLocalError("");
        if (!facultyForm.employee_id || facultyForm.employee_id.trim() === "" || !/^\d+$/.test(facultyForm.employee_id.trim())) {
            setLocalError("Please enter a valid Employee ID (numbers only).");
            return;
        }
        if (facultyForm.birth_date) {
            const dateErr = validateBirthDate(facultyForm.birth_date);
            if (dateErr) {
                setLocalError(dateErr);
                return;
            }
        }
        handleFacultySubmit(e);
    };

    const resetForms = () => {
        setLocalError("");
        setStudentForm({
            student_id: "",
            first_name: "",
            middle_name: "",
            last_name: "",
            course: "",
            year_level: "",
            section: "",
            sex: "",
            birth_date: "",
            contact_number: "",
            address: "",
        });
        setStaffForm({
            staff_id: "",
            first_name: "",
            middle_name: "",
            last_name: "",
            position: "",
            department: "",
            sex: "",
            birth_date: "",
            contact_number: "",
            address: "",
        });
        setFacultyForm({
            employee_id: "",
            first_name: "",
            middle_name: "",
            last_name: "",
            position: "",
            department: "",
            sex: "",
            birth_date: "",
            contact_number: "",
            address: "",
        });
    };

    const handleCloseStudent = () => {
        resetForms();
        closeStudentForm();
    };

    const handleCloseStaff = () => {
        resetForms();
        closeStaffForm();
    };

    const handleCloseFaculty = () => {
        resetForms();
        closeFacultyForm();
    };

    return (
        <>
{showStudentForm && (
                <Modal
                    title={
                        editingStudent
                            ? "Edit Student"
                            : "Add New Patient"
                    }
                    onClose={handleCloseStudent}
                >
                    <form
                        onSubmit={onStudentSubmit}
                        className="p-6"
                    >
                        {!editingStudent && (
                            <PatientCategorySelector
                                activeCategory="student"
                                onSelect={onSwitchCategory}
                            />
                        )}

                        {localError && (
                            <div className="mb-4 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-semibold text-red-700">
                                <svg className="h-4 w-4 shrink-0 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span>{localError}</span>
                            </div>
                        )}

                        <div className="grid gap-4 md:grid-cols-2">
                            <InputField
                                label="First Name"
                                value={
                                    studentForm.first_name
                                }
                                onChange={(e) =>
                                    setStudentForm({
                                        ...studentForm,
                                        first_name:
                                            sanitizeName(e.target.value),
                                    })
                                }
                                onKeyDown={(e) => {
                                    if (/^[0-9]$/.test(e.key)) {
                                        e.preventDefault();
                                    }
                                }}
                                required
                            />

                            <InputField
                                label="Last Name"
                                value={
                                    studentForm.last_name
                                }
                                onChange={(e) =>
                                    setStudentForm({
                                        ...studentForm,
                                        last_name:
                                            sanitizeName(e.target.value),
                                    })
                                }
                                onKeyDown={(e) => {
                                    if (/^[0-9]$/.test(e.key)) {
                                        e.preventDefault();
                                    }
                                }}
                                required
                            />

                            <InputField
                                label="Middle Name"
                                value={
                                    studentForm.middle_name
                                }
                                onChange={(e) =>
                                    setStudentForm({
                                        ...studentForm,
                                        middle_name:
                                            sanitizeName(e.target.value),
                                    })
                                }
                                onKeyDown={(e) => {
                                    if (/^[0-9]$/.test(e.key)) {
                                        e.preventDefault();
                                    }
                                }}
                            />

                            <InputField
                                label="Student ID"
                                value={
                                    studentForm.student_id
                                }
                                onChange={(e) =>
                                    setStudentForm({
                                        ...studentForm,
                                        student_id:
                                            sanitizeNumericId(e.target.value),
                                    })
                                }
                                onKeyDown={allowOnlyDigitsKeyDown}
                                onBeforeInput={allowOnlyDigitsBeforeInput}
                                onPaste={(e) => {
                                    e.preventDefault();
                                    const text = e.clipboardData.getData("text").replace(/[^0-9]/g, "").slice(0, 15);
                                    setStudentForm({ ...studentForm, student_id: text });
                                }}
                                inputMode="numeric"
                                pattern="[0-9]*"
                                placeholder="e.g. 20241041"
                                maxLength={15}
                                required
                            />

                            <SelectField
                                label="Course"
                                value={
                                    studentForm.course
                                }
                                onChange={(e) =>
                                    setStudentForm({
                                        ...studentForm,
                                        course:
                                            e.target.value,
                                    })
                                }
                                options={COURSES}
                                required
                            />

                            <SelectField
                                label="Year Level"
                                value={
                                    studentForm.year_level
                                }
                                onChange={(e) =>
                                    setStudentForm({
                                        ...studentForm,
                                        year_level:
                                            e.target.value,
                                    })
                                }
                                options={YEAR_LEVELS}
                                required
                            />

                            <SelectField
                                label="Section"
                                value={studentForm.section}
                                onChange={(e) =>
                                    setStudentForm({
                                        ...studentForm,
                                        section: e.target.value,
                                    })
                                }
                                options={SECTIONS}
                            />

                            <SelectField
                                label="Sex"
                                value={
                                    studentForm.sex
                                }
                                onChange={(e) =>
                                    setStudentForm({
                                        ...studentForm,
                                        sex:
                                            e.target.value,
                                    })
                                }
                                options={SEX_OPTIONS}
                                required
                            />

                            <DateOfBirthField
                                label="Birth Date"
                                value={studentForm.birth_date}
                                onChange={(val) =>
                                    setStudentForm({
                                        ...studentForm,
                                        birth_date: val,
                                    })
                                }
                                required
                            />

                            <InputField
                                label="Contact Number"
                                value={
                                    studentForm.contact_number
                                }
                                onChange={(e) =>
                                    setStudentForm({
                                        ...studentForm,
                                        contact_number:
                                            sanitizePhone(e.target.value),
                                    })
                                }
                                onKeyDown={allowOnlyDigitsKeyDown}
                                onBeforeInput={allowOnlyDigitsBeforeInput}
                                onPaste={(e) => {
                                    e.preventDefault();
                                    const text = e.clipboardData.getData("text").replace(/[^0-9]/g, "").slice(0, 11);
                                    setStudentForm({ ...studentForm, contact_number: text });
                                }}
                                type="text"
                                inputMode="numeric"
                                pattern="[0-9]*"
                                placeholder="e.g. 09123456789"
                                maxLength={11}
                                required
                            />

                            <div className="md:col-span-2">
                                <InputField
                                    label="Address"
                                    value={
                                        studentForm.address
                                    }
                                    onChange={(e) =>
                                        setStudentForm({
                                            ...studentForm,
                                            address:
                                                e.target.value,
                                        })
                                    }
                                    required
                                />
                            </div>
                        </div>

                        <div className="mt-6 flex justify-end gap-3 border-t pt-5">
                            <button
                                type="button"
                                onClick={handleCloseStudent}
                                disabled={saving}
                                className="rounded-lg border border-stone-300 px-4 py-2.5 text-sm font-medium text-stone-700 hover:bg-stone-50"
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                disabled={saving}
                                className="rounded-lg bg-amber-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-amber-700"
                            >
                                {editingStudent
                                    ? "Update Student"
                                    : "Save Patient"}
                            </button>
                        </div>
                    </form>
                </Modal>
            )}





            {showStaffForm && (
                <Modal
                    title={
                        editingStaff
                            ? "Edit Staff"
                            : "Add New Patient"
                    }
                    onClose={handleCloseStaff}
                >
                    <form
                        onSubmit={onStaffSubmit}
                        className="p-6"
                    >
                        {!editingStaff && (
                            <PatientCategorySelector
                                activeCategory="staff"
                                onSelect={onSwitchCategory}
                            />
                        )}

                        {localError && (
                            <div className="mb-4 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-semibold text-red-700">
                                <svg className="h-4 w-4 shrink-0 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span>{localError}</span>
                            </div>
                        )}

                        <div className="grid gap-4 md:grid-cols-2">
                            <InputField
                                label="First Name"
                                value={
                                    staffForm.first_name
                                }
                                onChange={(e) =>
                                    setStaffForm({
                                        ...staffForm,
                                        first_name:
                                            sanitizeName(e.target.value),
                                    })
                                }
                                onKeyDown={(e) => {
                                    if (/^[0-9]$/.test(e.key)) {
                                        e.preventDefault();
                                    }
                                }}
                                required
                            />

                            <InputField
                                label="Last Name"
                                value={
                                    staffForm.last_name
                                }
                                onChange={(e) =>
                                    setStaffForm({
                                        ...staffForm,
                                        last_name:
                                            sanitizeName(e.target.value),
                                    })
                                }
                                onKeyDown={(e) => {
                                    if (/^[0-9]$/.test(e.key)) {
                                        e.preventDefault();
                                    }
                                }}
                                required
                            />

                            <InputField
                                label="Middle Name"
                                value={
                                    staffForm.middle_name
                                }
                                onChange={(e) =>
                                    setStaffForm({
                                        ...staffForm,
                                        middle_name:
                                            sanitizeName(e.target.value),
                                    })
                                }
                                onKeyDown={(e) => {
                                    if (/^[0-9]$/.test(e.key)) {
                                        e.preventDefault();
                                    }
                                }}
                            />

                            <InputField
                                label="Staff ID"
                                value={
                                    staffForm.staff_id
                                }
                                onChange={(e) =>
                                    setStaffForm({
                                        ...staffForm,
                                        staff_id:
                                            sanitizeNumericId(e.target.value),
                                    })
                                }
                                onKeyDown={allowOnlyDigitsKeyDown}
                                onBeforeInput={allowOnlyDigitsBeforeInput}
                                onPaste={(e) => {
                                    e.preventDefault();
                                    const text = e.clipboardData.getData("text").replace(/[^0-9]/g, "").slice(0, 15);
                                    setStaffForm({ ...staffForm, staff_id: text });
                                }}
                                inputMode="numeric"
                                pattern="[0-9]*"
                                placeholder="e.g. 10023"
                                maxLength={15}
                                required
                            />

                            <SelectField
                                label="Position"
                                value={staffForm.position}
                                onChange={(e) =>
                                    setStaffForm({
                                        ...staffForm,
                                        position: e.target.value,
                                    })
                                }
                                options={STAFF_POSITIONS}
                                required
                            />

                            <SelectField
                                label="Department"
                                value={staffForm.department}
                                onChange={(e) =>
                                    setStaffForm({
                                        ...staffForm,
                                        department: e.target.value,
                                    })
                                }
                                options={DEPARTMENTS}
                            />

                            <SelectField
                                label="Sex"
                                value={
                                    staffForm.sex
                                }
                                onChange={(e) =>
                                    setStaffForm({
                                        ...staffForm,
                                        sex:
                                            e.target.value,
                                    })
                                }
                                options={SEX_OPTIONS}
                            />

                            <DateOfBirthField
                                label="Birth Date"
                                value={staffForm.birth_date}
                                onChange={(val) =>
                                    setStaffForm({
                                        ...staffForm,
                                        birth_date: val,
                                    })
                                }
                            />

                            <InputField
                                label="Contact Number"
                                value={
                                    staffForm.contact_number
                                }
                                onChange={(e) =>
                                    setStaffForm({
                                        ...staffForm,
                                        contact_number:
                                            sanitizePhone(e.target.value),
                                    })
                                }
                                onKeyDown={allowOnlyDigitsKeyDown}
                                onBeforeInput={allowOnlyDigitsBeforeInput}
                                onPaste={(e) => {
                                    e.preventDefault();
                                    const text = e.clipboardData.getData("text").replace(/[^0-9]/g, "").slice(0, 11);
                                    setStaffForm({ ...staffForm, contact_number: text });
                                }}
                                type="text"
                                inputMode="numeric"
                                pattern="[0-9]*"
                                placeholder="e.g. 09123456789"
                                maxLength={11}
                            />

                            <div className="md:col-span-2">
                                <InputField
                                    label="Address"
                                    value={
                                        staffForm.address
                                    }
                                    onChange={(e) =>
                                        setStaffForm({
                                            ...staffForm,
                                            address:
                                                e.target.value,
                                        })
                                    }
                                />
                            </div>
                        </div>

                        <div className="mt-6 flex justify-end gap-3 border-t pt-5">
                            <button
                                type="button"
                                onClick={handleCloseStaff}
                                disabled={saving}
                                className="rounded-lg border border-stone-300 px-4 py-2.5 text-sm font-medium text-stone-700 hover:bg-stone-50"
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                disabled={saving}
                                className="rounded-lg bg-amber-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-amber-700"
                            >
                                {editingStaff
                                    ? "Update Staff"
                                    : "Save Patient"}
                            </button>
                        </div>
                    </form>
                </Modal>
            )}





            {showFacultyForm && (
                <Modal
                    title={
                        editingFaculty
                            ? "Edit Faculty"
                            : "Add New Patient"
                    }
                    onClose={handleCloseFaculty}
                >
                    <form
                        onSubmit={onFacultySubmit}
                        className="p-6"
                    >
                        {!editingFaculty && (
                            <PatientCategorySelector
                                activeCategory="faculty"
                                onSelect={onSwitchCategory}
                            />
                        )}

                        {localError && (
                            <div className="mb-4 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-semibold text-red-700">
                                <svg className="h-4 w-4 shrink-0 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span>{localError}</span>
                            </div>
                        )}

                        <div className="grid gap-4 md:grid-cols-2">
                            <InputField
                                label="First Name"
                                value={
                                    facultyForm.first_name
                                }
                                onChange={(e) =>
                                    setFacultyForm({
                                        ...facultyForm,
                                        first_name:
                                            sanitizeName(e.target.value),
                                    })
                                }
                                onKeyDown={(e) => {
                                    if (/^[0-9]$/.test(e.key)) {
                                        e.preventDefault();
                                    }
                                }}
                                required
                            />

                            <InputField
                                label="Last Name"
                                value={
                                    facultyForm.last_name
                                }
                                onChange={(e) =>
                                    setFacultyForm({
                                        ...facultyForm,
                                        last_name:
                                            sanitizeName(e.target.value),
                                    })
                                }
                                onKeyDown={(e) => {
                                    if (/^[0-9]$/.test(e.key)) {
                                        e.preventDefault();
                                    }
                                }}
                                required
                            />

                            <InputField
                                label="Middle Name"
                                value={
                                    facultyForm.middle_name
                                }
                                onChange={(e) =>
                                    setFacultyForm({
                                        ...facultyForm,
                                        middle_name:
                                            sanitizeName(e.target.value),
                                    })
                                }
                                onKeyDown={(e) => {
                                    if (/^[0-9]$/.test(e.key)) {
                                        e.preventDefault();
                                    }
                                }}
                            />

                            <InputField
                                label="Employee ID"
                                value={
                                    facultyForm.employee_id
                                }
                                onChange={(e) =>
                                    setFacultyForm({
                                        ...facultyForm,
                                        employee_id:
                                            sanitizeNumericId(e.target.value),
                                    })
                                }
                                onKeyDown={allowOnlyDigitsKeyDown}
                                onBeforeInput={allowOnlyDigitsBeforeInput}
                                onPaste={(e) => {
                                    e.preventDefault();
                                    const text = e.clipboardData.getData("text").replace(/[^0-9]/g, "").slice(0, 15);
                                    setFacultyForm({ ...facultyForm, employee_id: text });
                                }}
                                inputMode="numeric"
                                pattern="[0-9]*"
                                placeholder="e.g. 20045"
                                maxLength={15}
                                required
                            />


                            <SelectField
                                label="Position"
                                value={facultyForm.position}
                                onChange={(e) =>
                                    setFacultyForm({
                                        ...facultyForm,
                                        position: e.target.value,
                                    })
                                }
                                options={FACULTY_POSITIONS}
                                required
                            />

                            <SelectField
                                label="Department"
                                value={facultyForm.department}
                                onChange={(e) =>
                                    setFacultyForm({
                                        ...facultyForm,
                                        department: e.target.value,
                                    })
                                }
                                options={DEPARTMENTS}
                            />


                            <SelectField
                                label="Sex"
                                value={
                                    facultyForm.sex
                                }
                                onChange={(e) =>
                                    setFacultyForm({
                                        ...facultyForm,
                                        sex:
                                            e.target.value,
                                    })
                                }
                                options={SEX_OPTIONS}
                            />


                            <DateOfBirthField
                                label="Birth Date"
                                value={facultyForm.birth_date}
                                onChange={(val) =>
                                    setFacultyForm({
                                        ...facultyForm,
                                        birth_date: val,
                                    })
                                }
                            />


                            <InputField
                                label="Contact Number"
                                value={
                                    facultyForm.contact_number
                                }
                                onChange={(e) =>
                                    setFacultyForm({
                                        ...facultyForm,
                                        contact_number:
                                            sanitizePhone(e.target.value),
                                    })
                                }
                                onKeyDown={allowOnlyDigitsKeyDown}
                                onBeforeInput={allowOnlyDigitsBeforeInput}
                                onPaste={(e) => {
                                    e.preventDefault();
                                    const text = e.clipboardData.getData("text").replace(/[^0-9]/g, "").slice(0, 11);
                                    setFacultyForm({ ...facultyForm, contact_number: text });
                                }}
                                type="text"
                                inputMode="numeric"
                                pattern="[0-9]*"
                                placeholder="e.g. 09123456789"
                                maxLength={11}
                            />


                            <div className="md:col-span-2">
                                <InputField
                                    label="Address"
                                    value={
                                        facultyForm.address
                                    }
                                    onChange={(e) =>
                                        setFacultyForm({
                                            ...facultyForm,
                                            address:
                                                e.target.value,
                                        })
                                    }
                                />
                            </div>
                        </div>

                        <div className="mt-6 flex justify-end gap-3 border-t pt-5">
                            <button
                                type="button"
                                onClick={handleCloseFaculty}
                                disabled={saving}
                                className="rounded-lg border border-stone-300 px-4 py-2.5 text-sm font-medium text-stone-700 hover:bg-stone-50"
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                disabled={saving}
                                className="rounded-lg bg-amber-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-amber-700"
                            >
                                {editingFaculty
                                    ? "Update Faculty"
                                    : "Save Patient"}
                            </button>
                        </div>
                    </form>
                </Modal>
            )}


        </>
    );
}
