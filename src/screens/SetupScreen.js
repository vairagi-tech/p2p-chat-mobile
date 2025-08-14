/**
 * Setup Screen Component
 * Allows users to enter their nickname and port before starting chat
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';

const SetupScreen = ({ navigation }) => {
  const [nickname, setNickname] = useState('');
  const [port, setPort] = useState('8888');

  const handleStartChat = () => {
    const trimmedNickname = nickname.trim();
    const portNumber = parseInt(port);
    
    // Validation
    if (!trimmedNickname) {
      Alert.alert('Invalid Input', 'Please enter a nickname');
      return;
    }
    
    if (trimmedNickname.length < 2) {
      Alert.alert('Invalid Input', 'Nickname must be at least 2 characters long');
      return;
    }
    
    if (trimmedNickname.length > 20) {
      Alert.alert('Invalid Input', 'Nickname must be less than 20 characters');
      return;
    }
    
    if (!portNumber || portNumber < 1024 || portNumber > 65535) {
      Alert.alert('Invalid Port', 'Port must be between 1024 and 65535');
      return;
    }
    
    // Navigate to chat screen
    navigation.navigate('Chat', {
      nickname: trimmedNickname,
      port: portNumber,
    });
  };

  const generateRandomNickname = () => {
    const adjectives = [
      'Cool', 'Swift', 'Brave', 'Smart', 'Quick', 'Bright', 'Sharp', 'Bold',
      'Clever', 'Wise', 'Fast', 'Strong', 'Creative', 'Brilliant', 'Dynamic'
    ];
    
    const nouns = [
      'Coder', 'Hacker', 'Ninja', 'Wizard', 'Master', 'Guru', 'Expert', 'Pro',
      'Developer', 'Engineer', 'Architect', 'Designer', 'Builder', 'Creator', 'Innovator'
    ];
    
    const randomAdjective = adjectives[Math.floor(Math.random() * adjectives.length)];
    const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];
    const randomNumber = Math.floor(Math.random() * 999) + 1;
    
    setNickname(`${randomAdjective}${randomNoun}${randomNumber}`);
  };

  const generateRandomPort = () => {
    const randomPort = Math.floor(Math.random() * (9999 - 8888 + 1)) + 8888;
    setPort(randomPort.toString());
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1976D2" />
      
      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>🚀 P2P Chat</Text>
            <Text style={styles.subtitle}>Decentralized Mobile Messaging</Text>
          </View>

          {/* Features */}
          <View style={styles.featuresContainer}>
            <View style={styles.feature}>
              <Text style={styles.featureIcon}>🔒</Text>
              <Text style={styles.featureText}>No servers, pure P2P</Text>
            </View>
            <View style={styles.feature}>
              <Text style={styles.featureIcon}>🌐</Text>
              <Text style={styles.featureText}>Mesh networking</Text>
            </View>
            <View style={styles.feature}>
              <Text style={styles.featureIcon}>🛡️</Text>
              <Text style={styles.featureText}>Privacy focused</Text>
            </View>
            <View style={styles.feature}>
              <Text style={styles.featureIcon}>⚡</Text>
              <Text style={styles.featureText}>Fast & efficient</Text>
            </View>
          </View>

          {/* Setup Form */}
          <View style={styles.formContainer}>
            <Text style={styles.sectionTitle}>Setup Your Profile</Text>
            
            {/* Nickname Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Nickname</Text>
              <View style={styles.inputRow}>
                <TextInput
                  style={styles.textInput}
                  value={nickname}
                  onChangeText={setNickname}
                  placeholder="Enter your nickname"
                  maxLength={20}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <TouchableOpacity
                  style={styles.randomButton}
                  onPress={generateRandomNickname}
                >
                  <Text style={styles.randomButtonText}>🎲</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.inputHint}>2-20 characters, will be visible to other peers</Text>
            </View>

            {/* Port Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Port Number</Text>
              <View style={styles.inputRow}>
                <TextInput
                  style={styles.textInput}
                  value={port}
                  onChangeText={setPort}
                  placeholder="8888"
                  keyboardType="numeric"
                  maxLength={5}
                />
                <TouchableOpacity
                  style={styles.randomButton}
                  onPress={generateRandomPort}
                >
                  <Text style={styles.randomButtonText}>🎲</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.inputHint}>
                Network port (1024-65535). Use different ports for multiple instances.
              </Text>
            </View>
          </View>

          {/* Quick Setup Presets */}
          <View style={styles.presetsContainer}>
            <Text style={styles.sectionTitle}>Quick Setup</Text>
            <View style={styles.presetButtons}>
              <TouchableOpacity
                style={styles.presetButton}
                onPress={() => {
                  setNickname('Alice');
                  setPort('8888');
                }}
              >
                <Text style={styles.presetButtonText}>Alice:8888</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.presetButton}
                onPress={() => {
                  setNickname('Bob');
                  setPort('8889');
                }}
              >
                <Text style={styles.presetButtonText}>Bob:8889</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.presetButton}
                onPress={() => {
                  setNickname('Charlie');
                  setPort('8890');
                }}
              >
                <Text style={styles.presetButtonText}>Charlie:8890</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Instructions */}
          <View style={styles.instructionsContainer}>
            <Text style={styles.instructionTitle}>💡 How to Connect</Text>
            <Text style={styles.instructionText}>
              1. Start the app with different nicknames on multiple devices
            </Text>
            <Text style={styles.instructionText}>
              2. Use /connect &lt;ip:port&gt; command to connect to peers
            </Text>
            <Text style={styles.instructionText}>
              3. Messages will route through the mesh network automatically
            </Text>
            <Text style={styles.instructionText}>
              4. Type /help in chat for more commands
            </Text>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>

      {/* Start Button */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={[
            styles.startButton,
            { opacity: nickname.trim() && port ? 1 : 0.5 }
          ]}
          onPress={handleStartChat}
          disabled={!nickname.trim() || !port}
        >
          <Text style={styles.startButtonText}>
            🚀 Start P2P Chat
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  keyboardContainer: {
    flex: 1,
  },
  scrollContainer: {
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
    marginTop: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1976D2',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  featuresContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  feature: {
    alignItems: 'center',
    width: '48%',
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  featureIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  featureText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    fontWeight: '500',
  },
  formContainer: {
    backgroundColor: '#FFF',
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#FAFAFA',
  },
  randomButton: {
    marginLeft: 12,
    backgroundColor: '#1976D2',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  randomButtonText: {
    fontSize: 18,
  },
  inputHint: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    fontStyle: 'italic',
  },
  presetsContainer: {
    backgroundColor: '#FFF',
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  presetButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  presetButton: {
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#1976D2',
    flex: 1,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  presetButtonText: {
    color: '#1976D2',
    fontWeight: '600',
    fontSize: 14,
  },
  instructionsContainer: {
    backgroundColor: '#FFF3E0',
    padding: 20,
    borderRadius: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
  },
  instructionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#F57C00',
    marginBottom: 12,
  },
  instructionText: {
    fontSize: 14,
    color: '#E65100',
    marginBottom: 6,
    lineHeight: 20,
  },
  bottomContainer: {
    padding: 20,
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  startButton: {
    backgroundColor: '#1976D2',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  startButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default SetupScreen;
