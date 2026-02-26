import React, { useState, useRef } from 'react';
import { Download, Loader2 } from 'lucide-react';
import InvoiceForm from './components/InvoiceForm';
import InvoicePreview from './components/InvoicePreview';
import { Currency, InvoiceState, CompanyDetails } from './types';
import companiesData from './data/companies.json';

const App: React.FC = () => {
  const [companies, setCompanies] = useState<CompanyDetails[]>([]);
  const [invoiceData, setInvoiceData] = useState<InvoiceState>({
    invoiceNumber: '',
    date: new Date(),
    currency: Currency.USD,
    selectedCompany: '',
    priceExclVat: '0',
    items: [
      { id: '1', description: '' }
    ]
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const componentRef = useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const stored = localStorage.getItem('onyx_companies');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setCompanies(parsed);
        if (parsed.length > 0 && !invoiceData.selectedCompany) {
          setInvoiceData(prev => ({ ...prev, selectedCompany: parsed[0].id }));
        }
      } catch (e) {
        console.error("Failed to parse stored companies", e);
        setCompanies(companiesData);
        if (companiesData.length > 0 && !invoiceData.selectedCompany) {
          setInvoiceData(prev => ({ ...prev, selectedCompany: companiesData[0].id }));
        }
      }
    } else {
      setCompanies(companiesData);
      if (companiesData.length > 0 && !invoiceData.selectedCompany) {
        setInvoiceData(prev => ({ ...prev, selectedCompany: companiesData[0].id }));
      }
    }
  }, []);

  const saveCompanies = (newCompanies: CompanyDetails[]) => {
    setCompanies(newCompanies);
    localStorage.setItem('onyx_companies', JSON.stringify(newCompanies));
  };

  const handleAddCompany = async (company: Partial<CompanyDetails>) => {
    const newCompany = { ...company, id: 'comp_' + Date.now() } as CompanyDetails;
    saveCompanies([...companies, newCompany]);
    return newCompany;
  };

  const handleDeleteCompany = async (id: string) => {
    const filtered = companies.filter(c => c.id !== id);
    saveCompanies(filtered);
    if (invoiceData.selectedCompany === id) {
      setInvoiceData(inv => ({ ...inv, selectedCompany: filtered.length > 0 ? filtered[0].id! : '' }));
    }
  };

  const handleDownloadPdf = async () => {
    if (!componentRef.current) return;

    setIsGenerating(true);

    try {
      const element = componentRef.current;
      const opt = {
        margin: 0,
        filename: `Invoice_${invoiceData.invoiceNumber || 'Draft'}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, logging: false, scrollY: 0 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };

      // @ts-ignore
      await window.html2pdf().set(opt).from(element).save();
    } catch (error) {
      console.error('PDF generation failed:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col h-screen overflow-hidden">
      {/* App Header */}
      <header className="no-print bg-gray-900 text-white h-16 flex items-center justify-between px-6 shadow-md shrink-0 z-10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center font-bold text-xl">
            O
          </div>
          <h1 className="text-lg font-semibold tracking-wide">Onyx Invoice Generator</h1>
        </div>

        <button
          onClick={handleDownloadPdf}
          disabled={isGenerating}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-md transition-colors font-medium shadow-sm"
        >
          {isGenerating ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
          {isGenerating ? 'Generating...' : 'Export PDF'}
        </button>
      </header>

      {/* Main Content - Split View */}
      <main className="flex flex-1 overflow-hidden">
        {/* Left Side: Data Entry */}
        <div className="no-print w-full lg:w-5/12 xl:w-4/12 bg-gray-50 border-r border-gray-200 p-4 overflow-y-auto custom-scrollbar">
          <InvoiceForm
            data={invoiceData}
            onChange={setInvoiceData}
            companies={companies}
            onAddCompany={handleAddCompany}
            onDeleteCompany={handleDeleteCompany}
          />
        </div>

        {/* Right Side: Preview */}
        <div className="print-wrapper w-full lg:w-7/12 xl:w-8/12 bg-gray-200 overflow-y-auto p-8 flex items-start justify-center">
          {/* The wrapper div ensures the preview has space around it in the view area */}
          <div className="print-wrapper transform scale-[0.85] xl:scale-100 origin-top transition-transform duration-200">
            <InvoicePreview ref={componentRef} data={invoiceData} companies={companies} />
          </div>
        </div>

        {/* Mobile Preview Warning/Toggle could go here, for now simpler grid */}
        <div className="no-print lg:hidden w-full bg-gray-200 p-4 block">
          <div className="text-center mb-4 text-gray-600 text-sm">Scroll down for preview</div>
          <InvoicePreview ref={null} data={invoiceData} companies={companies} />
        </div>
      </main>
    </div>
  );
};

export default App;