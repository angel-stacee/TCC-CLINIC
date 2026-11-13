import { useState, type Dispatch, type FormEventHandler, type SetStateAction } from "react";
import { Modal, InputField, SelectField } from "./FieldsAndModals";

export interface StudentFormValues { student_id: string; first_name: string; middle_name: string; last_name: string; course: string; year_level: string; section: string; sex: string; birth_date: string; contact_number: string; address: string; }
export interface StaffFormValues { staff_id: string; first_name: string; middle_name: string; last_name: string; position: string; department: string; sex: string; birth_date: string; contact_number: string; address: string; }
export interface FacultyFormValues { employee_id: string; first_name: string; middle_name: string; last_name: string; position: string; department: string; sex: string; birth_date: string; contact_number: string; address: string; }

const COURSES = ["BSIT", "BSBA", "MidWifery", "BSHM", "BLIS", "BSED", "BSCRIM"];
const YEAR_LEVELS = ["1st Year", "2nd Year", "3rd Year", "4th Year"];
const SEX_OPTIONS = ["Male", "Female"];

// Student ID: strictly digits (numbers) only, no letters, no special characters!
const sanitizeStudentId = (val: string) => val.replace(/[^0-9]/g, "").slice(0, 15);

// Staff ID & Faculty Employee ID: alphanumeric and hyphens (e.g. STF-001, FAC-001)
const sanitizeEmployeeId = (val: string) => val.replace(/[^a-zA-Z0-9-]/g, "").toUpperCase().slice(0, 20);

