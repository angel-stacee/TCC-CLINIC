import type { ChangeEventHandler, ReactNode } from "react";

interface InputFieldProps {
    label: string;
    value: string | number | null | undefined;
    onChange: ChangeEventHandler<HTMLInputElement>;
    onKeyDown?: React.KeyboardEventHandler<HTMLInputElement>;
    onBeforeInput?: React.FormEventHandler<HTMLInputElement>;
    onPaste?: React.ClipboardEventHandler<HTMLInputElement>;
    type?: string;
    required?: boolean;
    placeholder?: string;
    disabled?: boolean;
    min?: string | number;
    max?: string | number;
    maxLength?: number;
    inputMode?: "none" | "text" | "decimal" | "numeric" | "tel" | "search" | "email" | "url";
    pattern?: string;
    error?: string;
}
interface SelectFieldProps { label: string; value: string | number | null | undefined; onChange: ChangeEventHandler<HTMLSelectElement>; options: string[]; required?: boolean; disabled?: boolean; }
interface ModalProps { children: ReactNode; onClose: () => void; title: string; maxWidth?: string; }
interface ConfirmationModalProps { open: boolean; title: string; message: string; confirmText?: string; cancelText?: string; danger?: boolean; loading?: boolean; onConfirm: () => void; onClose: () => void; }
interface InfoItemProps { label: string; value: ReactNode; }
interface RecordSectionProps { icon: ReactNode; title: string; children: ReactNode; }

export function InputField({
    label,
    value,
    onChange,
    onKeyDown,
    onBeforeInput,
    onPaste,
    type = "text",
    required = false,
    placeholder = "",
    disabled = false,
    min,
    max,
    maxLength,
    inputMode,
    pattern,
    error,
}: InputFieldProps) {
    return (
        <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-stone-700">
                {label}

                {required && (
                    <span className="ml-1 text-red-500">*</span>
                )}
            </label>

            <input
                type={type}
                value={value ?? ""}
                onChange={onChange}
                onKeyDown={onKeyDown}
                onBeforeInput={onBeforeInput}
                onPaste={onPaste}
                required={required}
                placeholder={placeholder}
                disabled={disabled}
                min={min}
                max={max}
                maxLength={maxLength}
                inputMode={inputMode}
                pattern={pattern}
                className={`w-full rounded-lg border ${
                    error ? "border-red-400 focus:border-red-500 focus:ring-red-100" : "border-stone-300 focus:border-amber-500 focus:ring-amber-100"
                } bg-white px-3 py-2.5 text-sm outline-none transition focus:ring-2 disabled:cursor-not-allowed disabled:bg-stone-100`}
            />

            {error && (
                <span className="text-xs text-red-500">{error}</span>
            )}
        </div>
    );
}

const MONTH_NAMES = [
    { value: "01", label: "January" },
    { value: "02", label: "February" },
    { value: "03", label: "March" },
    { value: "04", label: "April" },
    { value: "05", label: "May" },
    { value: "06", label: "June" },
    { value: "07", label: "July" },
    { value: "08", label: "August" },
    { value: "09", label: "September" },
    { value: "10", label: "October" },
    { value: "11", label: "November" },
    { value: "12", label: "December" },
];

