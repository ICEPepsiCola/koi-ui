import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { EXTRA_DEMOS } from './docs-extra-demos.mjs';
import { hasCjk, localizeDemoCode, toEnglishDemoText } from './demo-locale.mjs';
import { LANGS, loadI18nTree, t, writeFile, ensureDir } from './lib/i18n.mjs';

const require = createRequire(import.meta.url);
const { withCustomConfig } = require('react-docgen-typescript');

const ROOT = path.resolve(import.meta.dirname, '..');
const I18N_DIR = path.join(ROOT, 'i18n');
const DOCS_DIR = path.join(ROOT, 'docs');
const CORE_TSCONFIG = path.join(ROOT, 'packages/core/tsconfig.json');

const flat = loadI18nTree(I18N_DIR);

const PRIMITIVE_COMPONENTS = new Set(['Box', 'Stack']);

function resolveSourcePath(name) {
  if (PRIMITIVE_COMPONENTS.has(name)) {
    return `./packages/core/src/primitives/${name}.tsx`;
  }
  return `./packages/core/src/components/${name}/${name}.tsx`;
}

const parser = withCustomConfig(CORE_TSCONFIG, {
  shouldExtractLiteralValuesFromEnum: true,
  propFilter: (prop) => {
    if (prop.declarations?.length) {
      return prop.declarations.some(
        (declaration) => !declaration.fileName.includes('node_modules'),
      );
    }
    return true;
  },
});

function escapeCell(value) {
  return String(value ?? '')
    .replace(/\|/g, '\\|')
    .replace(/\n/g, ' ');
}

/** Soft-wrap long TS unions in API tables without changing readable text. */
function softBreakType(typeName) {
  return escapeCell(String(typeName ?? '').replace(/([|&,])/g, '$1\u200B'));
}

/** @type {Map<string, ReturnType<typeof parser.parse> | null>} */
const apiCache = new Map();

