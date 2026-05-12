import React, { useState, useEffect } from 'react';
import { AutoComplete } from 'antd';
import { request } from '@/request';
import useDebounce from '@/hooks/useDebounce';

export default function CreatableCustomerSelect({ value, onChange }) {
  const [inputValue, setInputValue] = useState('');
  const [options, setOptions] = useState([]);

  const searchCustomers = async (searchText) => {
    try {
      const { success, result } = await request.search({
        entity: 'customer',
        options: { q: searchText, fields: 'name' },
      });
      if (success && result) {
        // نستخدم الاسم كقيمة مباشرة (Value) ليتم إرساله كنص للـ Backend
        setOptions(result.map((c) => ({ value: c.name, label: c.name })));
      }
    } catch (e) {
      console.log(e);
    }
  };

  const [, cancel] = useDebounce(
    () => {
      searchCustomers(inputValue);
    },
    500,
    [inputValue]
  );

  useEffect(() => {
    searchCustomers('');
    return () => cancel();
  }, []);

  return (
    <AutoComplete
      options={options}
      placeholder="اكتب اسم العميل مباشرة (أو اختر من المقترحات)"
      value={value}
      onChange={(val) => {
        setInputValue(val);
        if (onChange) onChange(val);
      }}
      onSelect={(val) => {
        setInputValue(val);
        if (onChange) onChange(val);
      }}
      style={{ width: '100%' }}
    />
  );
}
