import React from 'react';
import { StyleSheet, Text, TouchableOpacity, ViewStyle, TextStyle } from 'react-native';

interface ToolButtonProps {
  label: string;
  onPress: () => void;
  isActive?: boolean;
  disabled?: boolean;
  variant?: 'default' | 'primary' | 'danger';
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
}

export const ToolButton: React.FC<ToolButtonProps> = ({
  label,
  onPress,
  isActive = false,
  disabled = false,
  variant = 'default',
  style,
  textStyle,
  icon,
}) => {
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      disabled={disabled}
      style={[
        styles.button,
        variant === 'primary' && styles.primaryButton,
        variant === 'danger' && styles.dangerButton,
        isActive && styles.activeButton,
        disabled && styles.disabledButton,
        style,
      ]}
    >
      {icon}
      <Text
        style={[
          styles.text,
          variant === 'primary' && styles.primaryText,
          variant === 'danger' && styles.dangerText,
          isActive && styles.activeText,
          disabled && styles.disabledText,
          textStyle,
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  primaryButton: {
    backgroundColor: '#0EA5E9',
    borderColor: '#0284C7',
  },
  dangerButton: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FCA5A5',
  },
  activeButton: {
    backgroundColor: '#EFF6FF',
    borderColor: '#3B82F6',
  },
  disabledButton: {
    backgroundColor: '#F1F5F9',
    borderColor: '#E2E8F0',
    opacity: 0.5,
  },
  text: {
    fontSize: 14,
    fontWeight: '500',
    color: '#334155',
  },
  primaryText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  dangerText: {
    color: '#EF4444',
  },
  activeText: {
    color: '#2563EB',
    fontWeight: '600',
  },
  disabledText: {
    color: '#94A3B8',
  },
});
