import React, { useState, useEffect } from 'react';
import { Download, TrendingUp, ArrowUpDown, ArrowUp, ArrowDown, Search, X, Save, History, User, Calculator, Activity, Info } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { toPng, toJpeg } from 'html-to-image';
import { jsPDF } from 'jspdf';
import { auth, db } from '../firebase';
import { signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged } from 'firebase/auth';
import { collection, doc, setDoc, deleteDoc, query, where, addDoc, serverTimestamp } from 'firebase/firestore';
import { useLanguage } from '../LanguageContext';

function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn(error);
      return initialValue;
    }
  });

  const setValue = (value: T) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.warn(error);
    }
  };

  return [storedValue, setValue];
}

const InputGroup = ({ label, tooltip, value, onChange, type = "number", disabled = false, rightElement }: any) => {
  const displayValue = value === undefined || value === null || (typeof value === 'number' && Number.isNaN(value)) ? '' : value;

  return (
    <div className={`p-3 border rounded-lg transition-all duration-300 ease-in-out
      ${disabled ? 'bg-zinc-100/50 dark:bg-zinc-800/30 border-zinc-200 dark:border-zinc-800 opacity-70 cursor-not-allowed' : 
        'bg-zinc-50 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-700 hover:shadow-md hover:border-zinc-300 dark:hover:border-zinc-600 hover:-translate-y-0.5'}
    `}>
      <div className="flex items-center justify-between mb-2">
        <label className={`flex items-center text-xs font-bold transition-colors duration-200
          ${disabled ? 'text-zinc-400 dark:text-zinc-500' : 'text-zinc-500 dark:text-zinc-400'}
        `}>
          {label}
          {tooltip && (
            <span className={`group relative ml-1.5 inline-flex items-center justify-center w-[18px] h-[18px] rounded-full text-[11px] cursor-help transition-colors
              ${disabled ? 'bg-zinc-300 dark:bg-zinc-600 text-zinc-100 dark:text-zinc-400' : 'bg-zinc-500 text-white hover:bg-zinc-600 dark:hover:bg-zinc-400'}
            `}>
              ?
              <span className="absolute bottom-full right-1/2 translate-x-1/2 mb-2 hidden group-hover:block w-48 bg-black text-white text-xs p-2 rounded-lg text-right font-normal z-50 shadow-xl">
                {tooltip}
              </span>
            </span>
          )}
        </label>
        {rightElement && <div>{rightElement}</div>}
      </div>
      <input
        type={type}
        value={displayValue}
        disabled={disabled}
        onChange={(e) => {
          const val = e.target.value;
          if (type === 'number') {
            onChange(val === '' ? '' : Number(val));
          } else {
            onChange(val);
          }
        }}
        className={`w-full p-2.5 border rounded-md text-base font-bold focus:outline-none focus:ring-2 focus:ring-[#09090b] transition-all duration-200
          ${disabled ? 'bg-zinc-100 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-700 text-zinc-400 dark:text-zinc-500 cursor-not-allowed' : 
            'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 hover:border-zinc-300 dark:hover:border-zinc-600'}
        `}
      />
    </div>
  );
};

