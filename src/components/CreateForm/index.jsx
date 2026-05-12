import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { crud } from '@/redux/crud/actions';
import { usePanelContext, useSidePanelContext } from '@/context/crud';
import { selectCreatedItem } from '@/redux/crud/selectors';
import useLanguage from '@/locale/useLanguage';
import { Button, Form, Input, InputNumber, Select } from 'antd';
import Loading from '@/components/Loading';

export default function CreateForm({ config, formElements, withUpload = false }) {
  let { entity } = config;
  const dispatch = useDispatch();
  const { isLoading, isSuccess } = useSelector(selectCreatedItem);
  const { actions: panelActions } = usePanelContext();
  const { actions: sidePanelActions } = useSidePanelContext();
  const [form] = Form.useForm();
  const translate = useLanguage();

  // Guard: tracks if any InputNumber is actively being typed in.
  // Prevents onValuesChange / external re-renders from mutating form state mid-type.
  const isTyping = useRef(false);

  const toNumber = (v) => {
    if (v === '' || v === null || v === undefined) return null;
    const n = Number(String(v).replace(',', '.'));
    return isNaN(n) ? null : n;
  };

  const onSubmit = (fieldsValue) => {
    if (fieldsValue.file && withUpload) {
      fieldsValue.file = fieldsValue.file[0].originFileObj;
    }

    const cleanedValues = { ...fieldsValue };
    const fields = Array.isArray(formElements) ? formElements : [];

    // Convert InputNumber stringMode values to real numbers on submit only
    fields.forEach((field) => {
      if (field.type === 'number') {
        cleanedValues[field.name] = toNumber(fieldsValue[field.name]);
      }
    });

    dispatch(crud.create({ entity, jsonData: cleanedValues, withUpload }));
  };

  useEffect(() => {
    if (isSuccess) {
      sidePanelActions.readBox.open();
      panelActions.collapsedBox.open();
      panelActions.panel.open();
      form.resetFields();
      dispatch(crud.resetAction({ actionType: 'create' }));
      dispatch(crud.list({ entity }));
    }
  }, [isSuccess]);

  return (
    <Loading isLoading={isLoading}>
      <Form form={form} layout="vertical" onFinish={onSubmit}>
        {Array.isArray(formElements)
          ? formElements.map((field) => (
            <Form.Item
              key={field.name}
              label={field.label}
              name={field.name}
              rules={[{ required: field.required }]}
            >
              {field.type === 'number' ? (
                // stringMode: AntD treats the value as a string internally during typing.
                // This completely eliminates the +1 increment bug and cursor jump.
                // parser/formatter ensure commas are handled, precision avoids float display issues.
                <InputNumber
                  stringMode
                  style={{ width: '100%' }}
                  placeholder="0"
                  autoComplete="off"
                  precision={field.precision ?? 2}
                  parser={(val) => val?.replace(',', '.')}
                  onFocus={() => { isTyping.current = true; }}
                  onBlur={() => { isTyping.current = false; }}
                />
              ) : field.type === 'select' ? (
                <Select options={field.options} />
              ) : (
                <Input />
              )}
            </Form.Item>
          ))
          : formElements}
        <Form.Item>
          <Button type="primary" htmlType="submit">
            {translate('Submit')}
          </Button>
        </Form.Item>
      </Form>
    </Loading>
  );
}