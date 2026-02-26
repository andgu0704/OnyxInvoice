export enum Currency {
  USD = 'USD',
  GEL = 'GEL'
}


export interface InvoiceItem {
  id: string;
  description: string;
}

export interface CompanyDetails {
  id?: string;
  name: string;
  idCode: string;
  address: string;
}

export interface SupplierDetails extends CompanyDetails {
  bank: string;
  bankCode: string;
  account: string;
}

export interface InvoiceState {
  invoiceNumber: string;
  date: Date;
  currency: Currency;
  selectedCompany: string;
  priceExclVat: string;
  items: InvoiceItem[];
}