import { useCallback, useEffect } from 'react';
import {
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  EllipsisOutlined,
  RedoOutlined,
  ArrowLeftOutlined,
} from '@ant-design/icons';
import { Dropdown, Table, Button, Input } from 'antd';
import { PageHeader } from '@ant-design/pro-layout';

import { useSelector, useDispatch } from 'react-redux';
import { crud } from '@/redux/crud/actions';
import { selectListItems } from '@/redux/crud/selectors';
import useLanguage from '@/locale/useLanguage';
import { dataForTable } from '@/utils/dataStructure';
import { useMoney, useDate } from '@/settings';
import { generate as uniqueId } from 'shortid';

import {
  useModalContext,
  usePanelContext,
  useSidePanelContext,
} from '@/context/crud';

// ==========================
// Safe formatter (🔥 FIX)
// ==========================
const formatValue = (value) => {
  if (value === null || value === undefined) return '—';

  if (Array.isArray(value)) {
    return value.join(', ');
  }

  if (typeof value === 'object') {
    return value?.name || value?.title || '—';
  }

  return value;
};

// ─────────────────────────────────────────────

function AddNewItem({ config }) {
  const { actions } = usePanelContext();
  const { ADD_NEW_ENTITY } = config;

  const handleClick = () => {
    actions.panel.open();
    actions.collapsedBox.close();
  };

  return (
    <Button onClick={handleClick} type="primary">
      {ADD_NEW_ENTITY}
    </Button>
  );
}

// ─────────────────────────────────────────────

export default function DataTable({ config, extra = [] }) {
  let {
    entity,
    dataTableColumns,
    DATATABLE_TITLE,
    fields,
    searchConfig,
  } = config;

  const translate = useLanguage();
  const { moneyFormatter } = useMoney();
  const { dateFormat } = useDate();
  const dispatch = useDispatch();

  const { actions: panelActions } = usePanelContext();
  const { actions: modalActions } = useModalContext();
  const { actions: sidePanelActions } = useSidePanelContext();

  // ==========================
  // Row Actions
  // ==========================
  const handleRead = (record) => {
    dispatch(crud.currentItem({ data: record }));
    panelActions.panel.open();
    panelActions.collapsedBox.open();
    sidePanelActions.readBox.open();
  };

  const handleEdit = (record) => {
    dispatch(crud.currentItem({ data: record }));
    dispatch(crud.currentAction({ actionType: 'update', data: record }));
    sidePanelActions.editBox.open();
    panelActions.panel.open();
    panelActions.collapsedBox.open();
  };

  const handleDelete = (record) => {
    dispatch(crud.currentAction({ actionType: 'delete', data: record }));
    modalActions.open();
  };

  const handleUpdatePassword = (record) => {
    dispatch(crud.currentItem({ data: record }));
    dispatch(crud.currentAction({ actionType: 'update', data: record }));
    sidePanelActions.advancedBox.open();
    panelActions.panel.open();
    panelActions.collapsedBox.open();
  };

  // ==========================
  // Redux Auth
  // ==========================
  const currentAdmin = useSelector((state) => state.auth.current);

  // ==========================
  // Menu
  // ==========================
  let menuItems = [
    { label: translate('Show'), key: 'read', icon: <EyeOutlined /> },
    { label: translate('Edit'), key: 'edit', icon: <EditOutlined /> },
    ...extra,
    { type: 'divider' },
    { label: translate('Delete'), key: 'delete', icon: <DeleteOutlined /> },
  ];

  if (currentAdmin?.role === 'cashier') {
    menuItems = menuItems.filter((item) => item.key !== 'delete' && item.type !== 'divider');
  }

  const handleMenuClick = (record, { key }) => {
    switch (key) {
      case 'read':
        return handleRead(record);
      case 'edit':
        return handleEdit(record);
      case 'delete':
        return handleDelete(record);
      case 'updatePassword':
        return handleUpdatePassword(record);
      default:
        if (config.onExtraClick) {
          config.onExtraClick(key, record);
        }
        return null;
    }
  };

  // ==========================
  // FIX: Columns handling
  // ==========================
  let dispatchColumns = fields
    ? dataForTable({
      fields,
      translate,
      moneyFormatter,
      dateFormat,
    }).map((col) => ({
      ...col,

      // 🔥 SAFE RENDER FOR OBJECTS
      render: (value, record) => {
        if (col.render) return col.render(value, record);
        return formatValue(value);
      },
    }))
    : [...dataTableColumns];

  // Check if an action column already exists to avoid duplicates
  const hasActionColumn = dispatchColumns.some(col => col.key === 'action');

  if (!hasActionColumn) {
    dataTableColumns = [
      ...dispatchColumns,
      {
        title: '',
        key: 'action',
        fixed: 'right',
        render: (_, record) => (
          <Dropdown
            menu={{
              items: menuItems,
              onClick: (info) => handleMenuClick(record, info),
            }}
            trigger={['click']}
          >
            <EllipsisOutlined
              style={{ cursor: 'pointer', fontSize: '24px' }}
              onClick={(e) => e.preventDefault()}
            />
          </Dropdown>
        ),
      },
    ];
  } else {
    dataTableColumns = [...dispatchColumns];
  }

  // ==========================
  // Redux
  // ==========================
  const { result: listResult, isLoading: listIsLoading } =
    useSelector(selectListItems);

  const { pagination, items: dataSource } = listResult;

  const handleTableChange = useCallback(
    (pagination) => {
      dispatch(
        crud.list({
          entity,
          options: {
            page: pagination.current || 1,
            items: pagination.pageSize || 10,
          },
        })
      );
    },
    [entity]
  );

  const filterTable = (e) => {
    dispatch(
      crud.list({
        entity,
        options: {
          q: e.target.value,
          fields: searchConfig?.searchFields || '',
        },
      })
    );
  };

  const refresh = () => dispatch(crud.list({ entity }));

  useEffect(() => {
    refresh();
  }, []);

  // ==========================
  // UI
  // ==========================
  return (
    <>
      <PageHeader
        onBack={() => window.history.back()}
        backIcon={<ArrowLeftOutlined />}
        title={DATATABLE_TITLE}
        ghost={false}
        extra={[
          <Input
            key="search"
            onChange={filterTable}
            placeholder={translate('search')}
            allowClear
            style={{ width: '100%', maxWidth: '200px' }}
          />,
          <Button
            key="refresh"
            onClick={refresh}
            icon={<RedoOutlined />}
          >
            {translate('Refresh')}
          </Button>,
          config?.addButton,
          <AddNewItem key="add" config={config} />,
        ]}
      />

      <Table
        columns={dataTableColumns}
        rowKey={(item) => item._id}
        dataSource={dataSource}
        pagination={pagination}
        loading={listIsLoading}
        onChange={handleTableChange}
        scroll={{ x: 'max-content' }}
      />
    </>
  );
}