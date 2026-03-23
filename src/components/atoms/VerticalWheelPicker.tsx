import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, NativeSyntheticEvent, NativeScrollEvent } from 'react-native';
import { THEME } from '../../constants/theme';

interface VerticalWheelPickerProps {
  items: string[];
  value: string;
  onValueChange: (val: string) => void;
  itemHeight?: number;
  width?: number;
}

export const VerticalWheelPicker: React.FC<VerticalWheelPickerProps> = ({ 
  items, value, onValueChange, itemHeight = 50, width = 140 
}) => {
  const scrollRef = useRef<ScrollView>(null);
  
  
  const displayItems = ['', ...items, ''];
  const selectedIndex = items.indexOf(value);

  
  useEffect(() => {
    if (scrollRef.current && selectedIndex >= 0) {
      setTimeout(() => {
        scrollRef.current?.scrollTo({ 
          y: selectedIndex * itemHeight, 
          animated: false 
        });
      }, 100);
    }
  }, []); 

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    
    
  };

  const handleMomentumScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetY = e.nativeEvent.contentOffset.y;
    const index = Math.round(offsetY / itemHeight);
    if (index >= 0 && index < items.length && items[index] !== value) {
      onValueChange(items[index]);
    }
  };

  return (
    <View style={[styles.container, { height: itemHeight * 3, width }]}>
      <View style={[styles.selectionOverlay, { height: itemHeight, top: itemHeight }]} pointerEvents="none" />
      <ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled={true}
        snapToInterval={itemHeight}
        decelerationRate="fast"
        onMomentumScrollEnd={handleMomentumScrollEnd}
        scrollEventThrottle={16}
        removeClippedSubviews={false}
      >
        {displayItems.map((item, index) => {
          const isSelected = item === value;
          const isEmpty = item === '';
          return (
            <View key={`${item}-${index}`} style={[styles.itemContainer, { height: itemHeight }]}>
              {!isEmpty && (
                <Text style={[styles.itemText, isSelected && styles.itemTextSelected]}>
                  {item}
                </Text>
              )}
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignSelf: 'center',
    marginBottom: THEME.spacing.xl,
    position: 'relative',
  },
  selectionOverlay: {
    position: 'absolute',
    width: '100%',
    backgroundColor: 'rgba(52, 211, 153, 0.15)', 
    borderRadius: THEME.roundness.md,
    borderWidth: 1,
    borderColor: 'rgba(52, 211, 153, 0.3)',
  },
  itemContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemText: {
    fontFamily: THEME.typography.bold,
    fontSize: 18,
    color: THEME.colors.textSecondary,
    opacity: 0.4,
  },
  itemTextSelected: {
    fontFamily: THEME.typography.black,
    fontSize: 24,
    color: THEME.colors.primary,
    opacity: 1,
  },
});
