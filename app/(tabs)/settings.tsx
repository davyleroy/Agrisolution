import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Linking,
  Share,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Settings as SettingsIcon,
  Globe,
  Info,
  User,
  Mail,
  Shield,
  FileText,
  Star,
  Share2,
  ChevronRight,
} from 'lucide-react-native';

export default function SettingsScreen() {
  const handleRateApp = () => {
    Alert.alert(
      'Rate App',
      'Thank you for using Agrisol! Please rate us on the app store.',
      [{ text: 'OK' }]
    );
  };

  const handleShareApp = async () => {
    try {
      await Share.share({
        message: `Check out Agrisol - AI-Powered Crop Health Monitor! 🌱\n\nDownload it now to identify crop diseases and get expert recommendations for your farm.`,
        title: 'Agrisol - Smart Farming App',
      });
    } catch (error) {
      console.error('Error sharing app:', error);
    }
  };

  const handleContact = () => {
    const email = 'support@agrisol.app';
    const subject = 'Agrisol App Support';
    const body = 'Hello Agrisol Team,\n\nI need help with...';
    
    const mailtoUrl = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    
    Linking.openURL(mailtoUrl).catch(() => {
      Alert.alert(
        'Contact',
        `Please send an email to: ${email}`,
        [{ text: 'OK' }]
      );
    });
  };

  const handlePrivacyPolicy = () => {
    Alert.alert(
      'Privacy Policy',
      'Privacy policy will be available on our website soon.',
      [{ text: 'OK' }]
    );
  };

  const handleTermsOfService = () => {
    Alert.alert(
      'Terms of Service',
      'Terms of service will be available on our website soon.',
      [{ text: 'OK' }]
    );
  };

  const settingsOptions = [
    {
      id: 'language',
      title: 'Language',
      subtitle: 'English',
      icon: Globe,
      onPress: () => Alert.alert('Language', 'Language selection coming soon!'),
      showChevron: true,
    },
    {
      id: 'about',
      title: 'About',
      subtitle: 'Version 1.0.0',
      icon: Info,
      onPress: () => Alert.alert(
        'About',
        'Agrisol - AI-Powered Precision Agriculture System for Sustainable Crop Management\n\nDeveloped by: Davy Mbuto Nkurunziza\nVersion: 1.0.0 (MVP)',
        [{ text: 'Close' }]
      ),
      showChevron: true,
    },
    {
      id: 'developer',
      title: 'Developer',
      subtitle: 'Davy Mbuto Nkurunziza',
      icon: User,
      onPress: () => Alert.alert(
        'Developer',
        'Davy Mbuto Nkurunziza\nSoftware Engineer & AI Enthusiast\n\nSpecializing in precision agriculture and sustainable farming solutions.',
        [{ text: 'Close' }]
      ),
      showChevron: true,
    },
    {
      id: 'contact',
      title: 'Contact',
      subtitle: 'support@agrisol.app',
      icon: Mail,
      onPress: handleContact,
      showChevron: true,
    },
    {
      id: 'privacy',
      title: 'Privacy Policy',
      subtitle: 'Data protection & privacy',
      icon: Shield,
      onPress: handlePrivacyPolicy,
      showChevron: true,
    },
    {
      id: 'terms',
      title: 'Terms of Service',
      subtitle: 'Terms & conditions',
      icon: FileText,
      onPress: handleTermsOfService,
      showChevron: true,
    },
    {
      id: 'rate',
      title: 'Rate App',
      subtitle: 'Help us improve',
      icon: Star,
      onPress: handleRateApp,
      showChevron: true,
    },
    {
      id: 'share',
      title: 'Share App',
      subtitle: 'Tell your friends',
      icon: Share2,
      onPress: handleShareApp,
      showChevron: true,
    },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <LinearGradient
        colors={['#374151', '#4b5563']}
        style={styles.header}
      >
        <SettingsIcon size={32} color="#ffffff" strokeWidth={2} />
        <Text style={styles.title}>Settings</Text>
        <Text style={styles.subtitle}>Customize your Agrisol experience</Text>
      </LinearGradient>

      {/* Settings Options */}
      <View style={styles.settingsContainer}>
        {settingsOptions.map((option) => (
          <TouchableOpacity
            key={option.id}
            style={styles.settingItem}
            onPress={option.onPress}
            activeOpacity={0.7}
          >
            <View style={styles.settingIcon}>
              <option.icon size={24} color="#059669" strokeWidth={2} />
            </View>
            
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>{option.title}</Text>
              <Text style={styles.settingSubtitle}>{option.subtitle}</Text>
            </View>
            
            {option.showChevron && (
              <ChevronRight size={20} color="#6b7280" strokeWidth={2} />
            )}
          </TouchableOpacity>
        ))}
      </View>

      {/* App Info */}
      <View style={styles.appInfoContainer}>
        <Text style={styles.appInfoTitle}>Agrisol</Text>
        <Text style={styles.appInfoSubtitle}>
          AI-Powered Crop Health Monitor
        </Text>
        <Text style={styles.appInfoVersion}>Version 1.0.0 (MVP)</Text>
        <Text style={styles.appInfoCopyright}>
          © 2024 Davy Mbuto Nkurunziza. All rights reserved.
        </Text>
      </View>

      <View style={styles.bottomSpacing} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 30,
    alignItems: 'center',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginTop: 12,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#ffffff',
    opacity: 0.8,
  },
  settingsContainer: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  settingIcon: {
    backgroundColor: '#ecfdf5',
    borderRadius: 12,
    padding: 8,
    marginRight: 16,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  appInfoContainer: {
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 40,
    marginBottom: 20,
  },
  appInfoTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#059669',
    marginBottom: 4,
  },
  appInfoSubtitle: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 8,
  },
  appInfoVersion: {
    fontSize: 14,
    color: '#9ca3af',
    marginBottom: 16,
  },
  appInfoCopyright: {
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'center',
    lineHeight: 18,
  },
  bottomSpacing: {
    height: 20,
  },
});