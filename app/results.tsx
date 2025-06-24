import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Share,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import {
  ArrowLeft,
  Share2,
  BookOpen,
  CheckCircle,
  AlertTriangle,
  Camera,
  Save,
  Leaf,
  TrendingUp,
  Clock,
  Target,
} from 'lucide-react-native';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth, supabase } from '@/contexts/AuthContext';
import { mlService, SUPPORTED_CROPS, MLAnalysisResult } from '@/services/mlService';

export default function ResultsScreen() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const params = useLocalSearchParams();
  const imageUri = params.imageUri as string;
  const cropType = params.cropType as string;
  
  const [analysisResult, setAnalysisResult] = useState<MLAnalysisResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const selectedCrop = SUPPORTED_CROPS.find(crop => crop.id === cropType);

  useEffect(() => {
    analyzeImage();
  }, []);

  const analyzeImage = async () => {
    if (!selectedCrop) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const result = await mlService.analyzeImage(imageUri, selectedCrop);
      setAnalysisResult(result);
    } catch (error) {
      console.error('Analysis error:', error);
      Alert.alert(t('error'), t('analysisError'));
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    if (!analysisResult?.prediction) return;

    try {
      const { prediction } = analysisResult;
      const textToShare = `${t('agrisolAnalysis')}:

${t('crop')}: ${selectedCrop ? t(selectedCrop.id) : t('unknown')}
${t('detected')}: ${prediction.disease}
${t('confidence')}: ${prediction.confidence}%
${t('severity')}: ${t(prediction.severity.toLowerCase())}

${t('recommendations')}:
${prediction.recommendations.slice(0, 3).map(rec => `• ${rec}`).join('\n')}

${t('analyzedWithAgrisol')}`;

      await Share.share({
        message: textToShare,
        title: t('agrisolAnalysisResults'),
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleSave = async () => {
    if (!analysisResult?.prediction || !user) {
      Alert.alert(t('error'), t('mustBeSignedIn'));
      return;
    }

    setSaving(true);
    try {
      const { prediction } = analysisResult;
      
      const { error } = await supabase
        .from('scan_history')
        .insert([
          {
            user_id: user.id,
            crop_type: cropType,
            image_uri: imageUri,
            detected_disease: prediction.disease,
            confidence: prediction.confidence,
            severity: prediction.severity,
            treatment_urgency: prediction.treatmentUrgency,
            estimated_recovery: prediction.estimatedRecovery,
            recommendations: prediction.recommendations,
            created_at: new Date().toISOString(),
          },
        ]);

      if (error) {
        throw error;
      }

      Alert.alert(t('success'), t('analysisSaved'));
    } catch (error) {
      console.error('Error saving analysis:', error);
      Alert.alert(t('error'), t('errorSavingAnalysis'));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <LinearGradient
          colors={['#059669', '#10b981']}
          style={styles.loadingGradient}
        >
          <ActivityIndicator size="large" color="#ffffff" />
          <Text style={styles.loadingText}>{t('analyzingImage')}</Text>
          <Text style={styles.loadingSubtext}>{t('pleaseWait')}</Text>
        </LinearGradient>
      </View>
    );
  }

  if (!analysisResult || !analysisResult.success || !analysisResult.prediction) {
    return (
      <View style={styles.errorContainer}>
        <AlertTriangle size={64} color="#dc2626" strokeWidth={1.5} />
        <Text style={styles.errorTitle}>{t('analysisError')}</Text>
        <Text style={styles.errorText}>{analysisResult?.error || t('unknownError')}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => router.back()}>
          <Text style={styles.retryButtonText}>{t('tryAgain')}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const { prediction } = analysisResult;
  const isHealthy = prediction.disease.toLowerCase().includes('healthy');
  const statusColor = isHealthy ? '#059669' : '#dc2626';
  const StatusIcon = isHealthy ? CheckCircle : AlertTriangle;

  const recommendations = [
    {
      title: t('immediateAction'),
      action: prediction.recommendations[0] || t('noActionNeeded'),
      icon: AlertTriangle,
      color: prediction.treatmentUrgency === 'High' ? '#dc2626' : '#f59e0b',
    },
    {
      title: t('prevention'),
      action: prediction.recommendations[1] || t('continueRegularCare'),
      icon: Leaf,
      color: '#059669',
    },
    {
      title: t('monitoring'),
      action: prediction.recommendations[2] || t('regularMonitoring'),
      icon: TrendingUp,
      color: '#2563eb',
    },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <LinearGradient
        colors={isHealthy ? ['#059669', '#10b981'] : ['#dc2626', '#ef4444']}
        style={styles.header}
      >
        <View style={styles.headerTop}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ArrowLeft size={24} color="#ffffff" strokeWidth={2} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
            <Share2 size={24} color="#ffffff" strokeWidth={2} />
          </TouchableOpacity>
        </View>
        
        <View style={styles.headerContent}>
          <View style={styles.statusIcon}>
            <StatusIcon size={48} color="#ffffff" strokeWidth={2} />
          </View>
          <Text style={styles.resultTitle}>{t('analysisComplete')}</Text>
          <Text style={styles.resultSubtitle}>
            {isHealthy ? t('greatNews') : t('issueDetected')}
          </Text>
        </View>
      </LinearGradient>

      {/* Image and Crop Info */}
      <View style={styles.imageContainer}>
        <Image source={{ uri: imageUri }} style={styles.cropImage} />
        {selectedCrop && (
          <View style={styles.cropBadge}>
            <Text style={styles.cropBadgeEmoji}>{selectedCrop.icon}</Text>
            <Text style={styles.cropBadgeText}>{t(selectedCrop.id)}</Text>
          </View>
        )}
      </View>

      {/* Main Results Card */}
      <View style={styles.resultsCard}>
        <View style={styles.mainResult}>
          <Text style={styles.diseaseTitle}>{prediction.disease}</Text>
          <View style={styles.confidenceContainer}>
            <View style={[styles.confidenceBar, { backgroundColor: statusColor }]}>
              <View
                style={[
                  styles.confidenceFill,
                  { width: `${prediction.confidence}%`, backgroundColor: '#ffffff' },
                ]}
              />
            </View>
            <Text style={styles.confidenceText}>{prediction.confidence}% {t('confidence')}</Text>
          </View>
        </View>

        <View style={styles.detailsGrid}>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>{t('severity')}</Text>
            <Text style={[styles.detailValue, { color: statusColor }]}>
              {t(prediction.severity.toLowerCase())}
            </Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>{t('urgency')}</Text>
            <Text style={styles.detailValue}>{t(prediction.treatmentUrgency.toLowerCase())}</Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>{t('recoveryTime')}</Text>
            <Text style={styles.detailValue}>{prediction.estimatedRecovery}</Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>{t('processingTime')}</Text>
            <Text style={styles.detailValue}>
              {analysisResult.processingTime ? `${(analysisResult.processingTime / 1000).toFixed(1)}s` : 'N/A'}
            </Text>
          </View>
        </View>
      </View>

      {/* Recommendations */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('recommendations')}</Text>
        {recommendations.map((rec, index) => (
          <View key={index} style={styles.recommendationCard}>
            <View style={[styles.recIcon, { backgroundColor: `${rec.color}20` }]}>
              <rec.icon size={20} color={rec.color} strokeWidth={2} />
            </View>
            <View style={styles.recContent}>
              <Text style={styles.recTitle}>{rec.title}</Text>
              <Text style={styles.recDescription}>{rec.action}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* Additional Recommendations */}
      {prediction.recommendations.length > 3 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('additionalRecommendations')}</Text>
          <View style={styles.detailedCard}>
            {prediction.recommendations.slice(3).map((rec, index) => (
              <Text key={index} style={styles.additionalRecText}>
                • {rec}
              </Text>
            ))}
          </View>
        </View>
      )}

      {/* Warning for Non-Healthy Plants */}
      {!isHealthy && (
        <View style={styles.section}>
          <View style={styles.warningCard}>
            <AlertTriangle size={20} color="#f59e0b" strokeWidth={2} />
            <Text style={styles.warningText}>
              {t('consultExpertWarning')}
            </Text>
          </View>
        </View>
      )}

      {/* Action Buttons */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity style={styles.primaryButton} onPress={() => router.push('/crop-selection?imageSource=camera')}>
          <Camera size={20} color="#ffffff" strokeWidth={2} />
          <Text style={styles.primaryButtonText}>{t('newScan')}</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.secondaryButton, saving && styles.disabledButton]} 
          onPress={handleSave}
          disabled={saving}
        >
          <Save size={20} color="#059669" strokeWidth={2} />
          <Text style={styles.secondaryButtonText}>
            {saving ? t('saving') : t('saveResult')}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Guide Link */}
      <TouchableOpacity
        style={styles.guideLink}
        onPress={() => router.push('/(tabs)/guide')}
      >
        <BookOpen size={20} color="#6b7280" strokeWidth={2} />
        <Text style={styles.guideLinkText}>{t('viewCropCareGuide')}</Text>
      </TouchableOpacity>

      <View style={styles.bottomSpacing} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  loadingGradient: {
    alignItems: 'center',
    padding: 40,
    borderRadius: 20,
    margin: 20,
  },
  loadingText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginTop: 20,
  },
  loadingSubtext: {
    fontSize: 16,
    color: '#ffffff',
    opacity: 0.8,
    marginTop: 8,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    backgroundColor: '#f8fafc',
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#dc2626',
    marginTop: 20,
    marginBottom: 12,
  },
  errorText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 30,
  },
  retryButton: {
    backgroundColor: '#059669',
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    padding: 8,
  },
  shareButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    padding: 8,
  },
  headerContent: {
    alignItems: 'center',
  },
  statusIcon: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 30,
    padding: 16,
    marginBottom: 16,
  },
  resultTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  resultSubtitle: {
    fontSize: 16,
    color: '#ffffff',
    opacity: 0.9,
  },
  imageContainer: {
    paddingHorizontal: 20,
    marginTop: -30,
    position: 'relative',
  },
  cropImage: {
    width: '100%',
    height: 200,
    borderRadius: 16,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
  },
  cropBadge: {
    position: 'absolute',
    top: 16,
    right: 36,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
  },
  cropBadgeEmoji: {
    fontSize: 16,
    marginRight: 6,
  },
  cropBadgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  resultsCard: {
    backgroundColor: '#ffffff',
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 16,
    padding: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  mainResult: {
    alignItems: 'center',
    marginBottom: 20,
  },
  diseaseTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
    textAlign: 'center',
  },
  confidenceContainer: {
    alignItems: 'center',
    width: '100%',
  },
  confidenceBar: {
    width: '100%',
    height: 8,
    borderRadius: 4,
    marginBottom: 8,
    overflow: 'hidden',
  },
  confidenceFill: {
    height: '100%',
    borderRadius: 4,
  },
  confidenceText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  detailItem: {
    width: '48%',
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
  section: {
    paddingHorizontal: 20,
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
  },
  recommendationCard: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  recIcon: {
    borderRadius: 10,
    padding: 8,
    marginRight: 12,
    alignSelf: 'flex-start',
  },
  recContent: {
    flex: 1,
  },
  recTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  recDescription: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  detailedCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  additionalRecText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 22,
    marginBottom: 8,
  },
  warningCard: {
    flexDirection: 'row',
    backgroundColor: '#fef3c7',
    borderRadius: 12,
    padding: 16,
    alignItems: 'flex-start',
  },
  warningText: {
    fontSize: 14,
    color: '#92400e',
    marginLeft: 12,
    flex: 1,
    lineHeight: 20,
  },
  actionsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginTop: 24,
    gap: 12,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: '#059669',
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#059669',
  },
  disabledButton: {
    opacity: 0.6,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#059669',
  },
  guideLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    marginTop: 20,
    gap: 8,
  },
  guideLinkText: {
    fontSize: 14,
    color: '#6b7280',
    textDecorationLine: 'underline',
  },
  bottomSpacing: {
    height: 30,
  },
});