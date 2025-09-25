export interface RecognitionRequest {
    image: string,
    base64: string,
}

export interface RecognitionResult {
    origin: string,
    segmentation: {},
    quantitative: {},
    timestamp: Date,
    status: 'pending' | 'success' | 'error',
}

export interface AutomorphResult {
    origin: string,
    segmentation: {
        artery_binary_process?: string,  // 动脉分割结果（base64）
        vein_binary_process?: string,    // 静脉分割结果（base64）
        binary_process?: string,         // 血管分割结果（base64）
        optic_disc_cup?: string,         // 视盘分割结果（base64）
        artery_vein?: string,            // 动脉静脉合并结果（base64）
    },
    quantitative: {
        [key: string]: number | string,  // 量化特征，键值对形式
    },
    timestamp: Date,
    status: 'pending' | 'success' | 'error',
}

export interface OCTRecognitionResult extends RecognitionResult {
    // TODO: 定义OCT识别结果的接口
}

export interface FFARecognitionResult extends RecognitionResult {
    // TODO: 定义FFA识别结果的接口
}

export interface CFPRecognitionResult extends RecognitionResult {
    // TODO: 定义CFP识别结果的接口
}