const defaultTranslations = {
  ar: {
    opModeDetailed: "تفصيلي لكافة التكاليف",
    opModeTotal: "رقم إجمالي جاهز",
    rentType: "نوع الإيجار",
    rentTotal: "إجمالي الإيجار",
    rentFixed: "إيجار ثابت للقطعة",
    rentCbm: "بناءً على الحجم",
    rentPerPiece: "تكلفة القطعة",
    rentPerCbm: "سعر المتر المكعب",
    cbmPerPiece: "حجم القطعة",
    packUnit: "تكلفة التغليف للقطعة",
    ccUnit: "تكلفة تأكيد الطلب للقطعة",
    customs: "الجمارك للقطعة",
    sms: "رسائل SMS",
    vat: "الضريبة (VAT)",
    gatewayPct: "رسوم الدفع للقطعة",
    marketerType: "نوع عمولة المسوق",
    marketerPctOpt: "نسبة مئوية",
    marketerFixedOpt: "مبلغ ثابت",
    marketerBothOpt: "كلاهما",
    marketerPctVal: "العمولة (%)",
    marketerFixedVal: "العمولة (مبلغ)",
    opFlatVal: "التكلفة الإجمالية التشغيلية للطلب",
    batchQty: "كمية الدفعة",
    opCostPerUnit: "تكلفة العمليات للوحدة",
    bundleSize: "حجم العرض (Bundle)",
    pCost: "تكلفة المنتج",
    shipSuccess: "تكلفة الشحن الناجح",
    rtoFlat: "تكلفة المرتجع",
    wastePercent: "نسبة التالف (%)",
    targetMargin: "الربح المطلوب",
    amount: "مبلغ",
    percentage: "نسبة %",
    finalSp: "سعر البيع النهائي",
    confirmRate: "نسبة التأكيد (%)",
    analysisNdr: "تحليل نسبة التسليم (NDR)",
    analysisCpa: "تحليل تکلفة الاعلان (CPA)",
    fixedCpa: "CPA الثابت (تكلفة الاعلان)",
    fixedNdr: "NDR الثابت (نسبة التسليم)",
    cpaFrom: "CPA (من)",
    cpaTo: "CPA (إلى)",
    compareActualToBE: "مقارنة العائد الحقيقي بنقطة التعادل",
    trueRoasChart: "العائد الفعلي (True ROAS)",
    beRoasChart: "التعادل (B.E ROAS)",
    deliveryRateCol: "نسبة التسليم",
    ndrCol: "NDR",
    shippedOrders: "الطلبات المشحونة",
    totalBill: "إجمالي فاتورة الشحن",
    opCostByNdr: "إجمالي العمليات",
    netProfit: "صافي الربح",
    bePoint: "نقطة التعادل لـ",
    customCalc: "الحاسبة المخصصة",
    customNdrLabel: "ادخل نسبة تسليم مخصصة (%)",
    customCpaLabel: "ادخل تكلفة اعلانات مخصصة",
    dashSp: "السعر المقترح للمنتج",
    dashShip: "فاتورة الشحن",
    dashNet: "الربح المتوقع",
    dashWaste: "التالف",
    saveProduct: "حفظ المنتج",
    productName: "اسم المنتج",
    rentTooltip: "إجمالي الإيجار، ستنقسم على الكمية",
    rentPerPieceTooltip: "تكلفة الإيجار والمصاريف للقطعة الواحد",
    packTooltip: "تكلفة التغليف للقطعة",
    ccTooltip: "عمولة التأكيد لكل طلب محتمل",
    customsTooltip: "قيمة الجمارك المدفوعة على القطعة",
    smsTooltip: "تكلفة رسالة الـ SMS (لو بتستخدمها لتأكيد الطلب)",
    vatTooltip: "الضريبة المضافة كنسبة مئوية",
    opFlatTooltip: "متوسط تكلفة التشغيل للطلب الواحد",
    batchTooltip: "الكمية في الدفعة الواحدة",
    pCostTooltip: "تكلفة شراء أو تصنيع القطعة",
    shipSuccessTooltip: "تكلفة الشحن الناجح للعميل",
    rtoTooltip: "تكلفة المرتجع",
    wasteTooltip: "النسبة المئوية للمتلفات",
    targetMarginTooltip: "صافي الربح الذي ترغب في تحقيقه من كل طلب",
    finalSpTooltip: "سعر بيع المنتج النهائي الحالي للنمذجة",
    confirmTooltip: "نسبة الطلبات اللي سيتم تأكيدها من Leads",
    fixedCpaTooltip: "تكلفة الاستحواذ على العميل CPA",
    dashSpTooltip: "هذا السعر الذي سيعطيك الربح المطلوب لو بعت بي",
  }
};

