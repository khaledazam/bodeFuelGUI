import React from 'react';
import { Input } from 'antd';
import { useMoney } from '@/settings';

export default function MoneyInputFormItem({
  value,
  onChange,
  readOnly = false,
  disabled = false,
  isCurrency = true,
  ...rest
}) {
  const {
    currency_symbol,
    currency_position,
  } = useMoney();

  return (
    <Input
      inputMode="decimal"
      placeholder="0"
      autoComplete="off"
      value={value}
      onChange={onChange}
      readOnly={readOnly}
      disabled={disabled || readOnly}
      addonAfter={isCurrency && currency_position === 'after' ? currency_symbol : undefined}
      addonBefore={isCurrency && currency_position === 'before' ? currency_symbol : undefined}
      {...rest}
    />
  );
}