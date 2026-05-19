import { useState, useEffect } from 'react';
import { Table, Button, Space, Modal, Form, Input, Select, Switch, Popconfirm, Tag, Card, Row, Col } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, UserOutlined, KeyOutlined } from '@ant-design/icons';
import { request } from '@/request';
import { useSelector } from 'react-redux';
import { selectCurrentAdmin } from '@/redux/auth/selectors';
import useLanguage from '@/locale/useLanguage';

export default function UserManagement() {
  const translate = useLanguage();
  const currentAdmin = useSelector(selectCurrentAdmin);

  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [form] = Form.useForm();

  const fetchUsers = async () => {
    setIsLoading(true);
    const response = await request.list({ entity: 'admin' });
    if (response && response.success) {
      setUsers(response.result || []);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleOpenAddModal = () => {
    setEditingUser(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (user) => {
    setEditingUser(user);
    form.setFieldsValue({
      name: user.name,
      surname: user.surname || '',
      email: user.email,
      role: user.role,
      enabled: user.enabled,
      salary: user.salary,
      password: '', // Reset password field
    });
    setIsModalOpen(true);
  };

  const handleDeleteUser = async (id) => {
    setIsLoading(true);
    const response = await request.delete({ entity: 'admin', id });
    if (response && response.success) {
      fetchUsers();
    } else {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (values) => {
    setIsLoading(true);
    let response;
    if (editingUser) {
      // Update
      response = await request.update({
        entity: 'admin',
        id: editingUser._id,
        jsonData: {
          name: values.name,
          surname: values.surname,
          email: values.email,
          role: values.role,
          enabled: values.enabled,
          password: values.password,
          salary: values.salary,
        },
      });
    } else {
      // Create
      response = await request.create({
        entity: 'admin',
        jsonData: {
          name: values.name,
          surname: values.surname,
          email: values.email,
          role: values.role,
          password: values.password,
          salary: values.salary,
        },
      });
    }

    if (response && response.success) {
      setIsModalOpen(false);
      form.resetFields();
      fetchUsers();
    } else {
      setIsLoading(false);
    }
  };

  const columns = [
    {
      title: 'الاسم',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <span style={{ fontWeight: 600 }}>
          {record.name} {record.surname || ''}
        </span>
      ),
    },
    {
      title: 'البريد الإلكتروني',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'الدور والجروب',
      dataIndex: 'role',
      key: 'role',
      render: (role) => {
        let color = 'blue';
        let text = role;
        if (role === 'owner') {
          color = 'volcano';
          text = 'المالك الأساسي';
        } else if (role === 'admin') {
          color = 'green';
          text = 'مدير (Admin)';
        } else if (role === 'cashier') {
          color = 'orange';
          text = 'كاشير (Cashier)';
        }
        return <Tag color={color}>{text}</Tag>;
      },
    },
    {
      title: 'الراتب المحدد',
      dataIndex: 'salary',
      key: 'salary',
      render: (salary, record) => {
        if (record.role !== 'cashier') return '-';
        return <span style={{ fontWeight: '500' }}>{salary ? `${salary} ج.م` : '0 ج.م'}</span>;
      },
    },
    {
      title: 'إجمالي المسحوبات',
      dataIndex: 'totalWithdrawals',
      key: 'totalWithdrawals',
      render: (totalWithdrawals, record) => {
        if (record.role !== 'cashier') return '-';
        return (
          <span style={{ color: totalWithdrawals > 0 ? '#ff4d4f' : '#8c8c8c', fontWeight: '500' }}>
            {totalWithdrawals ? `${totalWithdrawals} ج.م` : '0 ج.م'}
          </span>
        );
      },
    },
    {
      title: 'الراتب المتبقي',
      dataIndex: 'remainingSalary',
      key: 'remainingSalary',
      render: (remainingSalary, record) => {
        if (record.role !== 'cashier') return '-';
        return (
          <span style={{ color: remainingSalary > 0 ? '#52c41a' : '#faad14', fontWeight: 'bold' }}>
            {remainingSalary !== undefined ? `${remainingSalary} ج.م` : `${record.salary || 0} ج.م`}
          </span>
        );
      },
    },
    {
      title: 'الحالة',
      dataIndex: 'enabled',
      key: 'enabled',
      render: (enabled) => (
        <Tag color={enabled ? 'success' : 'error'}>
          {enabled ? 'نشط' : 'معطل'}
        </Tag>
      ),
    },
    {
      title: 'الخيارات',
      key: 'actions',
      render: (_, record) => {
        const isSelf = currentAdmin?._id === record._id;
        const isOwner = record.role === 'owner';
        return (
          <Space size="middle">
            <Button
              type="text"
              icon={<EditOutlined style={{ color: '#1890ff' }} />}
              onClick={() => handleOpenEditModal(record)}
            >
              تعديل
            </Button>
            {!isSelf && !isOwner && (
              <Popconfirm
                title="هل أنت متأكد من حذف هذا الحساب نهائياً؟"
                okText="نعم، احذف"
                cancelText="إلغاء"
                onConfirm={() => handleDeleteUser(record._id)}
              >
                <Button type="text" danger icon={<DeleteOutlined />}>
                  حذف
                </Button>
              </Popconfirm>
            )}
          </Space>
        );
      },
    },
  ];

  return (
    <Card
      title={
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
          <span style={{ fontSize: '18px', fontWeight: 'bold' }}>إدارة حسابات الكاشير والموظفين</span>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleOpenAddModal}
            style={{ borderRadius: '6px' }}
          >
            إضافة حساب جديد
          </Button>
        </div>
      }
      style={{
        borderRadius: '12px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
        background: '#fff',
      }}
    >
      <Table
        columns={columns}
        dataSource={users}
        rowKey="_id"
        loading={isLoading}
        pagination={{ pageSize: 10 }}
        style={{ direction: 'rtl' }}
      />

      <Modal
        title={
          <div style={{ paddingBottom: '10px', borderBottom: '1px solid #f0f0f0' }}>
            <span style={{ fontSize: '16px', fontWeight: 'bold' }}>
              {editingUser ? 'تعديل الحساب' : 'إضافة حساب جديد'}
            </span>
          </div>
        }
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        destroyOnClose
        width={500}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{ enabled: true, role: 'cashier' }}
          style={{ marginTop: '20px', direction: 'rtl' }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="name"
                label="الاسم الأول"
                rules={[{ required: true, message: 'يرجى إدخال الاسم الأول' }]}
              >
                <Input prefix={<UserOutlined />} placeholder="الاسم" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="surname" label="الاسم الأخير">
                <Input placeholder="اللقب" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="email"
            label="البريد الإلكتروني"
            normalize={(value) => (value ? value.trim() : value)}
            rules={[
              { required: true, message: 'يرجى إدخال البريد الإلكتروني' },
              { type: 'email', message: 'يرجى إدخال بريد إلكتروني صالح' },
            ]}
          >
            <Input placeholder="example@domain.com" />
          </Form.Item>

          <Form.Item
            name="password"
            label="كلمة المرور"
            rules={[
              {
                required: !editingUser,
                message: 'يرجى إدخال كلمة المرور',
              },
              {
                min: 6,
                message: 'يجب أن لا تقل كلمة المرور عن 6 أحرف',
              },
            ]}
          >
            <Input.Password
              prefix={<KeyOutlined />}
              placeholder={editingUser ? 'اتركها فارغة لعدم التغيير' : 'كلمة المرور (6 أحرف على الأقل)'}
            />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="role" label="الدور والصلاحية" rules={[{ required: true }]}>
                <Select>
                  <Select.Option value="cashier">كاشير (صلاحيات محدودة)</Select.Option>
                  <Select.Option value="admin">مدير كامل الصلاحية (Admin)</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            {editingUser && (
              <Col span={12}>
                <Form.Item name="enabled" label="حالة الحساب" valuePropName="checked">
                  <Switch checkedChildren="نشط" unCheckedChildren="معطل" />
                </Form.Item>
              </Col>
            )}
          </Row>

          <Form.Item noStyle shouldUpdate={(prevValues, currentValues) => prevValues.role !== currentValues.role}>
            {({ getFieldValue }) =>
              getFieldValue('role') === 'cashier' ? (
                <Form.Item
                  name="salary"
                  label="الراتب المحدد"
                  rules={[{ required: true, message: 'يرجى إدخال قيمة الراتب المحدد' }]}
                >
                  <Input type="number" min={0} placeholder="قيمة الراتب المحدد بالكامِل" addonAfter="ج.م" />
                </Form.Item>
              ) : null
            }
          </Form.Item>

          <Form.Item style={{ marginTop: '24px', marginBottom: 0, textAlign: 'left' }}>
            <Space>
              <Button onClick={() => setIsModalOpen(false)}>إلغاء</Button>
              <Button type="primary" htmlType="submit" loading={isLoading}>
                {editingUser ? 'حفظ التغييرات' : 'إنشاء الحساب'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
}
