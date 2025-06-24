import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Camera, Image as ImageIcon, CheckCircle } from 'lucide-react-native';
import { SUPPORTED_CROPS, CropType } from '@/services/mlService';
import { useLanguage } from '@/contexts/LanguageContext';

const { width } = Dimensions.get('window');

export default function CropSelectionScreen() {
  const { t } = useLanguage();
  const params = useLocalSearchParams();
  const imageSource = params.imageSource as string; // 'camera' or 'gallery'
  const [selectedCrop, setSelectedCrop] = useState<CropType | null>(null);

  const handleCropSelect = (crop: CropType) => {
    setSelectedCrop(crop);
  };

  const handleContinue = () => {
    if (!selectedCrop) return;
    
    router.push({
      pathname: '/scan',
      params: {
        cropType: selectedCrop.id,
        imageSource,
      },
    });
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#059669', '#10b981']}
        style={styles.header}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color="#ffffff" strokeWidth={2} />
        </TouchableOpacity>
        
        <View style={styles.headerContent}>
          <Text style={styles.title}>{t('selectCropType')}</Text>
          <Text style={styles.subtitle}>{t('selectCropTypeDesc')}</Text>
        </View>
      </LinearGradient>

      {/* Source Indicator */}
      <View style={styles.sourceIndicator}>
        <View style={styles.sourceIcon}>
          {imageSource === 'camera' ? (
            <Camera size={20} color="#059669" strokeWidth={2} />
          ) : (
            <ImageIcon size={20} color="#059669" strokeWidth={2} />
          )}
        </View>
        <Text style={styles.sourceText}>
          {imageSource === 'camera' ? t('takingPhoto') : t('selectingFromGallery')}
        </Text>
      </View>

      {/* Crop Selection */}
      <ScrollView style={styles.cropList} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>{t('availableCrops')}</Text>
        
        {SUPPORTED_CROPS.map((crop) => (
          <TouchableOpacity
            key={crop.id}
            style={[
              styles.cropCard,
              selectedCrop?.id === crop.id && styles.selectedCropCard,
            ]}
            onPress={() => handleCropSelect(crop)}
            activeOpacity={0.7}
          >
            <View style={styles.cropCardContent}>
              <View style={styles.cropIcon}>
                <Text style={styles.cropEmoji}>{crop.icon}</Text>
              </View>
              
              <View style={styles.cropInfo}>
                <Text style={styles.cropName}>{t(crop.id)}</Text>
                <Text style={styles.cropScientific}>{crop.scientificName}</Text>
                <Text style={styles.cropDescription}>{t(`${crop.id}Description`)}</Text>
                
                <View style={styles.diseasesList}>
                  <Text style={styles.diseasesTitle}>{t('commonDiseases')}:</Text>
                  {crop.commonDiseases.slice(0, 2).map((disease, index) => (
                    <Text key={index} style={styles.diseaseItem}>
                      • {disease}
                    </Text>
                  ))}
                  {crop.commonDiseases.length > 2 && (
                    <Text style={styles.moreDiseasesText}>
                      +{crop.commonDiseases.length - 2} {t('more')}
                    </Text>
                  )}
                </View>
              </View>
              
              {selectedCrop?.id === crop.id && (
                <View style={styles.selectedIndicator}>
                  <CheckCircle size={24} color="#059669" strokeWidth={2} />
                </View>
              )}
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Continue Button */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={[
            styles.continueButton,
            !selectedCrop && styles.disabledButton,
          ]}
          onPress={handleContinue}
          disabled={!selectedCrop}
        >
          <LinearGradient
            colors={selectedCrop ? ['#059669', '#10b981'] : ['#9ca3af', '#9ca3af']}
            style={styles.buttonGradient}
          >
            <Text style={styles.continueButtonText}>
              {t('continueToScan')}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
        
        {selectedCrop && (
          <Text style={styles.selectedCropText}>
            {t('selected')}: {t(selectedCrop.id)}
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  backButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    padding: 8,
    alignSelf: 'flex-start',
    marginBottom: 20,
  },
  headerContent: {
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#ffffff',
    opacity: 0.9,
    textAlign: 'center',
  },
  sourceIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    marginHorizontal: 20,
    marginTop: -15,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  sourceIcon: {
    backgroundColor: '#ecfdf5',
    borderRadius: 20,
    padding: 8,
    marginRight: 12,
  },
  sourceText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  cropList: {
    flex: 1,
    paddingHorizontal: 20,
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
  },
  cropCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedCropCard: {
    borderColor: '#059669',
    elevation: 4,
    shadowOpacity: 0.1,
  },
  cropCardContent: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'flex-start',
  },
  cropIcon: {
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    padding: 12,
    marginRight: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cropEmoji: {
    fontSize: 32,
  },
  cropInfo: {
    flex: 1,
  },
  cropName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  cropScientific: {
    fontSize: 14,
    color: '#6b7280',
    fontStyle: 'italic',
    marginBottom: 8,
  },
  cropDescription: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
    marginBottom: 12,
  },
  diseasesList: {
    marginTop: 8,
  },
  diseasesTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 4,
  },
  diseaseItem: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 2,
  },
  moreDiseasesText: {
    fontSize: 12,
    color: '#059669',
    fontWeight: '500',
    marginTop: 2,
  },
  selectedIndicator: {
    marginLeft: 8,
  },
  bottomContainer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  continueButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
  },
  disabledButton: {
    opacity: 0.6,
  },
  buttonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  selectedCropText: {
    fontSize: 14,
    color: '#059669',
    textAlign: 'center',
    fontWeight: '500',
  },
});