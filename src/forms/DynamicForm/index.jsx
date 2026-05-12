import { useState } from 'react';
import { DatePicker, Input, Form, Select, Switch, Tag } from 'antd';
import { CloseOutlined, CheckOutlined } from '@ant-design/icons';
import useLanguage from '@/locale/useLanguage';
import { useMoney, useDate } from '@/settings';
import AutoCompleteAsync from '@/components/AutoCompleteAsync';
import SelectAsync from '@/components/SelectAsync';
import { generate as uniqueId } from 'shortid';
import { countryList } from '@/utils/countryList';

export default function DynamicForm({ fields, isUpdateForm = false }) {
  const [feedback, setFeedback] = useState();

  return (
    <div>
      {Object.keys(fields).map((key) => {
        let field = fields[key];

        if ((isUpdateForm && !field.disableForUpdate) || !field.disableForForm) {
          field.name = key;
          if (!field.label) field.label = key;
          if (field.hasFeedback)
            return (
              <FormElement feedback={feedback} setFeedback={setFeedback} key={key} field={field} />
            );
          else if (feedback && field.feedback) {
            if (feedback == field.feedback) return <FormElement key={key} field={field} />;
          } else {
            return <FormElement key={key} field={field} />;
          }
        }
      })}
    </div>
  );
}

