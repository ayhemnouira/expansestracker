import React, { useState, useEffect } from "react";
import { X, DollarSign, Calendar, Bell } from "lucide-react";
import { CATEGORIES, BUDGET_PERIODS } from "../../utils/categories";
import {
  BudgetPeriod,
  type Budget,
  type BudgetRequestDTO,
} from "../../types/budget";
import { useTheme } from "@mui/material/styles"; // ✅ import MUI theme

interface BudgetFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: BudgetRequestDTO) => void;
  editingBudget: Budget | null;
  isLoading: boolean;
}

interface FormData {
  category: string;
  amount: string;
  period: BudgetPeriod;
  startDate: string;
  alertThreshold: number;
}

interface FormErrors {
  category?: string;
  amount?: string;
  startDate?: string;
  alertThreshold?: string;
}

const BudgetForm: React.FC<BudgetFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  editingBudget,
  isLoading,
}) => {
  const theme = useTheme(); // ✅ Get current MUI theme (dark/light)
  const isDark = theme.palette.mode === "dark"; // Check mode

  const [formData, setFormData] = useState<FormData>({
    category: "",
    amount: "",
    period: BudgetPeriod.MONTHLY,
    startDate: new Date().toISOString().split("T")[0],
    alertThreshold: 80,
  });

  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    if (editingBudget) {
      setFormData({
        category: editingBudget.category,
        amount: editingBudget.amount.toString(),
        period: editingBudget.period,
        startDate: editingBudget.startDate,
        alertThreshold: editingBudget.alertThreshold,
      });
    } else {
      setFormData({
        category: "",
        amount: "",
        period: BudgetPeriod.MONTHLY,
        startDate: new Date().toISOString().split("T")[0],
        alertThreshold: 80,
      });
    }
    setErrors({});
  }, [editingBudget, isOpen]);

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.category) newErrors.category = "Category is required";
    if (!formData.amount || parseFloat(formData.amount) <= 0)
      newErrors.amount = "Amount must be greater than 0";
    if (!formData.startDate) newErrors.startDate = "Start date is required";
    if (formData.alertThreshold < 0 || formData.alertThreshold > 100)
      newErrors.alertThreshold = "Alert threshold must be between 0 and 100";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      const submitData: BudgetRequestDTO = {
        category: formData.category,
        amount: parseFloat(formData.amount),
        period: formData.period,
        startDate: formData.startDate,
        alertThreshold: formData.alertThreshold,
      };
      onSubmit(submitData);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleRangeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: parseInt(value) }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex justify-center bg-black/50 backdrop-blur-sm">
      <div
        className={`relative rounded-2xl shadow-2xl w-full max-w-2xl mt-24 transform transition-all scale-100 animate-fadeIn border ${
          isDark
            ? "bg-[#1e1e1e] border-gray-700 text-gray-100"
            : "bg-white border-gray-100 text-gray-900"
        }`}
      >
        {/* Header */}
        <div
          className={`flex items-center justify-between p-5 border-b ${
            isDark ? "border-gray-700" : "border-gray-200"
          }`}
        >
          <h2 className="text-xl font-semibold">
            {editingBudget ? "Edit Budget" : "Create New Budget"}
          </h2>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg transition-colors ${
              isDark
                ? "hover:bg-gray-700 text-gray-300"
                : "hover:bg-gray-100 text-gray-500"
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="p-6 space-y-6 overflow-y-auto max-h-[80vh]"
        >
          {/* Category Selection */}
          <div>
            <label className="block text-sm font-semibold mb-2">Category</label>
            <div className="grid grid-cols-2 gap-3">
              {CATEGORIES.map((category) => (
                <button
                  key={category.value}
                  type="button"
                  onClick={() => {
                    setFormData((prev) => ({
                      ...prev,
                      category: category.value,
                    }));
                    if (errors.category) {
                      setErrors((prev) => ({ ...prev, category: undefined }));
                    }
                  }}
                  className={`p-3 rounded-xl border-2 transition-all ${
                    formData.category === category.value
                      ? `${category.color} bg-opacity-10 border-opacity-50`
                      : isDark
                      ? "border-gray-700 hover:border-gray-600"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="text-2xl mb-1">{category.icon}</div>
                  <div className="text-xs font-medium">{category.label}</div>
                </button>
              ))}
            </div>
            {errors.category && (
              <p className="mt-1 text-sm text-red-500">{errors.category}</p>
            )}
          </div>

          {/* Amount */}
          <div>
            <label className="block text-sm font-semibold mb-2">
              Budget Amount (TND)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <DollarSign
                  className={`w-5 h-5 ${
                    isDark ? "text-gray-400" : "text-gray-400"
                  }`}
                />
              </div>
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                step="0.01"
                className={`w-full pl-10 pr-4 py-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                  isDark
                    ? "bg-gray-800 border-gray-700 text-gray-100"
                    : "bg-white border-gray-300 text-gray-900"
                } ${errors.amount ? "border-red-500" : "border"}`}
                placeholder="0.00"
              />
            </div>
            {errors.amount && (
              <p className="mt-1 text-sm text-red-500">{errors.amount}</p>
            )}
          </div>

          {/* Period */}
          <div>
            <label className="block text-sm font-semibold mb-2">Period</label>
            <select
              name="period"
              value={formData.period}
              onChange={handleChange}
              className={`w-full px-4 py-3 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all ${
                isDark
                  ? "bg-gray-800 border-gray-700 text-gray-100"
                  : "bg-white border-gray-300 text-gray-900"
              }`}
            >
              {BUDGET_PERIODS.map((period) => (
                <option key={period.value} value={period.value}>
                  {period.label}
                </option>
              ))}
            </select>
          </div>

          {/* Start Date */}
          <div>
            <label className="block text-sm font-semibold mb-2">
              Start Date
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Calendar className="w-5 h-5 text-gray-400" />
              </div>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                className={`w-full pl-10 pr-4 py-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                  isDark
                    ? "bg-gray-800 border-gray-700 text-gray-100"
                    : "bg-white border-gray-300 text-gray-900"
                } ${errors.startDate ? "border-red-500" : "border"}`}
              />
            </div>
            {errors.startDate && (
              <p className="mt-1 text-sm text-red-500">{errors.startDate}</p>
            )}
          </div>

          {/* Alert Threshold */}
          <div>
            <label className="block text-sm font-semibold mb-2">
              Alert Threshold ({formData.alertThreshold}%)
            </label>
            <div className="flex items-center gap-3">
              <Bell className="w-5 h-5 text-gray-400 flex-shrink-0" />
              <input
                type="range"
                name="alertThreshold"
                value={formData.alertThreshold}
                onChange={handleRangeChange}
                min="50"
                max="100"
                step="5"
                className="w-full h-2 rounded-lg appearance-none cursor-pointer accent-blue-600 bg-gray-300 dark:bg-gray-700"
              />
            </div>
            <p
              className={`mt-2 text-xs ${
                isDark ? "text-gray-400" : "text-gray-500"
              }`}
            >
              You'll be notified when you reach this percentage of your budget.
            </p>
            {errors.alertThreshold && (
              <p className="mt-1 text-sm text-red-500">
                {errors.alertThreshold}
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className={`flex-1 px-4 py-3 rounded-xl font-semibold transition-colors ${
                isDark
                  ? "border border-gray-600 text-gray-300 hover:bg-gray-700"
                  : "border border-gray-300 text-gray-700 hover:bg-gray-50"
              }`}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Saving..." : editingBudget ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BudgetForm;
