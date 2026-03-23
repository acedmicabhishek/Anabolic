import React, { useRef, useEffect, useCallback, useMemo } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
} from 'react-native';
import { THEME } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';

interface FancyDatePickerProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  onOpenCalendar: () => void;
}

const ITEM_WIDTH = 60;

export const FancyDatePicker: React.FC<FancyDatePickerProps> = React.memo(({ 
  selectedDate, 
  onDateChange,
  onOpenCalendar 
}) => {
  const flatListRef = useRef<FlatList>(null);
  
  const dates = useMemo(() => {
    const arr = [];
    const baseDate = new Date(); 
    const start = new Date(baseDate);
    start.setDate(start.getDate() - 30); 
    
    for (let i = 0; i < 61; i++) {
        const d = new Date(start);
        d.setDate(d.getDate() + i);
        arr.push(d);
    }
    return arr;
  }, []); 

  useEffect(() => {
    const index = dates.findIndex(d => d.toDateString() === selectedDate.toDateString());
    if (index !== -1 && flatListRef.current) {
      setTimeout(() => {
        flatListRef.current?.scrollToIndex({
          index,
          viewPosition: 0.5,
          animated: true,
        });
      }, 100);
    }
  }, [selectedDate, dates]);

  const renderItem = useCallback(({ item }: { item: Date }) => {
    const isSelected = item.toDateString() === selectedDate.toDateString();
    const dayName = item.toLocaleDateString('en-US', { weekday: 'short' });
    const dayNum = item.getDate();
    const isToday = item.toDateString() === new Date().toDateString();

    return (
      <TouchableOpacity 
        onPress={() => onDateChange(item)}
        style={[
          styles.dateItem,
          isSelected && styles.dateItemActive,
          isToday && !isSelected && styles.dateItemToday
        ]}
      >
        <Text style={[styles.dayName, isSelected && styles.textActive]}>{dayName}</Text>
        <Text style={[styles.dayNum, isSelected && styles.textActive]}>{dayNum}</Text>
        {isToday && !isSelected && <View style={styles.todayDot} />}
      </TouchableOpacity>
    );
  }, [selectedDate, onDateChange]);

  const keyExtractor = useCallback((item: Date) => item.toISOString(), []);

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={dates}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={ITEM_WIDTH}
        decelerationRate="fast"
        getItemLayout={(_, index) => ({
          length: ITEM_WIDTH,
          offset: ITEM_WIDTH * index,
          index,
        })}
        contentContainerStyle={styles.listContent}
        onScrollToIndexFailed={(info) => {
          flatListRef.current?.scrollToOffset({ offset: info.averageItemLength * info.index, animated: false });
        }} 
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={5}
      />
      <TouchableOpacity style={styles.calendarBtn} onPress={onOpenCalendar}>
        <View style={styles.calendarCircle}>
          <Ionicons name="calendar" size={18} color={THEME.colors.primary} />
        </View>
      </TouchableOpacity>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(21, 26, 34, 0.6)',
    borderRadius: THEME.roundness.lg,
    paddingVertical: 10,
    marginHorizontal: THEME.spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  listContent: {
    paddingLeft: THEME.spacing.sm,
  },
  dateItem: {
    width: ITEM_WIDTH,
    height: 65,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
    borderRadius: THEME.roundness.md,
  },
  dateItemActive: {
    backgroundColor: THEME.colors.primary,
    elevation: 4,
    shadowColor: THEME.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  dateItemToday: {
    borderColor: 'rgba(141, 224, 166, 0.3)',
    borderWidth: 1,
  },
  dayName: {
    fontFamily: THEME.typography.bold,
    fontSize: 10,
    color: THEME.colors.textSecondary,
    textTransform: 'uppercase',
  },
  dayNum: {
    fontFamily: THEME.typography.black,
    fontSize: 18,
    color: THEME.colors.text,
  },
  textActive: {
    color: THEME.colors.background,
  },
  todayDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: THEME.colors.primary,
    position: 'absolute',
    bottom: 6,
  },
  calendarBtn: {
    paddingRight: THEME.spacing.md,
    paddingLeft: THEME.spacing.sm,
  },
  calendarCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(141, 224, 166, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  }
});
