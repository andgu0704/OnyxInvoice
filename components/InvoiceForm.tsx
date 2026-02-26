import React, { useState } from 'react';
import { format, addDays } from 'date-fns';
import { Plus, Trash2 } from 'lucide-react';
import { Currency, InvoiceItem, InvoiceState, CompanyDetails } from '../types';

interface InvoiceFormProps {
  data: InvoiceState;
  onChange: (data: InvoiceState) => void;
  companies: CompanyDetails[];
  onAddCompany: (company: Partial<CompanyDetails>) => void;
  onDeleteCompany: (id: string) => void;
}

const InvoiceForm: React.FC<InvoiceFormProps> = ({ data, onChange, companies, onAddCompany, onDeleteCompany }) => {
  const [showAddCompany, setShowAddCompany] = useState(false);
  const [newCompany, setNewCompany] = useState({ name: '', idCode: '', address: '' });
  const handleItemChange = (id: string, field: keyof InvoiceItem, value: string) => {
    const newItems = data.items.map(item => {
      if (item.id === id) {
        return { ...item, [field]: value };
      }
      return item;
    });
    onChange({ ...data, items: newItems });
  };

  const addItem = () => {
    const newItem: InvoiceItem = {
      id: crypto.randomUUID(),
      description: ''
    };
    onChange({ ...data, items: [...data.items, newItem] });
  };

  const removeItem = (id: string) => {
    onChange({ ...data, items: data.items.filter(item => item.id !== id) });
  };

  const dueDate = addDays(data.date, 7);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 h-full overflow-y-auto">
      <h2 className="text-xl font-bold mb-6 text-gray-800 border-b pb-2">Invoice Details</h2>

      {/* General Settings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Invoice Number</label>
          <input
            type="text"
            value={data.invoiceNumber}
            onChange={(e) => onChange({ ...data, invoiceNumber: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            placeholder="INV-001"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
          <select
            value={data.currency}
            onChange={(e) => onChange({ ...data, currency: e.target.value as Currency })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          >
            <option value={Currency.USD}>USD ($)</option>
            <option value={Currency.GEL}>GEL (₾)</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Invoice Date</label>
          <input
            type="date"
            value={format(data.date, 'yyyy-MM-dd')}
            onChange={(e) => onChange({ ...data, date: new Date(e.target.value) })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Due Date (Read Only)</label>
          <input
            type="text"
            readOnly
            value={format(dueDate, 'dd/MM/yyyy')}
            className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md text-gray-500 cursor-not-allowed"
          />
          <p className="text-xs text-gray-500 mt-1">Calculated as Invoice Date + 7 days</p>
        </div>

        <div className="md:col-span-2">
          <div className="flex justify-between items-end mb-1">
            <label className="block text-sm font-medium text-gray-700">Buyer Company</label>
            <button
              onClick={() => setShowAddCompany(!showAddCompany)}
              className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              <Plus size={14} /> Add New Company
            </button>
          </div>
          <div className="flex gap-2">
            <select
              value={data.selectedCompany}
              onChange={(e) => onChange({ ...data, selectedCompany: e.target.value })}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="" disabled>Select a company</option>
              {companies.map(company => (
                <option key={company.id} value={company.id}>
                  {company.name}
                </option>
              ))}
            </select>
            <button
              onClick={() => {
                if (window.confirm('Delete selected company?')) {
                  onDeleteCompany(data.selectedCompany);
                }
              }}
              disabled={!data.selectedCompany || companies.length <= 1}
              className="px-3 py-2 text-red-600 border border-red-200 hover:bg-red-50 rounded-md disabled:opacity-50"
              title="Delete Company"
            >
              <Trash2 size={18} />
            </button>
          </div>

          {showAddCompany && (
            <div className="mt-3 p-4 bg-white border border-gray-200 rounded-md shadow-sm">
              <h4 className="text-sm font-semibold mb-3">Add New Company</h4>
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Company Name"
                  value={newCompany.name}
                  onChange={e => setNewCompany(c => ({ ...c, name: e.target.value }))}
                  className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-sm"
                />
                <input
                  type="text"
                  placeholder="ID Code"
                  value={newCompany.idCode}
                  onChange={e => setNewCompany(c => ({ ...c, idCode: e.target.value }))}
                  className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-sm"
                />
                <input
                  type="text"
                  placeholder="Address"
                  value={newCompany.address}
                  onChange={e => setNewCompany(c => ({ ...c, address: e.target.value }))}
                  className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-sm"
                />
                <div className="flex justify-end gap-2 pt-1">
                  <button
                    onClick={() => setShowAddCompany(false)}
                    className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-md"
                  >Cancel</button>
                  <button
                    onClick={() => {
                      if (newCompany.name && newCompany.idCode) {
                        onAddCompany(newCompany);
                        setNewCompany({ name: '', idCode: '', address: '' });
                        setShowAddCompany(false);
                      }
                    }}
                    disabled={!newCompany.name || !newCompany.idCode}
                    className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                  >Save Company</button>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="md:col-span-2 bg-blue-50 p-4 rounded-md border border-blue-100">
          <label className="block text-sm font-semibold text-blue-800 mb-1">Unit Price (Excl. VAT) - Applies to all items</label>
          <div className="relative">
            <input
              type="text"
              inputMode="decimal"
              value={data.priceExclVat}
              onChange={(e) => {
                const val = e.target.value;
                // Allow empty string or digits with max one decimal point
                if (val === '' || /^\d*\.?\d*$/.test(val)) {
                  onChange({ ...data, priceExclVat: val });
                }
              }}
              className="w-full px-3 py-2 border border-blue-200 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="0.00"
            />
          </div>
          <p className="text-xs text-blue-600 mt-1">VAT and Totals will be calculated automatically.</p>
        </div>
      </div>

      {/* Items List */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-700">Items</h3>
          <button
            onClick={addItem}
            className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
          >
            <Plus size={16} /> Add Item
          </button>
        </div>

        <div className="space-y-3">
          {data.items.map((item) => (
            <div key={item.id} className="flex gap-2 items-center p-3 border border-gray-200 rounded-lg bg-gray-50 group">
              <div className="flex-1">
                <input
                  type="text"
                  value={item.description}
                  onChange={(e) => handleItemChange(item.id, 'description', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  placeholder="Enter item description..."
                />
              </div>
              <button
                onClick={() => removeItem(item.id)}
                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-all"
                title="Remove Item"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}

          {data.items.length === 0 && (
            <div className="text-center py-8 text-gray-400 bg-gray-50 rounded-lg border border-dashed border-gray-300">
              No items added yet. Click "Add Item" to start.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InvoiceForm;