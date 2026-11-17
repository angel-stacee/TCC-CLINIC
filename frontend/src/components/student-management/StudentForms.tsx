import { useState, useEffect, useCallback, type Dispatch, type FormEventHandler, type SetStateAction } from "react";
import { GraduationCap, BookOpen, Briefcase } from "lucide-react";
import { Modal, InputField, SelectField, DateOfBirthField } from "./FieldsAndModals";
import api from "../../services/api";

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

export const verifyPatientIdUnique = async (
    id: string,
    category: "student" | "staff" | "faculty",
    excludeId?: number | null,
    localStudents: any[] = [],
    localStaff: any[] = [],
    localFaculties: any[] = []
): Promise<{ available: boolean; message?: string }> => {
    const cleanId = (id || "").trim();
    if (!cleanId) return { available: true };

    // 1. Instant check against loaded records in memory
    const studentMatch = localStudents.find(
        (s) => String(s.student_id).trim() === cleanId && (category !== "student" || s.id !== excludeId)
    );
    if (studentMatch) {
        const name = `${studentMatch.first_name || ""} ${studentMatch.last_name || ""}`.trim();
        return {
            available: false,
            message: `Student ID "${cleanId}" is already in use by student ${name || "record"}. Please enter a different ID.`,
        };
    }

    const staffMatch = localStaff.find(
        (st) => String(st.staff_id).trim() === cleanId && (category !== "staff" || st.id !== excludeId)
    );
    if (staffMatch) {
        const name = `${staffMatch.first_name || ""} ${staffMatch.last_name || ""}`.trim();
        return {
            available: false,
            message: `The ID "${cleanId}" is already in use by staff member ${name || "record"}. Please enter a different ID.`,
        };
    }

    const facultyMatch = localFaculties.find(
        (f) => String(f.employee_id).trim() === cleanId && (category !== "faculty" || f.id !== excludeId)
    );
    if (facultyMatch) {
        const name = `${facultyMatch.first_name || ""} ${facultyMatch.last_name || ""}`.trim();
        return {
            available: false,
            message: `The ID "${cleanId}" is already in use by faculty member ${name || "record"}. Please enter a different ID.`,
        };
    }

    // 2. Comprehensive check against database via API endpoint
    try {
        const res = await api.get("/patients/check-id", {
            params: {
                id: cleanId,
                category,
                exclude_id: excludeId || undefined,
            },
        });
        if (res.data && res.data.available === false) {
            return {
                available: false,
                message: res.data.message || `The ID "${cleanId}" is already registered. Please enter a different ID.`,
            };
        }
    } catch (err) {
        console.error("Unable to check patient ID via API:", err);
    }

    return { available: true };
};

function FormErrorBanner({ message }: { message: string }) {
    if (!message) return null;
    return (
        <div className="mb-4 flex items-start gap-2.5 rounded-xl border border-red-300 bg-red-50 p-3.5 text-xs font-semibold text-red-800 shadow-sm dark:border-red-800 dark:bg-red-950/40 dark:text-red-300">
            <svg className="h-5 w-5 shrink-0 text-red-600 dark:text-red-400 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div className="flex-1">
                <p className="font-bold text-red-900 dark:text-red-200">Patient ID / Validation Notice</p>
                <p className="mt-0.5 leading-relaxed">{message}</p>
            </div>
        </div>
    );
}

