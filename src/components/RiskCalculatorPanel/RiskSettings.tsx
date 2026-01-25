import React from 'react';
import type { FC, ChangeEvent } from 'react';
import styles from './RiskCalculatorPanel.module.css';

type Side = 'BUY' | 'SELL';

interface Params {
    capital: number;
    riskPercent: number;
    side: Side;
    entryPrice: number;
    stopLossPrice: number;
    targetPrice?: number;
    riskRewardRatio: number;
    showTarget: boolean;
}

export interface RiskSettingsProps {
    params: Params;
    updateParam: (key: keyof Params, value: number | string | boolean) => void;
    ltp?: number;
    onClose?: () => void;
}

/**
 * Settings form for risk calculator inputs
 */
const RiskSettings: FC<RiskSettingsProps> = ({ params, updateParam, ltp, onClose }) => {
    return (
        <div className={styles.settings}>
            {/* Capital Input */}
            <div className={styles.inputGroup}>
                <label htmlFor="capital">Capital (₹)</label>
                <input
                    id="capital"
                    type="number"
                    value={params.capital}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => updateParam('capital', Number(e.target.value))}
                    min={1000}
                    step={1000}
                    placeholder="Enter trading capital"
                />
            </div>

            {/* Risk Percentage Input */}
            <div className={styles.inputGroup}>
                <label htmlFor="riskPercent">Risk %</label>
                <input
                    id="riskPercent"
                    type="number"
                    value={params.riskPercent}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => updateParam('riskPercent', Number(e.target.value))}
                    min={0.5}
                    max={5}
                    step={0.1}
                    placeholder="Risk per trade"
                />
            </div>

            {/* Side Selection */}
            <div className={styles.inputGroup}>
                <label htmlFor="side">Side</label>
                <select
                    id="side"
                    value={params.side}
                    onChange={(e: ChangeEvent<HTMLSelectElement>) => updateParam('side', e.target.value)}
                >
                    <option value="BUY">BUY</option>
                    <option value="SELL">SELL</option>
                </select>
            </div>

            {/* Entry Price Input */}
            <div className={styles.inputGroup}>
                <label htmlFor="entryPrice">Entry Price</label>
                <input
                    id="entryPrice"
                    type="number"
                    value={params.entryPrice}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => updateParam('entryPrice', Number(e.target.value))}
                    step={0.01}
                    placeholder="Entry price"
                />
                {ltp && (
                    <button
                        className={styles.useLtp}
                        onClick={() => updateParam('entryPrice', ltp)}
                        type="button"
                    >
                        Use LTP (₹{ltp.toFixed(2)})
                    </button>
                )}
            </div>

            {/* Stop Loss Input */}
            <div className={styles.inputGroup}>
                <label htmlFor="stopLossPrice">Stop Loss</label>
                <input
                    id="stopLossPrice"
                    type="number"
                    value={params.stopLossPrice}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => updateParam('stopLossPrice', Number(e.target.value))}
                    step={0.01}
                    placeholder="Stop loss price"
                />
            </div>

            {/* Target Price Input */}
            <div className={styles.inputGroup}>
                <label htmlFor="targetPrice">Target Price (optional)</label>
                <input
                    id="targetPrice"
                    type="number"
                    value={params.targetPrice || ''}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => updateParam('targetPrice', Number(e.target.value))}
                    step={0.01}
                    placeholder="Leave empty for auto-calc"
                />
            </div>

            {/* Risk-Reward Ratio - only show if no target price */}
            {(!params.targetPrice || params.targetPrice <= 0) && (
                <div className={styles.inputGroup}>
                    <label htmlFor="riskRewardRatio">Risk:Reward Ratio</label>
                    <select
                        id="riskRewardRatio"
                        value={params.riskRewardRatio}
                        onChange={(e: ChangeEvent<HTMLSelectElement>) => updateParam('riskRewardRatio', Number(e.target.value))}
                    >
                        <option value={1}>1:1</option>
                        <option value={1.5}>1:1.5</option>
                        <option value={2}>1:2</option>
                        <option value={2.5}>1:2.5</option>
                        <option value={3}>1:3</option>
                        <option value={4}>1:4</option>
                        <option value={5}>1:5</option>
                    </select>
                </div>
            )}

            {/* Show Target Toggle */}
            <div className={styles.inputGroup}>
                <label htmlFor="showTarget">
                    <input
                        id="showTarget"
                        type="checkbox"
                        checked={params.showTarget}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => updateParam('showTarget', e.target.checked)}
                    />
                    Show Target Line
                </label>
            </div>
        </div>
    );
};

export default RiskSettings;
