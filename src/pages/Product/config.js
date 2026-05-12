export const fields = {
  name: {
    type: 'string',
    required: true,
    label: 'اسم المكمل',
  },
  sku: {
    type: 'string',
    required: true,
    label: 'الرقم التسلسلي',
  },
  barcode: {
    type: 'string',
    label: 'الباركود',
  },
  description: {
    type: 'textarea',
    label: 'الوصف',
  },
  costPrice: {
    type: 'currency',
    required: true,
    label: 'سعر الجملة (التكلفة)',
  },
  sellPrice: {
    type: 'currency',
    required: true,
    label: 'سعر البيع',
  },
  weight: {
    type: 'string',
    label: 'الوزن',
  },
  category: {
    type: 'async',
    entity: 'category',
    displayLabels: ['name'],
    searchFields: 'name',
    required: true,
    label: 'التصنيف',
  },
  brand: {
    type: 'async',
    entity: 'brand',
    displayLabels: ['name'],
    searchFields: 'name',
    required: true,
    label: 'الماركة',
  },
  dosageInstructions: {
    type: 'textarea',
    label: 'إرشادات الجرعة',
  },
  ingredients: {
    type: 'array',
    label: 'المكونات',
    options: [
      { value: 'Protein', label: 'بروتين' },
      { value: 'Creatine', label: 'كرياتين' },
      { value: 'Caffeine', label: 'كافيين' },
      { value: 'BCAA', label: 'أحماض أمينية BCAA' },
      { value: 'Whey', label: 'مصل اللبن' },
      { value: 'Vitamin C', label: 'فيتامين سي' },
      { value: 'Magnesium', label: 'مغنيسيوم' },
    ],
  },
};
