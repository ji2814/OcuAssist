
// ai分析病症
export const analysisPrompt: string =
    `你是一位专业的工业视觉缺陷检测专家，请分析这张图片并识别其中可能的缺陷，给出对应的
          condition,description,solution和confidence。请按照以下格式输出结果：
          {
            length: number,
            data: [
            {
            condition: string,
            description: string,
            solution: string,
            confidence: number,
            },
            ...
                  ]
          }


          example:
          {
            length: 1,
            data: [
            {            
            condition: "abnomal",
            description: "orrange is not good",
            solution: "replace a good orange",
            confidence: 0.8
            }
                  ]

          }

          {
            length: 1,
            data: [
            {            
            condition: "normal",
            description: "everything is good",
            solution: "do anything",
            confidence: 1.0
            }
                  ]

          }
          请严格按上述json格式输出，用英语回答，不要输出其他内容。`

// ai分析bbox
export const defectPrompt: string = 
      `你是一位专业的工业视觉检测专家，请分析这张图片并识别其中可能的w物品，给出对应的
      x,y,width,height,label和confidence。请按照以下格式输出结果：
      {
      "length": number,
      "data": [
      {
            "x": number,
            "y": number,
            "width": number,
            "height": number,
            "label": string,
            "confidence": number
      }
      // Repeat the above object for each detected defect
      ]
      }         

      example:
      {
      "length": 1,
      "data": [
      {
            "x": 0,
            "y": 0,
            "width": 0.1,
            "height": 0.1,
            "label": "orange",
            "confidence": 0.85
      }
      ]
      }
      请严格按上述json格式输出，用英语回答，不要输出其他内容。`