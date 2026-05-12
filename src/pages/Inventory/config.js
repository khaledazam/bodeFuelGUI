export const fields = {
  product: {
    type: 'async',
    entity: 'product',
    displayLabels: ['name'],
    searchFields: 'name',
    required: true,
  },
  currentStock: {
    type: 'number',
    required: true,
  },
  reservedStock: {
    type: 'number',
    disable: true,
  },
  lowStockThreshold: {
    type: 'number',
  },
  reorderPoint: {
    type: 'number',
  },
  supplier: {
    type: 'async',
    entity: 'supplier',
    displayLabels: ['name'],
    searchFields: 'name',
  },
};
