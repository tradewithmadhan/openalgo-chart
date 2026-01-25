/**
 * Appearance Section Component
 * Chart appearance settings for SettingsPopup
 */
import React from 'react';
import type { ChangeEvent } from 'react';
import styles from '../SettingsPopup.module.css';
import { DEFAULT_CHART_APPEARANCE, ChartAppearance } from '../constants/settingsConstants';

export interface AppearanceSectionProps {
    localAppearance: ChartAppearance;
    setLocalAppearance: React.Dispatch<React.SetStateAction<ChartAppearance>>;
}

const AppearanceSection: React.FC<AppearanceSectionProps> = ({ localAppearance, setLocalAppearance }) => {
    const handleResetAppearance = (): void => {
        setLocalAppearance(DEFAULT_CHART_APPEARANCE as ChartAppearance);
    };

    const handleColorChange = (field: keyof ChartAppearance, value: string, linkedField: keyof ChartAppearance | null = null): void => {
        setLocalAppearance(prev => {
            const update: any = { ...prev, [field]: value };
            if (linkedField) {
                update[linkedField] = value;
            }
            return update;
        });
    };

    const handleHexInput = (field: keyof ChartAppearance, value: string, linkedField: keyof ChartAppearance | null = null): void => {
        let val = value;
        if (!val.startsWith('#')) val = '#' + val;
        if (/^#[0-9A-Fa-f]{0,6}$/.test(val)) {
            handleColorChange(field, val, linkedField);
        }
    };

    return (
        <div className={styles.section}>
            <h3 className={styles.sectionTitle}>CANDLE COLORS</h3>

            <div className={styles.colorRow}>
                <label className={styles.colorLabel}>Up Color (Bullish)</label>
                <div className={styles.colorInputWrapper}>
                    <input
                        type="color"
                        value={localAppearance.candleUpColor}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => handleColorChange('candleUpColor', e.target.value, 'wickUpColor')}
                        className={styles.colorInput}
                    />
                    <input
                        type="text"
                        value={localAppearance.candleUpColor}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => handleHexInput('candleUpColor', e.target.value, 'wickUpColor')}
                        className={styles.hexInput}
                        maxLength={7}
                        placeholder="#000000"
                    />
                </div>
            </div>

            <div className={styles.colorRow}>
                <label className={styles.colorLabel}>Down Color (Bearish)</label>
                <div className={styles.colorInputWrapper}>
                    <input
                        type="color"
                        value={localAppearance.candleDownColor}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => handleColorChange('candleDownColor', e.target.value, 'wickDownColor')}
                        className={styles.colorInput}
                    />
                    <input
                        type="text"
                        value={localAppearance.candleDownColor}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => handleHexInput('candleDownColor', e.target.value, 'wickDownColor')}
                        className={styles.hexInput}
                        maxLength={7}
                        placeholder="#000000"
                    />
                </div>
            </div>

            <h3 className={styles.sectionTitle} style={{ marginTop: '24px' }}>GRID LINES</h3>

            <div className={styles.optionGroup}>
                <label className={styles.checkboxLabel}>
                    <input
                        type="checkbox"
                        checked={localAppearance.showVerticalGridLines}
                        onChange={() => setLocalAppearance(prev => ({ ...prev, showVerticalGridLines: !prev.showVerticalGridLines }))}
                        className={styles.checkbox}
                    />
                    <span className={styles.checkmark}></span>
                    <span>Vertical grid lines</span>
                </label>
            </div>

            <div className={styles.optionGroup}>
                <label className={styles.checkboxLabel}>
                    <input
                        type="checkbox"
                        checked={localAppearance.showHorizontalGridLines}
                        onChange={() => setLocalAppearance(prev => ({ ...prev, showHorizontalGridLines: !prev.showHorizontalGridLines }))}
                        className={styles.checkbox}
                    />
                    <span className={styles.checkmark}></span>
                    <span>Horizontal grid lines</span>
                </label>
            </div>

            <h3 className={styles.sectionTitle} style={{ marginTop: '24px' }}>BACKGROUND COLOR</h3>

            <div className={styles.colorRow}>
                <label className={styles.colorLabel}>Dark Theme</label>
                <div className={styles.colorInputWrapper}>
                    <input
                        type="color"
                        value={localAppearance.darkBackground}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => handleColorChange('darkBackground', e.target.value)}
                        className={styles.colorInput}
                    />
                    <input
                        type="text"
                        value={localAppearance.darkBackground}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => handleHexInput('darkBackground', e.target.value)}
                        className={styles.hexInput}
                        maxLength={7}
                        placeholder="#000000"
                    />
                </div>
            </div>

            <div className={styles.colorRow}>
                <label className={styles.colorLabel}>Light Theme</label>
                <div className={styles.colorInputWrapper}>
                    <input
                        type="color"
                        value={localAppearance.lightBackground}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => handleColorChange('lightBackground', e.target.value)}
                        className={styles.colorInput}
                    />
                    <input
                        type="text"
                        value={localAppearance.lightBackground}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => handleHexInput('lightBackground', e.target.value)}
                        className={styles.hexInput}
                        maxLength={7}
                        placeholder="#000000"
                    />
                </div>
            </div>

            <button
                className={styles.resetButton}
                onClick={handleResetAppearance}
                style={{ marginTop: '24px' }}
            >
                Reset to Defaults
            </button>
        </div>
    );
};

export default AppearanceSection;