// Disallow numbers and special characters for names (allows letters, spaces, hyphens, periods, apostrophes, and Philippine letters like ñ/Ñ)
const sanitizeName = (val: string) => val.replace(/[0-9]/g, "").replace(/[^a-zA-Z\sñÑ\-.']/g, "");

// Allow digits only (and optional leading +) for phone numbers
const sanitizePhone = (val: string) => val.replace(/[^0-9+]/g, "").slice(0, 15);

// Date constraints
const TODAY = new Date().toISOString().split("T")[0];
const MIN_BIRTH_DATE = "1920-01-01";

// Helper to validate complete date
const validateBirthDate = (d: string) => {
    if (!d || d.trim() === "") return "Birth date is required. Please enter a complete date (Month, Day, and Year).";
    if (!/^\d{4}-\d{2}-\d{2}$/.test(d)) return "Birth date is incomplete. Please enter the full Month, Day, and 4-digit Year.";
    const [y, m, day] = d.split("-").map(Number);
    const currYear = new Date().getFullYear();
    if (y < 1920 || y > currYear) return `Birth year must be between 1920 and ${currYear}.`;
    if (m < 1 || m > 12) return "Invalid month in birth date.";
    if (day < 1 || day > 31) return "Invalid day in birth date.";
    const dObj = new Date(d);
    if (isNaN(dObj.getTime()) || dObj > new Date()) return "Birth date cannot be in the future.";
    return null;
};

type StudentFormsProps = { showStudentForm: boolean; editingStudent: boolean; closeStudentForm: () => void; handleStudentSubmit: React.FormEventHandler<HTMLFormElement>; studentForm: StudentFormValues; setStudentForm: React.Dispatch<React.SetStateAction<StudentFormValues>>; saving: boolean; showStaffForm: boolean; editingStaff: boolean; closeStaffForm: () => void; handleStaffSubmit: React.FormEventHandler<HTMLFormElement>; staffForm: StaffFormValues; setStaffForm: React.Dispatch<React.SetStateAction<StaffFormValues>>; showFacultyForm: boolean; editingFaculty: boolean; closeFacultyForm: () => void; handleFacultySubmit: React.FormEventHandler<HTMLFormElement>; facultyForm: FacultyFormValues; setFacultyForm: React.Dispatch<React.SetStateAction<FacultyFormValues>>; };

export function StudentForms({ showStudentForm, editingStudent, closeStudentForm, handleStudentSubmit, studentForm, setStudentForm, saving, showStaffForm, editingStaff, closeStaffForm, handleStaffSubmit, staffForm, setStaffForm, showFacultyForm, editingFaculty, closeFacultyForm, handleFacultySubmit, facultyForm, setFacultyForm }: StudentFormsProps) {
    const [localError, setLocalError] = useState("");

    const onStudentSubmit: FormEventHandler<HTMLFormElement> = (e) => {
        e.preventDefault();
        setLocalError("");
        if (!studentForm.student_id || studentForm.student_id.trim() === "") {
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
        if (facultyForm.birth_date) {
            const dateErr = validateBirthDate(facultyForm.birth_date);
            if (dateErr) {
                setLocalError(dateErr);
                return;
            }
        }
        handleFacultySubmit(e);
    };

    const handleCloseStudent = () => {
        setLocalError("");
        closeStudentForm();
    };

    const handleCloseStaff = () => {
        setLocalError("");
        closeStaffForm();
    };

    const handleCloseFaculty = () => {
        setLocalError("");
        closeFacultyForm();
    };

    return (
        <>
{showStudentForm && (
                <Modal
                    title={
                        editingStudent
                            ? "Edit Student"
                            : "Add New Student"
                    }
                    onClose={handleCloseStudent}
                >
                    <form
                        onSubmit={onStudentSubmit}
                        className="p-6"
                    >
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
                                label="Student ID"
                                value={
                                    studentForm.student_id
                                }
                                onChange={(e) =>
                                    setStudentForm({
                                        ...studentForm,
                                        student_id:
                                            sanitizeStudentId(e.target.value),
                                    })
                                }
                                inputMode="numeric"
                                placeholder="e.g. 20241041"
                                maxLength={15}
                                required
                            />

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

                            <InputField
                                label="Section"
                                value={
                                    studentForm.section
                                }
                                onChange={(e) =>
                                    setStudentForm({
                                        ...studentForm,
                                        section:
                                            e.target.value,
                                    })
                                }
                                placeholder="Example: BSIT-3B"
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

                            <InputField
                                label="Birth Date"
                                type="date"
                                min={MIN_BIRTH_DATE}
                                max={TODAY}
                                value={
                                    studentForm.birth_date
                                }
                                onChange={(e) =>
                                    setStudentForm({
                                        ...studentForm,
                                        birth_date:
                                            e.target.value,
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
                                onClick={
                                    closeStudentForm
                                }
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
                                    : "Save Student"}
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
                            : "Add New Staff"
                    }
                    onClose={handleCloseStaff}
                >
                    <form
                        onSubmit={onStaffSubmit}
                        className="p-6"
                    >
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
                                label="Staff ID"
                                value={
                                    staffForm.staff_id
                                }
                                onChange={(e) =>
                                    setStaffForm({
                                        ...staffForm,
                                        staff_id:
                                            sanitizeEmployeeId(e.target.value),
                                    })
                                }
                                placeholder="e.g. STF-001"
                                required
                            />

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
                                required
                            />

                            <InputField
                                label="Position"
                                value={
                                    staffForm.position
                                }
                                onChange={(e) =>
                                    setStaffForm({
                                        ...staffForm,
                                        position:
                                            e.target.value,
                                    })
                                }
                                placeholder="Example: Clinic Staff"
                                required
                            />

                            <InputField
                                label="Department"
                                value={
                                    staffForm.department
                                }
                                onChange={(e) =>
                                    setStaffForm({
                                        ...staffForm,
                                        department:
                                            e.target.value,
                                    })
                                }
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

                            <InputField
                                label="Birth Date"
                                type="date"
                                min={MIN_BIRTH_DATE}
                                max={TODAY}
                                value={
                                    staffForm.birth_date
                                }
                                onChange={(e) =>
                                    setStaffForm({
                                        ...staffForm,
                                        birth_date:
                                            e.target.value,
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
                                onClick={
                                    closeStaffForm
                                }
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
                                    : "Save Staff"}
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
                            : "Add New Faculty"
                    }
                    onClose={handleCloseFaculty}
                >
                    <form
                        onSubmit={onFacultySubmit}
                        className="p-6"
                    >
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
                                label="Employee ID"
                                value={
                                    facultyForm.employee_id
                                }
                                onChange={(e) =>
                                    setFacultyForm({
                                        ...facultyForm,
                                        employee_id:
                                            sanitizeEmployeeId(e.target.value),
                                    })
                                }
                                required
                                placeholder="Example: FAC-001"
                            />


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
                                required
                            />


                            <InputField
                                label="Position"
                                value={
                                    facultyForm.position
                                }
                                onChange={(e) =>
                                    setFacultyForm({
                                        ...facultyForm,
                                        position:
                                            e.target.value,
                                    })
                                }
                                placeholder="Example: Instructor"
                                required
                            />


                            <InputField
                                label="Department"
                                value={
                                    facultyForm.department
                                }
                                onChange={(e) =>
                                    setFacultyForm({
                                        ...facultyForm,
                                        department:
                                            e.target.value,
                                    })
                                }
                                placeholder="Example: College of Information Technology"
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


                            <InputField
                                label="Birth Date"
                                type="date"
                                min={MIN_BIRTH_DATE}
                                max={TODAY}
                                value={
                                    facultyForm.birth_date
                                }
                                onChange={(e) =>
                                    setFacultyForm({
                                        ...facultyForm,
                                        birth_date:
                                            e.target.value,
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
                                onClick={
                                    closeFacultyForm
                                }
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
                                    : "Save Faculty"}
                            </button>
                        </div>
                    </form>
                </Modal>
            )}


        </>
    );
}
