import React from "react";
import {
  Pencil,
  Trash2,
  Calendar,
  TrendingUp,
  AlertCircle,
} from "lucide-react";
import BudgetProgress from "./BudgetProgress";
import { getCategoryInfo } from "../../utils/categories";
import type { Budget } from "../../types/budget";

interface BudgetCardProps {
  budget: Budget;
  onEdit: (budget: Budget) => void;
  onDelete: (id: number) => void;
}

const BudgetCard: React.FC<BudgetCardProps> = ({
  budget,
  onEdit,
  onDelete,
}) => {
  const categoryInfo = getCategoryInfo(budget.category);

  const formatDate = (date: string): string => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-200 overflow-hidden group">
      {/* Header with gradient */}
      <div
        className={`${categoryInfo.color} bg-opacity-10 p-4 border-b border-gray-100`}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`w-12 h-12 rounded-xl ${categoryInfo.color} bg-opacity-20 flex items-center justify-center text-2xl`}
            >
              {categoryInfo.icon}
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">
                {categoryInfo.label}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <span className="px-2 py-0.5 text-xs font-medium bg-white rounded-full text-gray-600 border border-gray-200">
                  {budget.period}
                </span>
                <span className="flex items-center gap-1 text-xs text-gray-500">
                  <Calendar className="w-3 h-3" />
                  {budget.daysRemaining} days left
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => onEdit(budget)}
              className="p-2 hover:bg-white rounded-lg transition-colors"
              title="Edit Budget"
            >
              <Pencil className="w-4 h-4 text-blue-600" />
            </button>
            <button
              onClick={() => onDelete(budget.id)}
              className="p-2 hover:bg-white rounded-lg transition-colors"
              title="Delete Budget"
            >
              <Trash2 className="w-4 h-4 text-red-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Progress Section */}
      <div className="p-4">
        <BudgetProgress
          percentage={budget.percentageUsed}
          status={budget.status}
          spent={budget.spent}
          amount={budget.amount}
        />

        {/* Remaining Amount */}
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Remaining</span>
            <div className="flex items-center gap-1">
              <TrendingUp
                className={`w-4 h-4 ${
                  budget.remaining >= 0 ? "text-green-600" : "text-red-600"
                }`}
              />
              <span
                className={`text-lg font-bold ${
                  budget.remaining >= 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                {Math.abs(budget.remaining).toFixed(2)} TND
              </span>
            </div>
          </div>
        </div>

        {/* Alert Messages */}
        {budget.status === "WARNING" && (
          <div className="mt-3 flex items-start gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <AlertCircle className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-yellow-800">
              You've reached {budget.alertThreshold}% of your budget limit
            </p>
          </div>
        )}

        {budget.status === "EXCEEDED" && (
          <div className="mt-3 flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-red-800">
              Budget exceeded by {(budget.spent - budget.amount).toFixed(2)} TND
            </p>
          </div>
        )}

        {/* Period Info */}
        <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>{formatDate(budget.startDate)}</span>
            <span>→</span>
            <span>{formatDate(budget.endDate)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BudgetCard;
