/** Demo snippets per component. First entry is usually `basic`. */
export const DEMOS = {
  "Button": [
    {
      "key": "basic",
      "code": "import { Button, Space } from '@koi-ui/core';\nexport default () => (\n  <Space>\n    <Button variant=\"primary\">主要</Button>\n    <Button variant=\"secondary\">次要</Button>\n  </Space>\n);"
    },
    {
      "key": "variants",
      "code": "import { Button, Stack } from '@koi-ui/core';\nexport default () => (\n  <Stack gap={2}>\n    <Button variant=\"primary\">Primary</Button>\n    <Button variant=\"secondary\">Secondary</Button>\n    <Button variant=\"ghost\">Ghost</Button>\n    <Button variant=\"destructive\">Destructive</Button>\n  </Stack>\n);"
    },
    {
      "key": "sizeStatus",
      "code": "import { Button, Space } from '@koi-ui/core';\nexport default () => (\n  <Space wrap>\n    <Button size=\"sm\">Small</Button>\n    <Button size=\"md\">Medium</Button>\n    <Button size=\"lg\">Large</Button>\n    <Button loading>加载中</Button>\n    <Button disabled>禁用</Button>\n  </Space>\n);"
    }
  ],
  "Icon": [
    {
      "key": "basic",
      "code": "import { Icon, Space } from '@koi-ui/core';\nexport default () => (\n  <Space gap={4}>\n    <Icon name=\"search\" />\n    <Icon name=\"check\" />\n    <Icon name=\"close\" />\n  </Space>\n);"
    },
    {
      "key": "commonIcons",
      "code": "import { Icon, Space } from '@koi-ui/core';\nexport default () => (\n  <Space gap={6}>\n    <Icon name=\"home\" />\n    <Icon name=\"user\" />\n    <Icon name=\"settings\" />\n    <Icon name=\"bell\" />\n  </Space>\n);"
    }
  ],
  "Typography": [
    {
      "key": "basic",
      "code": "import { Typography } from '@koi-ui/core';\nconst { Title, Text, Paragraph } = Typography;\nexport default () => (\n  <div>\n    <Title level={3}>标题</Title>\n    <Paragraph>段落文字</Paragraph>\n    <Text muted>辅助文字</Text>\n  </div>\n);"
    },
    {
      "key": "headingLevels",
      "code": "import { Typography } from '@koi-ui/core';\nconst { Title } = Typography;\nexport default () => (\n  <div>\n    <Title level={1}>H1 标题</Title>\n    <Title level={3}>H3 标题</Title>\n    <Title level={5}>H5 标题</Title>\n  </div>\n);"
    }
  ],
  "Divider": [
    {
      "key": "basic",
      "code": "import { Divider } from '@koi-ui/core';\nexport default () => <Divider>分割文字</Divider>;"
    }
  ],
  "Grid": [
    {
      "key": "basic",
      "code": "import { Row, Col } from '@koi-ui/core';\nexport default () => (\n  <Row gutter={16}>\n    <Col span={12}><div className=\"bg-muted p-4 rounded-md\">col-12</div></Col>\n    <Col span={12}><div className=\"bg-muted p-4 rounded-md\">col-12</div></Col>\n  </Row>\n);"
    },
    {
      "key": "offset",
      "code": "import { Row, Col } from '@koi-ui/core';\nexport default () => (\n  <Row gutter={16}>\n    <Col span={8}><div className=\"bg-muted p-4 rounded-md\">span-8</div></Col>\n    <Col span={8} offset={8}><div className=\"bg-muted p-4 rounded-md\">offset-8</div></Col>\n  </Row>\n);"
    }
  ],
  "Layout": [
    {
      "key": "basic",
      "code": "import { Layout } from '@koi-ui/core';\nconst { Header, Content, Footer } = Layout;\nexport default () => (\n  <Layout className=\"border border-border rounded-md overflow-hidden\">\n    <Header className=\"bg-muted px-4 py-2\">Header</Header>\n    <Content className=\"px-4 py-6\">Content</Content>\n    <Footer className=\"bg-muted px-4 py-2 text-center text-sm\">Footer</Footer>\n  </Layout>\n);"
    }
  ],
  "Space": [
    {
      "key": "basic",
      "code": "import { Space, Button } from '@koi-ui/core';\nexport default () => (\n  <Space>\n    <Button>按钮1</Button>\n    <Button>按钮2</Button>\n    <Button>按钮3</Button>\n  </Space>\n);"
    }
  ],
  "Flex": [
    {
      "key": "basic",
      "code": "import { Flex, Button } from '@koi-ui/core';\nexport default () => (\n  <Flex justify=\"between\" align=\"center\" className=\"p-4 border border-border rounded-md\">\n    <span>左侧</span>\n    <Button size=\"sm\">操作</Button>\n  </Flex>\n);"
    },
    {
      "key": "alignment",
      "code": "import { Flex, Tag } from '@koi-ui/core';\nexport default () => (\n  <Flex justify=\"between\" align=\"center\" className=\"h-20 rounded-md border border-border px-4\">\n    <Tag>左侧</Tag>\n    <Tag color=\"primary\">右侧</Tag>\n  </Flex>\n);"
    }
  ],
  "Stack": [
    {
      "key": "basic",
      "code": "import { Stack, Text } from '@koi-ui/core';\nexport default () => (\n  <Stack gap={2}>\n    <Text weight=\"bold\">标题</Text>\n    <Text muted>描述</Text>\n  </Stack>\n);"
    }
  ],
  "Box": [
    {
      "key": "basic",
      "code": "import { Box, Text } from '@koi-ui/core';\nexport default () => <Box p={6} border rounded=\"md\"><Text>容器</Text></Box>;"
    }
  ],
  "SafeArea": [
    {
      "key": "basic",
      "code": "import { SafeArea, Text } from '@koi-ui/core';\nexport default () => (\n  <div className=\"koi-safe-area-demo flex h-full min-h-[28rem] flex-col overflow-hidden bg-primary/25\" style={{ ['--koi-safe-area-top']: '48px', ['--koi-safe-area-bottom']: '34px' }}>\n    <SafeArea className=\"flex h-full min-h-0 flex-col bg-muted\">\n      <div className=\"flex flex-1 flex-col items-center justify-center gap-2 px-4 text-center\">\n        <Text className=\"font-medium\">安全区域内容</Text>\n        <Text muted size=\"sm\">上下彩色留白为安全区</Text>\n      </div>\n    </SafeArea>\n  </div>\n);"
    }
  ],
  "Affix": [
    {
      "key": "basic",
      "code": "import { Affix, Button } from '@koi-ui/core';\nexport default () => (\n  <div className=\"space-y-3 pb-8 text-sm text-muted-foreground\">\n    <p className=\"font-medium text-surface-foreground\">向下滚动查看固钉效果</p>\n    <Affix offsetTop={0}><Button>固定在顶部</Button></Affix>\n    {Array.from({ length: 40 }, (_, i) => (<p key={i}>内容行 {i + 1}</p>))}\n  </div>\n);"
    }
  ],
  "Breadcrumb": [
    {
      "key": "basic",
      "code": "import { Breadcrumb } from '@koi-ui/core';\nexport default () => <Breadcrumb items={[{ title: '首页' }, { title: '列表' }, { title: '详情' }]} />;"
    }
  ],
  "Dropdown": [
    {
      "key": "basic",
      "code": "import { Dropdown, Button } from '@koi-ui/core';\nexport default () => (\n  <Dropdown trigger={<Button>下拉菜单</Button>} items={[{ key: '1', label: '选项一' }, { key: '2', label: '选项二' }]} />\n);"
    },
    {
      "key": "disabledItems",
      "code": "import { Dropdown, Button } from '@koi-ui/core';\nexport default () => (\n  <Dropdown\n    trigger={<Button>操作菜单</Button>}\n    items={[\n      { key: 'edit', label: '编辑' },\n      { key: 'copy', label: '复制' },\n      { key: 'delete', label: '删除', disabled: true },\n    ]}\n  />\n);"
    }
  ],
  "Menu": [
    {
      "key": "basic",
      "code": "import { Menu } from '@koi-ui/core';\nexport default () => <Menu items={[{ key: '1', label: '导航一' }, { key: '2', label: '导航二' }]} defaultSelectedKey=\"1\" />;"
    }
  ],
  "Pagination": [
    {
      "key": "basic",
      "code": "import { Pagination } from '@koi-ui/core';\nimport { useState } from 'react';\nexport default () => { const [p,setP]=useState(1); return <Pagination current={p} total={50} onChange={setP} />; };"
    }
  ],
  "Steps": [
    {
      "key": "basic",
      "code": "import { Steps } from '@koi-ui/core';\nexport default () => <Steps current={1} items={[{ title: '完成' }, { title: '进行中' }, { title: '待进行' }]} />;"
    },
    {
      "key": "completed",
      "code": "import { Steps } from '@koi-ui/core';\nexport default () => (\n  <Steps\n    current={3}\n    items={[\n      { title: '填写信息', description: '已完成' },\n      { title: '确认订单', description: '已完成' },\n      { title: '支付', description: '已完成' },\n      { title: '完成' },\n    ]}\n  />\n);"
    }
  ],
  "Tabs": [
    {
      "key": "basic",
      "code": "import { Tabs, Text } from '@koi-ui/core';\nexport default () => <Tabs items={[{ key:'1', label:'Tab1', children:<Text>内容1</Text> }, { key:'2', label:'Tab2', children:<Text>内容2</Text> }]} />;"
    },
    {
      "key": "controlledTabs",
      "code": "import { Tabs, Text } from '@koi-ui/core';\nimport { useState } from 'react';\nexport default () => {\n  const [key, setKey] = useState('profile');\n  return (\n    <Tabs\n      activeKey={key}\n      onChange={setKey}\n      items={[\n        { key: 'profile', label: '资料', children: <Text>个人资料面板</Text> },\n        { key: 'settings', label: '设置', children: <Text>系统设置面板</Text> },\n      ]}\n    />\n  );\n};"
    }
  ],
  "NavBar": [
    {
      "key": "basic",
      "code": "import { NavBar } from '@koi-ui/core';\nexport default () => <NavBar title=\"页面标题\" onBack={() => {}} />;"
    },
    {
      "key": "withRightAction",
      "code": "import { NavBar, Button } from '@koi-ui/core';\nexport default () => (\n  <NavBar\n    title=\"详情页\"\n    onBack={() => {}}\n    right={<Button size=\"sm\" variant=\"ghost\">分享</Button>}\n  />\n);"
    }
  ],
  "TabBar": [
    {
      "key": "basic",
      "code": "import { TabBar } from '@koi-ui/core';\nimport { useState } from 'react';\nexport default () => { const [k,setK]=useState('home'); return <TabBar activeKey={k} onChange={setK} items={[{ key:'home', label:'首页' }, { key:'mine', label:'我的' }]} />; };"
    }
  ],
  "IndexBar": [
    {
      "key": "basic",
      "code": "import { IndexBar } from '@koi-ui/core';\nconst groups = [{ index:'A', items:['Apple','Ant','Avocado'] }, { index:'B', items:['Banana','Blueberry'] }, { index:'C', items:['Cherry','Coconut'] }, { index:'D', items:['Date','Dragonfruit'] }];\nexport default () => (\n  <div className=\"koi-indexbar-demo flex h-[20rem] min-h-0 overflow-hidden rounded-md border border-border\">\n    <IndexBar className=\"min-h-0 min-w-0 flex-1\" groups={groups} renderItem={(item) => <span>{item}</span>} />\n  </div>\n);"
    }
  ],
  "AutoComplete": [
    {
      "key": "basic",
      "code": "import { AutoComplete } from '@koi-ui/core';\nexport default () => <AutoComplete options={[{ value:'apple', label:'Apple' }, { value:'banana', label:'Banana' }]} placeholder=\"搜索\" />;"
    }
  ],
  "Checkbox": [
    {
      "key": "basic",
      "code": "import { Checkbox, CheckboxGroup } from '@koi-ui/core';\nexport default () => <CheckboxGroup defaultValue={['a']}><Checkbox checkboxValue=\"a\" label=\"选项A\" /><Checkbox checkboxValue=\"b\" label=\"选项B\" /></CheckboxGroup>;"
    },
    {
      "key": "controlledCheckbox",
      "code": "import { Checkbox, CheckboxGroup, Text } from '@koi-ui/core';\nimport { useState } from 'react';\nexport default () => {\n  const [values, setValues] = useState(['read']);\n  return (\n    <div>\n      <CheckboxGroup value={values} onChange={setValues}>\n        <Checkbox checkboxValue=\"read\" label=\"阅读\" />\n        <Checkbox checkboxValue=\"write\" label=\"写作\" />\n        <Checkbox checkboxValue=\"code\" label=\"编程\" />\n      </CheckboxGroup>\n      <Text muted className=\"mt-2 block text-sm\">已选：{values.join(', ') || '无'}</Text>\n    </div>\n  );\n};"
    }
  ],
  "DatePicker": [
    {
      "key": "basic",
      "code": "import { DatePicker } from '@koi-ui/core';\nimport { useState } from 'react';\nexport default () => { const [v,setV]=useState(''); return <DatePicker value={v} onChange={setV} placeholder=\"选择日期\" />; };"
    },
    {
      "key": "controlledDate",
      "code": "import { DatePicker, Text } from '@koi-ui/core';\nimport { useState } from 'react';\nexport default () => {\n  const [date, setDate] = useState('2026-07-12');\n  return (\n    <div>\n      <DatePicker value={date} onChange={setDate} placeholder=\"选择日期\" />\n      <Text muted className=\"mt-2 block text-sm\">选中：{date || '未选择'}</Text>\n    </div>\n  );\n};"
    }
  ],
  "Form": [
    {
      "key": "basic",
      "code": "import { Form, FormItem, Input, Button } from '@koi-ui/core';\nexport default () => (\n  <Form layout=\"vertical\"><FormItem label=\"用户名\"><Input placeholder=\"请输入\" /></FormItem><Button variant=\"primary\">提交</Button></Form>\n);"
    },
    {
      "key": "horizontalLayout",
      "code": "import { Form, FormItem, Input, Button, Space } from '@koi-ui/core';\nexport default () => (\n  <Form layout=\"horizontal\">\n    <FormItem label=\"邮箱\"><Input placeholder=\"name@example.com\" /></FormItem>\n    <FormItem label=\"密码\"><Input type=\"password\" placeholder=\"请输入密码\" /></FormItem>\n    <Space><Button variant=\"primary\">登录</Button><Button variant=\"secondary\">注册</Button></Space>\n  </Form>\n);"
    }
  ],
  "Input": [
    {
      "key": "basic",
      "code": "import { Input } from '@koi-ui/core';\nexport default () => <Input placeholder=\"请输入\" />;"
    },
    {
      "key": "errorState",
      "code": "import { Input, Stack } from '@koi-ui/core';\nexport default () => (\n  <Stack gap={3}>\n    <Input placeholder=\"正常\" />\n    <Input placeholder=\"出错\" error=\"请输入有效内容\" />\n    <Input placeholder=\"禁用\" disabled />\n  </Stack>\n);"
    },
    {
      "key": "controlledInput",
      "code": "import { Input } from '@koi-ui/core';\nimport { useState } from 'react';\nexport default () => {\n  const [value, setValue] = useState('');\n  return <Input value={value} onChange={setValue} placeholder=\"输入同步\" />;\n};"
    }
  ],
  "InputNumber": [
    {
      "key": "basic",
      "code": "import { InputNumber } from '@koi-ui/core';\nimport { useState } from 'react';\nexport default () => { const [v,setV]=useState(1); return <InputNumber value={v} onChange={setV} />; };"
    }
  ],
  "Radio": [
    {
      "key": "basic",
      "code": "import { Radio, RadioGroup } from '@koi-ui/core';\nexport default () => <RadioGroup defaultValue=\"a\"><Radio radioValue=\"a\" label=\"选项A\" /><Radio radioValue=\"b\" label=\"选项B\" /></RadioGroup>;"
    },
    {
      "key": "controlledRadio",
      "code": "import { Radio, RadioGroup, Text } from '@koi-ui/core';\nimport { useState } from 'react';\nexport default () => {\n  const [value, setValue] = useState('a');\n  return (\n    <div>\n      <RadioGroup value={value} onChange={setValue}>\n        <Radio radioValue=\"a\" label=\"方案 A\" />\n        <Radio radioValue=\"b\" label=\"方案 B\" />\n      </RadioGroup>\n      <Text muted className=\"mt-2 block text-sm\">当前：{value}</Text>\n    </div>\n  );\n};"
    }
  ],
  "Rate": [
    {
      "key": "basic",
      "code": "import { Rate } from '@koi-ui/core';\nimport { useState } from 'react';\nexport default () => { const [v,setV]=useState(3); return <Rate value={v} onChange={setV} />; };"
    }
  ],
  "Select": [
    {
      "key": "basic",
      "code": "import { Select } from '@koi-ui/core';\nimport { useState } from 'react';\nexport default () => { const [v,setV]=useState(''); return <Select options={[{label:'北京',value:'bj'},{label:'上海',value:'sh'}]} value={v} onChange={setV} placeholder=\"选择城市\" />; };"
    },
    {
      "key": "controlledSelect",
      "code": "import { Select, Text } from '@koi-ui/core';\nimport { useState } from 'react';\nexport default () => {\n  const [city, setCity] = useState('sh');\n  return (\n    <div>\n      <Select\n        value={city}\n        onChange={setCity}\n        placeholder=\"选择城市\"\n        options={[\n          { label: '北京', value: 'bj' },\n          { label: '上海', value: 'sh' },\n          { label: '广州', value: 'gz' },\n        ]}\n      />\n      <Text muted className=\"mt-2 block text-sm\">当前：{city}</Text>\n    </div>\n  );\n};"
    }
  ],
  "Slider": [
    {
      "key": "basic",
      "code": "import { Slider } from '@koi-ui/core';\nimport { useState } from 'react';\nexport default () => { const [v,setV]=useState(30); return <Slider value={v} onChange={setV} />; };"
    }
  ],
  "Switch": [
    {
      "key": "basic",
      "code": "import { Switch } from '@koi-ui/core';\nimport { useState } from 'react';\nexport default () => { const [v,setV]=useState(true); return <Switch checked={v} onChange={setV} />; };"
    }
  ],
  "TextArea": [
    {
      "key": "basic",
      "code": "import { TextArea } from '@koi-ui/core';\nexport default () => <TextArea placeholder=\"请输入多行文本\" rows={3} />;"
    }
  ],
  "TimePicker": [
    {
      "key": "basic",
      "code": "import { TimePicker } from '@koi-ui/core';\nimport { useState } from 'react';\nexport default () => { const [v,setV]=useState(''); return <TimePicker value={v} onChange={setV} placeholder=\"选择时间\" />; };"
    }
  ],
  "Upload": [
    {
      "key": "basic",
      "code": "import { Upload } from '@koi-ui/core';\nexport default () => <Upload accept=\"image/*\" />;"
    },
    {
      "key": "customHint",
      "code": "import { Upload } from '@koi-ui/core';\nexport default () => <Upload accept=\"image/*\" hint=\"支持 JPG/PNG，单文件不超过 5MB\" />;"
    }
  ],
  "Cascader": [
    {
      "key": "basic",
      "code": "import { Cascader } from '@koi-ui/core';\nexport default () => <Cascader options={[{label:'浙江',value:'zj',children:[{label:'杭州',value:'hz'}]}]} placeholder=\"选择地区\" />;"
    }
  ],
  "Picker": [
    {
      "key": "basic",
      "code": "import { Picker } from '@koi-ui/core';\nexport default () => (\n  <Picker\n    placeholder=\"选择\"\n    columns={[\n      { options: [{ label: '周一', value: '1' }, { label: '周二', value: '2' }, { label: '周三', value: '3' }] },\n      { options: [{ label: '上午', value: 'am' }, { label: '下午', value: 'pm' }] },\n    ]}\n  />\n);"
    }
  ],
  "SearchBar": [
    {
      "key": "basic",
      "code": "import { SearchBar } from '@koi-ui/core';\nexport default () => <SearchBar placeholder=\"搜索\" />;"
    },
    {
      "key": "controlledSearch",
      "code": "import { SearchBar, Text } from '@koi-ui/core';\nimport { useState } from 'react';\nexport default () => {\n  const [keyword, setKeyword] = useState('');\n  return (\n    <div>\n      <SearchBar value={keyword} onChange={setKeyword} placeholder=\"搜索商品\" />\n      <Text muted className=\"mt-2 block text-sm\">关键词：{keyword || '无'}</Text>\n    </div>\n  );\n};"
    }
  ],
  "Stepper": [
    {
      "key": "basic",
      "code": "import { Stepper } from '@koi-ui/core';\nimport { useState } from 'react';\nexport default () => { const [v,setV]=useState(1); return <Stepper value={v} onChange={setV} />; };"
    }
  ],
  "Avatar": [
    {
      "key": "basic",
      "code": "import { Avatar } from '@koi-ui/core';\nexport default () => <Avatar fallback=\"张\" />;"
    }
  ],
  "Badge": [
    {
      "key": "basic",
      "code": "import { Badge, Button } from '@koi-ui/core';\nexport default () => <Badge count={5}><Button>消息</Button></Badge>;"
    }
  ],
  "Calendar": [
    {
      "key": "basic",
      "code": "import { Calendar } from '@koi-ui/core';\nexport default () => <Calendar />;"
    }
  ],
  "Card": [
    {
      "key": "basic",
      "code": "import { Card, Text } from '@koi-ui/core';\nexport default () => <Card title=\"卡片标题\"><Text>卡片内容</Text></Card>;"
    },
    {
      "key": "withFooterArea",
      "code": "import { Card, Button, Text } from '@koi-ui/core';\nexport default () => (\n  <Card\n    title=\"项目概览\"\n    footer={<Button size=\"sm\" variant=\"primary\">查看详情</Button>}\n  >\n    <Text>这是一个带底部操作区的卡片示例。</Text>\n  </Card>\n);"
    }
  ],
  "Collapse": [
    {
      "key": "basic",
      "code": "import { Collapse } from '@koi-ui/core';\nexport default () => <Collapse items={[{ key:'1', label:'面板1', children:'内容1' }, { key:'2', label:'面板2', children:'内容2' }]} />;"
    }
  ],
  "Descriptions": [
    {
      "key": "basic",
      "code": "import { Descriptions } from '@koi-ui/core';\nexport default () => <Descriptions items={[{ key:'name', label:'姓名', children:'张三' }, { key:'phone', label:'手机', children:'138****0000' }]} />;"
    },
    {
      "key": "multiColumn",
      "code": "import { Descriptions } from '@koi-ui/core';\nexport default () => (\n  <Descriptions\n    column={2}\n    items={[\n      { key: 'name', label: '姓名', children: '张三' },\n      { key: 'phone', label: '手机', children: '138****0000' },\n      { key: 'city', label: '城市', children: '上海' },\n      { key: 'role', label: '角色', children: '管理员' },\n    ]}\n  />\n);"
    }
  ],
  "Empty": [
    {
      "key": "basic",
      "code": "import { Empty } from '@koi-ui/core';\nexport default () => <Empty description=\"暂无数据\" />;"
    }
  ],
  "Image": [
    {
      "key": "basic",
      "code": "import { Image } from '@koi-ui/core';\nexport default () => <Image src=\"https://picsum.photos/200/120\" alt=\"demo\" width={200} height={120} />;"
    }
  ],
  "List": [
    {
      "key": "basic",
      "code": "import { List } from '@koi-ui/core';\nexport default () => <List items={[{ key:'1', title:'标题一', description:'描述一' }, { key:'2', title:'标题二', description:'描述二' }]} />;"
    }
  ],
  "Popover": [
    {
      "key": "basic",
      "code": "import { Popover, Button } from '@koi-ui/core';\nexport default () => <Popover content=\"气泡内容\"><Button>悬停查看</Button></Popover>;"
    }
  ],
  "Segmented": [
    {
      "key": "basic",
      "code": "import { Segmented } from '@koi-ui/core';\nimport { useState } from 'react';\nexport default () => { const [v,setV]=useState('a'); return <Segmented value={v} onChange={setV} options={[{label:'列表',value:'a'},{label:'卡片',value:'b'}]} />; };"
    }
  ],
  "Statistic": [
    {
      "key": "basic",
      "code": "import { Statistic } from '@koi-ui/core';\nexport default () => <Statistic title=\"活跃用户\" value={112893} />;"
    }
  ],
  "Table": [
    {
      "key": "basic",
      "code": "import { Table } from '@koi-ui/core';\nexport default () => <Table columns={[{key:'name',title:'姓名'},{key:'age',title:'年龄'}]} data={[{name:'张三',age:'20'},{name:'李四',age:'25'}]} />;"
    },
    {
      "key": "emptyData",
      "code": "import { Table } from '@koi-ui/core';\nexport default () => (\n  <Table\n    columns={[{ key: 'name', title: '姓名' }, { key: 'role', title: '角色' }]}\n    data={[]}\n    emptyText=\"暂无成员\"\n  />\n);"
    }
  ],
  "Tag": [
    {
      "key": "basic",
      "code": "import { Tag, Space } from '@koi-ui/core';\nexport default () => <Space><Tag>默认</Tag><Tag variant=\"success\">成功</Tag><Tag variant=\"destructive\">危险</Tag></Space>;"
    },
    {
      "key": "closable",
      "code": "import { Tag, Space } from '@koi-ui/core';\nimport { useState } from 'react';\nexport default () => {\n  const [tags, setTags] = useState(['React', 'TypeScript', 'Tailwind']);\n  return (\n    <Space wrap>\n      {tags.map((tag) => (\n        <Tag key={tag} closable onClose={() => setTags(tags.filter((t) => t !== tag))}>{tag}</Tag>\n      ))}\n    </Space>\n  );\n};"
    }
  ],
  "Timeline": [
    {
      "key": "basic",
      "code": "import { Timeline } from '@koi-ui/core';\nexport default () => <Timeline items={[{ key:'1', children:'创建项目' }, { key:'2', children:'上线发布' }, { key:'3', children:'持续迭代' }]} />;"
    }
  ],
  "Tooltip": [
    {
      "key": "basic",
      "code": "import { Tooltip, Button } from '@koi-ui/core';\nexport default () => <Tooltip content=\"提示文字\"><Button>悬停</Button></Tooltip>;"
    }
  ],
  "Tree": [
    {
      "key": "basic",
      "code": "import { Tree } from '@koi-ui/core';\nexport default () => <Tree data={[{ key:'1', title:'父节点', children:[{ key:'1-1', title:'子节点' }] }]} />;"
    }
  ],
  "NoticeBar": [
    {
      "key": "basic",
      "code": "import { NoticeBar } from '@koi-ui/core';\nexport default () => <NoticeBar content=\"这是一条滚动通告信息\" />;"
    }
  ],
  "Swiper": [
    {
      "key": "basic",
      "code": "import { Swiper } from '@koi-ui/core';\nexport default () => (\n  <Swiper>\n    <div className=\"h-32 bg-muted flex items-center justify-center text-lg font-medium\">Slide 1</div>\n    <div className=\"h-32 bg-primary/10 flex items-center justify-center text-lg font-medium\">Slide 2</div>\n    <div className=\"h-32 bg-muted/80 flex items-center justify-center text-lg font-medium\">Slide 3</div>\n    <div className=\"h-32 bg-primary/20 flex items-center justify-center text-lg font-medium\">Slide 4</div>\n  </Swiper>\n);"
    },
    {
      "key": "withArrows",
      "code": "import { Swiper } from '@koi-ui/core';\nexport default () => (\n  <Swiper showArrows>\n    <div className=\"h-32 bg-muted flex items-center justify-center text-lg font-medium\">Slide 1</div>\n    <div className=\"h-32 bg-primary/10 flex items-center justify-center text-lg font-medium\">Slide 2</div>\n    <div className=\"h-32 bg-muted/80 flex items-center justify-center text-lg font-medium\">Slide 3</div>\n    <div className=\"h-32 bg-primary/20 flex items-center justify-center text-lg font-medium\">Slide 4</div>\n  </Swiper>\n);"
    }
  ],
  "Ellipsis": [
    {
      "key": "basic",
      "code": "import { Ellipsis } from '@koi-ui/core';\nexport default () => <Ellipsis content=\"这是一段很长的文字，用来演示文本省略效果：当内容宽度超过容器时，超出部分会被省略显示，并在末尾展示省略号，方便在列表、卡片等有限空间里保留可读性。\" rows={1} />;"
    }
  ],
  "Alert": [
    {
      "key": "basic",
      "code": "import { Alert } from '@koi-ui/core';\nexport default () => <Alert variant=\"info\" title=\"提示\" description=\"这是一条提示信息\" />;"
    },
    {
      "key": "variants",
      "code": "import { Alert, Stack } from '@koi-ui/core';\nexport default () => (\n  <Stack gap={3}>\n    <Alert variant=\"info\" title=\"信息\" description=\"常规提示\" />\n    <Alert variant=\"success\" title=\"成功\" description=\"操作已完成\" />\n    <Alert variant=\"warning\" title=\"警告\" description=\"请检查输入\" />\n    <Alert variant=\"error\" title=\"错误\" description=\"提交失败\" />\n  </Stack>\n);"
    }
  ],
  "Drawer": [
    {
      "key": "basic",
      "code": "import { Drawer, Button } from '@koi-ui/core';\nimport { useState } from 'react';\nexport default () => { const [o,setO]=useState(false); return <><Button onClick={()=>setO(true)}>打开抽屉</Button><Drawer open={o} onClose={()=>setO(false)} title=\"抽屉标题\">内容</Drawer></>; };"
    },
    {
      "key": "bottomDrawer",
      "code": "import { Drawer, Button } from '@koi-ui/core';\nimport { useState } from 'react';\nexport default () => {\n  const [open, setOpen] = useState(false);\n  return (\n    <>\n      <Button onClick={() => setOpen(true)}>底部弹出</Button>\n      <Drawer open={open} onClose={() => setOpen(false)} title=\"筛选\" placement=\"bottom\">\n        筛选面板内容\n      </Drawer>\n    </>\n  );\n};"
    }
  ],
  "Modal": [
    {
      "key": "basic",
      "code": "import { Modal, Button } from '@koi-ui/core';\nimport { useState } from 'react';\nexport default () => { const [o,setO]=useState(false); return <><Button onClick={()=>setO(true)}>打开弹窗</Button><Modal open={o} onClose={()=>setO(false)} title=\"标题\">内容</Modal></>; };"
    },
    {
      "key": "withFooter",
      "code": "import { Modal, Button, Space } from '@koi-ui/core';\nimport { useState } from 'react';\nexport default () => {\n  const [open, setOpen] = useState(false);\n  return (\n    <>\n      <Button onClick={() => setOpen(true)}>确认操作</Button>\n      <Modal\n        open={open}\n        onClose={() => setOpen(false)}\n        title=\"删除确认\"\n        footer={\n          <Space>\n            <Button variant=\"secondary\" onClick={() => setOpen(false)}>取消</Button>\n            <Button variant=\"destructive\" onClick={() => setOpen(false)}>删除</Button>\n          </Space>\n        }\n      >\n        确定要删除这条记录吗？\n      </Modal>\n    </>\n  );\n};"
    }
  ],
  "Notification": [
    {
      "key": "basic",
      "code": "import { Notification } from '@koi-ui/core';\nexport default () => <Notification title=\"通知\" description=\"这是一条通知\" />;"
    }
  ],
  "Popconfirm": [
    {
      "key": "basic",
      "code": "import { Popconfirm, Button } from '@koi-ui/core';\nexport default () => <Popconfirm title=\"确定删除吗？\" onConfirm={() => {}}><Button variant=\"destructive\">删除</Button></Popconfirm>;"
    }
  ],
  "Progress": [
    {
      "key": "basic",
      "code": "import { Progress } from '@koi-ui/core';\nexport default () => <Progress percent={60} />;"
    },
    {
      "key": "styles",
      "code": "import { Progress, Stack } from '@koi-ui/core';\nexport default () => (\n  <Stack gap={4}>\n    <Progress percent={30} showInfo />\n    <Progress percent={70} variant=\"success\" showInfo />\n    <Progress percent={100} showInfo />\n    <Progress percent={50} variant=\"destructive\" showInfo />\n  </Stack>\n);"
    }
  ],
  "Result": [
    {
      "key": "basic",
      "code": "import { Result, Button } from '@koi-ui/core';\nexport default () => <Result status=\"success\" title=\"提交成功\" extra={<Button>返回</Button>} />;"
    },
    {
      "key": "errorResult",
      "code": "import { Result, Button } from '@koi-ui/core';\nexport default () => (\n  <Result\n    status=\"error\"\n    title=\"提交失败\"\n    subTitle=\"请检查网络后重试\"\n    extra={<Button variant=\"primary\">重试</Button>}\n  />\n);"
    }
  ],
  "Skeleton": [
    {
      "key": "basic",
      "code": "import { Skeleton } from '@koi-ui/core';\nexport default () => <Skeleton active paragraph={{ rows: 3 }} />;"
    }
  ],
  "Spin": [
    {
      "key": "basic",
      "code": "import { Spin } from '@koi-ui/core';\nexport default () => <Spin tip=\"加载中...\" />;"
    }
  ],
  "Toast": [
    {
      "key": "basic",
      "code": "import { Button, toast } from '@koi-ui/core';\nexport default () => <Button onClick={() => toast.success('操作成功')}>显示提示</Button>;"
    }
  ],
  "Popup": [
    {
      "key": "basic",
      "code": "import { Popup, Button } from '@koi-ui/core';\nimport { useState } from 'react';\nexport default () => { const [o,setO]=useState(false); return <><Button onClick={()=>setO(true)}>弹出</Button><Popup open={o} onClose={()=>setO(false)}>弹出内容</Popup></>; };"
    }
  ],
  "ActionSheet": [
    {
      "key": "basic",
      "code": "import { ActionSheet, Button } from '@koi-ui/core';\nimport { useState } from 'react';\nexport default () => { const [o,setO]=useState(false); return <><Button onClick={()=>setO(true)}>打开</Button><ActionSheet open={o} onClose={()=>setO(false)} actions={[{ key:'1', text:'选项一' }, { key:'2', text:'选项二' }]} /></>; };"
    },
    {
      "key": "withDescription",
      "code": "import { ActionSheet, Button } from '@koi-ui/core';\nimport { useState } from 'react';\nexport default () => {\n  const [open, setOpen] = useState(false);\n  return (\n    <>\n      <Button onClick={() => setOpen(true)}>更多操作</Button>\n      <ActionSheet\n        open={open}\n        onClose={() => setOpen(false)}\n        title=\"分享到\"\n        description=\"选择一个平台\"\n        actions={[\n          { key: 'wechat', text: '微信' },\n          { key: 'link', text: '复制链接' },\n        ]}\n      />\n    </>\n  );\n};"
    }
  ],
  "Loading": [
    {
      "key": "basic",
      "code": "import { Loading, Button } from '@koi-ui/core';\nimport { useState } from 'react';\nexport default () => { const [o,setO]=useState(false); return <><Button onClick={()=>setO(true)}>加载</Button><Loading open={o} /></>; };"
    }
  ],
  "Mask": [
    {
      "key": "basic",
      "code": "import { Mask, Button } from '@koi-ui/core';\nimport { useState } from 'react';\nexport default () => { const [o,setO]=useState(false); return <><Button onClick={()=>setO(true)}>显示蒙层</Button><Mask open={o} onClick={()=>setO(false)} /></>; };"
    }
  ],
  "Watermark": [
    {
      "key": "basic",
      "code": "import { Watermark } from '@koi-ui/core';\nexport default () => <Watermark content=\"Koi UI\"><div className=\"h-32 flex items-center justify-center border border-border rounded-md\">水印区域</div></Watermark>;"
    }
  ],
  "BackTop": [
    {
      "key": "basic",
      "code": "import { BackTop } from '@koi-ui/core';\nexport default () => <div className=\"h-40 overflow-auto relative\"><div className=\"h-96 p-4\">滚动区域</div><BackTop /></div>;"
    }
  ],
  "FloatButton": [
    {
      "key": "basic",
      "code": "import { FloatButton, Icon } from '@koi-ui/core';\nexport default () => <FloatButton icon={<Icon name=\"plus\" />} />;"
    }
  ],
  "PullToRefresh": [
    {
      "key": "basic",
      "code": "import { PullToRefresh, List } from '@koi-ui/core';\nexport default () => <PullToRefresh onRefresh={async()=>{}}><List items={[{key:'1',title:'项目1'},{key:'2',title:'项目2'}]} /></PullToRefresh>;"
    }
  ],
  "Footer": [
    {
      "key": "basic",
      "code": "import { Footer } from '@koi-ui/core';\nexport default () => <Footer>© 2026 Koi UI</Footer>;"
    }
  ],
  "FloatingPanel": [
    {
      "key": "basic",
      "code": "import { FloatingPanel } from '@koi-ui/core';\nexport default () => <FloatingPanel title=\"面板\"><div className=\"p-4\">可拖拽面板内容</div></FloatingPanel>;"
    }
  ],
  "InfiniteScroll": [
    {
      "key": "basic",
      "code": "import { InfiniteScroll, List } from '@koi-ui/core';\nexport default () => <InfiniteScroll hasMore={false} loadMore={async()=>{}}><List items={[{key:'1',title:'项目1'},{key:'2',title:'项目2'}]} /></InfiniteScroll>;"
    }
  ]
};
