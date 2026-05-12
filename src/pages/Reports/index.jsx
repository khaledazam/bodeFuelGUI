import { Tabs, Table, Card, Row, Col, Statistic, Tag, DatePicker, Button, Space } from 'antd';
import { 
  FileDoneOutlined, 
  DatabaseOutlined, 
  HourglassOutlined, 
  DownloadOutlined,
  SearchOutlined 
} from '@ant-design/icons';
import dayjs from 'dayjs';

import useFetch from '@/hooks/useFetch';
import { request } from '@/request';
import { useMoney, useDate } from '@/settings';
import useLanguage from '@/locale/useLanguage';

export default function Reports() {
  const translate = useLanguage();
  const { moneyFormatter } = useMoney();
  const { dateFormat } = useDate();

  const { result: salesReport, isLoading: salesLoading } = useFetch(() => request.list({ entity: 'order' }));
  const { result: inventoryReport, isLoading: inventoryLoading } = useFetch(() => request.list({ entity: 'inventory' }));

  const expiringProducts = inventoryReport?.filter(item => {
    if (!item.nextExpirationBatch) return false;
    const expDate = dayjs(item.nextExpirationBatch);
    const thirtyDaysFromNow = dayjs().add(30, 'days');
    return expDate.isBefore(thirtyDaysFromNow);
  }) || [];

  const salesColumns = [
    { title: 'Order #', dataIndex: 'invoiceNumber' },
    { title: 'Customer', dataIndex: ['customer', 'name'] },
    { title: 'Date', dataIndex: 'orderDate', render: (date) => dayjs(date).format(dateFormat) },
    { title: 'Total', dataIndex: 'totalAmount', render: (val) => moneyFormatter({ amount: val }), align: 'right' },
    { title: 'Status', dataIndex: 'orderStatus', render: (status) => <Tag color="blue">{status.toUpperCase()}</Tag> },
  ];

  const inventoryColumns = [
    { title: 'Supplement', dataIndex: ['product', 'name'] },
    { title: 'In Stock', dataIndex: 'currentStock', render: (val, record) => (
      <Tag color={val <= record.lowStockThreshold ? 'red' : 'green'}>{val}</Tag>
    )},
    { title: 'Reserved', dataIndex: 'reservedStock' },
    { title: 'Supplier', dataIndex: ['supplier', 'name'] },
    { title: 'Last Restock', dataIndex: 'lastRestockDate', render: (date) => date ? dayjs(date).format(dateFormat) : '-' },
  ];

  const expirationColumns = [
    { title: 'Supplement', dataIndex: ['product', 'name'] },
    { title: 'Batch Quantity', dataIndex: 'currentStock' },
    { title: 'Expiry Date', dataIndex: 'nextExpirationBatch', render: (date) => (
      <Tag color="orange">{dayjs(date).format(dateFormat)}</Tag>
    )},
    { title: 'Days to Expiry', render: (_, record) => dayjs(record.nextExpirationBatch).diff(dayjs(), 'days') },
  ];

  return (
    <div className="reports-container pad20">
      <Row gutter={[24, 24]} className="mb-20">
         <Col span={24}>
            <div className="whiteBox shadow-sm pad20">
               <h2 style={{ color: '#22075e', marginBottom: 20 }}>Supplement ERP Reports</h2>
               <p>Detailed performance and inventory metrics for your business.</p>
            </div>
         </Col>
      </Row>

      <Tabs 
        defaultActiveKey="1" 
        className="whiteBox shadow-sm pad20"
        items={[
          {
            key: '1',
            label: (<span><FileDoneOutlined /> Sales Report</span>),
            children: (
              <>
                <Space style={{ marginBottom: 16 }}>
                   <DatePicker.RangePicker />
                   <Button type="primary" icon={<SearchOutlined />}>Filter</Button>
                </Space>
                <Table 
                   dataSource={salesReport} 
                   columns={salesColumns} 
                   loading={salesLoading}
                   rowKey="_id"
                />
              </>
            ),
          },
          {
            key: '2',
            label: (<span><DatabaseOutlined /> Inventory Status</span>),
            children: (
              <Table 
                 dataSource={inventoryReport} 
                 columns={inventoryColumns} 
                 loading={inventoryLoading}
                 rowKey="_id"
              />
            ),
          },
          {
            key: '3',
            label: (<span><HourglassOutlined /> Expiring Products</span>),
            children: (
              <Table 
                 dataSource={expiringProducts} 
                 columns={expirationColumns} 
                 loading={inventoryLoading}
                 rowKey="_id"
              />
            ),
          },
        ]}
      />
    </div>
  );
}
