export const fields = {
  name: {
    type: 'string',
    required: true,
    label: 'rule_name',
  },
  triggerProduct: {
    type: 'async',
    entity: 'product',
    displayLabels: ['name'],
    required: true,
    label: 'trigger_product',
  },
  discountedProduct: {
    type: 'async',
    entity: 'product',
    displayLabels: ['name'],
    required: true,
    label: 'discounted_product',
  },
  discountType: {
    type: 'selectWithTranslation',
    options: [
      { value: 'percentage', label: 'percentage', color: 'blue' },
      { value: 'fixed', label: 'fixed_amount', color: 'green' },
    ],
    required: true,
    label: 'discount_type',
  },
  discountValue: {
    type: 'number',
    required: true,
    label: 'discount_value',
  },
  enabled: {
    type: 'boolean',
    label: 'enabled',
  },
};