export function DateOfBirthField({
    label = "Birth Date",
    value,
    onChange,
    required = false,
    error,
}: {
    label?: string;
    value: string;
    onChange: (dateStr: string) => void;
    required?: boolean;
    error?: string;
}) {
    const normalized = (value || "").replace(/\//g, "-");
    const rawParts = normalized.split("-");

    let selectedYear = "";
    let selectedMonth = "";
    let selectedDay = "";

    if (rawParts.length >= 3) {
        if (/^\d{4}$/.test(rawParts[0])) {
            // YYYY-MM-DD
            selectedYear = rawParts[0];
            selectedMonth = /^\d{1,2}$/.test(rawParts[1]) ? rawParts[1].padStart(2, "0") : "";
            selectedDay = /^\d{1,2}$/.test(rawParts[2]) ? rawParts[2].padStart(2, "0") : "";
        } else if (/^\d{4}$/.test(rawParts[2])) {
            // MM-DD-YYYY
            selectedYear = rawParts[2];
            selectedMonth = /^\d{1,2}$/.test(rawParts[0]) ? rawParts[0].padStart(2, "0") : "";
            selectedDay = /^\d{1,2}$/.test(rawParts[1]) ? rawParts[1].padStart(2, "0") : "";
        } else {
            selectedYear = /^\d{4}$/.test(rawParts[0]) ? rawParts[0] : "";
            selectedMonth = /^\d{1,2}$/.test(rawParts[1]) ? rawParts[1].padStart(2, "0") : "";
            selectedDay = /^\d{1,2}$/.test(rawParts[2]) ? rawParts[2].padStart(2, "0") : "";
        }
    } else if (rawParts.length === 2 && /^\d{4}$/.test(rawParts[0])) {
        selectedYear = rawParts[0];
        selectedMonth = /^\d{1,2}$/.test(rawParts[1]) ? rawParts[1].padStart(2, "0") : "";
    }

    const currentYear = new Date().getFullYear();
    const years: number[] = [];
    for (let y = currentYear; y >= 1930; y--) {
        years.push(y);
    }

    const maxDays = (() => {
        if (!selectedMonth) return 31;
        const m = parseInt(selectedMonth, 10);
        if (m === 2) {
            const y = parseInt(selectedYear, 10);
            if (!y) return 29;
            return (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0 ? 29 : 28;
        }
        return [4, 6, 9, 11].includes(m) ? 30 : 31;
    })();

    const handlePartChange = (part: "year" | "month" | "day", val: string) => {
        const y = part === "year" ? val : selectedYear;
        const m = part === "month" ? val : selectedMonth;
        let d = part === "day" ? val : selectedDay;

        // Auto-correct day if month changes and day exceeds maxDays
        if (d && m) {
            const monthNum = parseInt(m, 10);
            let limit = 31;
            if (monthNum === 2) {
                const yearNum = parseInt(y, 10);
                limit = yearNum && ((yearNum % 4 === 0 && yearNum % 100 !== 0) || yearNum % 400 === 0) ? 29 : 28;
            } else if ([4, 6, 9, 11].includes(monthNum)) {
                limit = 30;
            }
            if (parseInt(d, 10) > limit) {
                d = String(limit).padStart(2, "0");
            }
        }

        if (y && m && d) {
            onChange(`${y}-${m}-${d}`);
        } else if (y || m || d) {
            onChange(`${y || ""}-${m || ""}-${d || ""}`);
        } else {
            onChange("");
        }
    };

    return (
        <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-stone-700">
                {label}
                {required && <span className="ml-1 text-red-500">*</span>}
            </label>

            <div className="grid grid-cols-3 gap-2">
                <select
                    value={selectedMonth}
                    onChange={(e) => handlePartChange("month", e.target.value)}
                    required={required}
                    className={`w-full rounded-lg border ${
                        error ? "border-red-400 focus:border-red-500" : "border-stone-300 focus:border-amber-500"
                    } bg-white px-2 py-2.5 text-xs sm:text-sm outline-none transition focus:ring-2 focus:ring-amber-100`}
                >
                    <option value="">Month</option>
                    {MONTH_NAMES.map((m) => (
                        <option key={m.value} value={m.value}>
                            {m.label}
                        </option>
                    ))}
                </select>

                <select
                    value={selectedDay}
                    onChange={(e) => handlePartChange("day", e.target.value)}
                    required={required}
                    className={`w-full rounded-lg border ${
                        error ? "border-red-400 focus:border-red-500" : "border-stone-300 focus:border-amber-500"
                    } bg-white px-2 py-2.5 text-xs sm:text-sm outline-none transition focus:ring-2 focus:ring-amber-100`}
                >
                    <option value="">Day</option>
                    {Array.from({ length: maxDays }, (_, i) => String(i + 1).padStart(2, "0")).map((d) => (
                        <option key={d} value={d}>
                            {d}
                        </option>
                    ))}
                </select>

                <select
                    value={selectedYear}
                    onChange={(e) => handlePartChange("year", e.target.value)}
                    required={required}
                    className={`w-full rounded-lg border ${
                        error ? "border-red-400 focus:border-red-500" : "border-stone-300 focus:border-amber-500"
                    } bg-white px-2 py-2.5 text-xs sm:text-sm outline-none transition focus:ring-2 focus:ring-amber-100`}
                >
                    <option value="">Year</option>
                    {years.map((y) => (
                        <option key={y} value={String(y)}>
                            {y}
                        </option>
                    ))}
                </select>
            </div>

            {error && <span className="text-xs text-red-500">{error}</span>}
        </div>
    );
}







export function SelectField({
    label,
    value,
    onChange,
    options,
    required = false,
    disabled = false,
}: SelectFieldProps) {
    const stringVal = value !== null && value !== undefined && value !== "" ? String(value) : "";
    const allOptions = (stringVal && !options.includes(stringVal))
        ? [stringVal, ...options]
        : options;

    return (
        <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-stone-700">
                {label}

                {required && (
                    <span className="ml-1 text-red-500">*</span>
                )}
            </label>

            <select
                value={stringVal}
                onChange={onChange}
                required={required}
                disabled={disabled}
                className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-100 disabled:cursor-not-allowed disabled:bg-stone-100"
            >
                <option value="">
                    Select {label}
                </option>

                {allOptions.map((option) => (
                    <option key={option} value={option}>
                        {option}
                    </option>
                ))}
            </select>
        </div>
    );
}







export function Modal({
    children,
    onClose,
    title,
    maxWidth = "max-w-3xl",
}: ModalProps) {
    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
            onMouseDown={(e) => {
                if (e.target === e.currentTarget && onClose) {
                    onClose();
                }
            }}
        >
            <div
                className={`max-h-[90vh] w-full ${maxWidth} overflow-y-auto rounded-2xl bg-white shadow-xl`}
            >
                <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-white px-6 py-4">
                    <h2 className="text-lg font-semibold text-stone-800">
                        {title}
                    </h2>

                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-lg px-3 py-1 text-xl text-stone-500 hover:bg-stone-100 hover:text-stone-700"
                    >
                        ×
                    </button>
                </div>

                {children}
            </div>
        </div>
    );
}







export function ConfirmationModal({
    open,
    title,
    message,
    confirmText = "Confirm",
    cancelText = "Cancel",
    danger = false,
    loading = false,
    onConfirm,
    onClose,
}: ConfirmationModalProps) {
    if (!open) {
        return null;
    }

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/45 p-4 backdrop-blur-sm">
            <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl">
                <div className="flex items-start gap-4 px-6 py-5">
                    <div
                        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${
                            danger
                                ? "bg-red-100 text-red-600"
                                : "bg-amber-100 text-amber-600"
                        }`}
                    >
                        {danger ? (
                            <span className="text-2xl">!</span>
                        ) : (
                            <span className="text-xl">✓</span>
                        )}
                    </div>

                    <div className="min-w-0">
                        <h2 className="text-lg font-bold text-stone-800">
                            {title}
                        </h2>

                        <p className="mt-2 text-sm leading-6 text-stone-600">
                            {message}
                        </p>
                    </div>
                </div>

                <div className="flex flex-col-reverse gap-2 border-t border-stone-100 bg-stone-50 px-6 py-4 sm:flex-row sm:justify-end">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={loading}
                        className="rounded-lg border border-stone-300 bg-white px-5 py-2.5 text-sm font-medium text-stone-700 transition hover:bg-stone-100 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {cancelText}
                    </button>

                    <button
                        type="button"
                        onClick={onConfirm}
                        disabled={loading}
                        className={`rounded-lg px-5 py-2.5 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-60 ${
                            danger
                                ? "bg-red-600 hover:bg-red-700"
                                : "bg-amber-600 hover:bg-amber-700"
                        }`}
                    >
                        {loading ? "Processing..." : confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
}







export function InfoItem({ label, value }: InfoItemProps) {
    return (
        <div className="rounded-lg bg-stone-50 p-3">
            <p className="text-xs font-medium uppercase text-stone-400">
                {label}
            </p>

            <p className="mt-1 text-sm font-medium text-stone-800">
                {value || "-"}
            </p>
        </div>
    );
}







export function RecordSection({
    icon,
    title,
    children,
}: RecordSectionProps) {
    return (
        <div className="mb-6 last:mb-0">
            <div className="mb-3 flex items-center gap-2 border-b border-stone-100 pb-2">
                <span className="text-base leading-none">
                    {icon}
                </span>

                <h3 className="text-sm font-semibold uppercase tracking-wide text-stone-700">
                    {title}
                </h3>
            </div>

            {children}
        </div>
    );
}







