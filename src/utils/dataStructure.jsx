import dayjs from 'dayjs';
import { Switch, Tag } from 'antd';
import { CloseOutlined, CheckOutlined } from '@ant-design/icons';
import { countryList } from '@/utils/countryList';
import { generate as uniqueId } from 'shortid';
import color from '@/utils/color';
import { safeValue } from '@/utils/dataSafety';

// ===============================
// READ MODE (unchanged logic)
// ===============================
export const dataForRead = ({ fields, translate }) => {
  let columns = [];

  Object.keys(fields).forEach((key) => {
    let field = fields[key];
    columns.push({
      title: field.label ? field.label : key,
      dataIndex: field.dataIndex ? field.dataIndex.join('.') : key,
      isDate: field.type === 'date',
    });
  });

  return columns;
};

// ===============================
// TABLE MODE (FIXED)
// ===============================
export function dataForTable({ fields, translate, moneyFormatter, dateFormat }) {
  let columns = [];

  Object.keys(fields).forEach((key) => {
    let field = fields[key];
    const keyIndex = field.dataIndex ? field.dataIndex : [key];

    const component = {
      boolean: {
        title: field.label ? translate(field.label) : translate(key),
        dataIndex: keyIndex,
        onCell: () => ({
          props: {
            style: { width: '60px' },
          },
        }),
        render: (_, record) => (
          <Switch
            checked={!!record[key]}
            checkedChildren={<CheckOutlined />}
            unCheckedChildren={<CloseOutlined />}
          />
        ),
      },

      date: {
        title: field.label ? translate(field.label) : translate(key),
        dataIndex: keyIndex,
        render: (_, record) => {
          const date = record[key]
            ? dayjs(record[key]).format(dateFormat)
            : '—';

          return (
            <Tag bordered={false} color={field.color}>
              {date}
            </Tag>
          );
        },
      },

      currency: {
        title: field.label ? translate(field.label) : translate(key),
        dataIndex: keyIndex,
        onCell: () => ({
          style: {
            textAlign: 'right',
            whiteSpace: 'nowrap',
          },
        }),
        render: (_, record) =>
          moneyFormatter({
            amount: record[key],
            currency_code: record.currency,
          }),
      },

      async: {
        title: field.label ? translate(field.label) : translate(key),
        dataIndex: keyIndex,
        render: (text, record) => (
          <Tag
            bordered={false}
            color={field.color || record[key]?.color || record.color}
          >
            {safeValue(text)}
          </Tag>
        ),
      },

      color: {
        title: field.label ? translate(field.label) : translate(key),
        dataIndex: keyIndex,
        render: (text) => (
          <Tag bordered={false} color={text}>
            {color.find((x) => x.value === text)?.label}
          </Tag>
        ),
      },

      stringWithColor: {
        title: field.label ? translate(field.label) : translate(key),
        dataIndex: keyIndex,
        render: (text, record) => (
          <Tag bordered={false} color={record.color || field.color}>
            {safeValue(text)}
          </Tag>
        ),
      },

      tag: {
        title: field.label ? translate(field.label) : translate(key),
        dataIndex: keyIndex,
        render: (_, record) => (
          <Tag bordered={false} color={field.color}>
            {safeValue(record[key])}
          </Tag>
        ),
      },

      selectWithFeedback: {
        title: field.label ? translate(field.label) : translate(key),
        dataIndex: keyIndex,
        render: (_, record) => {
          const selectedOption = field.options?.find(
            (x) => x.value === record[key]
          );

          if (field.renderAsTag) {
            return (
              <Tag bordered={false} color={selectedOption?.color}>
                {safeValue(record[key])}
              </Tag>
            );
          }

          return safeValue(record[key]);
        },
      },

      select: {
        title: field.label ? translate(field.label) : translate(key),
        dataIndex: keyIndex,
        render: (_, record) => {
          const selectedOption = field.options?.find(
            (x) => x.value === record[key]
          );

          if (field.renderAsTag) {
            return (
              <Tag bordered={false} color={selectedOption?.color}>
                {safeValue(record[key])}
              </Tag>
            );
          }

          return safeValue(record[key]);
        },
      },

      selectWithTranslation: {
        title: field.label ? translate(field.label) : translate(key),
        dataIndex: keyIndex,
        render: (_, record) => {
          const selectedOption = field.options?.find(
            (x) => x.value === record[key]
          );

          if (field.renderAsTag) {
            return (
              <Tag bordered={false} color={selectedOption?.color}>
                {safeValue(record[key])}
              </Tag>
            );
          }

          return safeValue(record[key]);
        },
      },

      array: {
        title: field.label ? translate(field.label) : translate(key),
        dataIndex: keyIndex,
        render: (_, record) => {
          return (record[key] || []).map((x) => (
            <Tag
              bordered={false}
              key={`${uniqueId()}`}
              color={field.colors?.[x]}
            >
              {safeValue(x)}
            </Tag>
          ));
        },
      },

      country: {
        title: field.label ? translate(field.label) : translate(key),
        dataIndex: keyIndex,
        render: (_, record) => {
          const selectedCountry = countryList.find(
            (obj) => obj.value === record[key]
          );

          return (
            <Tag bordered={false} color={field.color || undefined}>
              {selectedCountry?.icon && selectedCountry.icon + ' '}
              {selectedCountry?.label &&
                safeValue(translate(selectedCountry.label))}
            </Tag>
          );
        },
      },
    };

    const defaultComponent = {
      title: field.label ? translate(field.label) : translate(key),
      dataIndex: keyIndex,
      render: (value) => safeValue(value),
    };

    const type = field.type;

    if (!field.disableForTable) {
      Object.keys(component).includes(type)
        ? columns.push(component[type])
        : columns.push(defaultComponent);
    }
  });

  return columns;
}

// ===============================
// helper (unused but kept)
// ===============================
function getRandomColor() {
  const colors = [
    'magenta',
    'red',
    'volcano',
    'orange',
    'gold',
    'lime',
    'green',
    'cyan',
    'blue',
    'geekblue',
    'purple',
  ];

  return colors[Math.floor(Math.random() * colors.length)];
}