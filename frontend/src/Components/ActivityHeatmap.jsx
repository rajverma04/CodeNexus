import React, { useEffect, useState } from 'react';
import { Tooltip as ReactTooltip } from 'react-tooltip';
import 'react-calendar-heatmap/dist/styles.css';
import axiosClient from '../utils/axiosClient';

const ActivityHeatmap = () => {
    // Helper to format date as YYYY-MM-DD
    const formatDate = (date) => {
        return date.toISOString().split('T')[0];
    };

    const [heatmapData, setHeatmapData] = useState({});
    const [loading, setLoading] = useState(true);
    const [months, setMonths] = useState([]);
    const [totalSubmissions, setTotalSubmissions] = useState(0);

    const getContributionColor = (count) => {
        if (count === 0) return 'bg-zinc-800';
        if (count && count <= 2) return 'bg-emerald-900';
        if (count > 2 && count <= 4) return 'bg-emerald-700';
        if (count > 4 && count <= 6) return 'bg-emerald-500';
        return 'bg-emerald-400';
    };

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await axiosClient.get('/problem/getSubmissionStats');
                const apiData = response.data;

                // Map data for quick lookup
                const dataMap = {};
                let total = 0;
                apiData.forEach(item => {
                    dataMap[item.date] = item.count;
                    total += item.count;
                });
                setTotalSubmissions(total);
                setHeatmapData(dataMap);

                // Generate last 12 months structure
                const monthBuckets = [];
                const today = new Date();

                // Iterate back 11 months + current month (total 12)
                for (let i = 11; i >= 0; i--) {
                    const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
                    const monthName = d.toLocaleString('default', { month: 'short' });
                    const year = d.getFullYear();
                    const daysInMonth = new Date(year, d.getMonth() + 1, 0).getDate();

                    const days = [];

                    // Add padding for start of month
                    // getDay() returns 0 for Sunday, 1 for Monday, etc.
                    // Since our grid flows column-wise but fills rows 0-6 (Sun-Sat), 
                    // we need padding cells to push the first day to the correct row index.
                    const startDayOfWeek = new Date(year, d.getMonth(), 1).getDay();

                    for (let p = 0; p < startDayOfWeek; p++) {
                        days.push({
                            date: null,
                            count: null,
                            empty: true
                        });
                    }

                    for (let day = 1; day <= daysInMonth; day++) {
                        const currentDay = new Date(year, d.getMonth(), day);
                        const dateStr = formatDate(currentDay);
                        days.push({
                            date: dateStr,
                            count: dataMap[dateStr] || 0,
                            dayOfWeek: currentDay.getDay(),
                            empty: false
                        });
                    }
                    monthBuckets.push({ name: monthName, year, days });
                }

                setMonths(monthBuckets);

            } catch (error) {
                console.error("Failed to fetch heatmap data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);


    if (loading) {
        return (
            <div className="animate-pulse flex gap-2">
                <div className="h-32 w-full bg-white/5 rounded-xl"></div>
            </div>
        );
    }

    return (
        <div className="w-full">
            <div className="flex items-center justify-between mb-4">
                <span className="text-white font-medium text-sm">
                    {totalSubmissions} submissions in the past year
                </span>
                {/* Legend */}
                <div className="flex items-center gap-1 text-xs text-zinc-500">
                    <span>Less</span>
                    <div className="w-2.5 h-2.5 rounded-sm bg-zinc-800"></div>
                    <div className="w-2.5 h-2.5 rounded-sm bg-emerald-900"></div>
                    <div className="w-2.5 h-2.5 rounded-sm bg-emerald-700"></div>
                    <div className="w-2.5 h-2.5 rounded-sm bg-emerald-500"></div>
                    <div className="w-2.5 h-2.5 rounded-sm bg-emerald-400"></div>
                    <span>More</span>
                </div>
            </div>

            <div className="flex gap-4 w-full overflow-x-auto pb-2">
                {months.map((month, idx) => (
                    <div key={idx} className="flex flex-col gap-2">
                        {/* Month Grid */}
                        <div className="grid grid-rows-7 grid-flow-col gap-1">
                            {month.days.map((day, dIdx) => (
                                day.empty ? (
                                    <div key={dIdx} className="w-2.5 h-2.5 rounded-sm bg-transparent"></div>
                                ) : (
                                    <div
                                        key={dIdx}
                                        className={`w-2.5 h-2.5 rounded-sm ${getContributionColor(day.count)} cursor-pointer transition-all hover:ring-1 hover:ring-white/50`}
                                        data-tooltip-id="heatmap-tooltip"
                                        data-tooltip-content={`${day.date}: ${day.count} submissions`}
                                    ></div>
                                )
                            ))}
                        </div>
                        <span className="text-xs text-zinc-500 text-center">{month.name}</span>
                    </div>
                ))}
            </div>

            <ReactTooltip id="heatmap-tooltip" className="!bg-zinc-800 !text-white !px-3 !py-1 !rounded-md !text-xs !z-50" />
        </div>
    );
};

export default ActivityHeatmap;
