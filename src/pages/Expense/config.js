export const fields = {
  name: {
    type: 'string',
    required: true,
  },
  expenseCategory: {
    type: 'select',
    required: true,
    options: [
      { value: 'withdrawal', label: 'مسحوبات شخصية / مالك' },
      { value: 'salary', label: 'رواتب وأجور' },
      { value: 'rent', label: 'إيجار' },
      { value: 'maintenance', label: 'صيانة وتصليح' },
      { value: 'petty_cash', label: 'نثريات' },
      { value: 'other', label: 'أخرى' },
    ],
  },
  amount: {
    type: 'number',
    required: true,
  },
  date: {
    type: 'date',
    required: true,
  },
  reference: {
    type: 'string',
  },
  notes: {
    type: 'textarea',
  },
};
