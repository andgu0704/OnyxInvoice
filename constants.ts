import { CompanyDetails, CompanyKey, SupplierDetails } from './types';

export const SUPPLIER_INFO: SupplierDetails = {
  name: 'შპს ,,ონიქს ტექნოლოჯი"',
  idCode: '204560965',
  address: 'ბაგები, წყნეთის გზატკეცილი N65, თბილისი, საქართველო',
  bank: 'საქართველოს ბანკი',
  bankCode: 'BAGAGE22',
  account: 'GE32BG0000000101521598'
};

export const BUYER_OPTIONS: Record<CompanyKey, CompanyDetails> = {
  [CompanyKey.TOYOTA]: {
    name: '"ტოიოტა კავკასია"',
    idCode: '236089273',
    address: 'დავით აღმაშენებლის გამზ. N61, თბილისი, საქართველო'
  },
  [CompanyKey.CIC]: {
    name: '"სავალდებულო დაზღვევის ცენტრი"',
    idCode: '405250473',
    address: 'ი. მოსაშვილის ქ. 24, თბილისი, საქართველო'
  }
};

export const VAT_RATE = 0.18;