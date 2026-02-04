import React, { useMemo } from 'react';
import { format, addDays } from 'date-fns';
import { InvoiceState } from '../types';
import { SUPPLIER_INFO, BUYER_OPTIONS, VAT_RATE } from '../constants';

interface InvoicePreviewProps {
  data: InvoiceState;
}

const InvoicePreview = React.forwardRef<HTMLDivElement, InvoicePreviewProps>(({ data }, ref) => {
  const buyer = BUYER_OPTIONS[data.selectedCompany];
  const dueDate = addDays(data.date, 7);

  const parsedPrice = parseFloat(data.priceExclVat) || 0;

  const totals = useMemo(() => {
    // Calculate based on global price
    const subtotal = data.items.length * parsedPrice;
    const vat = subtotal * VAT_RATE;
    const total = subtotal + vat;
    
    return { subtotal, vat, total };
  }, [data.items.length, parsedPrice]);

  const currencySymbol = data.currency === 'USD' ? '$' : '₾';
  
  // Format number helper
  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  return (
    <div className="flex justify-center p-4 print:p-0">
      {/* 
         Removed shadow-lg to prevent artifacts in HTML2PDF. 
         Using ring or border for screen visibility if needed, but white paper on gray background is usually distinct enough.
      */}
      <div 
        ref={ref} 
        className="print-container bg-white text-black w-[210mm] min-h-[296mm] p-[10mm] md:p-[15mm] text-sm leading-relaxed box-border"
        style={{ fontFamily: "'Inter', sans-serif" }}
      >
        {/* Header Section - Mimicking Excel Cell H layout roughly */}
        <div className="flex justify-between mb-12">
          <div className="w-1/2">
             <h1 className="text-3xl font-bold text-black tracking-tight">INVOICE</h1>
             <p className="text-gray-600 mt-1 font-medium">ინვოისი</p>
          </div>
          <div className="w-1/2 text-right">
            <table className="ml-auto text-sm border-collapse">
              <tbody>
                <tr>
                  <td className="font-bold pr-4 py-1 text-black">Invoice #</td>
                  <td className="font-bold py-1 text-black">{data.invoiceNumber}</td>
                </tr>
                <tr>
                  <td className="font-bold pr-4 py-1 text-black">Date</td>
                  <td className="py-1 text-black">{format(data.date, 'dd/MM/yyyy')}</td>
                </tr>
                <tr>
                  <td className="font-bold pr-4 py-1 text-black">Due Date</td>
                  <td className="py-1 text-black">{format(dueDate, 'dd/MM/yyyy')}</td>
                </tr>
                <tr>
                  <td className="font-bold pr-4 py-1 text-black">Currency</td>
                  <td className="py-1 text-black">{data.currency}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Address Grid Section */}
        <div className="grid grid-cols-2 gap-12 mb-12">
          {/* Supplier (Left) */}
          <div className="border-l-4 border-gray-900 pl-4">
            <h3 className="font-bold text-black mb-2 uppercase tracking-wide">Supplier (მიმწოდებელი)</h3>
            <div className="space-y-1 text-sm text-gray-800">
              <p><span className="font-bold text-black">Name:</span> {SUPPLIER_INFO.name}</p>
              <p><span className="font-bold text-black">Code:</span> {SUPPLIER_INFO.idCode}</p>
              <p><span className="font-bold text-black">Address:</span> {SUPPLIER_INFO.address}</p>
              <p className="mt-2"><span className="font-bold text-black">Bank:</span> {SUPPLIER_INFO.bank}</p>
              <p><span className="font-bold text-black">Bank Code:</span> {SUPPLIER_INFO.bankCode}</p>
              <p><span className="font-bold text-black">Account:</span> {SUPPLIER_INFO.account}</p>
            </div>
          </div>

          {/* Buyer (Right) */}
          <div className="border-l-4 border-blue-600 pl-4">
            <h3 className="font-bold text-black mb-2 uppercase tracking-wide">Buyer (შემსყიდველი)</h3>
            <div className="space-y-1 text-sm text-gray-800">
              <p><span className="font-bold text-black">Name:</span> {buyer.name}</p>
              <p><span className="font-bold text-black">Code:</span> {buyer.idCode}</p>
              <p><span className="font-bold text-black">Address:</span> {buyer.address}</p>
            </div>
          </div>
        </div>

        {/* Items Table */}
        <div className="mb-8">
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 px-4 py-2 text-left font-bold text-xs uppercase tracking-wider text-black">
                  საქონელი/მომსახურება<br/>Item
                </th>
                <th className="border border-gray-300 px-4 py-2 text-right font-bold text-xs uppercase tracking-wider text-black w-32">
                  ფასი დღგ-ს გარეშე<br/>Price Excl. VAT
                </th>
                <th className="border border-gray-300 px-4 py-2 text-right font-bold text-xs uppercase tracking-wider text-black w-24">
                  დღგ<br/>VAT
                </th>
                <th className="border border-gray-300 px-4 py-2 text-right font-bold text-xs uppercase tracking-wider text-black w-32">
                  ღირებულება დღგ-ს ჩათვლით<br/>Total Value
                </th>
              </tr>
            </thead>
            <tbody>
              {data.items.length === 0 ? (
                <tr>
                  <td colSpan={4} className="border border-gray-300 px-4 py-8 text-center text-gray-400 italic">
                    No items listed
                  </td>
                </tr>
              ) : (
                data.items.map((item, index) => {
                  return (
                    <tr key={item.id}>
                      <td className="border border-gray-300 px-4 py-2 text-xs text-black break-words">
                        {item.description}
                      </td>
                      {index === 0 && (
                        <>
                          <td 
                            rowSpan={data.items.length} 
                            className="border border-gray-300 px-4 py-2 text-right font-mono text-black align-middle"
                          >
                            {formatMoney(totals.subtotal)}
                          </td>
                          <td 
                            rowSpan={data.items.length} 
                            className="border border-gray-300 px-4 py-2 text-right font-mono text-black align-middle"
                          >
                            {formatMoney(totals.vat)}
                          </td>
                          <td 
                            rowSpan={data.items.length} 
                            className="border border-gray-300 px-4 py-2 text-right font-mono text-black bg-gray-50 align-middle"
                          >
                            {formatMoney(totals.total)}
                          </td>
                        </>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Totals */}
        <div className="flex justify-end">
          <div className="w-64">
             <div className="flex justify-between py-2 border-b border-gray-200">
                <span className="font-bold text-black">Subtotal:</span>
                <span className="font-mono text-black">{currencySymbol} {formatMoney(totals.subtotal)}</span>
             </div>
             <div className="flex justify-between py-2 border-b border-gray-200">
                <span className="font-bold text-black">Total VAT (18%):</span>
                <span className="font-mono text-black">{currencySymbol} {formatMoney(totals.vat)}</span>
             </div>
             <div className="flex justify-between py-3 border-b-2 border-black mt-1 bg-gray-50 px-2 -mx-2">
                <span className="font-bold text-lg text-black">Grand Total:</span>
                <span className="font-bold text-lg font-mono text-black">{currencySymbol} {formatMoney(totals.total)}</span>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
});

export default InvoicePreview;