import { THEMES, ALL_STANDARDS, TOTAL_STANDARDS, getThemeByKey, getStandardByCode } from '../lib/standards';

describe('DOE financial literacy standards', () => {
  it('has exactly 6 themes', () => {
    expect(THEMES).toHaveLength(6);
  });

  it('has exactly 30 standards total', () => {
    expect(TOTAL_STANDARDS).toBe(30);
    expect(ALL_STANDARDS).toHaveLength(30);
  });

  it('has 5 standards per theme', () => {
    THEMES.forEach((theme) => {
      expect(theme.standards).toHaveLength(5);
    });
  });

  it('covers every DOE code: EI-1 through MR-5', () => {
    const expected = [
      'EI-1', 'EI-2', 'EI-3', 'EI-4', 'EI-5',
      'SP-1', 'SP-2', 'SP-3', 'SP-4', 'SP-5',
      'SV-1', 'SV-2', 'SV-3', 'SV-4', 'SV-5',
      'IN-1', 'IN-2', 'IN-3', 'IN-4', 'IN-5',
      'MC-1', 'MC-2', 'MC-3', 'MC-4', 'MC-5',
      'MR-1', 'MR-2', 'MR-3', 'MR-4', 'MR-5',
    ];
    const actual = ALL_STANDARDS.map((s) => s.code).sort();
    expect(actual).toEqual(expected.sort());
  });

  it('getThemeByKey resolves known themes', () => {
    expect(getThemeByKey('earning_income')?.label).toBe('Earning Income');
    expect(getThemeByKey('managing_risk')?.label).toBe('Managing Risk');
  });

  it('getStandardByCode resolves known standards', () => {
    expect(getStandardByCode('SV-3')?.title).toContain('interest');
    expect(getStandardByCode('XX-99')).toBeUndefined();
  });

  it('every theme has Hawaiian label', () => {
    THEMES.forEach((t) => {
      expect(t.hawaiian.length).toBeGreaterThan(0);
    });
  });
});
