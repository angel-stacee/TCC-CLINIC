import type { Dispatch, SetStateAction } from "react";
import { Pencil, Search, Stethoscope, Trash2, X } from "lucide-react";

export interface VisitRecord { id: number | string; visit_date?: string | null; reason?: string | null; [key: string]: any; }
interface VisitPagination { current_page: number; last_page: number; total: number; per_page: number; }
interface ClinicVisitTableProps { search: string; setSearch: (value: string) => void; loading: boolean; pageLoading: boolean; filteredVisits: VisitRecord[]; getPatientName: (visit: VisitRecord) => { name: string; id?: string; type?: string }; getNurseName: (nurse: any) => string; getMedicineName: (medicine: any) => string; getMedicineUnit: (medicine: any) => string; formatDate: (date: string | null | undefined) => string; handleEdit: (visit: VisitRecord) => void; deleteVisit: VisitRecord | null; setDeleteVisit: Dispatch<SetStateAction<VisitRecord | null>>; handleDelete: () => void; visitPagination: VisitPagination; fetchVisits: (page?: number, searchTerm?: string) => Promise<void>; }

function renderReasonBadge(reason: string | null | undefined, symptoms?: string | null) {
    if (!reason || reason === "-") {
        return <span className="text-xs text-stone-400 italic">None</span>;
    }

    const r = reason.trim();
    const lower = r.toLowerCase();

    let colorStyle = "border-stone-200 bg-stone-100/90 text-stone-700 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-300";

    if (lower.includes("fever")) {
        colorStyle = "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-800/60 dark:bg-rose-950/50 dark:text-rose-300";
    } else if (lower.includes("headache")) {
        colorStyle = "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800/60 dark:bg-amber-950/50 dark:text-amber-300";
    } else if (lower.includes("dizziness")) {
        colorStyle = "border-indigo-200 bg-indigo-50 text-indigo-700 dark:border-indigo-800/60 dark:bg-indigo-950/50 dark:text-indigo-300";
    } else if (lower.includes("stomach") || lower.includes("abdominal")) {
        colorStyle = "border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-800/60 dark:bg-orange-950/50 dark:text-orange-300";
    } else if (lower.includes("cough") || lower.includes("cold")) {
        colorStyle = "border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-800/60 dark:bg-sky-950/50 dark:text-sky-300";
    } else if (lower.includes("injury") || lower.includes("wound") || lower.includes("pain")) {
        colorStyle = "border-purple-200 bg-purple-50 text-purple-700 dark:border-purple-800/60 dark:bg-purple-950/50 dark:text-purple-300";
    } else if (lower.includes("check-up") || lower.includes("first aid") || lower.includes("medication")) {
        colorStyle = "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800/60 dark:bg-emerald-950/50 dark:text-emerald-300";
    } else if (lower === "other") {
        colorStyle = "border-[#ebdcd5] bg-[#fdf5f3] text-[#70091f] dark:border-[#521320] dark:bg-[#70091f]/25 dark:text-[#f8a598]";
    }

    const displayText = lower === "other" && symptoms ? `Other · ${symptoms}` : r;

    return (
        <div className="flex flex-col items-start gap-0.5">
            <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold shadow-2xs ${colorStyle}`}>
                {displayText}
            </span>
            {lower !== "other" && symptoms && (
                <span className="max-w-[180px] truncate text-[10px] text-stone-500 pl-1 dark:text-stone-400" title={symptoms}>
                    {symptoms}
                </span>
            )}
        </div>
    );
}

export function ClinicVisitTable({ search, setSearch, loading, pageLoading, filteredVisits, getPatientName, getNurseName, getMedicineName, getMedicineUnit, formatDate, handleEdit, deleteVisit, setDeleteVisit, handleDelete, visitPagination, fetchVisits }: ClinicVisitTableProps) {
    return (
        <>

                <div className="overflow-hidden rounded-2xl border border-[#e8dfd4] bg-white shadow-sm">


                    <div className="flex flex-col gap-1 border-b border-[#e8dfd4] px-5 py-4 sm:flex-row sm:items-center sm:justify-between dark:border-stone-800">
                        <div>
                            <h2 className="text-base font-bold text-[#3d3329] dark:text-stone-100">
                                Clinic Visit Records
                            </h2>

                            <p className="mt-0.5 text-xs text-[#887d70] dark:text-stone-400">
                                Showing {filteredVisits.length} of {visitPagination.total} recorded visits
                            </p>
                        </div>
                    </div>


                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[1200px] text-left">

                            <thead>
                                <tr className="border-b border-[#e8dfd4] bg-[#fcfaf6]">

                                    <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wide text-[#887d70]">
                                        Patient
                                    </th>

                                    <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wide text-[#887d70]">
                                        Nurse on Duty
                                    </th>

                                    <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wide text-[#887d70]">
                                        Reason
                                    </th>

                                    <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wide text-[#887d70]">
                                        Visit Date
                                    </th>

                                    <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wide text-[#887d70]">
                                        Temperature
                                    </th>

                                    <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wide text-[#887d70]">
                                        Blood Pressure
                                    </th>

                                    <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wide text-[#887d70]">
                                        Treatment
                                    </th>

                                    <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wide text-[#887d70]">
                                        Medicine
                                    </th>

                                    <th className="px-5 py-3 text-right text-[10px] font-bold uppercase tracking-wide text-[#887d70]">
                                        Actions
                                    </th>

                                </tr>
                            </thead>

                            <tbody>

                                {pageLoading ? (
                                    <tr>
                                        <td
                                            colSpan={9}
                                            className="px-5 py-12 text-center text-xs text-[#887d70]"
                                        >
                                            Loading clinic visits...
                                        </td>
                                    </tr>
                                ) : filteredVisits.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={9}
                                            className="px-5 py-12 text-center"
                                        >
                                            <Stethoscope
                                                size={30}
                                                className="mx-auto mb-2 text-[#ded4c9]"
                                            />

                                            <p className="text-sm font-semibold text-[#54483a]">
                                                No clinic visits found
                                            </p>

                                            <p className="mt-1 text-xs text-[#887d70]">
                                                No clinic visit records match your search.
                                            </p>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredVisits.map(
                                        (visit) => {
                                            const patient =
                                                getPatientName(
                                                    visit
                                                );

                                            const medicineName =
                                                getMedicineName(
                                                    visit.medicine
                                                );

                                            return (
                                                <tr
                                                    key={visit.id}
                                                    className="border-b border-[#eee7de] transition hover:bg-[#fcfaf6]"
                                                >


                                                    <td className="px-5 py-3.5">
                                                        <p className="text-xs font-bold text-[#3c332a]">
                                                            {
                                                                patient.name
                                                            }
                                                        </p>

                                                        <p className="mt-0.5 text-[10px] text-[#887d70]">
                                                            {
                                                                patient.type
                                                            }

                                                            {patient.id
                                                                ? ` • ${patient.id}`
                                                                : ""}
                                                        </p>
                                                    </td>


                                                    <td className="px-5 py-3.5">
                                                        <p className="text-xs font-medium text-[#3c332a]">
                                                            {getNurseName(
                                                                visit.nurse
                                                            )}
                                                        </p>

                                                        {visit.nurse?.role && (
                                                            <p className="mt-0.5 text-[10px] text-[#887d70]">
                                                                {
                                                                    visit
                                                                        .nurse
                                                                        .role
                                                                }
                                                            </p>
                                                        )}
                                                    </td>


                                                    <td className="max-w-[200px] px-5 py-3.5">
                                                        {renderReasonBadge(visit.reason, visit.symptoms)}
                                                    </td>


                                                    <td className="px-5 py-3.5 text-xs text-[#766959]">
                                                        {formatDate(
                                                            visit.visit_date
                                                        )}
                                                    </td>


                                                    <td className="px-5 py-3.5 text-xs text-[#766959]">
                                                        {visit.temperature ||
                                                            "-"}
                                                    </td>


                                                    <td className="px-5 py-3.5 text-xs text-[#766959]">
                                                        {visit.blood_pressure ||
                                                            "-"}
                                                    </td>


                                                    <td className="max-w-[160px] px-5 py-3.5 text-xs text-[#766959]">
                                                        {visit.treatment ||
                                                            "-"}
                                                    </td>


                                                    <td className="max-w-[200px] px-5 py-3.5 text-xs text-[#766959]">

                                                        {medicineName ? (
                                                            <div>

                                                                <p className="font-semibold text-[#3d3329]">
                                                                    {
                                                                        medicineName
                                                                    }
                                                                </p>

                                                                {visit.medicine?.unit && (
                                                                    <p className="mt-0.5 text-[10px] text-[#887d70]">
                                                                        Unit:{" "}
                                                                        {
                                                                            visit
                                                                                .medicine
                                                                                .unit
                                                                        }
                                                                    </p>
                                                                )}

                                                                {visit.medicine_quantity && (
                                                                    <p className="mt-0.5 text-[10px] font-semibold text-[#8a6f50]">
                                                                        Quantity Used:{" "}
                                                                        {
                                                                            visit.medicine_quantity
                                                                        }
                                                                    </p>
                                                                )}

                                                            </div>
                                                        ) : (
                                                            "-"
                                                        )}

                                                    </td>


                                                    <td className="px-5 py-3.5">

                                                        <div className="flex justify-end gap-2">

                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    handleEdit(
                                                                        visit
                                                                    )
                                                                }
                                                                className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#e8dfd4] text-[#8a6f50] transition hover:bg-[#f3ebdf]"
                                                                title="Edit visit"
                                                            >
                                                                <Pencil
                                                                    size={
                                                                        14
                                                                    }
                                                                />
                                                            </button>

                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    setDeleteVisit(
                                                                        visit
                                                                    )
                                                                }
                                                                className="flex h-8 w-8 items-center justify-center rounded-lg border border-red-100 text-red-600 transition hover:bg-red-50"
                                                                title="Delete visit"
                                                            >
                                                                <Trash2
                                                                    size={
                                                                        14
                                                                    }
                                                                />
                                                            </button>

                                                        </div>

                                                    </td>

                                                </tr>
                                            );
                                        }
                                    )
                                )}

                            </tbody>

                        </table>
                    </div>
                </div>

                <div className="mb-6 flex items-center justify-between gap-3 text-sm text-[#887d70]">
                    <span>
                        Page {visitPagination.current_page} of {visitPagination.last_page}
                    </span>
                    <div className="flex gap-2">
                        <button
                            type="button"
                            disabled={visitPagination.current_page <= 1}
                            onClick={() =>
                                fetchVisits(visitPagination.current_page - 1, search)
                            }
                            className="rounded-lg border border-[#e8dfd4] bg-white px-3 py-1.5 font-medium disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            Previous
                        </button>
                        <button
                            type="button"
                            disabled={visitPagination.current_page >= visitPagination.last_page}
                            onClick={() =>
                                fetchVisits(visitPagination.current_page + 1, search)
                            }
                            className="rounded-lg border border-[#e8dfd4] bg-white px-3 py-1.5 font-medium disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            Next
                        </button>
                    </div>
                </div>


                {deleteVisit && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm">

                        <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">

                            <div className="flex items-start gap-4">

                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-600">
                                    <Trash2 size={20} />
                                </div>

                                <div className="min-w-0">

                                    <h3 className="text-base font-bold text-[#3c332a]">
                                        Delete Clinic Visit?
                                    </h3>

                                    <p className="mt-1 text-sm leading-6 text-[#887d70]">
                                        Are you sure you want to delete this clinic visit record? This action cannot be undone.
                                    </p>

                                    <div className="mt-3 rounded-xl border border-[#e8dfd4] bg-[#fcfaf6] px-4 py-3">

                                        <p className="text-xs font-bold text-[#3d3329]">
                                            {
                                                getPatientName(
                                                    deleteVisit
                                                ).name
                                            }
                                        </p>

                                        <p className="mt-1 text-[10px] text-[#887d70]">
                                            {formatDate(
                                                deleteVisit.visit_date
                                            )}{" "}
                                            •{" "}
                                            {deleteVisit.reason ||
                                                "Clinic Visit"}
                                        </p>

                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 flex justify-end gap-3">

                                <button
                                    type="button"
                                    onClick={() =>
                                        setDeleteVisit(
                                            null
                                        )
                                    }
                                    className="rounded-xl border border-[#e8dfd4] px-4 py-2.5 text-sm font-semibold text-[#766959] transition hover:bg-[#fcfaf6]"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="button"
                                    onClick={handleDelete}
                                    className="flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700"
                                >
                                    <Trash2 size={15} />
                                    Delete
                                </button>

                            </div>
                        </div>
                    </div>
                )}

        </>
    );
}
