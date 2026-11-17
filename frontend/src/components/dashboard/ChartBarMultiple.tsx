import { useMemo } from "react";
import { TrendingUp, BarChart3 } from "lucide-react";
import {
    ResponsiveContainer,
    BarChart,
    Bar,
    CartesianGrid,
    XAxis,
    Tooltip,
} from "recharts";

export type MonthlyBarPoint = {
    month: string;
    students?: number;
    employees?: number;
    desktop?: number;
    mobile?: number;
    [key: string]: any;
};

interface ChartBarMultipleProps {
    data?: MonthlyBarPoint[];
    monthlyVisits?: any[];
    loading?: boolean;
    className?: string;
    title?: string;
    description?: string;
}

export function ChartBarMultiple({
    data,
    monthlyVisits,
    loading = false,
    className = "",
    title = "Bar Chart - Multiple",
    description,
}: ChartBarMultipleProps) {
    const chartData = useMemo(() => {
        if (Array.isArray(data) && data.length > 0) {
            return data;
        }

        const monthMap: Record<string, { students: number; employees: number }> = {};

        if (Array.isArray(monthlyVisits) && monthlyVisits.length > 0) {
            monthlyVisits.forEach((row) => {
                const mKey = String(row.month || "").slice(0, 7);
                if (!mKey) return;
                monthMap[mKey] = {
                    students: Number(row.students || 0),
                    employees: Number(row.employees || 0),
                };
            });
        }

        const now = new Date();
        const monthNames = [
            "January",
            "February",
            "March",
            "April",
            "May",
            "June",
            "July",
            "August",
            "September",
            "October",
            "November",
            "December",
        ];

        const points: MonthlyBarPoint[] = [];

        // Generate past 6 months
        for (let i = 5; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const y = d.getFullYear();
            const m = String(d.getMonth() + 1).padStart(2, "0");
            const mKey = `${y}-${m}`;
            const monthName = monthNames[d.getMonth()];

            const match = monthMap[mKey];
            points.push({
                month: monthName,
                students: match ? match.students : 0,
                employees: match ? match.employees : 0,
            });
        }

        return points;
    }, [data, monthlyVisits]);

    const firstPoint = chartData[0] || {};
    const key1 = "students" in firstPoint ? "students" : "desktop";
    const key2 = "employees" in firstPoint ? "employees" : "mobile";
    const label1 = key1 === "students" ? "Students" : "Desktop";
    const label2 = key2 === "employees" ? "Faculty & Staff" : "Mobile";

    const displayDescription = useMemo(() => {
        if (description) return description;
        if (chartData.length >= 2) {
            const first = chartData[0].month;
            const last = chartData[chartData.length - 1].month;
            const currentYear = new Date().getFullYear();
            return `${first} - ${last} ${currentYear}`;
        }
        return "January - June 2024";
    }, [description, chartData]);

    return (
        <div
            className={`flex flex-col justify-between overflow-hidden rounded-2xl border border-[#e8dfd4] bg-white p-5 shadow-sm transition-shadow duration-200 hover:shadow-md dark:border-[#382f25] dark:bg-[#251f19] ${className}`}
        >
            {/* Card Header matching shadcn */}
            <div className="flex flex-col gap-1 pb-2">
                <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#f4ecdf] text-[#8a6f50] dark:bg-[#342a22] dark:text-[#d4b996]">
                        <BarChart3 size={18} />
                    </div>
                    <div>
                        <h3 className="text-base font-bold tracking-tight text-stone-900 dark:text-[#f4ecdf]">
                            {title}
                        </h3>
                    </div>
                </div>
                <p className="text-xs text-stone-500 dark:text-stone-400">
                    {displayDescription}
                </p>
            </div>

            {/* Card Content with Recharts BarChart */}
            <div className="flex-1 py-2">
                {loading ? (
                    <div className="flex h-[200px] w-full items-center justify-center">
                        <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#8a6f50] border-t-transparent" />
                    </div>
                ) : (
                    <div className="h-[200px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={chartData}
                                margin={{
                                    top: 10,
                                    right: 10,
                                    left: -20,
                                    bottom: 0,
                                }}
                                barGap={4}
                            >
                                <CartesianGrid
                                    vertical={false}
                                    strokeDasharray="3 3"
                                    className="stroke-stone-200 dark:stroke-stone-800"
                                    strokeOpacity={0.6}
                                />
                                <XAxis
                                    dataKey="month"
                                    tickLine={false}
                                    tickMargin={10}
                                    axisLine={false}
                                    tickFormatter={(value) => String(value).slice(0, 3)}
                                    className="text-[11px] font-medium fill-stone-400 dark:fill-stone-500"
                                />
                                <Tooltip
                                    cursor={{ fill: "rgba(128, 128, 128, 0.08)" }}
                                    content={({ active, payload, label }) => {
                                        if (!active || !payload || !payload.length) return null;
                                        return (
                                            <div className="rounded-xl border border-stone-800 bg-[#14120e] p-2.5 text-white shadow-xl min-w-[130px]">
                                                <p className="mb-1.5 border-b border-stone-800 pb-1 text-[11px] font-semibold text-stone-400">
                                                    {label}
                                                </p>
                                                <div className="space-y-1">
                                                    {payload.map((item: any, idx: number) => (
                                                        <div
                                                            key={idx}
                                                            className="flex items-center justify-between gap-3 text-xs"
                                                        >
                                                            <div className="flex items-center gap-1.5">
                                                                <span
                                                                    className="h-2 w-2 rounded-xs"
                                                                    style={{ backgroundColor: item.color || item.fill }}
                                                                />
                                                                <span className="text-stone-300">
                                                                    {item.name}:
                                                                </span>
                                                            </div>
                                                            <span className="font-bold text-white">
                                                                {Number(item.value || 0).toLocaleString()}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        );
                                    }}
                                />
                                <Bar
                                    dataKey={key1}
                                    name={label1}
                                    fill="#93c5fd"
                                    radius={[4, 4, 0, 0]}
                                    maxBarSize={24}
                                />
                                <Bar
                                    dataKey={key2}
                                    name={label2}
                                    fill="#3b82f6"
                                    radius={[4, 4, 0, 0]}
                                    maxBarSize={24}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </div>

            {/* Card Footer matching shadcn CardFooter */}
            <div className="flex flex-col items-start gap-1 border-t border-[#e8dfd4] pt-3 text-sm dark:border-[#382f25]">
                <div className="flex items-center gap-2 leading-none font-medium text-stone-800 dark:text-stone-200 text-xs">
                    <span>Trending up by 5.2% this month</span>
                    <TrendingUp className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div className="text-[11px] text-stone-500 dark:text-stone-400">
                    Showing total visitors for the last 6 months
                </div>
            </div>
        </div>
    );
}

// Standalone alias matching shadcn component name
export function MonthlyVisitsBarChart(props: ChartBarMultipleProps) {
    return <ChartBarMultiple {...props} />;
}
