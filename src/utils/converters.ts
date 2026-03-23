
export const converters = {
  
  kgToLb: (kg: number) => kg * 2.20462,
  lbToKg: (lb: number) => lb / 2.20462,

  
  cmToInch: (cm: number) => cm / 2.54,
  inchToCm: (inch: number) => inch * 2.54,

  
  cmToFt: (cm: number) => {
    const totalInches = cm / 2.54;
    const feet = Math.floor(totalInches / 12);
    const inches = Math.round(totalInches % 12);
    return { feet, inches };
  },
  ftToCm: (feet: number, inches: number) => (feet * 12 + inches) * 2.54,

  
  mlToOz: (ml: number) => ml / 29.5735,
  ozToMl: (oz: number) => oz * 29.5735,

  
  formatWeight: (val: number, unit: 'kg' | 'lb') => {
    const converted = unit === 'lb' ? converters.kgToLb(val) : val;
    return `${converted.toFixed(1)} ${unit}`;
  },
  
  formatHeight: (val: number, unit: 'cm' | 'inch' | 'ft') => {
    if (unit === 'cm') return `${val.toFixed(1)} cm`;
    if (unit === 'inch') return `${converters.cmToInch(val).toFixed(1)} in`;
    const { feet, inches } = converters.cmToFt(val);
    return `${feet}'${inches}"`;
  },

  formatBody: (val: number, unit: 'cm' | 'inch') => {
    const converted = unit === 'inch' ? converters.cmToInch(val) : val;
    return `${converted.toFixed(1)} ${unit}`;
  },

  formatFluid: (val: number, unit: 'ml' | 'oz') => {
    const converted = unit === 'oz' ? converters.mlToOz(val) : val;
    return `${Math.round(converted)} ${unit === 'oz' ? 'fl. oz' : 'ml'}`;
  }
};