type StudentFormsProps = {
    showStudentForm: boolean;
    editingStudent: boolean;
    editingStudentId?: number | null;
    closeStudentForm: () => void;
    handleStudentSubmit: React.FormEventHandler<HTMLFormElement>;
    studentForm: StudentFormValues;
    setStudentForm: React.Dispatch<React.SetStateAction<StudentFormValues>>;
    saving: boolean;
    showStaffForm: boolean;
    editingStaff: boolean;
    editingStaffId?: number | null;
    closeStaffForm: () => void;
    handleStaffSubmit: React.FormEventHandler<HTMLFormElement>;
    staffForm: StaffFormValues;
    setStaffForm: React.Dispatch<React.SetStateAction<StaffFormValues>>;
    showFacultyForm: boolean;
    editingFaculty: boolean;
    editingFacultyId?: number | null;
    closeFacultyForm: () => void;
    handleFacultySubmit: React.FormEventHandler<HTMLFormElement>;
    facultyForm: FacultyFormValues;
    setFacultyForm: React.Dispatch<React.SetStateAction<FacultyFormValues>>;
    onSwitchCategory?: (cat: "student" | "faculty" | "staff") => void;
    serverError?: string;
    onClearServerError?: () => void;
    students?: any[];
    staff?: any[];
    faculties?: any[];
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
    editingStudentId,
    closeStudentForm,
    handleStudentSubmit,
    studentForm,
    setStudentForm,
    saving,
    showStaffForm,
    editingStaff,
    editingStaffId,
    closeStaffForm,
    handleStaffSubmit,
    staffForm,
    setStaffForm,
    showFacultyForm,
    editingFaculty,
    editingFacultyId,
    closeFacultyForm,
    handleFacultySubmit,
    facultyForm,
    setFacultyForm,
    onSwitchCategory,
    serverError,
    onClearServerError,
    students = [],
    staff = [],
    faculties = [],
}: StudentFormsProps) {
    const [localError, setLocalError] = useState("");
    const [idError, setIdError] = useState("");
    const [, setValidatingId] = useState(false);

    useEffect(() => {
        setLocalError("");
        setIdError("");
        onClearServerError?.();
    }, [showStudentForm, showStaffForm, showFacultyForm, onClearServerError]);

    const activeError = idError || localError || serverError || "";

    const checkIdUniqueness = useCallback(async (
        rawId: string,
        category: "student" | "staff" | "faculty",
        excludeId?: number | null
    ) => {
        const cleanId = (rawId || "").trim();
        if (!cleanId || !/^\d+$/.test(cleanId)) {
            return;
        }
        setValidatingId(true);
        try {
            const check = await verifyPatientIdUnique(cleanId, category, excludeId, students, staff, faculties);
            if (!check.available) {
                const msg = check.message || `ID "${cleanId}" is already in use by another patient. Please enter a different ID.`;
                setIdError(msg);
                setLocalError(msg);
            } else {
                setIdError("");
                setLocalError((prev) => (prev && prev.includes("already in use") ? "" : prev));
            }
        } finally {
            setValidatingId(false);
        }
    }, [students, staff, faculties]);

    const onStudentSubmit: FormEventHandler<HTMLFormElement> = async (e) => {
        e.preventDefault();
        setLocalError("");
        setIdError("");
        onClearServerError?.();

        const sId = studentForm.student_id ? studentForm.student_id.trim() : "";
        if (!sId || !/^\d+$/.test(sId)) {
            setLocalError("Please enter a valid Student ID (numbers only).");
            return;
        }
        const dateErr = validateBirthDate(studentForm.birth_date);
        if (dateErr) {
            setLocalError(dateErr);
            return;
        }

        const check = await verifyPatientIdUnique(sId, "student", editingStudentId, students, staff, faculties);
        if (!check.available) {
            const msg = check.message || `Student ID "${sId}" is already in use by another patient. Please enter a different ID.`;
            setIdError(msg);
            setLocalError(msg);
            return;
        }

        handleStudentSubmit(e);
    };

    const onStaffSubmit: FormEventHandler<HTMLFormElement> = async (e) => {
        e.preventDefault();
        setLocalError("");
        setIdError("");
        onClearServerError?.();

        const stId = staffForm.staff_id ? staffForm.staff_id.trim() : "";
        if (!stId || !/^\d+$/.test(stId)) {
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

        const check = await verifyPatientIdUnique(stId, "staff", editingStaffId, students, staff, faculties);
        if (!check.available) {
            const msg = check.message || `Staff ID "${stId}" is already in use by another patient. Please enter a different ID.`;
            setIdError(msg);
            setLocalError(msg);
            return;
        }

        handleStaffSubmit(e);
    };

    const onFacultySubmit: FormEventHandler<HTMLFormElement> = async (e) => {
        e.preventDefault();
        setLocalError("");
        setIdError("");
        onClearServerError?.();

        const fId = facultyForm.employee_id ? facultyForm.employee_id.trim() : "";
        if (!fId || !/^\d+$/.test(fId)) {
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

        const check = await verifyPatientIdUnique(fId, "faculty", editingFacultyId, students, staff, faculties);
        if (!check.available) {
            const msg = check.message || `Employee ID "${fId}" is already in use by another patient. Please enter a different ID.`;
            setIdError(msg);
            setLocalError(msg);
            return;
        }

        handleFacultySubmit(e);
    };

    const resetForms = () => {
        setLocalError("");
        setIdError("");
        onClearServerError?.();
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

    const isStudentFormEmpty = () => {
        return (
            !studentForm.student_id &&
            !studentForm.first_name &&
            !studentForm.middle_name &&
            !studentForm.last_name &&
            !studentForm.course &&
            !studentForm.year_level &&
            !studentForm.section &&
            !studentForm.sex &&
            !studentForm.birth_date &&
            !studentForm.contact_number &&
            !studentForm.address
        );
    };

    const isStaffFormEmpty = () => {
        return (
            !staffForm.staff_id &&
            !staffForm.first_name &&
            !staffForm.middle_name &&
            !staffForm.last_name &&
            !staffForm.position &&
            !staffForm.department &&
            !staffForm.sex &&
            !staffForm.birth_date &&
            !staffForm.contact_number &&
            !staffForm.address
        );
    };

    const isFacultyFormEmpty = () => {
        return (
            !facultyForm.employee_id &&
            !facultyForm.first_name &&
            !facultyForm.middle_name &&
            !facultyForm.last_name &&
            !facultyForm.position &&
            !facultyForm.department &&
            !facultyForm.sex &&
            !facultyForm.birth_date &&
            !facultyForm.contact_number &&
            !facultyForm.address
        );
    };

    const handleCancelStudent = () => {
        setLocalError("");
        if (isStudentFormEmpty() || editingStudent) {
            closeStudentForm();
        } else {
            resetForms();
        }
    };

    const handleCancelStaff = () => {
        setLocalError("");
        if (isStaffFormEmpty() || editingStaff) {
            closeStaffForm();
        } else {
            resetForms();
        }
    };

    const handleCancelFaculty = () => {
        setLocalError("");
        if (isFacultyFormEmpty() || editingFaculty) {
            closeFacultyForm();
        } else {
            resetForms();
        }
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

                        <FormErrorBanner message={activeError} />

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
                                onChange={(e) => {
                                    setIdError("");
                                    setLocalError("");
                                    onClearServerError?.();
                                    setStudentForm({
                                        ...studentForm,
                                        student_id:
                                            sanitizeNumericId(e.target.value),
                                    });
                                }}
                                onBlur={() => {
                                    if (studentForm.student_id) {
                                        checkIdUniqueness(studentForm.student_id, "student", editingStudentId);
                                    }
                                }}
                                onKeyDown={allowOnlyDigitsKeyDown}
                                onBeforeInput={allowOnlyDigitsBeforeInput}
                                onPaste={(e) => {
                                    e.preventDefault();
                                    const text = e.clipboardData.getData("text").replace(/[^0-9]/g, "").slice(0, 15);
                                    setStudentForm({ ...studentForm, student_id: text });
                                    setIdError("");
                                    setLocalError("");
                                    onClearServerError?.();
                                    if (text) {
                                        checkIdUniqueness(text, "student", editingStudentId);
                                    }
                                }}
                                inputMode="numeric"
                                pattern="[0-9]*"
                                placeholder="e.g. 20241041"
                                maxLength={15}
                                required
                                error={idError}
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
                                onClick={handleCancelStudent}
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

                        <FormErrorBanner message={activeError} />

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
                                onChange={(e) => {
                                    setIdError("");
                                    setLocalError("");
                                    onClearServerError?.();
                                    setStaffForm({
                                        ...staffForm,
                                        staff_id:
                                            sanitizeNumericId(e.target.value),
                                    });
                                }}
                                onBlur={() => {
                                    if (staffForm.staff_id) {
                                        checkIdUniqueness(staffForm.staff_id, "staff", editingStaffId);
                                    }
                                }}
                                onKeyDown={allowOnlyDigitsKeyDown}
                                onBeforeInput={allowOnlyDigitsBeforeInput}
                                onPaste={(e) => {
                                    e.preventDefault();
                                    const text = e.clipboardData.getData("text").replace(/[^0-9]/g, "").slice(0, 15);
                                    setStaffForm({ ...staffForm, staff_id: text });
                                    setIdError("");
                                    setLocalError("");
                                    onClearServerError?.();
                                    if (text) {
                                        checkIdUniqueness(text, "staff", editingStaffId);
                                    }
                                }}
                                inputMode="numeric"
                                pattern="[0-9]*"
                                placeholder="e.g. 10023"
                                maxLength={15}
                                required
                                error={idError}
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
                                onClick={handleCancelStaff}
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

                        <FormErrorBanner message={activeError} />

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
                                onChange={(e) => {
                                    setIdError("");
                                    setLocalError("");
                                    onClearServerError?.();
                                    setFacultyForm({
                                        ...facultyForm,
                                        employee_id:
                                            sanitizeNumericId(e.target.value),
                                    });
                                }}
                                onBlur={() => {
                                    if (facultyForm.employee_id) {
                                        checkIdUniqueness(facultyForm.employee_id, "faculty", editingFacultyId);
                                    }
                                }}
                                onKeyDown={allowOnlyDigitsKeyDown}
                                onBeforeInput={allowOnlyDigitsBeforeInput}
                                onPaste={(e) => {
                                    e.preventDefault();
                                    const text = e.clipboardData.getData("text").replace(/[^0-9]/g, "").slice(0, 15);
                                    setFacultyForm({ ...facultyForm, employee_id: text });
                                    setIdError("");
                                    setLocalError("");
                                    onClearServerError?.();
                                    if (text) {
                                        checkIdUniqueness(text, "faculty", editingFacultyId);
                                    }
                                }}
                                inputMode="numeric"
                                pattern="[0-9]*"
                                placeholder="e.g. 20045"
                                maxLength={15}
                                required
                                error={idError}
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
                                onClick={handleCancelFaculty}
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
