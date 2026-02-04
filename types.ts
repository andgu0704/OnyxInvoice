export enum Currency {
  USD = 'USD',
  GEL = 'GEL'
}

export enum CompanyKey {
  TOYOTA = 'Toyota',
  CIC = 'CIC'
}

export interface InvoiceItem {
  id: string;
  description: string;
}

export interface CompanyDetails {
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
  selectedCompany: CompanyKey;
  priceExclVat: string;
  items: InvoiceItem[];
}