function FormElement({ field, feedback, setFeedback }) {
  const translate = useLanguage();
  const money = useMoney();
  const { dateFormat } = useDate();
  const { TextArea } = Input;

  const SelectComponent = () => (
    <Form.Item
      label={translate(field.label)}
      name={field.name}
      rules={[
        {
          required: field.required || false,
        },
      ]}
    >
      <Select
        showSearch={field.showSearch}
        defaultValue={field.defaultValue}
        style={{ width: '100%' }}
      >
        {field.options?.map((option) => (
          <Select.Option key={`${uniqueId()}`} value={option.value}>
            {option.label}
          </Select.Option>
        ))}
      </Select>
    </Form.Item>
  );

  const SelectWithTranslationComponent = () => (
    <Form.Item
      label={translate(field.label)}
      name={field.name}
      rules={[
        {
          required: field.required || false,
        },
      ]}
    >
      <Select
        defaultValue={field.defaultValue}
        style={{ width: '100%' }}
      >
        {field.options?.map((option) => (
          <Select.Option key={`${uniqueId()}`} value={option.value}>
            <Tag bordered={false} color={option.color}>
              {translate(option.label)}
            </Tag>
          </Select.Option>
        ))}
      </Select>
    </Form.Item>
  );

  const SelectWithFeedbackComponent = ({ feedbackValue, lanchFeedback }) => (
    <Form.Item
      label={translate(field.label)}
      name={field.name}
      rules={[
        {
          required: field.required || false,
        },
      ]}
    >
      <Select
        onSelect={(value) => lanchFeedback(value)}
        value={feedbackValue}
        style={{ width: '100%' }}
      >
        {field.options?.map((option) => (
          <Select.Option key={`${uniqueId()}`} value={option.value}>
            {translate(option.label)}
          </Select.Option>
        ))}
      </Select>
    </Form.Item>
  );

  const ColorComponent = () => (
    <Form.Item
      label={translate(field.label)}
      name={field.name}
      rules={[
        {
          required: field.required || false,
        },
      ]}
    >
      <Select
        showSearch
        defaultValue={field.defaultValue}
        filterOption={(input, option) =>
          (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
        }
        filterSort={(optionA, optionB) =>
          (optionA?.label ?? '').toLowerCase().startsWith((optionB?.label ?? '').toLowerCase())
        }
        style={{ width: '100%' }}
      >
        {field.options?.map((option) => (
          <Select.Option key={`${uniqueId()}`} value={option.value} label={option.label}>
            <Tag bordered={false} color={option.color}>
              {option.label}
            </Tag>
          </Select.Option>
        ))}
      </Select>
    </Form.Item>
  );

  const TagComponent = () => (
    <Form.Item
      label={translate(field.label)}
      name={field.name}
      rules={[
        {
          required: field.required || false,
        },
      ]}
    >
      <Select
        defaultValue={field.defaultValue}
        style={{ width: '100%' }}
      >
        {field.options?.map((option) => (
          <Select.Option key={`${uniqueId()}`} value={option.value}>
            <Tag bordered={false} color={option.color}>
              {translate(option.label)}
            </Tag>
          </Select.Option>
        ))}
      </Select>
    </Form.Item>
  );

  const ArrayComponent = () => (
    <Form.Item
      label={translate(field.label)}
      name={field.name}
      rules={[
        {
          required: field.required || false,
        },
      ]}
    >
      <Select
        mode={'multiple'}
        defaultValue={field.defaultValue}
        style={{ width: '100%' }}
      >
        {field.options?.map((option) => (
          <Select.Option key={`${uniqueId()}`} value={option.value}>
            {option.label}
          </Select.Option>
        ))}
      </Select>
    </Form.Item>
  );

  const CountryComponent = () => (
    <Form.Item
      label={translate(field.label)}
      name={field.name}
      rules={[
        {
          required: field.required || false,
        },
      ]}
    >
      <Select
        showSearch
        defaultValue={field.defaultValue}
        optionFilterProp="children"
        filterOption={(input, option) =>
          (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
        }
        filterSort={(optionA, optionB) =>
          (optionA?.label ?? '').toLowerCase().startsWith((optionB?.label ?? '').toLowerCase())
        }
        style={{ width: '100%' }}
      >
        {countryList.map((language) => (
          <Select.Option
            key={language.value}
            value={language.value}
            label={translate(language.label)}
          >
            {language?.icon && language?.icon + ' '}
            {translate(language.label)}
          </Select.Option>
        ))}
      </Select>
    </Form.Item>
  );

  const SearchComponent = () => (
    <Form.Item
      label={translate(field.label)}
      name={field.name}
      rules={[
        {
          required: field.required || false,
        },
      ]}
    >
      <AutoCompleteAsync
        entity={field.entity}
        displayLabels={field.displayLabels}
        searchFields={field.searchFields}
        outputValue={field.outputValue}
        withRedirect={field.withRedirect}
        urlToRedirect={field.urlToRedirect}
        redirectLabel={field.redirectLabel}
      />
    </Form.Item>
  );

  const formItemComponent = {
    select: <SelectComponent />,
    selectWithTranslation: <SelectWithTranslationComponent />,
    selectWithFeedback: (
      <SelectWithFeedbackComponent lanchFeedback={setFeedback} feedbackValue={feedback} />
    ),
    color: <ColorComponent />,
    tag: <TagComponent />,
    array: <ArrayComponent />,
    country: <CountryComponent />,
    search: <SearchComponent />,
  };

  const compunedComponent = {
    string: (
      <Input autoComplete="off" maxLength={field.maxLength} defaultValue={field.defaultValue} />
    ),
    url: <Input addonBefore="http://" autoComplete="off" placeholder="www.example.com" />,
    textarea: <TextArea rows={4} />,
    email: <Input autoComplete="off" placeholder="email@example.com" />,
    number: <Input inputMode="decimal" placeholder="0" autoComplete="off" />,
    phone: <Input style={{ width: '100%' }} placeholder="+1 123 456 789" />,
    boolean: (
      <Switch
        checkedChildren={<CheckOutlined />}
        unCheckedChildren={<CloseOutlined />}
        defaultValue={true}
      />
    ),
    date: (
      <DatePicker
        placeholder={translate('select_date')}
        style={{ width: '100%' }}
        format={dateFormat}
      />
    ),
    async: (
      <SelectAsync
        entity={field.entity}
        displayLabels={field.displayLabels}
        outputValue={field.outputValue}
        loadDefault={field.loadDefault}
        withRedirect={field.withRedirect}
        urlToRedirect={field.urlToRedirect}
        redirectLabel={field.redirectLabel}
      />
    ),
    currency: (
      <Input
        inputMode="decimal"
        placeholder="0.00"
        autoComplete="off"
        addonAfter={money.currency_position === 'after' ? money.currency_symbol : undefined}
        addonBefore={money.currency_position === 'before' ? money.currency_symbol : undefined}
      />
    ),
  };

  const customFormItem = formItemComponent[field.type];
  let renderComponent = compunedComponent[field.type];

  if (!renderComponent) {
    renderComponent = compunedComponent['string'];
  }

  if (customFormItem) return <>{customFormItem}</>;
  else {
    return (
      <Form.Item
        label={translate(field.label)}
        name={field.name}
        rules={[
          {
            required: field.required || false,
          },
        ]}
        valuePropName={field.type === 'boolean' ? 'checked' : 'value'}
      >
        {renderComponent}
      </Form.Item>
    );
  }
}
