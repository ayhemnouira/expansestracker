import React, { type JSX } from 'react';
import { BudgetStatus } from '../../types/budget';

interface BudgetProgressProps {
  percentage: number;
  status: BudgetStatus;
  spent: number;
  amount: number;
}

const BudgetProgress: React.FC<BudgetProgressProps> = ({ percentage, status, spent, amount }) => {
  const getProgressColor = (): string => {
    switch (status) {
      case BudgetStatus.SAFE:
        return 'bg-green-500';
      case BudgetStatus.WARNING:
        return 'bg-yellow-500';
      case BudgetStatus.EXCEEDED:
        return 'bg-red-500';
      default:
        return 'bg-gray-300';
    }
  };

  const getStatusBadge = (): JSX.Element | null => {
    switch (status) {
      case BudgetStatus.SAFE:
        return (
          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
            On Track
          </span>
        );
      case BudgetStatus.WARNING:
        return (
          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
            Warning
          </span>
        );
      case BudgetStatus.EXCEEDED:
        return (
          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
            Over Budget
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-2">
      {/* Progress Bar */}
      <div className="relative w-full h-3 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`h-full ${getProgressColor()} transition-all duration-500 ease-out relative`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        >
          {/* Animated shimmer effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30"></div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-gray-900">
            {spent.toFixed(2)} TND
          </span>
          <span className="text-gray-500">/ {amount.toFixed(2)} TND</span>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="font-semibold text-gray-700">
            {percentage.toFixed(1)}%
          </span>
          {getStatusBadge()}
        </div>
      </div>
    </div>
  );
};

export default BudgetProgress;