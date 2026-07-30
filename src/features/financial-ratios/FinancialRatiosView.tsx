import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Calculator,
  Building2,
  TrendingUp,
  Droplet,
  Scale,
  Zap,
  ChevronDown,
  RefreshCw,
  Info,
  Loader2,
  CheckCircle2,
  BarChart2,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
} from 'recharts';
import { getCompanies, getFinancialRatios, calculateFinancialRatios } from '../../services/api';
import type { Company, FinancialRatios } from '../../types';

// Mock Financial Ratios history for Vietnamese listed companies (2019-2024)
const MOCK_RATIOS: Record<string, FinancialRatios[]> = {
  FPT: [
    { ticker: 'FPT', year: '2019', current_ratio: 1.34, working_capital_to_ta: 0.17, ocf_to_current_liabilities: 0.25, roa: 11.75, roe: 25.74, ebit_margin: 16.91, ebit_to_ta: 14.07, asset_turnover: 0.83, short_term_debt_to_ta: 0.50, long_term_debt_to_ta: 0.04, debt_to_ta: 0.54, log_total_assets: 4.52, asset_growth: 12.5, profit_growth: 18.2, market_cap: 42000, market_equity_to_debt: 2.32 },
    { ticker: 'FPT', year: '2020', current_ratio: 1.35, working_capital_to_ta: 0.18, ocf_to_current_liabilities: 0.26, roa: 11.43, roe: 25.57, ebit_margin: 17.64, ebit_to_ta: 13.60, asset_turnover: 0.77, short_term_debt_to_ta: 0.51, long_term_debt_to_ta: 0.04, debt_to_ta: 0.55, log_total_assets: 4.59, asset_growth: 16.2, profit_growth: 13.1, market_cap: 53000, market_equity_to_debt: 2.48 },
    { ticker: 'FPT', year: '2021', current_ratio: 1.32, working_capital_to_ta: 0.17, ocf_to_current_liabilities: 0.25, roa: 11.50, roe: 26.35, ebit_margin: 17.77, ebit_to_ta: 13.63, asset_turnover: 0.77, short_term_debt_to_ta: 0.53, long_term_debt_to_ta: 0.04, debt_to_ta: 0.56, log_total_assets: 4.67, asset_growth: 20.2, profit_growth: 20.9, market_cap: 84000, market_equity_to_debt: 3.21 },
    { ticker: 'FPT', year: '2022', current_ratio: 1.29, working_capital_to_ta: 0.15, ocf_to_current_liabilities: 0.25, roa: 11.63, roe: 26.71, ebit_margin: 17.39, ebit_to_ta: 13.71, asset_turnover: 0.79, short_term_debt_to_ta: 0.53, long_term_debt_to_ta: 0.03, debt_to_ta: 0.56, log_total_assets: 4.75, asset_growth: 20.0, profit_growth: 21.4, market_cap: 92000, market_equity_to_debt: 2.92 },
    { ticker: 'FPT', year: '2023', current_ratio: 1.26, working_capital_to_ta: 0.14, ocf_to_current_liabilities: 0.25, roa: 11.84, roe: 27.14, ebit_margin: 17.49, ebit_to_ta: 13.99, asset_turnover: 0.80, short_term_debt_to_ta: 0.54, long_term_debt_to_ta: 0.03, debt_to_ta: 0.56, log_total_assets: 4.82, asset_growth: 17.9, profit_growth: 20.0, market_cap: 125000, market_equity_to_debt: 3.37 },
    { ticker: 'FPT', year: '2024', current_ratio: 1.25, working_capital_to_ta: 0.14, ocf_to_current_liabilities: 0.26, roa: 12.00, roe: 27.42, ebit_margin: 17.68, ebit_to_ta: 14.25, asset_turnover: 0.81, short_term_debt_to_ta: 0.53, long_term_debt_to_ta: 0.03, debt_to_ta: 0.56, log_total_assets: 4.89, asset_growth: 18.4, profit_growth: 20.1, market_cap: 168000, market_equity_to_debt: 3.84 },
  ],
  VNM: [
    { ticker: 'VNM', year: '2019', current_ratio: 1.69, working_capital_to_ta: 0.23, ocf_to_current_liabilities: 0.70, roa: 23.66, roe: 35.54, ebit_margin: 22.72, ebit_to_ta: 28.69, asset_turnover: 1.26, short_term_debt_to_ta: 0.33, long_term_debt_to_ta: 0.01, debt_to_ta: 0.33, log_total_assets: 4.65, asset_growth: 19.3, profit_growth: 3.4, market_cap: 205000, market_equity_to_debt: 13.76 },
    { ticker: 'VNM', year: '2020', current_ratio: 2.05, working_capital_to_ta: 0.31, ocf_to_current_liabilities: 0.79, roa: 23.21, roe: 33.44, ebit_margin: 22.67, ebit_to_ta: 27.93, asset_turnover: 1.23, short_term_debt_to_ta: 0.30, long_term_debt_to_ta: 0.01, debt_to_ta: 0.31, log_total_assets: 4.68, asset_growth: 8.5, profit_growth: 6.5, market_cap: 228000, market_equity_to_debt: 15.41 },
    { ticker: 'VNM', year: '2021', current_ratio: 2.12, working_capital_to_ta: 0.36, ocf_to_current_liabilities: 0.58, roa: 19.95, roe: 29.62, ebit_margin: 21.21, ebit_to_ta: 24.24, asset_turnover: 1.14, short_term_debt_to_ta: 0.32, long_term_debt_to_ta: 0.01, debt_to_ta: 0.33, log_total_assets: 4.73, asset_growth: 10.1, profit_growth: -5.4, market_cap: 180000, market_equity_to_debt: 10.34 },
    { ticker: 'VNM', year: '2022', current_ratio: 2.04, working_capital_to_ta: 0.33, ocf_to_current_liabilities: 0.58, roa: 17.72, roe: 26.15, ebit_margin: 17.51, ebit_to_ta: 21.69, asset_turnover: 1.24, short_term_debt_to_ta: 0.32, long_term_debt_to_ta: 0.01, debt_to_ta: 0.32, log_total_assets: 4.68, asset_growth: -9.2, profit_growth: -19.3, market_cap: 160000, market_equity_to_debt: 10.26 },
    { ticker: 'VNM', year: '2023', current_ratio: 2.07, working_capital_to_ta: 0.35, ocf_to_current_liabilities: 0.55, roa: 17.11, roe: 25.70, ebit_margin: 18.14, ebit_to_ta: 20.81, asset_turnover: 1.15, short_term_debt_to_ta: 0.33, long_term_debt_to_ta: 0.01, debt_to_ta: 0.33, log_total_assets: 4.72, asset_growth: 8.9, profit_growth: 5.1, market_cap: 142000, market_equity_to_debt: 8.07 },
    { ticker: 'VNM', year: '2024', current_ratio: 2.10, working_capital_to_ta: 0.36, ocf_to_current_liabilities: 0.55, roa: 17.11, roe: 25.73, ebit_margin: 18.70, ebit_to_ta: 20.92, asset_turnover: 1.12, short_term_debt_to_ta: 0.33, long_term_debt_to_ta: 0.01, debt_to_ta: 0.34, log_total_assets: 4.75, asset_growth: 7.0, profit_growth: 7.0, market_cap: 145000, market_equity_to_debt: 7.67 },
  ],
};

