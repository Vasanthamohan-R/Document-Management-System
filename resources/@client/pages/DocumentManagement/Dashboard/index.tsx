import React from "react";
import { Users, Layers, FileText, Plus } from "lucide-react";
import Button from "@/components/ui/Button";

import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";

const Dashboard: React.FC = () => {

  const stats = [
    { label: "Departments", value: "5", icon: Users, color: "text-purple-600", bg: "bg-purple-50" },
    { label: "Members", value: "24", icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Units", value: "3", icon: Layers, color: "text-indigo-600", bg: "bg-indigo-50" },
    { label: "Documents", value: "12,097", icon: FileText, color: "text-emerald-600", bg: "bg-emerald-50" }
  ];

  /* ---------------- PIE CHART ---------------- */

  const pieOptions: Highcharts.Options = {
    chart: {
      type: "pie",
      height: 300,
      backgroundColor: "transparent"
    },

    title: {
      text: "Browser market shares in March, 2022"
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

  return (
    <div className="space-y-10 max-w-[1600px] mx-auto pb-10">

      {/* Header */}

      <div>
        <h1 className="text-3xl font-bold text-slate-800 dark:text-white">
          Dashboard
        </h1>

        <p className="text-sm text-slate-500 mt-1">
          Monitor documents, approvals and workflow activities
        </p>
      </div>

      {/* Stats + Upload */}

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-center">

        <div className="lg:col-span-4 grid grid-cols-2 md:grid-cols-4 gap-6">

          {stats.map((stat, i) => (

            <div
              key={i}
              className="bg-white dark:bg-slate-900 rounded-2xl p-5 ring-1 ring-slate-100 dark:ring-slate-800 flex items-center gap-4"
            >

              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.bg} ${stat.color}`}>
                <stat.icon size={22} />
              </div>

              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase">
                  {stat.label}
                </p>

                <p className="text-lg font-bold text-slate-800 dark:text-white">
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

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 ring-1 ring-slate-100 dark:ring-slate-800">

          <h2 className="text-sm font-bold text-slate-800 dark:text-white uppercase mb-4">
            Documents Summary
          </h2>

          <HighchartsReact highcharts={Highcharts} options={pieOptions} />

        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 ring-1 ring-slate-100 dark:ring-slate-800">

          <h2 className="text-sm font-bold text-slate-800 dark:text-white uppercase mb-4">
            Document Flow by Department
          </h2>

          <HighchartsReact highcharts={Highcharts} options={barOptions} />

        </div>

      </div>

      {/* Pending Table */}

      <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 ring-1 ring-slate-100 dark:ring-slate-800">

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

            <thead className="text-sm text-slate-400">

              <tr>
                <th className="pb-4">No.</th>
                <th className="pb-4">File Name</th>
                <th className="pb-4">Class</th>
                <th className="pb-4">Due Date</th>
                <th className="pb-4">Owner</th>
                <th className="pb-4 text-right">Action</th>
              </tr>

            </thead>

            <tbody className="divide-y text-sm">

              {[1, 2, 3, 4].map((_, i) => (

                <tr
                  key={i}
                  className="hover:bg-slate-50 dark:hover:bg-slate-800 border-none"
                >

                  <td className="py-2">
                    {i + 1}
                  </td>

                  <td className="py-2">
                    Application for leave
                  </td>

                  <td className="py-2">
                    Proposal
                  </td>

                  <td className="py-2">
                    12-Jan-2018
                  </td>

                  <td className="py-2 flex items-center gap-2">
                    <img
                      src={`https://i.pravatar.cc/100?img=${i + 10}`}
                      className="w-8 h-8 rounded-full"
                    />
                    Olumide Mich..
                  </td>

                  <td className="py-2 text-right text-blue-600 font-semibold">
                    Review
                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

      </div>

    </div>
  );
};

export default Dashboard;