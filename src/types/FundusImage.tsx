export type FundusImage = {
    id: string; // 图片id
    fileName: string; // 文件名
    path: string; // 图片路径
    url: string; // 图片url

    base64?: string; // base64格式的图片数据
    patientId: string; // 患者id，即诊断号
    date?: Date; // 创建日期
    eye: 'left' | 'right'; // 眼睛
    modal: 'CFP' | 'FFA' | 'OCT' ; // 模态
}