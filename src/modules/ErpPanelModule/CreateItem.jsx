import { useState, useEffect } from 'react';
import { Button, Tag, Form, Divider } from 'antd';
import { PageHeader } from '@ant-design/pro-layout';
import { useSelector, useDispatch } from 'react-redux';
import useLanguage from '@/locale/useLanguage';
import { settingsAction } from '@/redux/settings/actions';
import { erp } from '@/redux/erp/actions';
import { selectCreatedItem } from '@/redux/erp/selectors';
import calculate from '@/utils/calculate';
import { generate as uniqueId } from 'shortid';
import Loading from '@/components/Loading';
import ThermalReceipt from '@/components/Receipt/ThermalReceipt';
import {
  ArrowLeftOutlined,
  CloseCircleOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

function SaveForm({ form }) {
  const translate = useLanguage();
  const handelClick = () => {
    form.submit();
  };

  return (
    <Button onClick={handelClick} type="primary" icon={<PlusOutlined />}>
      {translate('Save')}
    </Button>
  );
}

export default function CreateItem({ config, CreateForm }) {
  const translate = useLanguage();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    dispatch(settingsAction.list({ entity: 'setting' }));
  }, []);
  let { entity } = config;

  const { isLoading, isSuccess, result } = useSelector(selectCreatedItem);
  const [form] = Form.useForm();
  const [subTotal, setSubTotal] = useState(0);
  const [offerSubTotal, setOfferSubTotal] = useState(0);

  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [orderData, setOrderData] = useState(null);

  const toNumber = (v) =>
    v === '' || v === null || v === undefined
      ? 0
      : Number(String(v).replace(',', '.'));

  const handelValuesChange = (changedValues, values) => {
    const items = values['items'];
    let subTotal = 0;
    let subOfferTotal = 0;

    if (items) {
      items.map((item) => {
        if (item) {
          const qty = toNumber(item.quantity);
          const price = toNumber(item.price);
          const offerPrice = toNumber(item.offerPrice);

          if (offerPrice && qty) {
            let offerTotal = calculate.multiply(qty, offerPrice);
            subOfferTotal = calculate.add(subOfferTotal, offerTotal);
          }
          if (qty && price) {
            let total = calculate.multiply(qty, price);
            subTotal = calculate.add(subTotal, total);
          }
        }
      });
      setSubTotal(subTotal);
      setOfferSubTotal(subOfferTotal);
    }
  };

  useEffect(() => {
    if (isSuccess) {
      if (entity.toLowerCase() === 'order') {
        setOrderData(result);
        setIsReceiptOpen(true);
      } else {
        form.resetFields();
        dispatch(erp.resetAction({ actionType: 'create' }));
        setSubTotal(0);
        setOfferSubTotal(0);
        navigate(`/${entity.toLowerCase()}/read/${result._id}`);
      }
    }
  }, [isSuccess]);

  const handleReceiptClose = () => {
    setIsReceiptOpen(false);
    form.resetFields();
    dispatch(erp.resetAction({ actionType: 'create' }));
    setSubTotal(0);
    setOfferSubTotal(0);
    navigate(`/${entity.toLowerCase()}/read/${orderData._id}`);
  };

  const onSubmit = (fieldsValue) => {
    let cleanedValues = { ...fieldsValue };

    // ── Customer handling ──────────────────────────────────────
    // customer is now a string (name) from AutoComplete. 
    // Backend orderController.create handles finding or creating the customer record.
    if (cleanedValues.customer) {
      cleanedValues.customer = cleanedValues.customer;
    }

    // ── Fix items: convert strings to numbers ──────────────────
    let computedTotal = 0;
    if (cleanedValues.items) {
      cleanedValues.items = cleanedValues.items.map((item) => {
        const qty = toNumber(item.quantity);
        const price = toNumber(item.price);
        const lineTotal = calculate.multiply(qty, price);
        computedTotal = calculate.add(computedTotal, lineTotal);
        return {
          ...item,
          quantity: qty,
          price: price,
          total: lineTotal,
        };
      });
    }

    // ── Inject totalAmount — required by Order schema ──────────
    cleanedValues.totalAmount = toNumber(computedTotal);

    // Top level numeric fields
    const numericFields = ['taxRate', 'number', 'year'];
    numericFields.forEach(field => {
      if (cleanedValues[field] !== undefined) {
        cleanedValues[field] = toNumber(cleanedValues[field]);
      }
    });

    dispatch(erp.create({ entity, jsonData: cleanedValues }));
  };

  return (
    <>
      <PageHeader
        onBack={() => {
          navigate(`/${entity.toLowerCase()}`);
        }}
        backIcon={<ArrowLeftOutlined />}
        title={translate('New')}
        ghost={false}
        tags={<Tag>{translate('Draft')}</Tag>}
        extra={[
          <Button
            key={`${uniqueId()}`}
            onClick={() => navigate(`/${entity.toLowerCase()}`)}
            icon={<CloseCircleOutlined />}
          >
            {translate('Cancel')}
          </Button>,
          <SaveForm form={form} key={`${uniqueId()}`} />,
        ]}
        style={{
          padding: '20px 0px',
        }}
      ></PageHeader>
      <Divider dashed />
      <Loading isLoading={isLoading}>
        <Form form={form} layout="vertical" onFinish={onSubmit} onValuesChange={handelValuesChange}>
          <CreateForm subTotal={subTotal} offerTotal={offerSubTotal} />
        </Form>
      </Loading>
      <ThermalReceipt
        open={isReceiptOpen}
        onCancel={handleReceiptClose}
        orderData={orderData}
      />
    </>
  );
}
