import type { PropsWithChildren, ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  View,
  type ScrollViewProps,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { usePalette } from '@/constants/palette';

type ScreenProps = PropsWithChildren<{
  scroll?: boolean;
  keyboard?: boolean;
  footer?: ReactNode;
  contentClassName?: string;
  scrollProps?: ScrollViewProps;
}>;

export function Screen({
  children,
  scroll = true,
  keyboard = false,
  footer,
  contentClassName = '',
  scrollProps,
}: ScreenProps) {
  const palette = usePalette();

  const content = scroll ? (
    <ScrollView
      className="flex-1"
      contentContainerClassName={`px-5 pb-10 pt-4 ${contentClassName}`}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      {...scrollProps}>
      {children}
    </ScrollView>
  ) : (
    <View className={`flex-1 px-5 pt-4 ${contentClassName}`}>{children}</View>
  );

  const body = keyboard ? (
    <KeyboardAvoidingView
      className="flex-1"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}>
      {content}
    </KeyboardAvoidingView>
  ) : (
    content
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: palette.background }} edges={['top', 'left', 'right']}>
      <View className="flex-1 bg-background">
        {body}
        {footer}
      </View>
    </SafeAreaView>
  );
}

export function PageHeader({
  eyebrow,
  title,
  subtitle,
  right,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  right?: ReactNode;
}) {
  return (
    <View className="mb-6 flex-row items-start justify-between gap-4">
      <View className="flex-1 gap-1">
        {eyebrow ? (
          <Text className="text-xs font-bold uppercase tracking-widest text-primary">{eyebrow}</Text>
        ) : null}
        <Text className="text-3xl font-extrabold tracking-tight text-foreground">{title}</Text>
        {subtitle ? <Text className="text-sm leading-5 text-foreground-muted">{subtitle}</Text> : null}
      </View>
      {right}
    </View>
  );
}
