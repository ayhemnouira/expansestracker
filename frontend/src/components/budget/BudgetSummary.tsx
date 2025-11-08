import React from 'react';
import { TrendingUp, AlertTriangle, CheckCircle, XCircle, Wallet } from 'lucide-react';
import type{ BudgetSummary as BudgetSummaryType } from "../../types/budget";

interface BudgetSummaryProps {
  summary: BudgetSummaryType | null;
}

interface SummaryCard {
  title: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  bgColor: string;
  iconColor: string;
  borderColor: string;
}

const BudgetSummary: React.FC<BudgetSummaryProps> = ({ summary }) => {
  if (!summary) return null;

  const summaryCards: SummaryCard[] = [
    {
      title: 'Total Budgets',
      value: summary.totalBudgets,
      icon: Wallet,
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600',
      borderColor: 'border-blue-200'
    },
    {
      title: 'On Track',
      value: summary.safeBudgets,
      icon: CheckCircle,
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600',
      borderColor: 'border-green-200'
    },
    {
      title: 'Warning',
      value: summary.warningBudgets,
      icon: AlertTriangle,
      bgColor: 'bg-yellow-50',
      iconColor: 'text-yellow-600',
      borderColor: 'border-yellow-200'
    },
    {
      title: 'Exceeded',
      value: summary.exceededBudgets,
      icon: XCircle,
      bgColor: 'bg-red-50',
      iconColor: 'text-red-600',
      borderColor: 'border-red-200'
    }
  ];

  return (
    <div className="space-y-4">
      {/* Summary Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div
              key={index}
              className={`${card.bgColor} border ${card.borderColor} rounded-xl p-4 transition-all duration-300 hover:shadow-md`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{card.title}</p>
                  <p className={`text-3xl font-bold ${card.iconColor} mt-1`}>
                    {card.value}
                  </p>
                </div>
                <div className={`${card.iconColor} opacity-80`}>
                  <Icon className="w-8 h-8" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Overall Progress Card */}
      <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl p-6 text-white shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-medium opacity-90">Overall Budget Usage</h3>
            <p className="text-3xl font-bold mt-1">
              {summary.overallPercentage?.toFixed(1)}%
            </p>
          </div>
          <TrendingUp className="w-10 h-10 opacity-80" />
        </div>

        {/* Progress Bar */}
        <div className="w-full h-2 bg-white bg-opacity-30 rounded-full overflow-hidden">
          <div
            className="h-full bg-white transition-all duration-500"
            style={{ width: `${Math.min(summary.overallPercentage, 100)}%` }}
          ></div>
        </div>

        {/* Amount Details */}
        <div className="flex items-center justify-between mt-4 text-sm">
          <div>
            <p className="opacity-80">Total Spent</p>
            <p className="text-lg font-semibold">{summary.totalSpent?.toFixed(2)} TND</p>
          </div>
          <div className="text-right">
            <p className="opacity-80">Total Budget</p>
            <p className="text-lg font-semibold">{summary.totalBudgeted?.toFixed(2)} TND</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BudgetSummary;