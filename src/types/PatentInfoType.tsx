export interface PatentInfoType {
    patentID: string;
    patentName: string;
    age: number;
    gender: string;
    birthDate: string;
    idCardNumber: string;
}

export interface PatentInfoContextType {
    patentInfo: PatentInfoType;
    setPatentInfo: (patentInfo: PatentInfoType) => void;
}