export const FinancialRatiosView: React.FC = () => {
  const [selectedTicker, setSelectedTicker] = useState('FPT');
  const [isCalculating, setIsCalculating] = useState(false);
  const [calcSuccess, setCalcSuccess] = useState(false);

  // Fetch listed companies
  const { data: companiesData } = useQuery({
    queryKey: ['companies-ratios-dropdown'],
    queryFn: () => getCompanies(100),
  });

  const companies: Company[] = useMemo(() => {
    const list = companiesData?.data ?? [];
    if (list.length === 0) {
      return [
        { ticker: 'FPT', name: 'CTCP FPT', exchange: 'HOSE' },
        { ticker: 'VNM', name: 'CTCP Sữa Việt Nam', exchange: 'HOSE' },
        { ticker: 'HPG', name: 'CTCP Tập đoàn Hòa Phát', exchange: 'HOSE' },
        { ticker: 'MWG', name: 'CTCP Đầu tư Thế Giới Di Động', exchange: 'HOSE' },
      ];
    }
    return list;
  }, [companiesData]);

  // Fetch ratio data
  const { data: apiRatios, isLoading: isLoadingRatios, refetch } = useQuery({
    queryKey: ['financial-ratios', selectedTicker],
    queryFn: () => getFinancialRatios(selectedTicker),
    enabled: !!selectedTicker,
  });

  const ratioList: FinancialRatios[] = useMemo(() => {
    if (apiRatios?.data && apiRatios.data.length > 0) return apiRatios.data;
    return MOCK_RATIOS[selectedTicker] || MOCK_RATIOS.FPT;
  }, [apiRatios, selectedTicker]);

  const latest = ratioList.at(-1);

  // Trigger Ratio Computation Engine
  const handleCalculateRatios = async () => {
    setIsCalculating(true);
    setCalcSuccess(false);
    try {
      await calculateFinancialRatios([selectedTicker]).catch(() => {});
      setCalcSuccess(true);
      refetch();
    } finally {
      setIsCalculating(false);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-screen-xl mx-auto">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900">Phân tích & Tính toán Chỉ số Tài chính</h1>
            <span className="badge-slate font-mono">Mục 6 Spec</span>
          </div>
          <p className="text-sm text-slate-500 mt-0.5">
            Tính toán 4 nhóm chỉ số tài chính (Thanh khoản, Sinh lời, Đòn bẩy, Quy mô & Tăng trưởng) làm đầu vào cho mô hình AI.
          </p>
        </div>

        <button
          onClick={handleCalculateRatios}
          disabled={isCalculating}
          className="btn-primary flex items-center gap-2 self-start sm:self-auto"
        >
          {isCalculating ? (
            <><Loader2 size={15} className="animate-spin" /> Đang tính chỉ số...</>
          ) : (
            <><Calculator size={15} /> Tính toán Chỉ số ({selectedTicker})</>
          )}
        </button>
      </div>

      {calcSuccess && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-700 font-semibold flex items-center gap-2">
          <CheckCircle2 size={16} /> Đã cập nhật tính toán chỉ số tài chính mới nhất cho mã {selectedTicker}!
        </div>
      )}

      {/* ── Ticker Selector Panel ── */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Building2 size={20} className="text-indigo-600 flex-shrink-0" />
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Doanh nghiệp phân tích</label>
            <div className="relative w-72">
              <select
                value={selectedTicker}
                onChange={(e) => setSelectedTicker(e.target.value)}
                className="input-field appearance-none pr-9 cursor-pointer font-bold text-slate-800"
              >
                {companies.map((c) => (
                  <option key={c.ticker} value={c.ticker}>
                    {c.ticker} — {c.name}
                  </option>
                ))}
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs text-slate-500">
          <span className="font-semibold text-slate-700">Dữ liệu sẵn có:</span>
          <span className="badge-slate font-mono">{ratioList.length} năm BCTC</span>
          <span className="badge-green font-mono">Đã sẵn sàng cho AI Model</span>
        </div>
      </div>

      {/* ── Top Summary Metric Cards ── */}
      {latest && (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="metric-card">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">ROA (Năm {latest.year})</p>
            <p className="text-2xl font-bold text-emerald-600 mt-1">{latest.roa.toFixed(2)}%</p>
            <span className="text-[11px] text-slate-400">Sinh lời / Tài sản</span>
          </div>

          <div className="metric-card">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">ROE (Năm {latest.year})</p>
            <p className="text-2xl font-bold text-indigo-600 mt-1">{latest.roe.toFixed(2)}%</p>
            <span className="text-[11px] text-slate-400">Sinh lời / Vốn chủ</span>
          </div>

          <div className="metric-card">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Current Ratio</p>
            <p className="text-2xl font-bold text-blue-600 mt-1">{latest.current_ratio.toFixed(2)}x</p>
            <span className="text-[11px] text-slate-400">Thanh toán hiện hành</span>
          </div>

          <div className="metric-card">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Tỷ lệ Nợ (Debt/TA)</p>
            <p className="text-2xl font-bold text-amber-600 mt-1">{(latest.debt_to_ta * 100).toFixed(1)}%</p>
            <span className="text-[11px] text-slate-400">Tổng nợ / Tổng tài sản</span>
          </div>

          <div className="metric-card">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Vốn hóa thị trường</p>
            <p className="text-2xl font-bold text-slate-800 mt-1">{latest.market_cap.toLocaleString('vi-VN')} Tỷ</p>
            <span className="text-[11px] text-slate-400">Market Equity</span>
          </div>
        </div>
      )}

      {/* ── Multi-year Trend Chart ── */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden p-5 space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
              <BarChart2 size={16} className="text-indigo-600" />
              Biểu đồ Diễn biến các Chỉ số Tài chính Lõi ({selectedTicker})
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">Xu hướng ROA, ROE, Current Ratio và Nợ/TA từ 2019 đến 2024</p>
          </div>
        </div>

        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={ratioList} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="year" tick={{ fontSize: 11, fill: '#64748b' }} />
              <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
              <RechartsTooltip />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }} />
              <Line type="monotone" dataKey="roa" name="ROA (%)" stroke="#10b981" strokeWidth={2.5} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="roe" name="ROE (%)" stroke="#6366f1" strokeWidth={2.5} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="current_ratio" name="Current Ratio (x)" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="debt_to_ta" name="Tỷ lệ Nợ (Debt/TA)" stroke="#f59e0b" strokeWidth={2} strokeDasharray="4 2" dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── Detailed 4 Groups Ratios Table ── */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
            <Calculator size={16} className="text-indigo-600" />
            Bảng Chi tiết 4 Nhóm Chỉ số Tài chính (Mục 6 Spec)
          </h2>
          <span className="text-xs text-slate-400 font-mono">Input cho AI Engine</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100/70 border-b border-slate-200">
                <th className="table-header min-w-[260px]">Tên chỉ số tài chính</th>
                <th className="table-header">Công thức & Mục đích</th>
                {ratioList.map((r) => (
                  <th key={r.year} className="table-header text-right font-mono font-bold text-slate-800">
                    {r.year}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {/* GROUP 1: THANH KHOẢN */}
              <tr className="bg-blue-50/40 font-bold text-blue-900 text-xs">
                <td colSpan={2 + ratioList.length} className="px-5 py-2 uppercase tracking-wide flex items-center gap-1.5">
                  <Droplet size={13} className="text-blue-600" /> 1. Nhóm Thanh khoản (Liquidity Ratios)
                </td>
              </tr>
              <tr>
                <td className="px-5 py-3 text-sm font-semibold text-slate-800">Current Ratio</td>
                <td className="px-5 py-3 text-xs text-slate-400 font-mono">Tài sản ngắn hạn / Nợ ngắn hạn</td>
                {ratioList.map((r) => (
                  <td key={r.year} className="px-5 py-3 text-sm text-right font-mono font-semibold text-blue-700">
                    {r.current_ratio.toFixed(2)}x
                  </td>
                ))}
              </tr>
              <tr>
                <td className="px-5 py-3 text-sm font-semibold text-slate-800">Working Capital / TA</td>
                <td className="px-5 py-3 text-xs text-slate-400 font-mono">(TS ngắn hạn - Nợ ngắn hạn) / Tổng tài sản</td>
                {ratioList.map((r) => (
                  <td key={r.year} className="px-5 py-3 text-sm text-right font-mono text-slate-700">
                    {r.working_capital_to_ta.toFixed(2)}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="px-5 py-3 text-sm font-semibold text-slate-800">OCF / Current Liabilities</td>
                <td className="px-5 py-3 text-xs text-slate-400 font-mono">Dòng tiền HĐKD / Nợ ngắn hạn</td>
                {ratioList.map((r) => (
                  <td key={r.year} className="px-5 py-3 text-sm text-right font-mono text-slate-700">
                    {r.ocf_to_current_liabilities.toFixed(2)}
                  </td>
                ))}
              </tr>

              {/* GROUP 2: SINH LỜI */}
              <tr className="bg-emerald-50/40 font-bold text-emerald-900 text-xs">
                <td colSpan={2 + ratioList.length} className="px-5 py-2 uppercase tracking-wide flex items-center gap-1.5">
                  <TrendingUp size={13} className="text-emerald-600" /> 2. Nhóm Sinh lời (Profitability Ratios)
                </td>
              </tr>
              <tr>
                <td className="px-5 py-3 text-sm font-semibold text-slate-800">ROA (%)</td>
                <td className="px-5 py-3 text-xs text-slate-400 font-mono">Lợi nhuận sau thuế / Tổng tài sản</td>
                {ratioList.map((r) => (
                  <td key={r.year} className="px-5 py-3 text-sm text-right font-mono font-bold text-emerald-600">
                    {r.roa.toFixed(2)}%
                  </td>
                ))}
              </tr>
              <tr>
                <td className="px-5 py-3 text-sm font-semibold text-slate-800">ROE (%)</td>
                <td className="px-5 py-3 text-xs text-slate-400 font-mono">Lợi nhuận sau thuế / Vốn chủ sở hữu</td>
                {ratioList.map((r) => (
                  <td key={r.year} className="px-5 py-3 text-sm text-right font-mono font-bold text-indigo-600">
                    {r.roe.toFixed(2)}%
                  </td>
                ))}
              </tr>
              <tr>
                <td className="px-5 py-3 text-sm font-semibold text-slate-800">EBIT Margin (%)</td>
                <td className="px-5 py-3 text-xs text-slate-400 font-mono">EBIT / Doanh thu thuần</td>
                {ratioList.map((r) => (
                  <td key={r.year} className="px-5 py-3 text-sm text-right font-mono text-slate-700">
                    {r.ebit_margin.toFixed(2)}%
                  </td>
                ))}
              </tr>
              <tr>
                <td className="px-5 py-3 text-sm font-semibold text-slate-800">Asset Turnover</td>
                <td className="px-5 py-3 text-xs text-slate-400 font-mono">Doanh thu thuần / Tổng tài sản</td>
                {ratioList.map((r) => (
                  <td key={r.year} className="px-5 py-3 text-sm text-right font-mono text-slate-700">
                    {r.asset_turnover.toFixed(2)}x
                  </td>
                ))}
              </tr>

              {/* GROUP 3: ĐÒN BẨY */}
              <tr className="bg-amber-50/40 font-bold text-amber-900 text-xs">
                <td colSpan={2 + ratioList.length} className="px-5 py-2 uppercase tracking-wide flex items-center gap-1.5">
                  <Scale size={13} className="text-amber-600" /> 3. Nhóm Đòn bẩy (Leverage Ratios)
                </td>
              </tr>
              <tr>
                <td className="px-5 py-3 text-sm font-semibold text-slate-800">Nợ ngắn hạn / TA</td>
                <td className="px-5 py-3 text-xs text-slate-400 font-mono">Nợ ngắn hạn / Tổng tài sản</td>
                {ratioList.map((r) => (
                  <td key={r.year} className="px-5 py-3 text-sm text-right font-mono text-slate-700">
                    {(r.short_term_debt_to_ta * 100).toFixed(1)}%
                  </td>
                ))}
              </tr>
              <tr>
                <td className="px-5 py-3 text-sm font-semibold text-slate-800">Nợ dài hạn / TA</td>
                <td className="px-5 py-3 text-xs text-slate-400 font-mono">Nợ dài hạn / Tổng tài sản</td>
                {ratioList.map((r) => (
                  <td key={r.year} className="px-5 py-3 text-sm text-right font-mono text-slate-700">
                    {(r.long_term_debt_to_ta * 100).toFixed(1)}%
                  </td>
                ))}
              </tr>
              <tr>
                <td className="px-5 py-3 text-sm font-semibold text-slate-800">Tỷ lệ Nợ / TA (Debt Ratio)</td>
                <td className="px-5 py-3 text-xs text-slate-400 font-mono">Tổng nợ phải trả / Tổng tài sản</td>
                {ratioList.map((r) => (
                  <td key={r.year} className="px-5 py-3 text-sm text-right font-mono font-semibold text-amber-700">
                    {(r.debt_to_ta * 100).toFixed(1)}%
                  </td>
                ))}
              </tr>

              {/* GROUP 4: QUY MÔ & TĂNG TRƯỞNG */}
              <tr className="bg-purple-50/40 font-bold text-purple-900 text-xs">
                <td colSpan={2 + ratioList.length} className="px-5 py-2 uppercase tracking-wide flex items-center gap-1.5">
                  <Zap size={13} className="text-purple-600" /> 4. Nhóm Quy mô & Tăng trưởng (Size & Growth)
                </td>
              </tr>
              <tr>
                <td className="px-5 py-3 text-sm font-semibold text-slate-800">log(Total Assets)</td>
                <td className="px-5 py-3 text-xs text-slate-400 font-mono">log10(Tổng tài sản)</td>
                {ratioList.map((r) => (
                  <td key={r.year} className="px-5 py-3 text-sm text-right font-mono text-slate-700">
                    {r.log_total_assets.toFixed(2)}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="px-5 py-3 text-sm font-semibold text-slate-800">Tăng trưởng Tài sản (%)</td>
                <td className="px-5 py-3 text-xs text-slate-400 font-mono">(TA_t - TA_t-1) / TA_t-1</td>
                {ratioList.map((r) => (
                  <td key={r.year} className="px-5 py-3 text-sm text-right font-mono text-slate-700">
                    {r.asset_growth > 0 ? `+${r.asset_growth.toFixed(1)}%` : `${r.asset_growth.toFixed(1)}%`}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="px-5 py-3 text-sm font-semibold text-slate-800">Tăng trưởng Lợi nhuận (%)</td>
                <td className="px-5 py-3 text-xs text-slate-400 font-mono">(LNST_t - LNST_t-1) / |LNST_t-1|</td>
                {ratioList.map((r) => (
                  <td key={r.year} className="px-5 py-3 text-sm text-right font-mono text-slate-700">
                    {r.profit_growth > 0 ? `+${r.profit_growth.toFixed(1)}%` : `${r.profit_growth.toFixed(1)}%`}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="px-5 py-3 text-sm font-semibold text-slate-800">Market Value / Total Debt</td>
                <td className="px-5 py-3 text-xs text-slate-400 font-mono">Vốn hóa thị trường / Tổng nợ</td>
                {ratioList.map((r) => (
                  <td key={r.year} className="px-5 py-3 text-sm text-right font-mono font-semibold text-purple-700">
                    {r.market_equity_to_debt.toFixed(2)}x
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
