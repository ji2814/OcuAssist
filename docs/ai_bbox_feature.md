# AI图片分析及bbox功能设计方案

## 功能概述
为图片查看器组件增加AI分析功能，能够：
1. 点击按钮调用AI大模型分析图片
2. 显示返回的bbox(边界框)在图片上
3. 支持bbox的手动增加和修改

## 数据结构
```typescript
interface BBox {
  x: number;  // 左上角x坐标(0-1相对值)
  y: number;  // 左上角y坐标(0-1相对值)
  width: number;  // 宽度(0-1相对值)
  height: number; // 高度(0-1相对值)
  label: string;  // 标签
  confidence: number; // 置信度(0-1)
}

interface DiagnosisItem {
  condition: string;
  description: string;
  solution: string;
  confidence: number;
  bboxes: BBox[]; // 新增bbox数组
}
```

## 实现步骤
1. 在ImageViewerTools组件添加AI分析按钮
2. 扩展ImageContent组件支持bbox渲染
3. 修改AIAssistant组件处理bbox数据
4. 更新后端API返回格式包含bbox信息
5. 实现bbox编辑交互逻辑

## 交互流程
1. 用户点击AI分析按钮
2. 调用AI模型分析当前图片
3. 接收并解析返回的bbox数据
4. 在图片上渲染bbox
5. 支持用户拖拽调整bbox位置/大小
6. 支持用户新增bbox