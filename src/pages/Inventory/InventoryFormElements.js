import useLanguage from '@/locale/useLanguage';

const InventoryFormElements = () => {
  const translate = useLanguage();
  
  return [
    {
      label: "المنتج",
      name: "product",
      type: "readOnly", // لا نغير المنتج بعد إنشائه
      displayLabels: ["product.name"],
    },
    {
      label: "الكمية الحالية",
      name: "currentStock",
      type: "number",
      disabled: true, // يفضل التعديل عبر "تسوية مخزون" لضمان وجود سجل (Log)
    },
    {
      label: "الكمية المحجوزة",
      name: "reservedStock",
      type: "number",
      disabled: true,
    },
    {
      label: "حد إعادة الطلب (Threshold)",
      name: "lowStockThreshold",
      type: "number",
      required: true,
    },
    {
      label: "نقطة الطلب (Reorder Point)",
      name: "reorderPoint",
      type: "number",
      required: true,
    },
    {
      label: "المورد",
      name: "supplier",
      type: "asyncSelect",
      entity: "supplier",
      displayLabels: ["name"],
      placeholder: "اختر المورد",
    },
    {
        label: 'تاريخ الصلاحية القادم',
        name: 'nextExpirationBatch',
        type: 'date',
    },
  ];
};

export default InventoryFormElements;