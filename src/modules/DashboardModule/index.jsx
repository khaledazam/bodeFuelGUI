import { useEffect, useState, useCallback } from 'react';
import { Tag, Row, Col, List, Avatar, Card, Statistic, Table, Divider, Badge, DatePicker, Button, Space, Alert, Typography } from 'antd';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { 
  DollarCircleOutlined, 
  ShoppingOutlined, 
  WarningOutlined, 
  OrderedListOutlined,
  HourglassOutlined,
  ArrowUpOutlined,
  FileExcelOutlined,
  FilterOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';

import useLanguage from '@/locale/useLanguage';
import { useMoney } from '@/settings';
import { request } from '@/request';
import useFetch from '@/hooks/useFetch';
import useOnFetch from '@/hooks/useOnFetch';
import RecentTable from './components/RecentTable';

const { RangePicker } = DatePicker;

export default function DashboardModule() {
  const translate = useLanguage();
  const { moneyFormatter } = useMoney();
  const [dateRange, setDateRange] = useState([dayjs().startOf('month'), dayjs().endOf('day')]);

  const {
    result: summaryResult,
    isLoading: summaryLoading,
    onFetch: fetchSummary,
  } = useOnFetch();

  const loadSummary = useCallback((dates) => {
    const [start, end] = dates || [dayjs().startOf('month'), dayjs().endOf('day')];
    fetchSummary(request.get({ 
      entity: 'dashboard/summary', 
      options: { 
        startDate: start.format('YYYY-MM-DD'), 
        endDate: end.format('YYYY-MM-DD') 
      } 
    }));
  }, [fetchSummary]);

  const {
    result: inventoryResult,
    isLoading: inventoryLoading,
  } = useFetch(() => request.list({ entity: 'inventory' }));

  useEffect(() => {
    loadSummary(dateRange);
  }, [loadSummary]);

  const onDateChange = (dates) => {
    setDateRange(dates);
    loadSummary(dates);
  };

  const exportToExcel = async () => {
    try {
      const [start, end] = dateRange;
      const response = await request.get({ 
        entity: 'order/list', 
        options: { 
          filter: `orderDate[gte]=${start.startOf('day').toISOString()}&orderDate[lte]=${end.endOf('day').toISOString()}`
        } 
      });

      if (response.success && response.result) {
        const data = response.result.map(order => ({
          'رقم الفاتورة': order.invoiceNumber,
          'التاريخ': dayjs(order.orderDate).format('YYYY-MM-DD HH:mm'),
          'العميل': order.customer?.name || '—',
          'نوع الطلب': order.orderType === 'delivery' ? 'توصيل' : 'محل',
          'رسوم الشحن': order.deliveryFee || 0,
          'الإجمالي': order.totalAmount || 0,
          'طريقة الدفع': order.paymentMethod || '—',
          'الكاشير': order.cashier?.name || '—',
        }));

        const csvContent = "\uFEFF" + [
          Object.keys(data[0]).join(","),
          ...data.map(row => Object.values(row).join(","))
        ].join("\n");

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `تقرير_المبيعات_${start.format('YYYY-MM-DD')}_إلى_${end.format('YYYY-MM-DD')}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (error) {
      console.error('Export failed', error);
    }
  };

  const stats = summaryResult?.stats || {};
  const timeline = summaryResult?.timeline || [];
  const topSellers = summaryResult?.topSellers || [];

  const expiringSoon = inventoryResult?.filter(item => {
    if (!item.nextExpirationBatch) return false;
    const diff = dayjs(item.nextExpirationBatch).diff(dayjs(), 'days');
    return diff > 0 && diff <= 30;
  }) || [];

  const dataTableColumns = [
    {
      title: translate('order_status'),
      dataIndex: 'orderStatus',
      render: (status) => {
        let color = 'blue';
        if (status === 'shipped') color = 'orange';
        if (status === 'delivered') color = 'green';
        if (status === 'cancelled') color = 'red';
        return <Tag color={color}>{translate(status)}</Tag>;
      },
    }
  ];

  return (
    <div className="dashboard-container">
      <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
        <Col span={24}>
          <Card bordered={false} className="shadow-sm">
            <Row justify="space-between" align="middle">
              <Col>
                <Space size="middle">
                  <FilterOutlined style={{ fontSize: 18, color: '#1890ff' }} />
                  <span style={{ fontWeight: 600 }}>تصفية النتائج:</span>
                  <RangePicker 
                    value={dateRange} 
                    onChange={onDateChange} 
                    format="YYYY-MM-DD"
                    allowClear={false}
                    size="large"
                  />
                </Space>
              </Col>
              <Col>
                <Button 
                  type="primary" 
                  icon={<FileExcelOutlined />} 
                  onClick={exportToExcel}
                  size="large"
                  ghost
                >
                  استخراج تقرير Excel
                </Button>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>

      {summaryResult?.lowStockList?.length > 0 && (
        <Alert
          message="تنبيه: يوجد أصناف أوشكت على النفاذ"
          description={
            <List
              size="small"
              dataSource={summaryResult.lowStockList}
              renderItem={item => (
                <List.Item key={item._id}>
                  <Typography.Text strong>{item.product?.name}</Typography.Text>
                  <Badge count={item.currentStock} style={{ backgroundColor: '#f5222d', marginRight: 10, marginLeft: 10 }} />
                  <Typography.Text type="secondary">(الحد الأدنى: {item.lowStockThreshold})</Typography.Text>
                </List.Item>
              )}
            />
          }
          type="warning"
          showIcon
          style={{ marginBottom: 24 }}
          closable
        />
      )}

      <Row gutter={[24, 24]}>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} className="shadow-sm border-left-success">
            <Statistic
              title={translate('total_revenue') || 'إجمالي المبيعات'}
              value={stats.totalRevenue}
              prefix={<DollarCircleOutlined style={{ color: '#52c41a' }} />}
              formatter={(val) => moneyFormatter({ amount: val })}
              loading={summaryLoading}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} className="shadow-sm">
            <Statistic
              title={'أرباح الشحن (Delivery)'}
              value={stats.totalDelivery}
              prefix={<ShoppingOutlined style={{ color: '#722ed1' }} />}
              formatter={(val) => moneyFormatter({ amount: val })}
              loading={summaryLoading}
            />
          </Card>
        </Col>
        
        {stats.grossProfit !== undefined && (
          <Col xs={24} sm={12} lg={6}>
            <Card bordered={false} className="shadow-sm">
              <Statistic
                title={'إجمالي الأرباح'}
                value={stats.grossProfit}
                prefix={<DollarCircleOutlined style={{ color: '#1890ff' }} />}
                formatter={(val) => moneyFormatter({ amount: val })}
                loading={summaryLoading}
              />
            </Card>
          </Col>
        )}

        {stats.totalExpense !== undefined && (
          <Col xs={24} sm={12} lg={6}>
            <Card bordered={false} className="shadow-sm">
              <Statistic
                title={'المصروفات'}
                value={stats.totalExpense}
                prefix={<ArrowUpOutlined style={{ color: '#cf1322' }} />}
                formatter={(val) => moneyFormatter({ amount: val })}
                loading={summaryLoading}
              />
            </Card>
          </Col>
        )}
      </Row>

      <div className="space30"></div>

      <Row gutter={[24, 24]}>
        <Col xs={24} sm={12} lg={8}>
          <Card bordered={false} className="shadow-sm">
            <Statistic
              title={translate('total_supplements')}
              value={stats.totalSupplements}
              prefix={<ShoppingOutlined style={{ color: '#1890ff' }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card bordered={false} className="shadow-sm">
            <Badge count={stats.lowStockItems} offset={[-10, 10]}>
              <Statistic
                title={translate('low_stock_items')}
                value={stats.lowStockItems}
                valueStyle={{ color: stats.lowStockItems > 0 ? '#cf1322' : 'inherit' }}
                prefix={<WarningOutlined />}
              />
            </Badge>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card bordered={false} className="shadow-sm">
             <Badge count={expiringSoon.length} offset={[-10, 10]}>
              <Statistic
                title={translate('expiring_soon_30d')}
                value={expiringSoon.length}
                valueStyle={{ color: expiringSoon.length > 0 ? '#faad14' : 'inherit' }}
                prefix={<HourglassOutlined />}
              />
            </Badge>
          </Card>
        </Col>
      </Row>

      <div className="space30"></div>

      <Row gutter={[24, 24]}>
        <Col xs={24} lg={16}>
          <Card title={translate('revenue_performance')} bordered={false} className="shadow-sm">
            <div style={{ width: '100%', height: 350 }}>
              <ResponsiveContainer>
                <AreaChart data={timeline}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#1890ff" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#1890ff" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="_id" />
                  <YAxis tickFormatter={(val) => `$${val/1000}k`} />
                  <Tooltip formatter={(val) => moneyFormatter({ amount: val })} />
                  <Area type="monotone" dataKey="revenue" stroke="#1890ff" fillOpacity={1} fill="url(#colorRevenue)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title={<><HourglassOutlined /> {translate('expiring_soon')}</>} bordered={false} className="shadow-sm" style={{ height: '100%' }}>
            <List
              dataSource={expiringSoon}
              loading={inventoryLoading}
              renderItem={(item) => (
                <List.Item>
                  <List.Item.Meta
                    title={item.product?.name}
                    description={<Tag color="volcano">{dayjs(item.nextExpirationBatch).format('DD MMM')}</Tag>}
                  />
                  <div>{translate('quantity_short')}: {item.currentStock}</div>
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>

      <div className="space30"></div>
      
      <Row gutter={[24, 24]}>
         <Col xs={24} lg={12}>
            <Card title={translate('top_best_sellers')} bordered={false} className="shadow-sm">
               <Table 
                  dataSource={topSellers} 
                  pagination={false} 
                  size="small"
                  columns={[
                    { title: translate('supplements'), dataIndex: ['productDetails', 'name'] },
                    { title: translate('quantity_short'), dataIndex: 'totalQuantity', align: 'right' },
                    { title: translate('total'), dataIndex: 'totalRevenue', render: (val) => moneyFormatter({ amount: val }), align: 'right' }
                  ]}
               />
            </Card>
         </Col>
         <Col xs={24} lg={12}>
            <Card title={translate('latest_orders')} bordered={false} className="shadow-sm">
               <RecentTable entity={'order'} dataTableColumns={dataTableColumns} />
            </Card>
         </Col>
      </Row>
    </div>
  );
}
