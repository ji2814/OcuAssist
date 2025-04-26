import React from 'react';
import { Page, Text, View, Document, StyleSheet, Image, Font } from '@react-pdf/renderer';
import { FundusImage } from '../types/FundusImage';
import { PatientInfoProps } from '../types/PatientInfo';
import { Diagnosis } from '../types/Diagnosis';

// Register fonts with Chinese support
Font.register({
  family: 'NotoSans',
  fonts: [
    { src: 'https://fonts.gstatic.com/ea/notosanssc/v1/NotoSansSC-Regular.otf' },
    { src: 'https://fonts.gstatic.com/ea/notosanssc/v1/NotoSansSC-Bold.otf', fontWeight: 'bold' }
  ]
});

// Define styles
const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: 'NotoSans',
    fontSize: 12
  },
  header: {
    marginBottom: 20,
    textAlign: 'center'
  },
  title: {
    fontSize: 24,
    marginBottom: 10
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    borderBottomStyle: 'solid',
    marginVertical: 15
  },
  section: {
    marginBottom: 15
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: 5
  },
  patientInfo: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15
  },
  imageContainer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20
  },
  imageWrapper: {
    width: '30%',
    marginBottom: 10
  },
  imageLabel: {
    fontSize: 12,
    marginBottom: 5
  },
  diagnosis: {
    marginBottom: 20
  },
  signature: {
    position: 'absolute',
    right: 30,
    bottom: 30,
    textAlign: 'right'
  },
  signatureLine: {
    marginTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#000',
    borderTopStyle: 'solid',
    paddingTop: 5,
    width: 200
  }
});

interface DiagnosticReportProps {
  patientInfo: PatientInfoProps;
  displayedImages: Record<string, FundusImage>;
  diagnosis: Diagnosis;
  date: string;
}

const DiagnosticReport: React.FC<DiagnosticReportProps> = ({
  patientInfo,
  displayedImages,
  diagnosis,
  date
}) => {

  const cfpImage = displayedImages?.['CFP']?.url
    ? displayedImages['CFP'] : undefined;
  const ffaImage = displayedImages?.['FFA']?.url
    ? displayedImages['FFA'] : undefined;
  const octImage = displayedImages?.['OCT']?.url
    ? displayedImages['OCT'] : undefined;

  console.log("DiagnosticReport", diagnosis)
    return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Ophthalmology Diagnostic Report</Text>
          <Text>Eye Hospital</Text>
        </View>

        {/* Patient Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Patient Information</Text>
          <View style={styles.divider} />
          <View style={styles.patientInfo}>
            <Text>Name: {patientInfo.name}</Text>
            <Text>Gender: {patientInfo.gender}</Text>
            <Text>Age: {patientInfo.age}</Text>
            <Text>Exam ID: {patientInfo.examNumber}</Text>
          </View>
        </View>
        
        {/* Fundus Images */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Fundus Images</Text>
          <View style={styles.divider} />
          <View style={styles.imageContainer}>
            {(cfpImage) && (
              <View style={styles.imageWrapper}>
                <Text style={styles.imageLabel}>Color Fundus Photo (CFP)</Text>
                <Image src={
                  cfpImage?.url
                } />
              </View>
            )}
            {(ffaImage) && (
              <View style={styles.imageWrapper}>
                <Text style={styles.imageLabel}>Fluorescein Angiography (FFA)</Text>
                <Image src={
                  ffaImage?.url
                } />
              </View>
            )}
            {(octImage) && (
              <View style={styles.imageWrapper}>
                <Text style={styles.imageLabel}>OCT Scan</Text>
                <Image src={
                  octImage?.url
                } />
              </View>
            )}
          </View>
        </View>

        {/* Diagnosis */}
        <View style={styles.diagnosis}>
          <Text style={styles.sectionTitle}>Diagnosis</Text>
          <View style={styles.divider} />
          
          {diagnosis.Diagnosis.length > 0 ? (
            diagnosis.Diagnosis.map((item, index) => (
              <View key={index} style={{marginBottom: 15}}>
                <Text style={{fontWeight: 'bold', marginBottom: 5}}>
                  Diagnosis {index + 1}: {item.condition}
                </Text>
                <Text style={{marginBottom: 5}}>
                  Description: {item.description}
                </Text>
                <Text style={{marginBottom: 5}}>
                  Solution: {item.solution}
                </Text>
                {item.severity && (
                  <Text>Severity: {item.severity}</Text>
                )}
                {item.confidence && (
                  <Text>Confidence: {item.confidence * 100}%</Text>
                )}
              </View>
            ))
          ) : (
            <Text>No diagnosis available</Text>
          )}

          {diagnosis.notes && (
            <Text style={{fontStyle: 'italic', marginTop: 10}}>
              Notes: {diagnosis.notes}
            </Text>
          )}
        </View>

        {/* Doctor Signature and Date */}
        <View style={styles.signature}>
          <View style={styles.signatureLine}>
            <Text>Doctor: ________________</Text>
            <Text>Date: {date}</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
};

export default DiagnosticReport;