export type PatientInfoProps = {
    name: string;
    gender: string;
    age: number;
    examNumber: string;
    id?: string;

    onExport?: () => void;
    onImport?: (id: string) => void;
    onCreate?: (patient: {
        name: string;
        gender: string;
        age: number;
        examNumber: string;
    }) => void;
}