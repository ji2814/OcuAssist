export function parseBoxContent(input: string): string {
    // 定义开始和结束标记
    const startMarker = "<|begin_of_box|>";
    const endMarker = "<|end_of_box|>";
    
    // 查找标记在字符串中的位置
    const startIndex = input.indexOf(startMarker);
    const endIndex = input.indexOf(endMarker);
    
    // 检查标记是否存在且位置有效
    if (startIndex === -1 || endIndex === -1 || startIndex >= endIndex) {
        console.error("无效的输入格式：未找到有效的标记或标记位置不正确");
        return "";
    }
    
    try {
        // 提取两个标记之间的内容
        const content = input.substring(
            startIndex + startMarker.length,
            endIndex
        );
        
        return content;
    } catch (error) {
        console.error("解析内容时出错：", error);
        return "";
    }
}
