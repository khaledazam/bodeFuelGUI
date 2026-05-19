import { useState, useMemo } from 'react';
import { Tabs, Table, Card, Row, Col, Statistic, Tag, DatePicker, Button, Space, Select, Input, Typography, Tooltip } from 'antd';
import { 
  FileDoneOutlined, 
  DatabaseOutlined, 
  HourglassOutlined, 
  DownloadOutlined,
  SearchOutlined,
  DollarCircleOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  FilterOutlined,
  UserOutlined,
  WalletOutlined,
  FileExcelOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { useSelector } from 'react-redux';
import { selectCurrentAdmin } from '@/redux/auth/selectors';

import useFetch from '@/hooks/useFetch';
import { request } from '@/request';
import { useMoney, useDate } from '@/settings';
import useLanguage from '@/locale/useLanguage';

const { RangePicker } = DatePicker;
const { Title, Text } = Typography;

export default function Reports() {
  const translate = useLanguage();
  const { moneyFormatter } = useMoney();
  const { dateFormat } = useDate();
  const currentAdmin = useSelector(selectCurrentAdmin);
  const isAdminOrOwner = currentAdmin && ['owner', 'admin'].includes(currentAdmin.role);

  // Fetch Reports Data
  const { result: salesReport, isLoading: salesLoading } = useFetch(() => request.list({ entity: 'order' }));
  const { result: inventoryReport, isLoading: inventoryLoading } = useFetch(() => request.list({ entity: 'inventory' }));
  const { result: expenseReport, isLoading: expenseLoading } = useFetch(() => request.list({ entity: 'expense' }));
  const { result: cashierList } = useFetch(() => request.list({ entity: 'admin' }));

  // --- STATE FOR FILTERS ---
  // Sales Filters
  const [salesDateRange, setSalesDateRange] = useState([dayjs().startOf('month'), dayjs().endOf('day')]);
  const [salesPaymentFilter, setSalesPaymentFilter] = useState('all');
  const [salesTypeFilter, setSalesTypeFilter] = useState('all');
  const [salesCashierFilter, setSalesCashierFilter] = useState('all');

  // Inventory Filters
  const [inventorySearch, setInventorySearch] = useState('');
  const [inventoryStockFilter, setInventoryStockFilter] = useState('all'); // all, low, normal

  // Expense Filters
  const [expenseDateRange, setExpenseDateRange] = useState([dayjs().startOf('month'), dayjs().endOf('day')]);
  const [expenseCategoryFilter, setExpenseCategoryFilter] = useState('all');
  const [expenseCashierFilter, setExpenseCashierFilter] = useState('all');

  // --- FILTERED DATA COMPUTATION (MEMOIZED) ---
  const filteredSales = useMemo(() => {
    if (!salesReport) return [];
    return salesReport.filter(order => {
      const orderDate = dayjs(order.orderDate);
      const start = salesDateRange[0].startOf('day');
      const end = salesDateRange[1].endOf('day');
      const isInDateRange = (orderDate.isAfter(start) || orderDate.isSame(start)) && 
                            (orderDate.isBefore(end) || orderDate.isSame(end));
      
      const matchesPayment = salesPaymentFilter === 'all' || order.paymentMethod === salesPaymentFilter;
      const matchesType = salesTypeFilter === 'all' || order.orderType === salesTypeFilter;
      const matchesCashier = salesCashierFilter === 'all' || order.cashier?._id === salesCashierFilter;
      
      return isInDateRange && matchesPayment && matchesType && matchesCashier;
    });
  }, [salesReport, salesDateRange, salesPaymentFilter, salesTypeFilter, salesCashierFilter]);

  const filteredExpenses = useMemo(() => {
    if (!expenseReport) return [];
    return expenseReport.filter(exp => {
      const expDate = dayjs(exp.date || exp.created);
      const start = expenseDateRange[0].startOf('day');
      const end = expenseDateRange[1].endOf('day');
      const isInDateRange = (expDate.isAfter(start) || expDate.isSame(start)) && 
                            (expDate.isBefore(end) || expDate.isSame(end));

      const matchesCategory = expenseCategoryFilter === 'all' || exp.expenseCategory === expenseCategoryFilter;
      const matchesCashier = expenseCashierFilter === 'all' || exp.user?._id === expenseCashierFilter;

      return isInDateRange && matchesCategory && matchesCashier;
    });
  }, [expenseReport, expenseDateRange, expenseCategoryFilter, expenseCashierFilter]);

  const filteredInventory = useMemo(() => {
    if (!inventoryReport) return [];
    return inventoryReport.filter(item => {
      const name = item.product?.name || '';
      const sku = item.product?.sku || '';
      const matchesSearch = name.toLowerCase().includes(inventorySearch.toLowerCase()) || 
                            sku.toLowerCase().includes(inventorySearch.toLowerCase());
      
      const isLowStock = item.currentStock <= item.lowStockThreshold;
      const matchesStock = inventoryStockFilter === 'all' || 
                           (inventoryStockFilter === 'low' && isLowStock) || 
                           (inventoryStockFilter === 'normal' && !isLowStock);
      
      return matchesSearch && matchesStock;
    });
  }, [inventoryReport, inventorySearch, inventoryStockFilter]);

  const expiringProducts = useMemo(() => {
    if (!inventoryReport) return [];
    return inventoryReport.filter(item => {
      if (!item.nextExpirationBatch) return false;
      const expDate = dayjs(item.nextExpirationBatch);
      const thirtyDaysFromNow = dayjs().add(30, 'days');
      return expDate.isBefore(thirtyDaysFromNow) && expDate.isAfter(dayjs().subtract(365, 'days'));
    });
  }, [inventoryReport]);

  // --- STATS COMPUTATION ---
  const salesStats = useMemo(() => {
    let totalRevenue = 0;
    let totalDelivery = 0;
    let totalProfit = 0;
    let paymentBreakdown = { cash: 0, instapay: 0, card: 0 };

    filteredSales.forEach(order => {
      totalRevenue += order.totalAmount || 0;
      totalDelivery += order.deliveryFee || 0;
      totalProfit += order.profit || 0;
      
      const pm = (order.paymentMethod || 'cash').toLowerCase();
      if (pm.includes('cash')) paymentBreakdown.cash += order.totalAmount || 0;
      else if (pm.includes('insta')) paymentBreakdown.instapay += order.totalAmount || 0;
      else paymentBreakdown.card += order.totalAmount || 0;
    });

    return { totalRevenue, totalDelivery, totalProfit, paymentBreakdown, count: filteredSales.length };
  }, [filteredSales]);

  const inventoryStats = useMemo(() => {
    let totalItems = 0;
    let totalQuantity = 0;
    let totalRetailValue = 0;
    let totalCostValue = 0;
    let lowStockCount = 0;

    filteredInventory.forEach(item => {
      totalItems += 1;
      totalQuantity += item.currentStock || 0;
      totalRetailValue += (item.currentStock || 0) * (item.product?.price || item.product?.sellPrice || 0);
      totalCostValue += (item.currentStock || 0) * (item.product?.costPrice || 0);
      if (item.currentStock <= item.lowStockThreshold) {
        lowStockCount += 1;
      }
    });

    return { totalItems, totalQuantity, totalRetailValue, totalCostValue, lowStockCount };
  }, [filteredInventory]);

  const expenseStats = useMemo(() => {
    let totalExpense = 0;
    let withdrawalTotal = 0;
    let salaryTotal = 0;
    let otherTotal = 0;

    filteredExpenses.forEach(exp => {
      totalExpense += exp.amount || 0;
      if (exp.expenseCategory === 'withdrawal') withdrawalTotal += exp.amount || 0;
      else if (exp.expenseCategory === 'salary') salaryTotal += exp.amount || 0;
      else otherTotal += exp.amount || 0;
    });

    return { totalExpense, withdrawalTotal, salaryTotal, otherTotal };
  }, [filteredExpenses]);


  // --- CSV EXPORTERS ---
  const exportSalesCSV = () => {
    if (filteredSales.length === 0) return;
    const data = filteredSales.map(order => ({
      'Invoice Number': order.invoiceNumber,
      'Date': dayjs(order.orderDate).format('YYYY-MM-DD HH:mm'),
      'Customer': order.customer?.name || '—',
      'Type': order.orderType === 'delivery' ? 'توصيل' : 'محل',
      'Delivery Fee': order.deliveryFee || 0,
      'Total Amount': order.totalAmount || 0,
      'Payment Method': order.paymentMethod || '—',
      'Cashier': order.cashier ? `${order.cashier.name} ${order.cashier.surname || ''}` : '—',
    }));

    const csvContent = "\uFEFF" + [
      Object.keys(data[0]).join(","),
      ...data.map(row => Object.values(row).map(v => `"${v}"`).join(","))
    ].join("\n");

    triggerDownload(csvContent, `تقرير_المبيعات_${salesDateRange[0].format('YYYY-MM-DD')}_إلى_${salesDateRange[1].format('YYYY-MM-DD')}.csv`);
  };

  const exportExpenseCSV = () => {
    if (filteredExpenses.length === 0) return;
    const data = filteredExpenses.map(exp => ({
      'Expense Name': exp.name,
      'Date': dayjs(exp.date || exp.created).format('YYYY-MM-DD'),
      'Category': translate(exp.expenseCategory) || exp.expenseCategory,
      'Cashier/Employee': exp.user ? `${exp.user.name} ${exp.user.surname || ''}` : '—',
      'Amount': exp.amount || 0,
    }));

    const csvContent = "\uFEFF" + [
      Object.keys(data[0]).join(","),
      ...data.map(row => Object.values(row).map(v => `"${v}"`).join(","))
    ].join("\n");

    triggerDownload(csvContent, `تقرير_المصروفات_${expenseDateRange[0].format('YYYY-MM-DD')}_إلى_${expenseDateRange[1].format('YYYY-MM-DD')}.csv`);
  };

  const triggerDownload = (content, filename) => {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };


  // --- TABLE COLUMNS ---
  const salesColumns = [
    { title: 'رقم الطلب #', dataIndex: 'invoiceNumber', key: 'invoiceNumber' },
    { title: 'العميل', dataIndex: ['customer', 'name'], key: 'customer' },
    { title: 'التاريخ', dataIndex: 'orderDate', key: 'orderDate', render: (date) => dayjs(date).format(dateFormat) },
    { title: 'النوع', dataIndex: 'orderType', key: 'orderType', render: (type) => type === 'delivery' ? <Tag color="cyan">توصيل</Tag> : <Tag color="blue">محل</Tag> },
    { title: 'رسوم الشحن', dataIndex: 'deliveryFee', key: 'deliveryFee', render: (val) => moneyFormatter({ amount: val }), align: 'right' },
    { title: 'طريقة الدفع', dataIndex: 'paymentMethod', key: 'paymentMethod', render: (pm) => <Tag color="purple">{pm.toUpperCase()}</Tag> },
    { title: 'الكاشير', key: 'cashier', render: (_, record) => record.cashier ? `${record.cashier.name} ${record.cashier.surname || ''}` : '—' },
    ...(isAdminOrOwner ? [{ title: 'الربح', dataIndex: 'profit', key: 'profit', render: (val) => moneyFormatter({ amount: val }), align: 'right' }] : []),
    { title: 'إجمالي الفاتورة', dataIndex: 'totalAmount', key: 'totalAmount', render: (val) => moneyFormatter({ amount: val }), align: 'right' },
  ];

  const inventoryColumns = [
    { title: 'اسم المكمل', dataIndex: ['product', 'name'], key: 'productName' },
    { title: 'رمز SKU', dataIndex: ['product', 'sku'], key: 'productSku' },
    { title: 'التصنيف', dataIndex: ['product', 'category', 'name'], key: 'productCategory' },
    { title: 'سعر البيع', key: 'sellPrice', render: (_, record) => moneyFormatter({ amount: record.product?.price || record.product?.sellPrice || 0 }), align: 'right' },
    ...(isAdminOrOwner ? [{ title: 'سعر التكلفة', dataIndex: ['product', 'costPrice'], key: 'costPrice', render: (val) => moneyFormatter({ amount: val }), align: 'right' }] : []),
    { title: 'المخزون الحالي', dataIndex: 'currentStock', key: 'currentStock', render: (val, record) => (
      <Tag color={val <= record.lowStockThreshold ? 'red' : 'green'}>{val}</Tag>
    )},
    { title: 'المحجوز للطلبات', dataIndex: 'reservedStock', key: 'reservedStock' },
    { title: 'المورد', dataIndex: ['supplier', 'name'], key: 'supplierName' },
    { title: 'آخر توريد', dataIndex: 'lastRestockDate', key: 'lastRestockDate', render: (date) => date ? dayjs(date).format(dateFormat) : '—' },
  ];

  const expirationColumns = [
    { title: 'اسم المكمل', dataIndex: ['product', 'name'], key: 'productName' },
    { title: 'رمز SKU', dataIndex: ['product', 'sku'], key: 'productSku' },
    { title: 'الكمية الحالية', dataIndex: 'currentStock', key: 'currentStock' },
    { title: 'تاريخ الانتهاء', dataIndex: 'nextExpirationBatch', key: 'nextExpirationBatch', render: (date) => (
      <Tag color="volcano">{dayjs(date).format(dateFormat)}</Tag>
    )},
    { title: 'أيام متبقية', key: 'daysLeft', render: (_, record) => {
      const diff = dayjs(record.nextExpirationBatch).diff(dayjs(), 'days');
      return diff <= 0 ? <Tag color="red">منتهي</Tag> : <Text type="danger" strong>{diff} يوم</Text>;
    }},
  ];

  const expenseColumns = [
    { title: 'المصروف', dataIndex: 'name', key: 'name' },
    { title: 'التاريخ', key: 'date', render: (_, record) => dayjs(record.date || record.created).format(dateFormat) },
    { title: 'التصنيف', dataIndex: 'expenseCategory', key: 'expenseCategory', render: (cat) => <Tag color="magenta">{translate(cat) || cat}</Tag> },
    { title: 'الموظف / الكاشير', key: 'user', render: (_, record) => record.user ? `${record.user.name} ${record.user.surname || ''}` : '—' },
    { title: 'المبلغ', dataIndex: 'amount', key: 'amount', render: (val) => moneyFormatter({ amount: val }), align: 'right' },
  ];

  return (
    <div className="reports-container pad20">
      <Row gutter={[24, 24]} className="mb-20">
         <Col span={24}>
            <div className="whiteBox shadow-sm pad20" style={{ background: 'linear-gradient(135deg, #22075e 0%, #1d39c4 100%)', color: '#fff', borderRadius: 8 }}>
               <Title level={2} style={{ color: '#fff', margin: 0 }}>تقارير Body Fuel </Title>
               <Text style={{ color: '#d6e4ff' }}>تحليل تفصيلي لأداء المبيعات، حركة المخزون، الصلاحية، والمصروفات بشكل كامل.</Text>
            </div>
         </Col>
      </Row>

      <Tabs 
        defaultActiveKey="1" 
        className="whiteBox shadow-sm pad20"
        style={{ borderRadius: 8 }}
        items={[
          // 1. SALES REPORT
          {
            key: '1',
            label: (<span><FileDoneOutlined /> تقرير المبيعات</span>),
            children: (
              <>
                {/* Filters */}
                <Card size="small" style={{ marginBottom: 20, backgroundColor: '#fafafa' }}>
                  <Row gutter={[16, 16]} align="middle">
                    <Col xs={24} md={8}>
                      <Space direction="vertical" style={{ width: '100%' }}>
                        <Text strong><FilterOutlined /> الفترة الزمنية:</Text>
                        <RangePicker 
                          value={salesDateRange} 
                          onChange={(dates) => dates && setSalesDateRange(dates)} 
                          allowClear={false} 
                          style={{ width: '100%' }}
                        />
                      </Space>
                    </Col>
                    <Col xs={24} sm={8} md={4}>
                      <Space direction="vertical" style={{ width: '100%' }}>
                        <Text strong>طريقة الدفع:</Text>
                        <Select value={salesPaymentFilter} onChange={setSalesPaymentFilter} style={{ width: '100%' }}>
                          <Select.Option value="all">الكل</Select.Option>
                          <Select.Option value="cash">كاش</Select.Option>
                          <Select.Option value="instapay">InstaPay</Select.Option>
                          <Select.Option value="card">فيزا / كارت</Select.Option>
                        </Select>
                      </Space>
                    </Col>
                    <Col xs={24} sm={8} md={4}>
                      <Space direction="vertical" style={{ width: '100%' }}>
                        <Text strong>نوع الطلب:</Text>
                        <Select value={salesTypeFilter} onChange={setSalesTypeFilter} style={{ width: '100%' }}>
                          <Select.Option value="all">الكل</Select.Option>
                          <Select.Option value="store">شراء مباشر</Select.Option>
                          <Select.Option value="delivery">توصيل للمنزل</Select.Option>
                        </Select>
                      </Space>
                    </Col>
                    <Col xs={24} sm={8} md={4}>
                      <Space direction="vertical" style={{ width: '100%' }}>
                        <Text strong>الكاشير:</Text>
                        <Select value={salesCashierFilter} onChange={setSalesCashierFilter} style={{ width: '100%' }}>
                          <Select.Option value="all">الكل</Select.Option>
                          {cashierList?.map(cashier => (
                            <Select.Option key={cashier._id} value={cashier._id}>{`${cashier.name} ${cashier.surname || ''}`}</Select.Option>
                          ))}
                        </Select>
                      </Space>
                    </Col>
                    <Col xs={24} md={4} style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'flex-end', height: '100%', paddingTop: 20 }}>
                      <Button 
                        type="primary" 
                        icon={<FileExcelOutlined />} 
                        onClick={exportSalesCSV}
                        disabled={filteredSales.length === 0}
                        style={{ backgroundColor: '#2e7d32', borderColor: '#2e7d32' }}
                      >
                        تصدير Excel
                      </Button>
                    </Col>
                  </Row>
                </Card>

                {/* Sales Stats Cards */}
                <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
                  <Col xs={24} sm={12} lg={6}>
                    <Card bordered={true} className="shadow-sm">
                      <Statistic
                        title="إجمالي المبيعات"
                        value={salesStats.totalRevenue}
                        precision={2}
                        prefix={<DollarCircleOutlined style={{ color: '#52c41a' }} />}
                        formatter={(val) => moneyFormatter({ amount: val })}
                      />
                    </Card>
                  </Col>
                  {isAdminOrOwner && (
                    <Col xs={24} sm={12} lg={6}>
                      <Card bordered={true} className="shadow-sm">
                        <Statistic
                          title="صافي ربح المبيعات"
                          value={salesStats.totalProfit}
                          precision={2}
                          prefix={<ArrowUpOutlined style={{ color: '#1890ff' }} />}
                          formatter={(val) => moneyFormatter({ amount: val })}
                        />
                      </Card>
                    </Col>
                  )}
                  <Col xs={24} sm={12} lg={6}>
                    <Card bordered={true} className="shadow-sm">
                      <Statistic
                        title="رسوم التوصيل"
                        value={salesStats.totalDelivery}
                        precision={2}
                        prefix={<ArrowDownOutlined style={{ color: '#722ed1' }} />}
                        formatter={(val) => moneyFormatter({ amount: val })}
                      />
                    </Card>
                  </Col>
                  <Col xs={24} sm={12} lg={6}>
                    <Card bordered={true} className="shadow-sm">
                      <Statistic
                        title="إجمالي الطلبات الفعالة"
                        value={salesStats.count}
                        prefix={<FileDoneOutlined style={{ color: '#fa8c16' }} />}
                      />
                    </Card>
                  </Col>
                </Row>

                <Table 
                   dataSource={filteredSales} 
                   columns={salesColumns} 
                   loading={salesLoading}
                   rowKey="_id"
                   pagination={{ pageSize: 10 }}
                />
              </>
            ),
          },

          // 2. INVENTORY STATUS
          {
            key: '2',
            label: (<span><DatabaseOutlined /> تقرير المخزون</span>),
            children: (
              <>
                {/* Inventory Filters */}
                <Card size="small" style={{ marginBottom: 20, backgroundColor: '#fafafa' }}>
                  <Row gutter={[16, 16]} align="middle">
                    <Col xs={24} sm={12} md={10}>
                      <Space direction="vertical" style={{ width: '100%' }}>
                        <Text strong>البحث باسم المكمل أو رمز SKU:</Text>
                        <Input 
                          placeholder="مثال: Whey Protein..." 
                          value={inventorySearch} 
                          onChange={(e) => setInventorySearch(e.target.value)} 
                          prefix={<SearchOutlined />}
                        />
                      </Space>
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                      <Space direction="vertical" style={{ width: '100%' }}>
                        <Text strong>مستوى المخزون:</Text>
                        <Select value={inventoryStockFilter} onChange={setInventoryStockFilter} style={{ width: '100%' }}>
                          <Select.Option value="all">الكل</Select.Option>
                          <Select.Option value="low">منخفض المخزون فقط</Select.Option>
                          <Select.Option value="normal">مستقر ومتوفر</Select.Option>
                        </Select>
                      </Space>
                    </Col>
                  </Row>
                </Card>

                {/* Inventory Stats */}
                <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
                  <Col xs={24} sm={12} lg={6}>
                    <Card bordered={true} className="shadow-sm">
                      <Statistic
                        title="أصناف المكملات"
                        value={inventoryStats.totalItems}
                        prefix={<DatabaseOutlined style={{ color: '#1890ff' }} />}
                      />
                    </Card>
                  </Col>
                  <Col xs={24} sm={12} lg={6}>
                    <Card bordered={true} className="shadow-sm">
                      <Statistic
                        title="إجمالي القطع المتوفرة"
                        value={inventoryStats.totalQuantity}
                        prefix={<DatabaseOutlined style={{ color: '#52c41a' }} />}
                      />
                    </Card>
                  </Col>
                  <Col xs={24} sm={12} lg={6}>
                    <Card bordered={true} className="shadow-sm">
                      <Statistic
                        title="إجمالي القيمة التقديرية (البيع)"
                        value={inventoryStats.totalRetailValue}
                        formatter={(val) => moneyFormatter({ amount: val })}
                        prefix={<DollarCircleOutlined style={{ color: '#fa8c16' }} />}
                      />
                    </Card>
                  </Col>
                  {isAdminOrOwner && (
                    <Col xs={24} sm={12} lg={6}>
                      <Card bordered={true} className="shadow-sm">
                        <Statistic
                          title="إجمالي القيمة التقديرية (التكلفة)"
                          value={inventoryStats.totalCostValue}
                          formatter={(val) => moneyFormatter({ amount: val })}
                          prefix={<DollarCircleOutlined style={{ color: '#eb2f96' }} />}
                        />
                      </Card>
                    </Col>
                  )}
                </Row>

                <Table 
                   dataSource={filteredInventory} 
                   columns={inventoryColumns} 
                   loading={inventoryLoading}
                   rowKey="_id"
                   pagination={{ pageSize: 10 }}
                />
              </>
            ),
          },

          // 3. EXPIRING PRODUCTS
          {
            key: '3',
            label: (<span><HourglassOutlined /> تقرير الصلاحية</span>),
            children: (
              <>
                <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
                  <Col span={24}>
                    <Card style={{ backgroundColor: '#fffbe6', border: '1px solid #ffe58f' }}>
                      <Statistic
                        title="منتجات أوشكت صلاحيتها على الانتهاء (أقل من 30 يوم)"
                        value={expiringProducts.length}
                        valueStyle={{ color: expiringProducts.length > 0 ? '#d46b08' : '#389e0d' }}
                        prefix={<HourglassOutlined />}
                      />
                    </Card>
                  </Col>
                </Row>

                <Table 
                   dataSource={expiringProducts} 
                   columns={expirationColumns} 
                   loading={inventoryLoading}
                   rowKey="_id"
                   pagination={{ pageSize: 10 }}
                />
              </>
            ),
          },

          // 4. EXPENSES & PAYOUTS REPORT
          {
            key: '4',
            label: (<span><WalletOutlined /> تقرير المصروفات</span>),
            children: (
              <>
                {/* Filters */}
                <Card size="small" style={{ marginBottom: 20, backgroundColor: '#fafafa' }}>
                  <Row gutter={[16, 16]} align="middle">
                    <Col xs={24} md={8}>
                      <Space direction="vertical" style={{ width: '100%' }}>
                        <Text strong><FilterOutlined /> الفترة الزمنية:</Text>
                        <RangePicker 
                          value={expenseDateRange} 
                          onChange={(dates) => dates && setExpenseDateRange(dates)} 
                          allowClear={false} 
                          style={{ width: '100%' }}
                        />
                      </Space>
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                      <Space direction="vertical" style={{ width: '100%' }}>
                        <Text strong>تصنيف المصروف:</Text>
                        <Select value={expenseCategoryFilter} onChange={setExpenseCategoryFilter} style={{ width: '100%' }}>
                          <Select.Option value="all">الكل</Select.Option>
                          <Select.Option value="withdrawal">مسحوبات شخصية</Select.Option>
                          <Select.Option value="salary">رواتب وأجور</Select.Option>
                          <Select.Option value="rent">إيجارات</Select.Option>
                          <Select.Option value="maintenance">صيانة</Select.Option>
                          <Select.Option value="other">مصروفات عامة / أخرى</Select.Option>
                        </Select>
                      </Space>
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                      <Space direction="vertical" style={{ width: '100%' }}>
                        <Text strong>الموظف / الكاشير:</Text>
                        <Select value={expenseCashierFilter} onChange={setExpenseCashierFilter} style={{ width: '100%' }}>
                          <Select.Option value="all">الكل</Select.Option>
                          {cashierList?.map(cashier => (
                            <Select.Option key={cashier._id} value={cashier._id}>{`${cashier.name} ${cashier.surname || ''}`}</Select.Option>
                          ))}
                        </Select>
                      </Space>
                    </Col>
                    <Col xs={24} md={4} style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'flex-end', height: '100%', paddingTop: 20 }}>
                      <Button 
                        type="primary" 
                        icon={<FileExcelOutlined />} 
                        onClick={exportExpenseCSV}
                        disabled={filteredExpenses.length === 0}
                        style={{ backgroundColor: '#2e7d32', borderColor: '#2e7d32' }}
                      >
                        تصدير Excel
                      </Button>
                    </Col>
                  </Row>
                </Card>

                {/* Expense Stats */}
                <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
                  <Col xs={24} sm={12} lg={6}>
                    <Card bordered={true} className="shadow-sm">
                      <Statistic
                        title="إجمالي المصروفات"
                        value={expenseStats.totalExpense}
                        precision={2}
                        prefix={<ArrowUpOutlined style={{ color: '#cf1322' }} />}
                        formatter={(val) => moneyFormatter({ amount: val })}
                      />
                    </Card>
                  </Col>
                  <Col xs={24} sm={12} lg={6}>
                    <Card bordered={true} className="shadow-sm">
                      <Statistic
                        title="مسحوبات شخصية / سلفيات"
                        value={expenseStats.withdrawalTotal}
                        precision={2}
                        prefix={<UserOutlined style={{ color: '#fa8c16' }} />}
                        formatter={(val) => moneyFormatter({ amount: val })}
                      />
                    </Card>
                  </Col>
                  <Col xs={24} sm={12} lg={6}>
                    <Card bordered={true} className="shadow-sm">
                      <Statistic
                        title="رواتب وأجور موظفين"
                        value={expenseStats.salaryTotal}
                        precision={2}
                        prefix={<WalletOutlined style={{ color: '#1890ff' }} />}
                        formatter={(val) => moneyFormatter({ amount: val })}
                      />
                    </Card>
                  </Col>
                  <Col xs={24} sm={12} lg={6}>
                    <Card bordered={true} className="shadow-sm">
                      <Statistic
                        title="مصروفات أخرى"
                        value={expenseStats.otherTotal}
                        precision={2}
                        prefix={<DollarCircleOutlined style={{ color: '#8c8c8c' }} />}
                        formatter={(val) => moneyFormatter({ amount: val })}
                      />
                    </Card>
                  </Col>
                </Row>

                <Table 
                   dataSource={filteredExpenses} 
                   columns={expenseColumns} 
                   loading={expenseLoading}
                   rowKey="_id"
                   pagination={{ pageSize: 10 }}
                />
              </>
            ),
          },
        ]}
      />
    </div>
  );
}