export default function PricingCalculator() {
  const tStr = (key: string) => defaultTranslations.ar[(key as keyof typeof defaultTranslations.ar)] || key;
  const isDark = document.documentElement.classList.contains('dark');
  const [currency, setCurrency] = useLocalStorage('app_currency', 'EGP');

  const formatCurrency = (val: number) => `${val.toLocaleString(undefined, { maximumFractionDigits: 0 })} ${currency}`;

  // Opex State
  const [opMode, setOpMode] = useLocalStorage<'detailed' | 'total'>('app_opMode', 'detailed');
  const [rent, setRent] = useLocalStorage('app_rent', 0);
  const [packUnit, setPackUnit] = useLocalStorage('app_packUnit', 0);
  const [ccUnit, setCcUnit] = useLocalStorage('app_ccUnit', 0);
  const [opFlatVal, setOpFlatVal] = useLocalStorage('app_opFlatVal', 0);
  const [batchQty, setBatchQty] = useLocalStorage('app_batchQty', 0);

  // New Detailed Ops State
  const [customs, setCustoms] = useLocalStorage('app_customs', 0);
  const [sms, setSms] = useLocalStorage('app_sms', 0);
  const [vat, setVat] = useLocalStorage('app_vat', 0);

  // Rent State
  const [rentType, setRentType] = useLocalStorage<'total' | 'fixed' | 'cbm'>('app_rentType', 'total');
  const [rentPerPiece, setRentPerPiece] = useLocalStorage('app_rentPerPiece', 0);
  const [rentPerCbm, setRentPerCbm] = useLocalStorage('app_rentPerCbm', 0);
  const [cbmPerPiece, setCbmPerPiece] = useLocalStorage('app_cbmPerPiece', 0);

  // Pricing State
  const [pCost, setPCost] = useLocalStorage('app_pCost', 0);
  const [shipSuccess, setShipSuccess] = useLocalStorage('app_shipSuccess', 0);
  const [rtoFlat, setRtoFlat] = useLocalStorage('app_rtoFlat', 0);
  const [wastePercent, setWastePercent] = useLocalStorage('app_wastePercent', 0);
  const [marginVal, setMarginVal] = useLocalStorage('app_marginVal', 0);
  const [marginType, setMarginType] = useLocalStorage<'fixed' | 'percentage'>('app_marginType', 'fixed');
  const [bundleSize, setBundleSize] = useLocalStorage('app_bundleSize', 1);

  // Forecast State
  const [analysisType, setAnalysisType] = useLocalStorage<'ndr' | 'cpa'>('app_analysisType', 'ndr');
  const [fSp, setFSp] = useLocalStorage('app_fSp', 0);
  const [fixedCpa, setFixedCpa] = useLocalStorage('app_fixedCpa', 0);
  const [cpaFrom, setCpaFrom] = useLocalStorage('app_cpaFrom', 0);
  const [cpaTo, setCpaTo] = useLocalStorage('app_cpaTo', 0);
  const [confirmRate, setConfirmRate] = useLocalStorage('app_confirmRate', 100);
  const [fixedNdr, setFixedNdr] = useLocalStorage('app_fixedNdr', 0);

  const [customNdr, setCustomNdr] = useLocalStorage('app_customNdr', 0);
  const [customCpa, setCustomCpa] = useLocalStorage('app_customCpa', 0);

  // Calculations
  const qty = Number(batchQty) || 1;
  const totalOrders = qty / bundleSize;
  const rentCalc = rentType === 'total' ? (Number(rent) / qty) : rentType === 'cbm' ? (Number(rentPerCbm) * Number(cbmPerPiece)) : Number(rentPerPiece);
  const ops = opMode === 'detailed' ? rentCalc + ((Number(packUnit) + Number(ccUnit)) * bundleSize) : Number(opFlatVal);
  const formatNumber = (num: number) => Number.isFinite(num) && !isNaN(num) ? num : 0;
  
  const pctFees = opMode === 'detailed' ? Number(vat) / 100 : 0;
  const fixedFees = 0;
  const customsCost = opMode === 'detailed' ? Number(customs) : 0;
  const smsCost = opMode === 'detailed' ? Number(sms) : 0;
  const totalWaste = qty * (Number(wastePercent) / 100) * Number(pCost);
  const wastePerUnit = qty > 0 ? totalWaste / qty : 0;

  // Analysis Scenarios
  const scenarios = [];
  if (analysisType === 'ndr') {
    for (let i = 10; i <= 100; i += 10) {
      const dRate = i / 100;
      const cRate = Number(confirmRate) / 100;
      const shippedOrders = totalOrders / dRate;
      const leads = Math.ceil(shippedOrders / cRate);
      const totalBill = (totalOrders * Number(shipSuccess)) + ((shippedOrders - totalOrders) * Number(rtoFlat));
      const billPerOrder = totalBill / totalOrders;
      const totalOpsPerOrder = (shippedOrders * ops) / totalOrders;
      const varCostPerOrder = ((Number(pCost) + customsCost) * bundleSize) + billPerOrder + totalOpsPerOrder + (wastePerUnit * bundleSize) + (Number(fSp) * pctFees) + fixedFees;
      const beRoas = Number(fSp) / (Number(fSp) - varCostPerOrder);
      const ads = leads * (Number(fixedCpa) + smsCost);
      const net = (totalOrders * Number(fSp)) - ((totalOrders * varCostPerOrder) + ads);
      const trueRoas = ads > 0 ? ((totalOrders * Number(fSp)) / ads) : 0;
      const trueCac = ads / totalOrders;
      
      scenarios.push({
        col1: `${i}%`,
        ndrTotal: (dRate * cRate * 100).toFixed(1) + '%',
        leads,
        shipped: Math.ceil(shippedOrders),
        totalBill: Math.round(totalBill),
        totalOpsPerOrder: Math.round(totalOpsPerOrder),
        beRoas: beRoas > 0 && isFinite(beRoas) ? beRoas.toFixed(2) : '∞',
        trueRoas: trueRoas.toFixed(2),
        trueCac: Math.round(trueCac),
        net: Math.round(net),
        isProfitable: trueRoas >= beRoas,
        numericBeRoas: beRoas > 0 && isFinite(beRoas) ? Number(beRoas.toFixed(2)) : 0,
        numericTrueRoas: Number(trueRoas.toFixed(2))
      });
    }
  } else {
    const dRate = Number(fixedNdr) / 100;
    const cRate = Number(confirmRate) / 100;
    const shippedOrders = totalOrders / dRate;
    const leads = Math.ceil(shippedOrders / cRate);
    const totalBill = (totalOrders * Number(shipSuccess)) + ((shippedOrders - totalOrders) * Number(rtoFlat));
    const billPerOrder = totalBill / totalOrders;
    const totalOpsPerOrder = (shippedOrders * ops) / totalOrders;
    const varCostPerOrder = ((Number(pCost) + customsCost) * bundleSize) + billPerOrder + totalOpsPerOrder + (wastePerUnit * bundleSize) + (Number(fSp) * pctFees) + fixedFees;
    const beRoas = Number(fSp) / (Number(fSp) - varCostPerOrder);
    const step = (Number(cpaTo) - Number(cpaFrom)) / 10;
    
    for (let j = 0; j <= 10; j++) {
      const curCpa = Number(cpaFrom) + (step * j);
      const ads = leads * (curCpa + smsCost);
      const net = (totalOrders * Number(fSp)) - ((totalOrders * varCostPerOrder) + ads);
      const trueRoas = ads > 0 ? ((totalOrders * Number(fSp)) / ads) : 0;
      const trueCac = ads / totalOrders;
      
      scenarios.push({
        col1: Math.round(curCpa),
        ndrTotal: (dRate * cRate * 100).toFixed(1) + '%',
        leads,
        shipped: Math.ceil(shippedOrders),
        totalBill: Math.round(totalBill),
        totalOpsPerOrder: Math.round(totalOpsPerOrder),
        beRoas: isFinite(beRoas) ? beRoas.toFixed(2) : '∞',
        trueRoas: trueRoas.toFixed(2),
        trueCac: Math.round(trueCac),
        net: Math.round(net),
        isProfitable: trueRoas >= beRoas,
        numericBeRoas: isFinite(beRoas) ? Number(beRoas.toFixed(2)) : 0,
        numericTrueRoas: Number(trueRoas.toFixed(2))
      });
    }
  }

  // Calculate generic dashboard things
  const dashWaste = isFinite(totalWaste) && !isNaN(totalWaste) ? Math.round(totalWaste) : 0;
  const dashShipped50 = totalOrders / 0.50;
  const dashTotalBill50 = (totalOrders * Number(shipSuccess)) + ((dashShipped50 - totalOrders) * Number(rtoFlat));
  const dashShip50 = isFinite(dashTotalBill50) && !isNaN(dashTotalBill50) ? Math.round(dashTotalBill50) : 0;
  
  const dashBillPerOrder50 = dashTotalBill50 / totalOrders;
  const dashTotalOpsPerOrder50 = (dashShipped50 * ops) / totalOrders;
  const dashVarCostPerOrder50 = ((Number(pCost) + customsCost) * bundleSize) + dashBillPerOrder50 + dashTotalOpsPerOrder50 + (wastePerUnit * bundleSize) + (Number(fSp) * pctFees) + fixedFees;
  const safeConfirm = Number(confirmRate) > 0 ? Number(confirmRate) / 100 : 1;
  const dashLeads50 = Math.ceil(dashShipped50 / safeConfirm);
  const dashAds50 = dashLeads50 * (Number(fixedCpa) + smsCost);
  const dashNetVal50 = (totalOrders * Number(fSp)) - ((totalOrders * dashVarCostPerOrder50) + dashAds50);
  const dashNet50 = isFinite(dashNetVal50) && !isNaN(dashNetVal50) ? Math.round(dashNetVal50) : 0;
  
  const targetMarginAmount = marginType === 'percentage' ? Number(fSp) * (Number(marginVal) / 100) : Number(marginVal);
  const dashAdsForSug = dashShipped50 * ((Number(fixedCpa) + smsCost) * 2);
  const fixedCostsPerOrderWithoutFSpForSug = ((Number(pCost) + customsCost) * bundleSize) + dashBillPerOrder50 + dashTotalOpsPerOrder50 + (wastePerUnit * bundleSize) + fixedFees;
  const dashSug = (totalOrders * targetMarginAmount + totalOrders * fixedCostsPerOrderWithoutFSpForSug + dashAdsForSug) / (totalOrders * (1 - pctFees));
  const dashSp = isFinite(dashSug) && !isNaN(dashSug) ? Math.ceil(dashSug) : 0;

  // Calculate Break-even
  const fixedCostsPerOrder = ((Number(pCost) + customsCost) * bundleSize) + Number(shipSuccess) - Number(rtoFlat) + (wastePerUnit * bundleSize) + (Number(fSp) * pctFees) + fixedFees;
  const cRate = Number(confirmRate) / 100;
  
  const variableCostsPerShippedForNdr = Number(rtoFlat) + ops + ((Number(fixedCpa) + smsCost) / cRate);
  const beNdrVal = variableCostsPerShippedForNdr / (Number(fSp) - fixedCostsPerOrder);
  const beNdrPercent = isFinite(beNdrVal) && beNdrVal > 0 ? (beNdrVal * 100).toFixed(2) : '0.00';
  const beTrueNdrVal = beNdrVal * cRate;
  const beTrueNdrPercent = isFinite(beTrueNdrVal) && beTrueNdrVal > 0 ? (beTrueNdrVal * 100).toFixed(2) : '0.00';

  const dRateFixed = Number(fixedNdr) / 100;
  const beCpaVal = cRate * (dRateFixed * (Number(fSp) - fixedCostsPerOrder) - Number(rtoFlat) - ops) - smsCost;
  const beCpaFormatted = isFinite(beCpaVal) && beCpaVal > 0 ? beCpaVal.toFixed(2) : '0.00';

  // Custom Calculator Logic
  const calcCustomRow = () => {
    let dRate, cpa;
    if (analysisType === 'ndr') {
      dRate = Number(customNdr) / 100;
      cpa = Number(fixedCpa);
    } else {
      dRate = Number(fixedNdr) / 100;
      cpa = Number(customCpa);
    }
    
    if (!dRate || dRate <= 0) return { leads: 0, shipped: 0, totalBill: 0, totalOpsPerOrder: 0, beRoas: 0, trueRoas: 0, trueCac: 0, net: 0, ndrTotal: '0.0%' };

    const shippedOrders = totalOrders / dRate;
    const leads = Math.ceil(shippedOrders / cRate);
    const totalBill = (totalOrders * Number(shipSuccess)) + ((shippedOrders - totalOrders) * Number(rtoFlat));
    const billPerOrder = totalBill / totalOrders;
    const totalOpsPerOrder = (shippedOrders * ops) / totalOrders;
    const varCostPerOrder = ((Number(pCost) + customsCost) * bundleSize) + billPerOrder + totalOpsPerOrder + (wastePerUnit * bundleSize) + (Number(fSp) * pctFees) + fixedFees;
    const beRoas = Number(fSp) / (Number(fSp) - varCostPerOrder);
    const ads = leads * (cpa + smsCost);
    const net = (totalOrders * Number(fSp)) - ((totalOrders * varCostPerOrder) + ads);
    const trueRoas = ads > 0 ? ((totalOrders * Number(fSp)) / ads) : 0;
    const trueCac = ads / totalOrders;
    const ndrTotal = (dRate * cRate * 100).toFixed(1) + '%';
    
    return { leads, shipped: Math.ceil(shippedOrders), totalBill, totalOpsPerOrder, beRoas, trueRoas, trueCac, net, ndrTotal };
  };

  const customResult = calcCustomRow();

  return (
    <div dir="rtl" className="w-full text-zinc-900 dark:text-zinc-100 font-cairo">
      <div className="mx-auto pb-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#09090b] to-[#18181b] text-white p-4 md:p-5 rounded-2xl shadow-lg mb-8 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex items-center gap-3 w-full md:w-auto justify-center md:justify-start">
            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
              <Calculator size={24} className="text-white" />
            </div>
            <span className="text-xl md:text-2xl font-black tracking-wide text-center" style={{ fontFamily: 'system-ui' }}>تسعير المنتج<span className="font-medium opacity-90" style={{ fontFamily: 'monospace' }}> (Pricing & Forecast)</span></span>
          </div>
          <div className="flex flex-wrap justify-center gap-2 md:gap-3 items-center w-full md:w-auto">
            <select 
              value={currency} 
              onChange={e => setCurrency(e.target.value)}
              className="px-2 py-2 md:px-4 md:py-2.5 rounded-xl border-none font-bold bg-white text-[#09090b] text-sm cursor-pointer outline-none shadow-sm hover:bg-zinc-50 transition-colors"
            >
              <option value="EGP">EGP</option>
              <option value="SAR">SAR</option>
              <option value="USD">USD</option>
            </select>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm p-4 sm:p-6 md:p-8">
            <div className="space-y-6">
              <h2 className="border-r-4 border-[#09090b] bg-[#09090b] text-white text-center not-italic no-underline pr-3 font-black text-lg p-2 rounded-md mb-4 bg-opacity-90">التكاليف التشغيلية قبل الشحن</h2>
              
              <div className="bg-zinc-50 dark:bg-zinc-800/50 p-4 rounded-xl flex flex-wrap gap-5 border border-zinc-100 dark:border-zinc-800">
                <label className="flex items-center gap-2 cursor-pointer text-sm font-bold hover:text-[#09090b] transition-colors">
                  <input type="radio" checked={opMode === 'detailed'} onChange={() => setOpMode('detailed')} className="w-4 h-4 text-[#09090b] focus:ring-[#09090b]" />
                  {tStr('opModeDetailed')}
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-sm font-bold hover:text-[#09090b] transition-colors">
                  <input type="radio" checked={opMode === 'total'} onChange={() => setOpMode('total')} className="w-4 h-4 text-[#09090b] focus:ring-[#09090b]" />
                  {tStr('opModeTotal')}
                </label>
              </div>

              {opMode === 'detailed' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  <div className="bg-zinc-50 dark:bg-zinc-800/50 p-3 border border-zinc-200 dark:border-zinc-700 rounded-lg sm:col-span-2 md:col-span-3 lg:col-span-4">
                    <label className="flex items-center text-xs font-bold text-zinc-500 dark:text-zinc-400 mb-2">
                      {tStr('rentType')}
                    </label>
                    <div className="flex flex-wrap gap-4 mb-3">
                      <label className="flex items-center gap-2 cursor-pointer text-sm font-bold hover:text-[#09090b] transition-colors">
                        <input type="radio" checked={rentType === 'total'} onChange={() => setRentType('total')} className="w-4 h-4 text-[#09090b] focus:ring-[#09090b]" />
                        {tStr('rentTotal')}
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer text-sm font-bold hover:text-[#09090b] transition-colors">
                        <input type="radio" checked={rentType === 'fixed'} onChange={() => setRentType('fixed')} className="w-4 h-4 text-[#09090b] focus:ring-[#09090b]" />
                        {tStr('rentFixed')}
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer text-sm font-bold hover:text-[#09090b] transition-colors">
                        <input type="radio" checked={rentType === 'cbm'} onChange={() => setRentType('cbm')} className="w-4 h-4 text-[#09090b] focus:ring-[#09090b]" />
                        {tStr('rentCbm')}
                      </label>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {rentType === 'total' && (
                        <InputGroup label={tStr('rentTotal')} tooltip={tStr('rentTooltip')} value={rent} onChange={setRent} />
                      )}
                      {rentType === 'fixed' && (
                        <InputGroup label={tStr('rentPerPiece')} tooltip={tStr('rentPerPieceTooltip')} value={rentPerPiece} onChange={setRentPerPiece} />
                      )}
                      {rentType === 'cbm' && (
                        <>
                          <InputGroup label={tStr('rentPerCbm')} tooltip="تكلفة المتر المكعب من الإيجار" value={rentPerCbm} onChange={setRentPerCbm} />
                          <InputGroup label={tStr('cbmPerPiece')} tooltip="حجم القطعة بالمتر المكعب" value={cbmPerPiece} onChange={setCbmPerPiece} />
                        </>
                      )}
                    </div>
                  </div>
                  
                  <InputGroup label={tStr('packUnit')} tooltip={tStr('packTooltip')} value={packUnit} onChange={setPackUnit} />
                  <InputGroup label={tStr('ccUnit')} tooltip={tStr('ccTooltip')} value={ccUnit} onChange={setCcUnit} />
                  <InputGroup label={tStr('customs')} tooltip={tStr('customsTooltip')} value={customs} onChange={setCustoms} />
                  <InputGroup label={tStr('sms')} tooltip={tStr('smsTooltip')} value={sms} onChange={setSms} />
                  <InputGroup label={tStr('vat')} tooltip={tStr('vatTooltip')} value={vat} onChange={setVat} />
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  <InputGroup label={tStr('opFlatVal')} tooltip={tStr('opFlatTooltip')} value={opFlatVal} onChange={setOpFlatVal} />
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InputGroup label={tStr('batchQty')} tooltip={tStr('batchTooltip')} value={batchQty} onChange={setBatchQty} />
                <div className="bg-[#09090b]/5 dark:bg-[#09090b]/10 border border-dashed border-[#09090b] p-4 rounded-xl text-center flex flex-col justify-center">
                  <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400 mb-1">{tStr('opCostPerUnit')}</span>
                  <span className="text-2xl font-black text-[#09090b]">{formatNumber(ops).toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="space-y-6 mt-12 pt-8 border-t-2 border-zinc-200 dark:border-zinc-700">
              <h2 className="border-r-4 border-[#09090b] bg-[#09090b] text-white text-center not-italic no-underline pr-3 font-black text-lg p-2 rounded-md mb-4 bg-opacity-90">بيانات المنتج الأساسية</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                <InputGroup label={tStr('pCost')} tooltip={tStr('pCostTooltip')} value={pCost} onChange={setPCost} />
                <InputGroup label={tStr('shipSuccess')} tooltip={tStr('shipSuccessTooltip')} value={shipSuccess} onChange={setShipSuccess} />
                <InputGroup label={tStr('rtoFlat')} tooltip={tStr('rtoTooltip')} value={rtoFlat} onChange={setRtoFlat} />
                <InputGroup label={tStr('wastePercent')} tooltip={tStr('wasteTooltip')} value={wastePercent} onChange={setWastePercent} />
                <InputGroup 
                  label={tStr('targetMargin')} 
                  tooltip={tStr('targetMarginTooltip')}
                  value={marginVal} 
                  onChange={setMarginVal} 
                  rightElement={
                    <div className="flex items-center gap-2 bg-white dark:bg-zinc-900 p-1 rounded-md border border-zinc-200 dark:border-zinc-700">
                      <label className="flex items-center gap-1 cursor-pointer">
                        <input type="radio" name="marginType" checked={marginType === 'fixed'} onChange={() => setMarginType('fixed')} className="w-3 h-3 text-[#09090b]" />
                        <span className="text-[10px] text-zinc-600 dark:text-zinc-300">{tStr('amount')}</span>
                      </label>
                      <label className="flex items-center gap-1 cursor-pointer">
                        <input type="radio" name="marginType" checked={marginType === 'percentage'} onChange={() => setMarginType('percentage')} className="w-3 h-3 text-[#09090b]" />
                        <span className="text-[10px] text-zinc-600 dark:text-zinc-300">{tStr('percentage')}</span>
                      </label>
                    </div>
                  }
                />
                <InputGroup label={tStr('finalSp')} tooltip={tStr('finalSpTooltip')} value={fSp} onChange={setFSp} />
                <InputGroup label={tStr('fixedCpa')} tooltip={tStr('fixedCpaTooltip')} value={fixedCpa} onChange={setFixedCpa} />
                <InputGroup label={tStr('confirmRate')} tooltip={tStr('confirmTooltip')} value={confirmRate} onChange={setConfirmRate} />
              </div>
            </div>

            {/* Forecast Setup */}
            <div className="space-y-6 mt-12 pt-8 border-t-2 border-zinc-200 dark:border-zinc-700">
              <h2 className="border-r-4 border-[#09090b] bg-[#09090b] text-white text-center not-italic no-underline pr-3 font-black text-lg p-2 rounded-md mb-4 bg-opacity-90">تحليل السيناريوهات</h2>
              
              <div className="bg-zinc-50 dark:bg-zinc-900/50 p-4 rounded-xl flex flex-wrap gap-5 items-center border border-zinc-100 dark:border-zinc-800">
                <label className="flex items-center gap-2 cursor-pointer text-sm font-bold hover:text-[#09090b] transition-colors">
                  <input type="radio" checked={analysisType === 'ndr'} onChange={() => setAnalysisType('ndr')} className="w-4 h-4 text-[#09090b] focus:ring-[#09090b]" />
                  {tStr('analysisNdr')}
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-sm font-bold hover:text-[#09090b] transition-colors">
                  <input type="radio" checked={analysisType === 'cpa'} onChange={() => setAnalysisType('cpa')} className="w-4 h-4 text-[#09090b] focus:ring-[#09090b]" />
                  {tStr('analysisCpa')}
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {analysisType === 'cpa' && (
                  <>
                    <InputGroup label={tStr('cpaFrom')} value={cpaFrom} onChange={setCpaFrom} />
                    <InputGroup label={tStr('cpaTo')} value={cpaTo} onChange={setCpaTo} />
                    <InputGroup label={tStr('fixedNdr')} value={fixedNdr} onChange={setFixedNdr} />
                  </>
                )}
              </div>
              
              {/* Chart */}
              <div id="chart-container" className="mt-8 bg-zinc-50 dark:bg-zinc-900/50 p-4 rounded-xl border border-zinc-100 dark:border-zinc-800">
                <h3 className="text-center font-bold text-zinc-600 dark:text-zinc-300 mb-4">
                  {tStr('compareActualToBE')} ({analysisType === 'ndr' ? 'NDR' : 'CPA'})
                </h3>
                <div className="w-full overflow-x-auto pb-2" dir="ltr">
                  <div className="min-w-[400px]">
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={scenarios} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#334155' : '#e2e8f0'} />
                        <XAxis 
                          dataKey="col1" 
                          stroke={isDark ? '#94a3b8' : '#64748b'} 
                          tick={{ fill: isDark ? '#94a3b8' : '#64748b', fontSize: 12, fontWeight: 'bold' }}
                        />
                        <YAxis 
                          stroke={isDark ? '#94a3b8' : '#64748b'} 
                          tick={{ fill: isDark ? '#94a3b8' : '#64748b', fontSize: 12, fontWeight: 'bold' }}
                        />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: isDark ? '#18181b' : '#ffffff',
                            borderColor: isDark ? '#27272a' : '#e4e4e7',
                            borderRadius: '8px',
                            color: isDark ? '#f4f4f5' : '#09090b',
                            fontWeight: 'bold',
                            direction: 'rtl'
                          }}
                        />
                        <Legend wrapperStyle={{ fontWeight: 'bold', paddingTop: '10px', cursor: 'pointer' }} />
                        <Line type="monotone" dataKey="numericTrueRoas" name={tStr('trueRoasChart')} stroke="#10b981" strokeWidth={3} dot={{ r: 4, fill: '#10b981', strokeWidth: 2 }} activeDot={{ r: 6 }} />
                        <Line type="monotone" dataKey="numericBeRoas" name={tStr('beRoasChart')} stroke="#ef4444" strokeWidth={3} strokeDasharray="5 5" dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Data Table */}
              <div className="overflow-x-auto border border-zinc-200 dark:border-zinc-700 rounded-xl mt-6 shadow-sm pb-2">
                <table className="w-full text-sm text-center min-w-[700px]">
                  <thead className="bg-zinc-50 dark:bg-zinc-900/80 border-b-2 border-zinc-200 dark:border-zinc-700">
                    <tr>
                      <th className="p-3 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-bold">{analysisType === 'ndr' ? tStr('deliveryRateCol') : 'CPA'}</th>
                      <th className="p-3 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-bold">{tStr('ndrCol')}</th>
                      <th className="p-3 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-bold">Leads</th>
                      <th className="p-3 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-bold">{tStr('shippedOrders')}</th>
                      <th className="p-3 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-bold">{tStr('totalBill')}</th>
                      <th className="p-3 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-bold">B.E ROAS</th>
                      <th className="p-3 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-bold">True ROAS</th>
                      <th className="p-3 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-bold">True CAC</th>
                      <th className="p-3 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-bold">{tStr('netProfit')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                    {scenarios.map((s, idx) => (
                      <tr key={idx} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors font-medium">
                        <td className="p-3 text-zinc-900 dark:text-zinc-100">{s.col1}</td>
                        <td className="p-3 text-indigo-600 dark:text-indigo-400 font-bold">{s.ndrTotal}</td>
                        <td className="p-3 text-zinc-700 dark:text-zinc-300">{s.leads}</td>
                        <td className="p-3 text-zinc-700 dark:text-zinc-300">{s.shipped}</td>
                        <td className="p-3 text-zinc-700 dark:text-zinc-300">{formatCurrency(s.totalBill)}</td>
                        <td className="p-3 text-red-600 dark:text-red-400 font-bold">{s.beRoas}</td>
                        <td className={`p-3 font-bold ${s.isProfitable ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>{s.trueRoas}</td>
                        <td className={`p-3 font-bold ${s.isProfitable ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>{formatCurrency(s.trueCac)}</td>
                        <td className={`p-3 font-bold ${s.net > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>{formatCurrency(s.net)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Break-even & Custom Calculator */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                {/* Custom Calculator Box */}
                <div className="bg-zinc-50 dark:bg-zinc-900/50 p-6 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-sm">
                  <h3 className="text-zinc-800 dark:text-zinc-200 font-black text-lg mb-4">{tStr('customCalc')}</h3>
                  <div className="mb-5">
                    <InputGroup 
                      label={analysisType === 'ndr' ? tStr('customNdrLabel') : tStr('customCpaLabel')} 
                      value={analysisType === 'ndr' ? customNdr : customCpa} 
                      onChange={analysisType === 'ndr' ? setCustomNdr : setCustomCpa} 
                      type="number"
                    />
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3">
                    {analysisType === 'ndr' && (
                      <div className="bg-white dark:bg-zinc-800 p-3 rounded-xl border border-zinc-200 dark:border-zinc-700 text-center flex flex-col justify-center">
                        <div className="text-[11px] text-zinc-500 mb-1 font-bold">{tStr('ndrCol')}</div>
                        <div className="font-black text-indigo-600 dark:text-indigo-400 text-sm">{customResult.ndrTotal}</div>
                      </div>
                    )}
                    <div className="bg-white dark:bg-zinc-800 p-3 rounded-xl border border-zinc-200 dark:border-zinc-700 text-center flex flex-col justify-center">
                      <div className="text-[11px] text-zinc-500 mb-1 font-bold">Leads</div>
                      <div className="font-black text-zinc-700 dark:text-zinc-200 text-sm">{customResult.leads}</div>
                    </div>
                    <div className="bg-white dark:bg-zinc-800 p-3 rounded-xl border border-zinc-200 dark:border-zinc-700 text-center flex flex-col justify-center">
                      <div className="text-[11px] text-zinc-500 mb-1 font-bold">{tStr('shippedOrders')}</div>
                      <div className="font-black text-zinc-700 dark:text-zinc-200 text-sm">{customResult.shipped}</div>
                    </div>
                    <div className="bg-white dark:bg-zinc-800 p-3 rounded-xl border border-zinc-200 dark:border-zinc-700 text-center flex flex-col justify-center">
                      <div className="text-[11px] text-zinc-500 mb-1 font-bold">{tStr('totalBill')}</div>
                      <div className="font-black text-zinc-700 dark:text-zinc-200 text-sm">{formatCurrency(Math.round(customResult.totalBill))}</div>
                    </div>
                    <div className="bg-white dark:bg-zinc-800 p-3 rounded-xl border border-zinc-200 dark:border-zinc-700 text-center flex flex-col justify-center">
                      <div className="text-[11px] text-zinc-500 mb-1 font-bold">{tStr('opCostByNdr')}</div>
                      <div className="font-black text-zinc-700 dark:text-zinc-200 text-sm">{formatCurrency(Math.round(customResult.totalOpsPerOrder))}</div>
                    </div>
                    <div className="bg-white dark:bg-zinc-800 p-3 rounded-xl border border-zinc-200 dark:border-zinc-700 text-center flex flex-col justify-center">
                      <div className="text-[11px] text-zinc-500 mb-1 font-bold">B.E ROAS</div>
                      <div className="font-black text-zinc-700 dark:text-zinc-200 text-sm">{isFinite(customResult.beRoas) && customResult.beRoas > 0 ? customResult.beRoas.toFixed(2) : '∞'}</div>
                    </div>
                    <div className="bg-white dark:bg-zinc-800 p-3 rounded-xl border border-zinc-200 dark:border-zinc-700 text-center flex flex-col justify-center">
                      <div className="text-[11px] text-zinc-500 mb-1 font-bold">True ROAS</div>
                      <div className={`font-black text-sm ${customResult.trueRoas >= customResult.beRoas ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>{customResult.trueRoas.toFixed(2)}</div>
                    </div>
                    <div className="bg-white dark:bg-zinc-800 p-3 rounded-xl border border-zinc-200 dark:border-zinc-700 text-center flex flex-col justify-center">
                      <div className="text-[11px] text-zinc-500 mb-1 font-bold">True CAC</div>
                      <div className={`font-black text-sm ${customResult.trueRoas >= customResult.beRoas ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>{formatCurrency(Math.round(customResult.trueCac))}</div>
                    </div>
                    <div className="bg-white dark:bg-zinc-800 p-3 rounded-xl border border-zinc-200 dark:border-zinc-700 text-center sm:col-span-2 flex flex-col justify-center">
                      <div className="text-[11px] text-zinc-500 mb-1 font-bold">{tStr('netProfit')}</div>
                      <div className={`font-black text-base ${customResult.net > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>{formatCurrency(Math.round(customResult.net))}</div>
                    </div>
                  </div>
                </div>

                {/* Break-even Box */}
                <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-2xl border border-red-100 dark:border-red-900/30 flex flex-col justify-center items-center text-center shadow-sm">
                  <h3 className="text-red-800 dark:text-red-300 font-black text-lg mb-2">{tStr('bePoint')} {analysisType === 'ndr' ? tStr('deliveryRateCol') : 'CPA'} (Break-even)</h3>
                  <p className="text-sm text-red-600/80 dark:text-red-400/80 mb-4 font-bold">النقطة التي يكون عندها صافي الربح = صفر<br/>(True ROAS = B.E ROAS)</p>
                  <div className="text-4xl font-black text-red-600 dark:text-red-400" dir="ltr">
                    {analysisType === 'ndr' ? `${beNdrPercent}%` : `${beCpaFormatted} ${currency}`}
                  </div>
                  {analysisType === 'ndr' && (
                    <div className="mt-4 pt-4 border-t border-red-200 dark:border-red-800/50 w-full">
                      <h4 className="text-red-800 dark:text-red-300 font-bold text-sm mb-1">{tStr('bePoint')} {tStr('ndrCol')} (Break-even)</h4>
                      <div className="text-2xl font-black text-red-600 dark:text-red-400" dir="ltr">
                        {beTrueNdrPercent}%
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Suggested Price Box */}
              <div className="bg-emerald-50 dark:bg-emerald-900/20 p-6 rounded-2xl border border-emerald-100 dark:border-emerald-900/30 flex flex-col justify-center items-center text-center shadow-sm mt-6">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-emerald-800 dark:text-emerald-300 font-black text-lg">{tStr('dashSp')}</h3>
                  <div className="group relative">
                    <Info size={18} className="text-emerald-600 dark:text-emerald-400 cursor-help" />
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-2 bg-black text-white text-xs rounded shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10 pointer-events-none">
                      {tStr('dashSpTooltip')}
                      <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-black"></div>
                    </div>
                  </div>
                </div>
                <div className="text-4xl font-black text-emerald-600 dark:text-emerald-400" dir="ltr">
                  {formatCurrency(dashSp)}
                </div>
              </div>
              
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
