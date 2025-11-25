
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { colors } from '../../styles/commonStyles';
import { IconSymbol } from '../../components/IconSymbol';

interface LogEntry {
  timestamp: string;
  message: string;
  type: 'info' | 'error' | 'success';
}

let logEntries: LogEntry[] = [];
let listeners: Array<(logs: LogEntry[]) => void> = [];

// Override console.log to capture logs
const originalLog = console.log;
const originalError = console.error;

console.log = (...args: any[]) => {
  originalLog(...args);
  const message = args.map(arg => 
    typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
  ).join(' ');
  
  addLog(message, 'info');
};

console.error = (...args: any[]) => {
  originalError(...args);
  const message = args.map(arg => 
    typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
  ).join(' ');
  
  addLog(message, 'error');
};

function addLog(message: string, type: 'info' | 'error' | 'success') {
  const entry: LogEntry = {
    timestamp: new Date().toLocaleTimeString(),
    message,
    type,
  };
  
  logEntries = [entry, ...logEntries].slice(0, 50); // Keep last 50 logs
  listeners.forEach(listener => listener([...logEntries]));
}

export function logSuccess(message: string) {
  originalLog(message);
  addLog(message, 'success');
}

export const DebugPanel: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>(logEntries);

  useEffect(() => {
    const listener = (newLogs: LogEntry[]) => {
      setLogs(newLogs);
    };
    
    listeners.push(listener);
    
    return () => {
      listeners = listeners.filter(l => l !== listener);
    };
  }, []);

  if (!isVisible) {
    return (
      <TouchableOpacity
        style={styles.floatingButton}
        onPress={() => setIsVisible(true)}
      >
        <IconSymbol
          ios_icon_name="terminal.fill"
          android_material_icon_name="code"
          size={24}
          color={colors.text}
        />
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Debug Console</Text>
        <TouchableOpacity onPress={() => setIsVisible(false)}>
          <IconSymbol
            ios_icon_name="xmark.circle.fill"
            android_material_icon_name="close"
            size={24}
            color={colors.text}
          />
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.logContainer}>
        {logs.length === 0 ? (
          <Text style={styles.emptyText}>No logs yet...</Text>
        ) : (
          logs.map((log, index) => (
            <View key={index} style={styles.logEntry}>
              <Text style={styles.timestamp}>{log.timestamp}</Text>
              <Text style={[
                styles.logMessage,
                log.type === 'error' && styles.errorMessage,
                log.type === 'success' && styles.successMessage,
              ]}>
                {log.message}
              </Text>
            </View>
          ))
        )}
      </ScrollView>
      
      <TouchableOpacity
        style={styles.clearButton}
        onPress={() => {
          logEntries = [];
          setLogs([]);
        }}
      >
        <Text style={styles.clearButtonText}>Clear Logs</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  floatingButton: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    zIndex: 1000,
  },
  container: {
    position: 'absolute',
    bottom: 100,
    left: 20,
    right: 20,
    height: 400,
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    zIndex: 1000,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  logContainer: {
    flex: 1,
    padding: 12,
  },
  emptyText: {
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 20,
  },
  logEntry: {
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  timestamp: {
    fontSize: 10,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  logMessage: {
    fontSize: 12,
    color: colors.text,
    fontFamily: 'monospace',
  },
  errorMessage: {
    color: colors.error,
  },
  successMessage: {
    color: colors.success,
  },
  clearButton: {
    padding: 12,
    backgroundColor: colors.secondary,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    alignItems: 'center',
  },
  clearButtonText: {
    color: colors.text,
    fontWeight: '600',
  },
});
