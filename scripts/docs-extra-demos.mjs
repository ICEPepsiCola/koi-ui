/** @type {Record<string, Array<{ key: string; code: string }>>} */
export const EXTRA_DEMOS = {
  Button: [
    {
      key: 'variants',
      code: `import { Button, Stack } from '@koi-ui/core';
export default () => (
  <Stack gap={2}>
    <Button variant="primary">Primary</Button>
    <Button variant="secondary">Secondary</Button>
    <Button variant="ghost">Ghost</Button>
    <Button variant="destructive">Destructive</Button>
  </Stack>
);`,
    },
    {
      key: 'sizeStatus',
      code: `import { Button, Space } from '@koi-ui/core';
export default () => (
  <Space wrap>
    <Button size="sm">Small</Button>
    <Button size="md">Medium</Button>
    <Button size="lg">Large</Button>
    <Button loading>加载中</Button>
    <Button disabled>禁用</Button>
  </Space>
);`,
    },
  ],
  Icon: [
    {
      key: 'commonIcons',
      code: `import { Icon, Space } from '@koi-ui/core';
export default () => (
  <Space gap={6}>
    <Icon name="home" />
    <Icon name="user" />
    <Icon name="settings" />
    <Icon name="bell" />
  </Space>
);`,
    },
  ],
  Typography: [
    {
      key: 'headingLevels',
      code: `import { Typography } from '@koi-ui/core';
const { Title } = Typography;
export default () => (
  <div>
    <Title level={1}>H1 标题</Title>
    <Title level={3}>H3 标题</Title>
    <Title level={5}>H5 标题</Title>
  </div>
);`,
    },
  ],
  Grid: [
    {
      key: 'offset',
      code: `import { Row, Col } from '@koi-ui/core';
export default () => (
  <Row gutter={16}>
    <Col span={8}><div className="bg-muted p-4 rounded-md">span-8</div></Col>
    <Col span={8} offset={8}><div className="bg-muted p-4 rounded-md">offset-8</div></Col>
  </Row>
);`,
    },
  ],
  Flex: [
    {
      key: 'alignment',
      code: `import { Flex, Tag } from '@koi-ui/core';
export default () => (
  <Flex justify="between" align="center" className="h-20 rounded-md border border-border px-4">
    <Tag>左侧</Tag>
    <Tag color="primary">右侧</Tag>
  </Flex>
);`,
    },
  ],
  Input: [
    {
      key: 'errorState',
      code: `import { Input, Stack } from '@koi-ui/core';
export default () => (
  <Stack gap={3}>
    <Input placeholder="正常" />
    <Input placeholder="出错" error="请输入有效内容" />
    <Input placeholder="禁用" disabled />
  </Stack>
);`,
    },
    {
      key: 'controlledInput',
      code: `import { Input } from '@koi-ui/core';
import { useState } from 'react';
export default () => {
  const [value, setValue] = useState('');
  return <Input value={value} onChange={setValue} placeholder="输入同步" />;
};`,
    },
  ],
  Select: [
    {
      key: 'controlledSelect',
      code: `import { Select, Text } from '@koi-ui/core';
import { useState } from 'react';
export default () => {
  const [city, setCity] = useState('sh');
  return (
    <div>
      <Select
        value={city}
        onChange={setCity}
        placeholder="选择城市"
        options={[
          { label: '北京', value: 'bj' },
          { label: '上海', value: 'sh' },
          { label: '广州', value: 'gz' },
        ]}
      />
      <Text muted className="mt-2 block text-sm">当前：{city}</Text>
    </div>
  );
};`,
    },
  ],
  Form: [
    {
      key: 'horizontalLayout',
      code: `import { Form, FormItem, Input, Button, Space } from '@koi-ui/core';
export default () => (
  <Form layout="horizontal">
    <FormItem label="邮箱"><Input placeholder="name@example.com" /></FormItem>
    <FormItem label="密码"><Input type="password" placeholder="请输入密码" /></FormItem>
    <Space><Button variant="primary">登录</Button><Button variant="secondary">注册</Button></Space>
  </Form>
);`,
    },
  ],
  Checkbox: [
    {
      key: 'controlledCheckbox',
      code: `import { Checkbox, CheckboxGroup, Text } from '@koi-ui/core';
import { useState } from 'react';
export default () => {
  const [values, setValues] = useState(['read']);
  return (
    <div>
      <CheckboxGroup value={values} onChange={setValues}>
        <Checkbox checkboxValue="read" label="阅读" />
        <Checkbox checkboxValue="write" label="写作" />
        <Checkbox checkboxValue="code" label="编程" />
      </CheckboxGroup>
      <Text muted className="mt-2 block text-sm">已选：{values.join(', ') || '无'}</Text>
    </div>
  );
};`,
    },
  ],
  Radio: [
    {
      key: 'controlledRadio',
      code: `import { Radio, RadioGroup, Text } from '@koi-ui/core';
import { useState } from 'react';
export default () => {
  const [value, setValue] = useState('a');
  return (
    <div>
      <RadioGroup value={value} onChange={setValue}>
        <Radio radioValue="a" label="方案 A" />
        <Radio radioValue="b" label="方案 B" />
      </RadioGroup>
      <Text muted className="mt-2 block text-sm">当前：{value}</Text>
    </div>
  );
};`,
    },
  ],
  Modal: [
    {
      key: 'withFooter',
      code: `import { Modal, Button, Space } from '@koi-ui/core';
import { useState } from 'react';
export default () => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>确认操作</Button>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="删除确认"
        footer={
          <Space>
            <Button variant="secondary" onClick={() => setOpen(false)}>取消</Button>
            <Button variant="destructive" onClick={() => setOpen(false)}>删除</Button>
          </Space>
        }
      >
        确定要删除这条记录吗？
      </Modal>
    </>
  );
};`,
    },
  ],
  Drawer: [
    {
      key: 'bottomDrawer',
      code: `import { Drawer, Button } from '@koi-ui/core';
import { useState } from 'react';
export default () => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>底部弹出</Button>
      <Drawer open={open} onClose={() => setOpen(false)} title="筛选" placement="bottom">
        筛选面板内容
      </Drawer>
    </>
  );
};`,
    },
  ],
  Alert: [
    {
      key: 'variants',
      code: `import { Alert, Stack } from '@koi-ui/core';
export default () => (
  <Stack gap={3}>
    <Alert variant="info" title="信息" description="常规提示" />
    <Alert variant="success" title="成功" description="操作已完成" />
    <Alert variant="warning" title="警告" description="请检查输入" />
    <Alert variant="error" title="错误" description="提交失败" />
  </Stack>
);`,
    },
  ],
  Table: [
    {
      key: 'emptyData',
      code: `import { Table } from '@koi-ui/core';
export default () => (
  <Table
    columns={[{ key: 'name', title: '姓名' }, { key: 'role', title: '角色' }]}
    data={[]}
    emptyText="暂无成员"
  />
);`,
    },
  ],
  Tag: [
    {
      key: 'closable',
      code: `import { Tag, Space } from '@koi-ui/core';
import { useState } from 'react';
export default () => {
  const [tags, setTags] = useState(['React', 'TypeScript', 'Tailwind']);
  return (
    <Space wrap>
      {tags.map((tag) => (
        <Tag key={tag} closable onClose={() => setTags(tags.filter((t) => t !== tag))}>{tag}</Tag>
      ))}
    </Space>
  );
};`,
    },
  ],
  Tabs: [
    {
      key: 'controlledTabs',
      code: `import { Tabs, Text } from '@koi-ui/core';
import { useState } from 'react';
export default () => {
  const [key, setKey] = useState('profile');
  return (
    <Tabs
      activeKey={key}
      onChange={setKey}
      items={[
        { key: 'profile', label: '资料', children: <Text>个人资料面板</Text> },
        { key: 'settings', label: '设置', children: <Text>系统设置面板</Text> },
      ]}
    />
  );
};`,
    },
  ],
  Steps: [
    {
      key: 'completed',
      code: `import { Steps } from '@koi-ui/core';
export default () => (
  <Steps
    current={3}
    items={[
      { title: '填写信息', description: '已完成' },
      { title: '确认订单', description: '已完成' },
      { title: '支付', description: '已完成' },
      { title: '完成' },
    ]}
  />
);`,
    },
  ],
  DatePicker: [
    {
      key: 'controlledDate',
      code: `import { DatePicker, Text } from '@koi-ui/core';
import { useState } from 'react';
export default () => {
  const [date, setDate] = useState('2026-07-12');
  return (
    <div>
      <DatePicker value={date} onChange={setDate} placeholder="选择日期" />
      <Text muted className="mt-2 block text-sm">选中：{date || '未选择'}</Text>
    </div>
  );
};`,
    },
  ],
  Upload: [
    {
      key: 'customHint',
      code: `import { Upload } from '@koi-ui/core';
export default () => <Upload accept="image/*" hint="支持 JPG/PNG，单文件不超过 5MB" />;`,
    },
  ],
  ActionSheet: [
    {
      key: 'withDescription',
      code: `import { ActionSheet, Button } from '@koi-ui/core';
import { useState } from 'react';
export default () => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>更多操作</Button>
      <ActionSheet
        open={open}
        onClose={() => setOpen(false)}
        title="分享到"
        description="选择一个平台"
        actions={[
          { key: 'wechat', text: '微信' },
          { key: 'link', text: '复制链接' },
        ]}
      />
    </>
  );
};`,
    },
  ],
  Dropdown: [
    {
      key: 'disabledItems',
      code: `import { Dropdown, Button } from '@koi-ui/core';
export default () => (
  <Dropdown
    trigger={<Button>操作菜单</Button>}
    items={[
      { key: 'edit', label: '编辑' },
      { key: 'copy', label: '复制' },
      { key: 'delete', label: '删除', disabled: true },
    ]}
  />
);`,
    },
  ],
  Card: [
    {
      key: 'withFooterArea',
      code: `import { Card, Button, Text } from '@koi-ui/core';
export default () => (
  <Card
    title="项目概览"
    footer={<Button size="sm" variant="primary">查看详情</Button>}
  >
    <Text>这是一个带底部操作区的卡片示例。</Text>
  </Card>
);`,
    },
  ],
  Descriptions: [
    {
      key: 'multiColumn',
      code: `import { Descriptions } from '@koi-ui/core';
export default () => (
  <Descriptions
    column={2}
    items={[
      { key: 'name', label: '姓名', children: '张三' },
      { key: 'phone', label: '手机', children: '138****0000' },
      { key: 'city', label: '城市', children: '上海' },
      { key: 'role', label: '角色', children: '管理员' },
    ]}
  />
);`,
    },
  ],
  Progress: [
    {
      key: 'styles',
      code: `import { Progress, Stack } from '@koi-ui/core';
export default () => (
  <Stack gap={4}>
    <Progress percent={30} showInfo />
    <Progress percent={70} variant="success" showInfo />
    <Progress percent={100} showInfo />
    <Progress percent={50} variant="destructive" showInfo />
  </Stack>
);`,
    },
  ],
  Result: [
    {
      key: 'errorResult',
      code: `import { Result, Button } from '@koi-ui/core';
export default () => (
  <Result
    status="error"
    title="提交失败"
    subTitle="请检查网络后重试"
    extra={<Button variant="primary">重试</Button>}
  />
);`,
    },
  ],
  NavBar: [
    {
      key: 'withRightAction',
      code: `import { NavBar, Button } from '@koi-ui/core';
export default () => (
  <NavBar
    title="详情页"
    onBack={() => {}}
    right={<Button size="sm" variant="ghost">分享</Button>}
  />
);`,
    },
  ],
  SearchBar: [
    {
      key: 'controlledSearch',
      code: `import { SearchBar, Text } from '@koi-ui/core';
import { useState } from 'react';
export default () => {
  const [keyword, setKeyword] = useState('');
  return (
    <div>
      <SearchBar value={keyword} onChange={setKeyword} placeholder="搜索商品" />
      <Text muted className="mt-2 block text-sm">关键词：{keyword || '无'}</Text>
    </div>
  );
};`,
    },
  ],
  Swiper: [
    {
      key: 'withArrows',
      code: `import { Swiper } from '@koi-ui/core';
export default () => (
  <Swiper showArrows>
    <div className="h-32 bg-muted flex items-center justify-center text-lg font-medium">Slide 1</div>
    <div className="h-32 bg-primary/10 flex items-center justify-center text-lg font-medium">Slide 2</div>
    <div className="h-32 bg-muted/80 flex items-center justify-center text-lg font-medium">Slide 3</div>
    <div className="h-32 bg-primary/20 flex items-center justify-center text-lg font-medium">Slide 4</div>
  </Swiper>
);`,
    },
  ],
};
