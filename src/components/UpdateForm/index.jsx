import { useEffect, useRef } from 'react';
import dayjs from 'dayjs';
import { useDispatch, useSelector } from 'react-redux';
import { crud } from '@/redux/crud/actions';
import { usePanelContext, useSidePanelContext } from '@/context/crud';
import { selectUpdatedItem } from '@/redux/crud/selectors';
import useLanguage from '@/locale/useLanguage';
import { Button, Form, Input, InputNumber, Select } from 'antd';
import Loading from '@/components/Loading';

export default function UpdateForm({ config, formElements, withUpload = false }) {
  const { entity } = config;
  const translate = useLanguage();
  const dispatch = useDispatch();

  const { current, isLoading, isSuccess } = useSelector(selectUpdatedItem);
  const { state, actions: sidePanelActions } = useSidePanelContext();
  const { actions: panelActions } = usePanelContext();

  const [form] = Form.useForm();

  // Tracks ID of record last hydrated into the form.
  // Prevents re-hydration if the same record is still selected.
  const lastLoadedId = useRef(null);

  // Guard: true while user has focus on any InputNumber field.
  // Blocks setFieldsValue from firing during active typing (eliminates increment bug).
  const isTyping = useRef(false);

  const showCurrentRecord = () => {
    sidePanelActions.readBox.open();
  };

  const toNumber = (v) => {
    if (v === '' || v === null || v === undefined) return null;
    const n = Number(String(v).replace(',', '.'));
    return isNaN(n) ? null : n;
  };

  // =========================
  // SUBMIT
  // =========================
  const onSubmit = (fieldsValue) => {
    const id = current._id;
    const cleanedValues = { ...fieldsValue };

    // Convert InputNumber stringMode values to real numbers ONLY on submit
    if (Array.isArray(formElements)) {
      formElements.forEach((field) => {
        if (field.type === 'number') {
          cleanedValues[field.name] = toNumber(fieldsValue[field.name]);
        }
      });
    }

    if (cleanedValues.file && withUpload) {
      cleanedValues.file = cleanedValues.file[0].originFileObj;
    }

    dispatch(crud.update({ entity, id, jsonData: cleanedValues, withUpload }));
  };

  // =========================
  // SAFE HYDRATION
  // =========================
  useEffect(() => {
    if (!current?._id) return;

    // Skip if same record is already loaded
    if (lastLoadedId.current === current._id) return;
    lastLoadedId.current = current._id;

    // CRITICAL: Never overwrite form while user is actively typing
    if (isTyping.current) return;

    // Also skip if the user has already touched the form (e.g. panel re-opened same record)
    if (form.isFieldsTouched()) return;

    let newValues = { ...current };

    // Convert date strings to dayjs objects for DatePicker fields
    const dateFields = ['birthday', 'date', 'expiredDate', 'created', 'updated'];
    dateFields.forEach((dateField) => {
      if (newValues[dateField]) {
        newValues[dateField] = dayjs(newValues[dateField]);
      }
    });

    // Numeric fields: provide as number (InputNumber stringMode accepts numbers fine on mount)
    if (Array.isArray(formElements)) {
      formElements.forEach((field) => {
        if (field.type === 'number' && newValues[field.name] !== undefined) {
          newValues[field.name] = toNumber(newValues[field.name]);
        }
      });
    }

    form.setFieldsValue(newValues);
  }, [current?._id]);

  // =========================
  // SUCCESS EFFECT
  // =========================
  useEffect(() => {
    if (isSuccess) {
      sidePanelActions.readBox.open();
      panelActions.collapsedBox.open();
      panelActions.panel.open();
      dispatch(crud.resetAction({ actionType: 'update' }));
      dispatch(crud.list({ entity }));
      // Reset the guard so next record loads fresh
      lastLoadedId.current = null;
    }
  }, [isSuccess]);

  const { isEditBoxOpen } = state;
  const show = isEditBoxOpen
    ? { display: 'block', opacity: 1 }
    : { display: 'none', opacity: 0 };

  return (
    <div style={show}>
      <Loading isLoading={isLoading}>
        <Form form={form} layout="vertical" onFinish={onSubmit}>
          {Array.isArray(formElements) &&
            formElements.map((field) => (
              <Form.Item
                key={field.name}
                label={field.label}
                name={field.name}
                rules={[{ required: field.required }]}
              >
                {field.type === 'number' ? (
                  // stringMode: keeps value as string string during typing.
                  // Eliminates the +1 increment and cursor jump bugs.
                  // Only toNumber() on submit produces actual Number for backend.
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
            ))}

          <Form.Item style={{ display: 'inline-block', paddingRight: '5px' }}>
            <Button type="primary" htmlType="submit">
              {translate('Save')}
            </Button>
          </Form.Item>

          <Form.Item style={{ display: 'inline-block', paddingLeft: '5px' }}>
            <Button onClick={showCurrentRecord}>{translate('Cancel')}</Button>
          </Form.Item>
        </Form>
      </Loading>
    </div>
  );
}
