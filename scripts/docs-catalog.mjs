/** Component docs catalog: category → ordered component names. */
export const CATEGORIES = {
  "general": [
    "Button",
    "Icon",
    "Typography"
  ],
  "layout": [
    "Divider",
    "Grid",
    "Layout",
    "Space",
    "Flex",
    "Stack",
    "Box",
    "SafeArea"
  ],
  "navigation": [
    "Affix",
    "Breadcrumb",
    "Dropdown",
    "Menu",
    "Pagination",
    "Steps",
    "Tabs",
    "NavBar",
    "TabBar",
    "IndexBar"
  ],
  "dataEntry": [
    "AutoComplete",
    "Checkbox",
    "DatePicker",
    "Form",
    "Input",
    "InputNumber",
    "Radio",
    "Rate",
    "Select",
    "Slider",
    "Switch",
    "TextArea",
    "TimePicker",
    "Upload",
    "Cascader",
    "Picker",
    "SearchBar",
    "Stepper"
  ],
  "dataDisplay": [
    "Avatar",
    "Badge",
    "Calendar",
    "Card",
    "Collapse",
    "Descriptions",
    "Empty",
    "Image",
    "List",
    "Popover",
    "Segmented",
    "Statistic",
    "Table",
    "Tag",
    "Timeline",
    "Tooltip",
    "Tree",
    "NoticeBar",
    "Swiper",
    "Ellipsis"
  ],
  "feedback": [
    "Alert",
    "Drawer",
    "Modal",
    "Notification",
    "Popconfirm",
    "Progress",
    "Result",
    "Skeleton",
    "Spin",
    "Toast",
    "Popup",
    "ActionSheet",
    "Loading",
    "Mask",
    "Watermark"
  ],
  "other": [
    "BackTop",
    "FloatButton",
    "PullToRefresh",
    "Footer",
    "FloatingPanel",
    "InfiniteScroll"
  ]
};

export function allComponentNames() {
  return Object.values(CATEGORIES).flat();
}
