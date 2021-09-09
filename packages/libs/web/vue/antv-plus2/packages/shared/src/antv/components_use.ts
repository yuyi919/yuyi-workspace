/**
 * 该文件是为了按需加载，剔除掉了一些不需要的框架组件。
 * 减少了编译支持库包大小
 *
 * 当需要更多组件依赖时，在该文件加入即可
 */
export {
  LocaleProvider,
  ConfigProvider,
  Layout,
  Empty,
  Space,
  // Select,
  // Input,
  // InputNumber,
  Affix,
  AutoComplete,
  // Button,
  // Switch,
  PageHeader,
  Radio,
  Checkbox,
  // TreeSelect,
  // Card,
  Form,
  // Row,
  // Col,
  // Modal,
  // Table,
  Tabs,
  // Icon,
  // Popover,
  Dropdown,
  List,
  // Collapse,
  Avatar,
  Breadcrumb,
  Steps,
  // Spin,
  Menu,
  // Drawer,
  // Tooltip,
  Alert,
  Tag,
  Divider,
  DatePicker,
  TimePicker,
  // Upload,
  Progress,
  Skeleton,
  Popconfirm,
  message,
  notification,
  Carousel,
  Pagination, // Tree, // FormModel,
  Result,
} from "ant-design-vue";

export * from "./Select";
export * from "./Tree";
export * from "./TreeSelect";
export * from "./Input";
export * from "./InputNumber";
export * from "./Badge";
export * from "./Button";
export * from "./Icon";
export * from "./Collapse";
export * from "./Table";
export * from "./Switch";
export * from "./Grid";
export * from "./FormModel";
export * from "./Spin";
export * from "./Card";
export * from "./Upload";
export * from "./Popover";
export * from "./Tooltip";
export * from "./Modal";
export * from "./Drawer";
