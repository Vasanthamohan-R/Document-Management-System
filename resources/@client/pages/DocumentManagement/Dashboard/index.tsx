import React from "react";
import { Users, Layers, FileText, Plus } from "lucide-react";
import Button from "@/components/ui/Button";

import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import { usePermissions } from "@/hooks/usePermissions";

const Dashboard: React.FC = () => {
  const { hasPermission } = usePermissions();

  const stats = [
    { label: "Departments", value: "5", icon: Users, color: "text-purple-600 dark:text-purple-400", bg: "bg-purple-50 dark:bg-purple-900/20" },
    { label: "Members", value: "24", icon: Users, color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-900/20" },
    { label: "Units", value: "3", icon: Layers, color: "text-indigo-600 dark:text-indigo-400", bg: "bg-indigo-50 dark:bg-indigo-900/20" },
    { label: "Documents", value: "12,097", icon: FileText, color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-900/20" }
  ];

  /* ---------------- PIE CHART ---------------- */

  const pieOptions: Highcharts.Options = {
    chart: {
      type: "pie",
      height: 300,
      backgroundColor: "transparent"
    },

    title: {
      text: "Document Distribution",
      style: {
        color: 'var(--charts-text)',
        fontSize: '14px',
        fontWeight: 'bold'
      }
    },

    tooltip: {
      pointFormat: "{series.name}: <b>{point.percentage:.1f}%</b>"
    },

    plotOptions: {
      pie: {
        allowPointSelect: true,
        cursor: "pointer",
        dataLabels: {
          enabled: false
        },
        showInLegend: true
      }
    },
    legend: {
      itemStyle: {
        color: 'var(--charts-text)'
      }
    },

    series: [
      {
        type: "pie",
        name: "Brands",
        colorByPoint: true,
        data: [
          { name: "Chrome", y: 74.77, sliced: true, selected: true },
          { name: "Edge", y: 12.82 },
          { name: "Firefox", y: 4.63 },
          { name: "Safari", y: 2.44 },
          { name: "Internet Explorer", y: 2.02 },
          { name: "Other", y: 3.28 }
        ]
      } as Highcharts.SeriesPieOptions
    ],

    credits: {
      enabled: false
    },
    accessibility: {
      enabled: false
    }
  };

  /* ---------------- BAR CHART ---------------- */

  const barOptions: Highcharts.Options = {
    chart: {
      type: "column",
      height: 300,
      backgroundColor: "transparent"
    },

    title: {
      text: undefined
    },

    xAxis: {
      categories: ["Accounts", "HR", "Finance", "Media"]
    },

    yAxis: {
      title: {
        text: "Documents"
      }
    },

    series: [
      {
        type: "column",
        name: "Approved",
        data: [40, 50, 75, 90],
        color: "#3b82f6"
      },
      {
        type: "column",
        name: "Pending",
        data: [30, 45, 60, 80],
        color: "#93c5fd"
      }
    ],

    credits: { enabled: false },
    accessibility: { enabled: false }
  };

  const isDark = typeof document !== 'undefined' ? document.documentElement.classList.contains('dark') : false;
  const chartTextColor = isDark ? '#cbd5e1' : '#475569';

  return (
    <div className="space-y-8" style={{ '--charts-text': chartTextColor } as React.CSSProperties}>

      {/* Page Header */}
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Dashboard Overview</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Real-time repository statistics and insights.</p>
        </div>
      </div>

      {/* Stats + Upload */}

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-center">

        <div className="lg:col-span-4 grid grid-cols-2 md:grid-cols-4 gap-6">

          {stats.map((stat, i) => (

            <div
              key={i}
              className="bg-white dark:bg-slate-900/50 backdrop-blur-sm rounded-2xl p-5 ring-1 ring-slate-100 dark:ring-slate-800 flex items-center gap-4 transition-colors duration-300"
            >

              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.bg} ${stat.color}`}>
                <stat.icon size={22} />
              </div>

              <div className="ml-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                  {stat.label}
                </p>

                <p className="text-xl font-bold text-slate-800 dark:text-white">
                  {stat.value}
                </p>
              </div>

            </div>

          ))}

        </div>

        <div className="flex justify-end">

          <Button
            variant="primary"
            size="lg"
            icon={Plus}
            className="h-12 px-8 rounded-full"
          >
            Upload Document
          </Button>

        </div>

      </div>

      {/* Charts */}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {hasPermission('dashboard.view_document_summary') && (
        <div className="bg-white dark:bg-slate-900/50 backdrop-blur-sm rounded-2xl p-6 ring-1 ring-slate-100 dark:ring-slate-800 transition-colors duration-300">

          <h2 className="text-sm font-bold text-slate-800 dark:text-white uppercase mb-4">
            Documents Summary
          </h2>

          <HighchartsReact highcharts={Highcharts} options={pieOptions} />

        </div>
        )}

        {hasPermission('dashboard.view_department_flow') && (
        <div className="bg-white dark:bg-slate-900/50 backdrop-blur-sm rounded-2xl p-6 ring-1 ring-slate-100 dark:ring-slate-800 transition-colors duration-300">

          <h2 className="text-sm font-bold text-slate-800 dark:text-white uppercase mb-4">
            Document Flow by Department
          </h2>

          <HighchartsReact highcharts={Highcharts} options={barOptions} />

        </div>
        )}

      </div>

      {/* Pending Table */}

      {hasPermission('dashboard.view_pending_documents') && (
      <div className="bg-white dark:bg-slate-900/50 backdrop-blur-sm rounded-2xl p-8 ring-1 ring-slate-100 dark:ring-slate-800 transition-colors duration-300">

        <div className="flex items-center justify-between mb-6">

          <h2 className="text-sm font-bold text-slate-800 dark:text-white uppercase">
            Pending Documents
          </h2>

          <button className="text-sm text-blue-600 font-semibold">
            View All
          </button>

        </div>

        <div className="overflow-x-auto">

          <table className="w-full text-left">

            <thead className="text-[11px] uppercase tracking-widest font-bold text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800/50">

              <tr>
                <th className="pb-4 pt-2">No.</th>
                <th className="pb-4 pt-2">File Name</th>
                <th className="pb-4 pt-2">Class</th>
                <th className="pb-4 pt-2">Due Date</th>
                <th className="pb-4 pt-2">Owner</th>
                <th className="pb-4 pt-2 text-right">Action</th>
              </tr>

            </thead>

            <tbody className="divide-y text-sm">

              {[1, 2, 3, 4].map((_, i) => (

                <tr
                  key={i}
                  className="hover:bg-slate-50 dark:hover:bg-slate-800 border-none"
                >

                  <td className="py-4">
                    {i + 1}
                  </td>

                  <td className="py-4">
                    <span className="font-semibold text-slate-700 dark:text-slate-200">Legal_Agreem...</span>
                  </td>

                  <td className="py-4">
                    <span className="px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-[10px] font-bold uppercase">Contract</span>
                  </td>

                  <td className="py-4 text-slate-500 dark:text-slate-400">
                    Oct 24, 2024
                  </td>

                  <td className="py-4 text-slate-600 dark:text-slate-300 flex items-center gap-2">
                    <img
                      src={`https://i.pravatar.cc/100?img=${i + 10}`}
                      className="w-8 h-8 rounded-full"
                    />
                    Olumide Mich..
                  </td>

                  <td className="py-4 text-right text-blue-600 font-semibold">
                    Review
                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

      </div>
      )}

    </div>
  );
};

export default Dashboard;