export const fields = {
  name: {
    type: 'string',
    required: true,
    label: 'اسم المورد',
  },
  contactName: {
    type: 'string',
    label: 'اسم المسؤول',
  },
  email: {
    type: 'email',
    label: 'البريد الإلكتروني',
  },
  phone: {
    type: 'string',
    label: 'رقم الهاتف',
  },
  address: {
    type: 'string',
    label: 'العنوان',
  },
  leadTimeDays: {
    type: 'number',
    label: 'مدة التوريد (أيام)',
  },
};
