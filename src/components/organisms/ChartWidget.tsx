import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
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

  const chartData = useMemo(() => ({
    labels: labels,
    datasets: datasets ? datasets.map(ds => ({
      data: ds.data.length > 0 ? ds.data : [0],
      color: (opacity = 1) => ds.color,
      strokeWidth: 3,
    })) : [
      {
        data: data && data.length > 0 ? data : [0],
        color: (opacity = 1) => THEME.colors.primary,
        strokeWidth: 4,
      },
    ],
  }), [labels, datasets, data]);

  const startWeight = useMemo(() => data && data.length > 0 ? data[0] : 0, [data]);
  const currentWeight = useMemo(() => data && data.length > 0 ? data[data.length - 1] : 0, [data]);
  const totalLost = useMemo(() => (startWeight - currentWeight).toFixed(1), [startWeight, currentWeight]);
  const isLoss = useMemo(() => Number(totalLost) >= 0, [totalLost]);

  const chartConfig = useMemo(() => ({
    backgroundColor: THEME.colors.surface,
    backgroundGradientFrom: THEME.colors.surface,
    backgroundGradientTo: THEME.colors.surface,
    decimalPlaces: datasets && datasets.some(ds => ds.data.some(v => v >= 100)) ? 0 : 1,
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
  }), [datasets]);

  const handleDataPointClick = useCallback(({ value, x, y, index }: any) => {
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

  const renderDotContent = useCallback(({ x, y, index }: any) => {
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

  const chartWidth = useMemo(() => Dimensions.get('window').width - THEME.spacing.lg * 4, []);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        {!hideTitle && <Text style={styles.title}>{title} {unit ? `(${unit})` : ''}</Text>}
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
      {(data && data.length < 2) && (!datasets || datasets[0].data.length < 2) ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Not enough data to display trend.</Text>
        </View>
      ) : (
        <LineChart
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
          withHorizontalLabels={true}
          withVerticalLabels={true}
          withDots={!datasets}
          fromZero={false}
          onDataPointClick={handleDataPointClick}
          decorator={renderDecorator}
          getDotColor={() => THEME.colors.primary}
          renderDotContent={!datasets && data ? renderDotContent : undefined}
        />
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