function parseComponentDocs(componentName) {
  if (apiCache.has(componentName)) return apiCache.get(componentName);
  const sourcePath = path.join(
    ROOT,
    resolveSourcePath(componentName).replace(/^\.\//, ''),
  );
  try {
    const docs = parser.parse(sourcePath);
    apiCache.set(componentName, docs);
    return docs;
  } catch {
    apiCache.set(componentName, null);
    return null;
  }
}

function generateApiMarkdown(componentName, lang) {
  const docs = parseComponentDocs(componentName);
  if (!docs?.length) return `${t(flat, 'common.api.empty', lang)}\n`;

  return docs
    .map((doc) => {
      const props = doc.props ?? {};
      const rows = Object.keys(props)
        .sort((a, b) => {
          const aRequired = props[a]?.required ? 0 : 1;
          const bRequired = props[b]?.required ? 0 : 1;
          if (aRequired !== bRequired) return aRequired - bRequired;
          return a.localeCompare(b);
        })
        .map((propName) => {
          const { defaultValue, description, name, required, type } =
            props[propName];
          const requiredLabel = t(flat, 'common.api.required', lang);
          const typeText = `\`${softBreakType(type.name)}\`${required ? ` **(${requiredLabel})**` : ''}`;
          const rawDefault = defaultValue?.value ?? '-';
          const localizedDefault =
            lang === 'en' ? toEnglishDemoText(rawDefault) : rawDefault;
          const defaultText = `\`${localizedDefault}\``;
          const i18nDesc = t(flat, `common.prop.${name}`, lang, '');
          const rawDesc = description ?? '';
          const desc =
            i18nDesc ||
            (lang === 'en' && hasCjk(rawDesc)
              ? toEnglishDemoText(rawDesc)
              : rawDesc) ||
            '-';
          // Prefer i18n; if EN still has leftover CJK (unmapped), hide it.
          const safeDesc =
            lang === 'en' && hasCjk(desc) && !i18nDesc ? '-' : desc;
          return `| ${escapeCell(name)} | ${escapeCell(safeDesc)} | ${typeText} | ${defaultText} |`;
        });

      if (!rows.length) return '';

      const header = `| ${t(flat, 'common.api.property', lang)} | ${t(flat, 'common.api.description', lang)} | ${t(flat, 'common.api.type', lang)} | ${t(flat, 'common.api.defaultValue', lang)} |
| :---: | :---: | :---: | :---: |`;

      const title = doc.displayName ? `### ${doc.displayName}\n\n` : '';
      let intro = '';
      if (doc.description) {
        const localizedIntro =
          lang === 'en' ? toEnglishDemoText(doc.description) : doc.description;
        if (!(lang === 'en' && hasCjk(localizedIntro))) {
          intro = `${localizedIntro}\n\n`;
        }
      }
      return `${title}${intro}${header}\n${rows.join('\n')}`;
    })
    .filter(Boolean)
    .join('\n\n');
}

/** Catalog: structure + demos only. Copy lives in i18n/pages. */
const CATEGORIES = {
  general: {
    items: [
      {
        name: 'Button',
        demo: `import { Button, Space } from '@koi-ui/core';\nexport default () => (\n  <Space>\n    <Button variant="primary">主要</Button>\n    <Button variant="secondary">次要</Button>\n  </Space>\n);`,
      },
      {
        name: 'Icon',
        demo: `import { Icon, Space } from '@koi-ui/core';\nexport default () => (\n  <Space gap={4}>\n    <Icon name="search" />\n    <Icon name="check" />\n    <Icon name="close" />\n  </Space>\n);`,
      },
      {
        name: 'Typography',
        demo: `import { Typography } from '@koi-ui/core';\nconst { Title, Text, Paragraph } = Typography;\nexport default () => (\n  <div>\n    <Title level={3}>标题</Title>\n    <Paragraph>段落文字</Paragraph>\n    <Text muted>辅助文字</Text>\n  </div>\n);`,
      },
    ],
  },
  layout: {
    items: [
      { name: 'Divider', demo: `import { Divider } from '@koi-ui/core';\nexport default () => <Divider>分割文字</Divider>;` },
      {
        name: 'Grid',
        demo: `import { Row, Col } from '@koi-ui/core';\nexport default () => (\n  <Row gutter={16}>\n    <Col span={12}><div className="bg-muted p-4 rounded-md">col-12</div></Col>\n    <Col span={12}><div className="bg-muted p-4 rounded-md">col-12</div></Col>\n  </Row>\n);`,
      },
      {
        name: 'Layout',
        demo: `import { Layout } from '@koi-ui/core';\nconst { Header, Content, Footer } = Layout;\nexport default () => (\n  <Layout className="border border-border rounded-md overflow-hidden">\n    <Header className="bg-muted px-4 py-2">Header</Header>\n    <Content className="px-4 py-6">Content</Content>\n    <Footer className="bg-muted px-4 py-2 text-center text-sm">Footer</Footer>\n  </Layout>\n);`,
      },
      {
        name: 'Space',
        demo: `import { Space, Button } from '@koi-ui/core';\nexport default () => (\n  <Space>\n    <Button>按钮1</Button>\n    <Button>按钮2</Button>\n    <Button>按钮3</Button>\n  </Space>\n);`,
      },
      {
        name: 'Flex',
        demo: `import { Flex, Button } from '@koi-ui/core';\nexport default () => (\n  <Flex justify="between" align="center" className="p-4 border border-border rounded-md">\n    <span>左侧</span>\n    <Button size="sm">操作</Button>\n  </Flex>\n);`,
      },
      {
        name: 'Stack',
        demo: `import { Stack, Text } from '@koi-ui/core';\nexport default () => (\n  <Stack gap={2}>\n    <Text weight="bold">标题</Text>\n    <Text muted>描述</Text>\n  </Stack>\n);`,
      },
      { name: 'Box', demo: `import { Box, Text } from '@koi-ui/core';\nexport default () => <Box p={6} border rounded="md"><Text>容器</Text></Box>;` },
      {
        name: 'SafeArea',
        demo: `import { SafeArea, Text } from '@koi-ui/core';\nexport default () => (\n  <div className="koi-safe-area-demo flex h-full min-h-[28rem] flex-col overflow-hidden bg-primary/25" style={{ ['--koi-safe-area-top']: '48px', ['--koi-safe-area-bottom']: '34px' }}>\n    <SafeArea className="flex h-full min-h-0 flex-col bg-muted">\n      <div className="flex flex-1 flex-col items-center justify-center gap-2 px-4 text-center">\n        <Text className="font-medium">安全区域内容</Text>\n        <Text muted size="sm">上下彩色留白为安全区</Text>\n      </div>\n    </SafeArea>\n  </div>\n);`,
      },
    ],
  },
  navigation: {
    items: [
      {
        name: 'Affix',
        demo: `import { Affix, Button } from '@koi-ui/core';\nexport default () => (\n  <div className="space-y-3 pb-8 text-sm text-muted-foreground">\n    <p className="font-medium text-surface-foreground">向下滚动查看固钉效果</p>\n    <Affix offsetTop={0}><Button>固定在顶部</Button></Affix>\n    {Array.from({ length: 40 }, (_, i) => (<p key={i}>内容行 {i + 1}</p>))}\n  </div>\n);`,
      },
      { name: 'Breadcrumb', demo: `import { Breadcrumb } from '@koi-ui/core';\nexport default () => <Breadcrumb items={[{ title: '首页' }, { title: '列表' }, { title: '详情' }]} />;` },
      {
        name: 'Dropdown',
        demo: `import { Dropdown, Button } from '@koi-ui/core';\nexport default () => (\n  <Dropdown trigger={<Button>下拉菜单</Button>} items={[{ key: '1', label: '选项一' }, { key: '2', label: '选项二' }]} />\n);`,
      },
      { name: 'Menu', demo: `import { Menu } from '@koi-ui/core';\nexport default () => <Menu items={[{ key: '1', label: '导航一' }, { key: '2', label: '导航二' }]} defaultSelectedKey="1" />;` },
      {
        name: 'Pagination',
        demo: `import { Pagination } from '@koi-ui/core';\nimport { useState } from 'react';\nexport default () => { const [p,setP]=useState(1); return <Pagination current={p} total={50} onChange={setP} />; };`,
      },
      { name: 'Steps', demo: `import { Steps } from '@koi-ui/core';\nexport default () => <Steps current={1} items={[{ title: '完成' }, { title: '进行中' }, { title: '待进行' }]} />;` },
      {
        name: 'Tabs',
        demo: `import { Tabs, Text } from '@koi-ui/core';\nexport default () => <Tabs items={[{ key:'1', label:'Tab1', children:<Text>内容1</Text> }, { key:'2', label:'Tab2', children:<Text>内容2</Text> }]} />;`,
      },
      { name: 'NavBar', demo: `import { NavBar } from '@koi-ui/core';\nexport default () => <NavBar title="页面标题" onBack={() => {}} />;` },
      {
        name: 'TabBar',
        demo: `import { TabBar } from '@koi-ui/core';\nimport { useState } from 'react';\nexport default () => { const [k,setK]=useState('home'); return <TabBar activeKey={k} onChange={setK} items={[{ key:'home', label:'首页' }, { key:'mine', label:'我的' }]} />; };`,
      },
      {
        name: 'IndexBar',
        demo: `import { IndexBar } from '@koi-ui/core';\nconst groups = [{ index:'A', items:['Apple','Ant','Avocado'] }, { index:'B', items:['Banana','Blueberry'] }, { index:'C', items:['Cherry','Coconut'] }, { index:'D', items:['Date','Dragonfruit'] }];\nexport default () => (\n  <div className="koi-indexbar-demo flex h-[20rem] min-h-0 overflow-hidden rounded-md border border-border">\n    <IndexBar className="min-h-0 min-w-0 flex-1" groups={groups} renderItem={(item) => <span>{item}</span>} />\n  </div>\n);`,
      },
    ],
  },
  dataEntry: {
    items: [
      { name: 'AutoComplete', demo: `import { AutoComplete } from '@koi-ui/core';\nexport default () => <AutoComplete options={[{ value:'apple', label:'Apple' }, { value:'banana', label:'Banana' }]} placeholder="搜索" />;` },
      { name: 'Checkbox', demo: `import { Checkbox, CheckboxGroup } from '@koi-ui/core';\nexport default () => <CheckboxGroup defaultValue={['a']}><Checkbox checkboxValue="a" label="选项A" /><Checkbox checkboxValue="b" label="选项B" /></CheckboxGroup>;` },
      {
        name: 'DatePicker',
        demo: `import { DatePicker } from '@koi-ui/core';\nimport { useState } from 'react';\nexport default () => { const [v,setV]=useState(''); return <DatePicker value={v} onChange={setV} placeholder="选择日期" />; };`,
      },
      {
        name: 'Form',
        demo: `import { Form, FormItem, Input, Button } from '@koi-ui/core';\nexport default () => (\n  <Form layout="vertical"><FormItem label="用户名"><Input placeholder="请输入" /></FormItem><Button variant="primary">提交</Button></Form>\n);`,
      },
      { name: 'Input', demo: `import { Input } from '@koi-ui/core';\nexport default () => <Input placeholder="请输入" />;` },
      {
        name: 'InputNumber',
        demo: `import { InputNumber } from '@koi-ui/core';\nimport { useState } from 'react';\nexport default () => { const [v,setV]=useState(1); return <InputNumber value={v} onChange={setV} />; };`,
      },
      { name: 'Radio', demo: `import { Radio, RadioGroup } from '@koi-ui/core';\nexport default () => <RadioGroup defaultValue="a"><Radio radioValue="a" label="选项A" /><Radio radioValue="b" label="选项B" /></RadioGroup>;` },
      {
        name: 'Rate',
        demo: `import { Rate } from '@koi-ui/core';\nimport { useState } from 'react';\nexport default () => { const [v,setV]=useState(3); return <Rate value={v} onChange={setV} />; };`,
      },
      {
        name: 'Select',
        demo: `import { Select } from '@koi-ui/core';\nimport { useState } from 'react';\nexport default () => { const [v,setV]=useState(''); return <Select options={[{label:'北京',value:'bj'},{label:'上海',value:'sh'}]} value={v} onChange={setV} placeholder="选择城市" />; };`,
      },
      {
        name: 'Slider',
        demo: `import { Slider } from '@koi-ui/core';\nimport { useState } from 'react';\nexport default () => { const [v,setV]=useState(30); return <Slider value={v} onChange={setV} />; };`,
      },
      {
        name: 'Switch',
        demo: `import { Switch } from '@koi-ui/core';\nimport { useState } from 'react';\nexport default () => { const [v,setV]=useState(true); return <Switch checked={v} onChange={setV} />; };`,
      },
      { name: 'TextArea', demo: `import { TextArea } from '@koi-ui/core';\nexport default () => <TextArea placeholder="请输入多行文本" rows={3} />;` },
      {
        name: 'TimePicker',
        demo: `import { TimePicker } from '@koi-ui/core';\nimport { useState } from 'react';\nexport default () => { const [v,setV]=useState(''); return <TimePicker value={v} onChange={setV} placeholder="选择时间" />; };`,
      },
      { name: 'Upload', demo: `import { Upload } from '@koi-ui/core';\nexport default () => <Upload accept="image/*" />;` },
      { name: 'Cascader', demo: `import { Cascader } from '@koi-ui/core';\nexport default () => <Cascader options={[{label:'浙江',value:'zj',children:[{label:'杭州',value:'hz'}]}]} placeholder="选择地区" />;` },
      { name: 'Picker', demo: `import { Picker } from '@koi-ui/core';\nexport default () => <Picker columns={[{ options: [{label:'周一',value:'1'},{label:'周二',value:'2'}] }]} placeholder="选择" />;` },
      { name: 'SearchBar', demo: `import { SearchBar } from '@koi-ui/core';\nexport default () => <SearchBar placeholder="搜索" />;` },
      {
        name: 'Stepper',
        demo: `import { Stepper } from '@koi-ui/core';\nimport { useState } from 'react';\nexport default () => { const [v,setV]=useState(1); return <Stepper value={v} onChange={setV} />; };`,
      },
    ],
  },
  dataDisplay: {
    items: [
      { name: 'Avatar', demo: `import { Avatar } from '@koi-ui/core';\nexport default () => <Avatar fallback="张" />;` },
      { name: 'Badge', demo: `import { Badge, Button } from '@koi-ui/core';\nexport default () => <Badge count={5}><Button>消息</Button></Badge>;` },
      { name: 'Calendar', demo: `import { Calendar } from '@koi-ui/core';\nexport default () => <Calendar />;` },
      { name: 'Card', demo: `import { Card, Text } from '@koi-ui/core';\nexport default () => <Card title="卡片标题"><Text>卡片内容</Text></Card>;` },
      { name: 'Collapse', demo: `import { Collapse } from '@koi-ui/core';\nexport default () => <Collapse items={[{ key:'1', label:'面板1', children:'内容1' }, { key:'2', label:'面板2', children:'内容2' }]} />;` },
      { name: 'Descriptions', demo: `import { Descriptions } from '@koi-ui/core';\nexport default () => <Descriptions items={[{ key:'name', label:'姓名', children:'张三' }, { key:'phone', label:'手机', children:'138****0000' }]} />;` },
      { name: 'Empty', demo: `import { Empty } from '@koi-ui/core';\nexport default () => <Empty description="暂无数据" />;` },
      { name: 'Image', demo: `import { Image } from '@koi-ui/core';\nexport default () => <Image src="https://picsum.photos/200/120" alt="demo" width={200} height={120} />;` },
      { name: 'List', demo: `import { List } from '@koi-ui/core';\nexport default () => <List items={[{ key:'1', title:'标题一', description:'描述一' }, { key:'2', title:'标题二', description:'描述二' }]} />;` },
      { name: 'Popover', demo: `import { Popover, Button } from '@koi-ui/core';\nexport default () => <Popover content="气泡内容"><Button>悬停查看</Button></Popover>;` },
      {
        name: 'Segmented',
        demo: `import { Segmented } from '@koi-ui/core';\nimport { useState } from 'react';\nexport default () => { const [v,setV]=useState('a'); return <Segmented value={v} onChange={setV} options={[{label:'列表',value:'a'},{label:'卡片',value:'b'}]} />; };`,
      },
      { name: 'Statistic', demo: `import { Statistic } from '@koi-ui/core';\nexport default () => <Statistic title="活跃用户" value={112893} />;` },
      { name: 'Table', demo: `import { Table } from '@koi-ui/core';\nexport default () => <Table columns={[{key:'name',title:'姓名'},{key:'age',title:'年龄'}]} data={[{name:'张三',age:'20'},{name:'李四',age:'25'}]} />;` },
      { name: 'Tag', demo: `import { Tag, Space } from '@koi-ui/core';\nexport default () => <Space><Tag>默认</Tag><Tag variant="success">成功</Tag><Tag variant="destructive">危险</Tag></Space>;` },
      { name: 'Timeline', demo: `import { Timeline } from '@koi-ui/core';\nexport default () => <Timeline items={[{ key:'1', children:'创建项目' }, { key:'2', children:'上线发布' }, { key:'3', children:'持续迭代' }]} />;` },
      { name: 'Tooltip', demo: `import { Tooltip, Button } from '@koi-ui/core';\nexport default () => <Tooltip content="提示文字"><Button>悬停</Button></Tooltip>;` },
      { name: 'Tree', demo: `import { Tree } from '@koi-ui/core';\nexport default () => <Tree data={[{ key:'1', title:'父节点', children:[{ key:'1-1', title:'子节点' }] }]} />;` },
      { name: 'NoticeBar', demo: `import { NoticeBar } from '@koi-ui/core';\nexport default () => <NoticeBar content="这是一条滚动通告信息" />;` },
      { name: 'Swiper', demo: `import { Swiper } from '@koi-ui/core';\nexport default () => <Swiper><div className="h-24 bg-muted flex items-center justify-center">Slide 1</div><div className="h-24 bg-primary/10 flex items-center justify-center">Slide 2</div></Swiper>;` },
      { name: 'Ellipsis', demo: `import { Ellipsis } from '@koi-ui/core';\nexport default () => <Ellipsis content="这是一段很长的文字，用来演示文本省略效果：当内容宽度超过容器时，超出部分会被省略显示，并在末尾展示省略号，方便在列表、卡片等有限空间里保留可读性。" rows={1} />;` },
    ],
  },
  feedback: {
    items: [
      { name: 'Alert', demo: `import { Alert } from '@koi-ui/core';\nexport default () => <Alert variant="info" title="提示" description="这是一条提示信息" />;` },
      {
        name: 'Drawer',
        demo: `import { Drawer, Button } from '@koi-ui/core';\nimport { useState } from 'react';\nexport default () => { const [o,setO]=useState(false); return <><Button onClick={()=>setO(true)}>打开抽屉</Button><Drawer open={o} onClose={()=>setO(false)} title="抽屉标题">内容</Drawer></>; };`,
      },
      {
        name: 'Modal',
        demo: `import { Modal, Button } from '@koi-ui/core';\nimport { useState } from 'react';\nexport default () => { const [o,setO]=useState(false); return <><Button onClick={()=>setO(true)}>打开弹窗</Button><Modal open={o} onClose={()=>setO(false)} title="标题">内容</Modal></>; };`,
      },
      { name: 'Notification', demo: `import { Notification } from '@koi-ui/core';\nexport default () => <Notification title="通知" description="这是一条通知" />;` },
      { name: 'Popconfirm', demo: `import { Popconfirm, Button } from '@koi-ui/core';\nexport default () => <Popconfirm title="确定删除吗？" onConfirm={() => {}}><Button variant="destructive">删除</Button></Popconfirm>;` },
      { name: 'Progress', demo: `import { Progress } from '@koi-ui/core';\nexport default () => <Progress percent={60} />;` },
      { name: 'Result', demo: `import { Result, Button } from '@koi-ui/core';\nexport default () => <Result status="success" title="提交成功" extra={<Button>返回</Button>} />;` },
      { name: 'Skeleton', demo: `import { Skeleton } from '@koi-ui/core';\nexport default () => <Skeleton active paragraph={{ rows: 3 }} />;` },
      { name: 'Spin', demo: `import { Spin } from '@koi-ui/core';\nexport default () => <Spin tip="加载中..." />;` },
      { name: 'Toast', demo: `import { Button, toast } from '@koi-ui/core';\nexport default () => <Button onClick={() => toast.success('操作成功')}>显示提示</Button>;` },
      {
        name: 'Popup',
        demo: `import { Popup, Button } from '@koi-ui/core';\nimport { useState } from 'react';\nexport default () => { const [o,setO]=useState(false); return <><Button onClick={()=>setO(true)}>弹出</Button><Popup open={o} onClose={()=>setO(false)}>弹出内容</Popup></>; };`,
      },
      {
        name: 'ActionSheet',
        demo: `import { ActionSheet, Button } from '@koi-ui/core';\nimport { useState } from 'react';\nexport default () => { const [o,setO]=useState(false); return <><Button onClick={()=>setO(true)}>打开</Button><ActionSheet open={o} onClose={()=>setO(false)} actions={[{ key:'1', text:'选项一' }, { key:'2', text:'选项二' }]} /></>; };`,
      },
      {
        name: 'Loading',
        demo: `import { Loading, Button } from '@koi-ui/core';\nimport { useState } from 'react';\nexport default () => { const [o,setO]=useState(false); return <><Button onClick={()=>setO(true)}>加载</Button><Loading open={o} /></>; };`,
      },
      {
        name: 'Mask',
        demo: `import { Mask, Button } from '@koi-ui/core';\nimport { useState } from 'react';\nexport default () => { const [o,setO]=useState(false); return <><Button onClick={()=>setO(true)}>显示蒙层</Button><Mask open={o} onClick={()=>setO(false)} /></>; };`,
      },
      { name: 'Watermark', demo: `import { Watermark } from '@koi-ui/core';\nexport default () => <Watermark content="Koi UI"><div className="h-32 flex items-center justify-center border border-border rounded-md">水印区域</div></Watermark>;` },
    ],
  },
  other: {
    items: [
      { name: 'BackTop', demo: `import { BackTop } from '@koi-ui/core';\nexport default () => <div className="h-40 overflow-auto relative"><div className="h-96 p-4">滚动区域</div><BackTop /></div>;` },
      { name: 'FloatButton', demo: `import { FloatButton, Icon } from '@koi-ui/core';\nexport default () => <FloatButton icon={<Icon name="plus" />} />;` },
      { name: 'PullToRefresh', demo: `import { PullToRefresh, List } from '@koi-ui/core';\nexport default () => <PullToRefresh onRefresh={async()=>{}}><List items={[{key:'1',title:'项目1'},{key:'2',title:'项目2'}]} /></PullToRefresh>;` },
      { name: 'Footer', demo: `import { Footer } from '@koi-ui/core';\nexport default () => <Footer>© 2026 Koi UI</Footer>;` },
      { name: 'FloatingPanel', demo: `import { FloatingPanel } from '@koi-ui/core';\nexport default () => <FloatingPanel title="面板"><div className="p-4">可拖拽面板内容</div></FloatingPanel>;` },
      { name: 'InfiniteScroll', demo: `import { InfiniteScroll, List } from '@koi-ui/core';\nexport default () => <InfiniteScroll hasMore={false} loadMore={async()=>{}}><List items={[{key:'1',title:'项目1'},{key:'2',title:'项目2'}]} /></InfiniteScroll>;` },
    ],
  },
};

function resolveDemos(item) {
  const base = [{ key: 'basic', code: item.demo }];
  const extra = (EXTRA_DEMOS[item.name] ?? []).map((d) => ({
    key: d.key,
    code: d.code,
  }));
  return [...base, ...extra];
}

function renderDemoSections(pageId, demos, lang) {
  return demos
    .map(({ key, code }) => {
      const title = t(
        flat,
        `pages.${pageId}.demos.${key}`,
        lang,
        t(flat, `common.demo.${key}`, lang, key),
      );
      const localized = localizeDemoCode(code, lang);
      return `## ${title}\n\n\`\`\`tsx preview\n${localized}\n\`\`\``;
    })
    .join('\n\n');
}

const DEFAULT_LANG = 'en';

function componentPageId(name) {
  return `components.${name.toLowerCase()}`;
}

/** Absolute docs path respecting default-lang prefix stripping. */
function localePath(lang, pathname) {
  const normalized = pathname.startsWith('/') ? pathname : `/${pathname}`;
  if (lang === DEFAULT_LANG) return normalized;
  return `/${lang}${normalized}`;
}

function sidebarLabel(name, lang) {
  const pageId = componentPageId(name);
  const zhTitle = t(flat, `pages.${pageId}.title`, 'zh', name);
  if (lang === 'en') return name;
  return `${name} ${zhTitle}`;
}

function buildComponentSidebar(lang) {
  return Object.entries(CATEGORIES).map(([catKey, cat]) => ({
    text: t(flat, `common.category.${catKey}`, lang),
    items: cat.items.map((item) => ({
      text: sidebarLabel(item.name, lang),
      link: localePath(lang, `/components/${item.name.toLowerCase()}`),
    })),
  }));
}

/** YAML scalar safe for frontmatter (keeps quotes; avoids long/: breakage). */
function yamlScalar(value) {
  return JSON.stringify(String(value ?? ''));
}

function clearGeneratedLocale(lang) {
  const localeRoot = path.join(DOCS_DIR, lang);
  for (const rel of ['components', 'guide', 'index.md', '_nav.json', '_meta.json']) {
    const target = path.join(localeRoot, rel);
    if (!fs.existsSync(target)) continue;
    fs.rmSync(target, { recursive: true, force: true });
  }
}

function generateLocaleDocs(lang) {
  clearGeneratedLocale(lang);
  const localeRoot = path.join(DOCS_DIR, lang);
  ensureDir(localeRoot);

  // Home
  writeFile(
    path.join(localeRoot, 'index.md'),
    `---
pageType: home

hero:
  name: ${yamlScalar(t(flat, 'pages.home.hero.name', lang))}
  text: ${yamlScalar(t(flat, 'pages.home.hero.text', lang))}
  tagline: ${yamlScalar(t(flat, 'pages.home.hero.tagline', lang))}
  actions:
    - theme: brand
      text: ${yamlScalar(t(flat, 'pages.home.hero.actionStart', lang))}
      link: ${localePath(lang, '/guide/getting-started')}
    - theme: alt
      text: ${yamlScalar(t(flat, 'pages.home.hero.actionComponents', lang))}
      link: ${localePath(lang, '/components/button')}

features:
  - title: ${yamlScalar(t(flat, 'pages.home.features.adaptive.title', lang))}
    details: ${yamlScalar(t(flat, 'pages.home.features.adaptive.details', lang))}
  - title: ${yamlScalar(t(flat, 'pages.home.features.tokens.title', lang))}
    details: ${yamlScalar(t(flat, 'pages.home.features.tokens.details', lang))}
  - title: ${yamlScalar(t(flat, 'pages.home.features.react.title', lang))}
    details: ${yamlScalar(t(flat, 'pages.home.features.react.details', lang))}
  - title: ${yamlScalar(t(flat, 'pages.home.features.docs.title', lang))}
    details: ${yamlScalar(t(flat, 'pages.home.features.docs.details', lang))}
---
`,
  );

  writeFile(
    path.join(localeRoot, '_nav.json'),
    `${JSON.stringify(
      [
        {
          text: 'nav.guide',
          link: localePath(lang, '/guide/getting-started'),
          activeMatch: localePath(lang, '/guide/'),
        },
        {
          text: 'nav.components',
          link: localePath(lang, '/components/button'),
          activeMatch: localePath(lang, '/components/'),
        },
      ],
      null,
      2,
    )}\n`,
  );

  writeFile(
    path.join(localeRoot, '_meta.json'),
    `${JSON.stringify(
      [
        { type: 'file', name: 'index', label: 'home' },
        {
          type: 'dir',
          name: 'guide',
          label: 'nav.guide',
          collapsible: true,
          collapsed: false,
        },
        {
          type: 'dir',
          name: 'components',
          label: 'nav.components',
          collapsible: true,
          collapsed: false,
        },
      ],
      null,
      2,
    )}\n`,
  );

  // Guides
  const guideDir = path.join(localeRoot, 'guide');
  ensureDir(guideDir);
  writeFile(
    path.join(guideDir, '_meta.json'),
    `${JSON.stringify(
      [
        { type: 'file', name: 'getting-started', label: 'sidebar.gettingStarted' },
        { type: 'file', name: 'theming', label: 'sidebar.theming' },
        { type: 'file', name: 'responsive', label: 'sidebar.responsive' },
      ],
      null,
      2,
    )}\n`,
  );

  for (const slug of ['getting-started', 'theming', 'responsive']) {
    const pageId = `guide.${slug}`;
    const title = t(flat, `pages.${pageId}.title`, lang);
    const body = t(flat, `pages.${pageId}.body`, lang, '');
    writeFile(path.join(guideDir, `${slug}.mdx`), `# ${title}\n\n${body.trim()}\n`);
  }

  // Components
  const componentsDir = path.join(localeRoot, 'components');
  ensureDir(componentsDir);
  const meta = {};

  for (const cat of Object.values(CATEGORIES)) {
    for (const item of cat.items) {
      const slug = item.name.toLowerCase();
      const pageId = componentPageId(item.name);
      meta[slug] = item.name;
      const zhTitle = t(flat, `pages.${pageId}.title`, 'zh', item.name);
      const heading =
        lang === 'en' ? `# ${item.name}` : `# ${item.name} ${zhTitle}`;
      const demos = resolveDemos(item);
      const apiMarkdown = generateApiMarkdown(item.name, lang);
      const mdx = `${heading}

${renderDemoSections(pageId, demos, lang)}

## ${t(flat, 'common.api.heading', lang)}

${apiMarkdown}
`;
      writeFile(path.join(componentsDir, `${slug}.mdx`), mdx);
    }
  }

  writeFile(
    path.join(componentsDir, '_meta.json'),
    `${JSON.stringify(meta, null, 2)}\n`,
  );
}

// Write flattened i18n.json for Rspress nav / sidebar label keys
const rspressI18n = {
  'nav.guide': flat['common.nav.guide'],
  'nav.components': flat['common.nav.components'],
  'sidebar.gettingStarted': flat['common.sidebar.gettingStarted'],
  'sidebar.theming': flat['common.sidebar.theming'],
  'sidebar.responsive': flat['common.sidebar.responsive'],
  home: {
    en: t(flat, 'pages.home.hero.name', 'en'),
    zh: t(flat, 'pages.home.hero.name', 'zh'),
  },
};

writeFile(path.join(ROOT, 'i18n.json'), `${JSON.stringify(rspressI18n, null, 2)}\n`);

// Theme locales for rspress.config
const themeLocales = LANGS.map((lang) => ({
  lang,
  label: lang === 'en' ? 'English' : '简体中文',
  title: 'Koi UI',
  description: t(flat, 'pages.home.hero.text', lang),
  nav: [
    {
      text: t(flat, 'common.nav.guide', lang),
      link: localePath(lang, '/guide/getting-started'),
      activeMatch: localePath(lang, '/guide/'),
    },
    {
      text: t(flat, 'common.nav.components', lang),
      link: localePath(lang, '/components/button'),
      activeMatch: localePath(lang, '/components/'),
    },
  ],
  sidebar: {
    [localePath(lang, '/guide/')]: [
      {
        text: t(flat, 'common.sidebar.gettingStarted', lang),
        link: localePath(lang, '/guide/getting-started'),
      },
      {
        text: t(flat, 'common.sidebar.theming', lang),
        link: localePath(lang, '/guide/theming'),
      },
      {
        text: t(flat, 'common.sidebar.responsive', lang),
        link: localePath(lang, '/guide/responsive'),
      },
    ],
    [localePath(lang, '/components/')]: buildComponentSidebar(lang),
  },
}));

writeFile(
  path.join(DOCS_DIR, '.generated/theme-locales.json'),
  `${JSON.stringify(themeLocales, null, 2)}\n`,
);

for (const lang of LANGS) {
  generateLocaleDocs(lang);
}

// Remove legacy non-locale docs pages (keep shared assets)
for (const rel of [
  'index.md',
  'guide',
  'components',
  'sidebar.components.json',
  '_meta.json',
]) {
  const target = path.join(DOCS_DIR, rel);
  if (fs.existsSync(target)) fs.rmSync(target, { recursive: true, force: true });
}

// Generate index exports (unchanged behavior)
const allItems = Object.values(CATEGORIES).flatMap((c) => c.items);
const extraExports = {
  Grid: "export { Row, Col, type RowProps, type ColProps } from './components/Grid';",
  Layout: "export { Layout, type LayoutProps } from './components/Layout';",
  Typography:
    "export { Typography, Title, Text as TypographyText, Paragraph, Link, type TypographyTextProps, type TitleProps, type ParagraphProps, type LinkProps } from './components/Typography';",
  Checkbox:
    "export { Checkbox, CheckboxGroup, type CheckboxProps, type CheckboxGroupProps } from './components/Checkbox';",
  Radio:
    "export { Radio, RadioGroup, type RadioProps, type RadioGroupProps } from './components/Radio';",
  Notification:
    "export { Notification, type NotificationOptions } from './components/Notification';",
  Toast:
    "export { toast, Toast, type ToastOptions, type ToastType } from './components/Toast';",
  Form: "export { Form, FormItem, type FormProps, type FormItemProps } from './components/Form';",
  Table:
    "export { Table, type TableProps, type ColumnDef } from './components/Table';",
  Select:
    "export { Select, type SelectProps, type SelectOption } from './components/Select';",
  Tabs: "export { Tabs, type TabsProps, type TabItem } from './components/Tabs';",
  Modal: "export { Modal, type ModalProps } from './components/Modal';",
};

const lines = [
  "import './styles.css';",
  '',
  "export { KoiProvider, useKoiContext, type KoiProviderProps, type KoiTheme } from './provider';",
  "export { AdaptiveRender, type AdaptiveRenderProps } from './adaptive';",
  "export { Box, Stack, Text, type BoxProps, type StackProps, type TextProps } from './primitives';",
  "export { cn } from './utils/cn';",
  '',
];

const exported = new Set([
  'Box',
  'Stack',
  'Text',
  'Form',
  'Table',
  'Select',
  'Tabs',
  'Modal',
  'Grid',
  'Layout',
  'Typography',
  'Checkbox',
  'Radio',
  'Notification',
  'Toast',
]);

for (const item of allItems) {
  if (extraExports[item.name]) {
    lines.push(extraExports[item.name]);
    exported.add(item.name);
    continue;
  }
  if (!exported.has(item.name)) {
    lines.push(`export * from './components/${item.name}';`);
    exported.add(item.name);
  }
}

writeFile(path.join(ROOT, 'packages/core/src/index.tsx'), `${lines.join('\n')}\n`);

console.log(
  `Generated docs for [${LANGS.join(', ')}]: ${allItems.length} components × ${LANGS.length} locales`,
);
