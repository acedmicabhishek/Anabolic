import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, Dimensions, ScrollView } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { Circle, G, Rect, Text as SvgText } from 'react-native-svg';
import { THEME } from '../../constants/theme';

interface ChartWidgetProps {
  title?: string;
  labels: string[];
  data?: number[];
  unit?: string;
  hideTitle?: boolean;
  datasets?: { data: number[]; color: string; name: string; unit?: string }[];
}

export const ChartWidget: React.FC<ChartWidgetProps> = React.memo(({ title, labels, data, unit, hideTitle = false, datasets }) => {
  const [tooltip, setTooltip] = useState<{x: number, y: number, value: number, index: number} | null>(null);

  useEffect(() => {
    setTooltip(null);
  }, [datasets, data, labels]);

  
  const safeguardData = useCallback((arr: number[]): number[] => {
    if (arr.length < 2) return arr;
    const allSame = arr.every(v => v === arr[0]);
    if (allSame && arr[0] !== 0) {
      return arr.map((v, i) => i === 0 ? v + 0.01 : v);
    }
    return arr;
  }, []);

  const chartData = useMemo(() => ({
    labels: labels,
    datasets: datasets ? datasets.map(ds => ({
      data: safeguardData(ds.data.length > 0 ? ds.data : [0]),
      color: (opacity = 1) => ds.color,
      strokeWidth: 3,
    })) : [
      {
        data: safeguardData(data && data.length > 0 ? data : [0]),
        color: (opacity = 1) => THEME.colors.primary,
        strokeWidth: 4,
      },
    ],
  }), [labels, datasets, data, safeguardData]);

  const startWeight = useMemo(() => data && data.length > 0 ? (data.find(v => v > 0) || 0) : 0, [data]);
  const currentWeight = useMemo(() => data && data.length > 0 ? data[data.length - 1] : 0, [data]);
  const totalLost = useMemo(() => (startWeight - currentWeight).toFixed(1), [startWeight, currentWeight]);
  const isLoss = useMemo(() => Number(totalLost) >= 0, [totalLost]);

  
  const decimalPlaces = useMemo(() => {
    const allValues = datasets 
      ? datasets.flatMap(ds => ds.data) 
      : (data || []);
    const maxVal = Math.max(...allValues, 0);
    if (maxVal >= 100) return 0;
    if (maxVal >= 10) return 1;
    return 1;
  }, [datasets, data]);

  const chartConfig = useMemo(() => ({
    backgroundColor: THEME.colors.surface,
    backgroundGradientFrom: THEME.colors.surface,
    backgroundGradientTo: THEME.colors.surface,
    decimalPlaces,
    color: (opacity = 1) => `rgba(141, 224, 166, ${opacity})`, 
    labelColor: (opacity = 1) => THEME.colors.textMuted,
    fillShadowGradientFrom: THEME.colors.primary,
    fillShadowGradientTo: 'transparent',
    fillShadowGradientFromOpacity: 0.1,
    fillShadowGradientToOpacity: 0,
    style: {
      borderRadius: THEME.roundness.lg,
    },
    propsForDots: {
      r: '4',
      strokeWidth: '0',
      fill: THEME.colors.primary,
    },
    propsForBackgroundLines: {
      strokeWidth: 1,
      stroke: 'rgba(255, 255, 255, 0.05)',
    },
  }), [datasets, decimalPlaces]);

  const handleDataPointClick = useCallback(({ value, x, y, index }: { value: number; x: number; y: number; index: number }) => {
    setTooltip({ value, x, y, index });
  }, []);

  const renderDecorator = useCallback(() => {
    return tooltip ? (
       <G>
         <Rect x={tooltip.x - 25} y={tooltip.y - 35} width={50} height={24} fill={THEME.colors.text} rx={4} ry={4} />
         <SvgText
            x={tooltip.x}
            y={tooltip.y - 18}
            fill={THEME.colors.background}
            fontSize="12"
            fontWeight="bold"
            textAnchor="middle"
         >
            {tooltip.value}
         </SvgText>
       </G>
    ) : null;
  }, [tooltip]);

  const renderDotContent = useCallback(({ x, y, index }: { x: number; y: number; index: number }) => {
    if (!data) return null;
    if (data.length > 10 && index !== 0 && index !== data.length - 1 && index !== Math.floor(data.length / 2)) {
      return null;
    }
    return (
      <Circle
        key={index}
        cx={x}
        cy={y}
        r="4"
        fill={THEME.colors.primary}
      />
    );
  }, [data]);

  const baseWidth = useMemo(() => Dimensions.get('window').width - THEME.spacing.lg * 4, []);
  
  const chartWidth = useMemo(() => {
    const dataPoints = chartData.labels.length;
    let pointWidth = 45; 
    if (dataPoints > 50) pointWidth = 12; 
    return Math.max(baseWidth, dataPoints * pointWidth);
  }, [baseWidth, chartData.labels.length]);

  
  const hasEnoughData = useMemo(() => {
    if (datasets) {
      return datasets.some(ds => ds.data.length >= 2 && ds.data.some(v => v > 0));
    }
    return data ? data.length >= 2 : false;
  }, [datasets, data]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        {!hideTitle && <Text style={styles.title}>{title} {unit ? `(${unit})` : ''}</Text>}
        {unit && hideTitle && <Text style={styles.unitBadge}>{unit.toUpperCase()}</Text>}
        {!datasets && data && (
          <View style={styles.kpiContainer}>
            <Text style={styles.kpiValue}>{Math.abs(Number(totalLost))}</Text>
            <Text style={styles.kpiLabel}>{isLoss ? 'KG LOST' : 'KG GAINED'}</Text>
          </View>
        )}
      </View>
      {datasets && (
        <View style={styles.legendContainer}>
          {datasets.map((ds, i) => (
            <View key={`leg-${i}`} style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: ds.color }]} />
              <Text style={styles.legendText}>{ds.name.toUpperCase()}</Text>
            </View>
          ))}
        </View>
      )}
      {!hasEnoughData ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Not enough data to display trend.</Text>
        </View>
      ) : (
        <View style={{ flexDirection: 'row', overflow: 'hidden' }}>
          {chartWidth > baseWidth && (
            <View style={{ width: 55, backgroundColor: THEME.colors.surface, zIndex: 2, overflow: 'hidden' }}>
              <LineChart
                bezier
                data={{
                  ...chartData,
                  datasets: chartData.datasets.map(ds => ({ ...ds, color: () => 'transparent' }))
                }}
                width={baseWidth}
                height={220}
                yAxisSuffix=""
                yAxisLabel=""
                chartConfig={{
                  ...chartConfig,
                  color: () => 'transparent',
                  propsForDots: { r: '0' },
                  formatXLabel: () => '',
                  propsForBackgroundLines: { strokeWidth: 0 }
                }}
                style={styles.chart}
                withInnerLines={false}
                withOuterLines={false}
                withVerticalLines={false}
                withHorizontalLabels={true}
                withVerticalLabels={false}
                withDots={false}
                fromZero={false}
              />
            </View>
          )}

          <ScrollView horizontal showsHorizontalScrollIndicator={false} bounces={false} style={{ flex: 1, zIndex: 1, marginLeft: chartWidth > baseWidth ? -15 : 0 }}>
            <LineChart
              bezier
              data={chartData}
              width={chartWidth}
              height={220}
              yAxisSuffix=""
              yAxisLabel=""
              chartConfig={chartConfig}
              style={styles.chart}
              withInnerLines={true}
              withOuterLines={false}
              withVerticalLines={false}
              withHorizontalLabels={!(chartWidth > baseWidth)}
              withVerticalLabels={true}
              withDots={!datasets}
              fromZero={false}
              onDataPointClick={handleDataPointClick}
              decorator={renderDecorator}
              getDotColor={() => THEME.colors.primary}
              renderDotContent={!datasets && data ? renderDotContent : undefined}
            />
          </ScrollView>
        </View>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    backgroundColor: THEME.colors.surface,
    borderRadius: THEME.roundness.lg,
    padding: THEME.spacing.lg,
    paddingBottom: THEME.spacing.sm,
    marginBottom: THEME.spacing.md,
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: THEME.spacing.md,
  },
  title: {
    fontFamily: THEME.typography.bold,
    color: THEME.colors.textSecondary,
    fontSize: 14,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  legendContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: THEME.spacing.md,
    marginBottom: THEME.spacing.md,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    fontFamily: THEME.typography.bold,
    color: THEME.colors.textSecondary,
    fontSize: 10,
    letterSpacing: 0.5,
  },
  kpiContainer: {
    alignItems: 'flex-end',
  },
  kpiValue: {
    fontFamily: THEME.typography.black,
    color: THEME.colors.text,
    fontSize: 24,
    lineHeight: 28,
  },
  kpiLabel: {
    fontFamily: THEME.typography.bold,
    color: THEME.colors.textSecondary,
    fontSize: 10,
    letterSpacing: 0.5,
  },
  unitBadge: {
    fontFamily: THEME.typography.black,
    color: THEME.colors.textMuted,
    fontSize: 9,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    opacity: 0.5,
  },
  chart: {
    marginVertical: THEME.spacing.sm,
    borderRadius: THEME.roundness.lg,
    paddingRight: 60, 
  },
  emptyContainer: {
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: THEME.colors.surfaceSecondary,
    borderRadius: THEME.roundness.md,
  },
  emptyText: {
    color: THEME.colors.textMuted,
    fontSize: 14,
    fontWeight: '500',
  },
});
