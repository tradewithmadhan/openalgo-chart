import React, { useCallback, useRef } from 'react';
import type { DragEvent, MouseEvent } from 'react';
import { X, GripVertical } from 'lucide-react';
import styles from './WatchlistItem.module.css';
import classNames from 'classnames';

interface WatchlistItemData {
    symbol: string;
    exchange: string;
    last: string | number;
    chg: string | number;
    chgP: string | number;
    up: boolean;
}

interface SymbolData {
    symbol: string;
    exchange: string;
}

interface ColumnWidths {
    symbol: number;
    last: number;
    chg: number;
    chgP: number;
}

export interface WatchlistItemProps {
    item: WatchlistItemData;
    isActive: boolean;
    isFocused: boolean;
    isDragging: boolean;
    columnWidths: ColumnWidths;
    minColumnWidth: number;
    sortEnabled: boolean;
    index: number;
    onSelect: (data: SymbolData) => void;
    onDoubleClick?: (data: SymbolData) => void;
    onRemove: (data: SymbolData) => void;
    onDragStart?: (e: DragEvent<HTMLDivElement>, index: number) => void;
    onDragOver?: (e: DragEvent<HTMLDivElement>, index: number) => void;
    onDragEnd?: () => void;
    onDrop?: (e: DragEvent<HTMLDivElement>, index: number) => void;
    onContextMenu?: (e: MouseEvent<HTMLDivElement>, item: WatchlistItemData, index: number) => void;
    onMouseEnter?: (e: MouseEvent<HTMLDivElement>, item: WatchlistItemData, rect?: DOMRect) => void;
    onMouseLeave?: () => void;
    onMouseMove?: (e: MouseEvent<HTMLDivElement>) => void;
}

/**
 * WatchlistItem - Individual symbol row in the watchlist
 *
 * Features:
 * - Smart tooltip integration (hover shows full name after delay)
 * - Drag handle for reordering
 * - Delete button appears on hover
 * - Exchange flag icon
 * - Right-click context menu support
 */

const WatchlistItem: React.FC<WatchlistItemProps> = ({
    item,
    isActive,
    isFocused,
    isDragging,
    columnWidths,
    minColumnWidth,
    sortEnabled,
    index,
    onSelect,
    onDoubleClick,
    onRemove,
    onDragStart,
    onDragOver,
    onDragEnd,
    onDrop,
    onContextMenu,
    onMouseEnter,
    onMouseLeave,
    onMouseMove,
}) => {
    const itemRef = useRef<HTMLDivElement>(null);

    const handleClick = useCallback((): void => {
        onSelect({ symbol: item.symbol, exchange: item.exchange });
    }, [item.symbol, item.exchange, onSelect]);

    const handleDoubleClick = useCallback((): void => {
        if (onDoubleClick) {
            onDoubleClick({ symbol: item.symbol, exchange: item.exchange });
        }
    }, [item.symbol, item.exchange, onDoubleClick]);

    const handleRemoveClick = useCallback((e: MouseEvent<HTMLButtonElement>): void => {
        e.stopPropagation();
        onRemove({ symbol: item.symbol, exchange: item.exchange });
    }, [item.symbol, item.exchange, onRemove]);

    const handleContextMenu = useCallback((e: MouseEvent<HTMLDivElement>): void => {
        e.preventDefault();
        if (onContextMenu) {
            onContextMenu(e, item, index);
        }
    }, [onContextMenu, item, index]);

    const handleMouseEnter = useCallback((e: MouseEvent<HTMLDivElement>): void => {
        if (onMouseEnter) {
            const rect = itemRef.current?.getBoundingClientRect();
            onMouseEnter(e, item, rect);
        }
    }, [onMouseEnter, item]);

    const handleMouseLeave = useCallback((): void => {
        if (onMouseLeave) {
            onMouseLeave();
        }
    }, [onMouseLeave]);

    const handleMouseMove = useCallback((e: MouseEvent<HTMLDivElement>): void => {
        if (onMouseMove) {
            onMouseMove(e);
        }
    }, [onMouseMove]);

    return (
        <div
            ref={itemRef}
            className={classNames(styles.item, {
                [styles.active]: isActive,
                [styles.focused]: isFocused,
                [styles.dragging]: isDragging,
            })}
            onClick={handleClick}
            onDoubleClick={handleDoubleClick}
            onContextMenu={handleContextMenu}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onMouseMove={handleMouseMove}
            draggable={!sortEnabled}
            onDragStart={(e) => onDragStart?.(e, index)}
            onDragOver={(e) => onDragOver?.(e, index)}
            onDragEnd={onDragEnd}
            onDrop={(e) => onDrop?.(e, index)}
        >
            {/* Drag handle - visible on hover */}
            <div className={styles.dragHandle}>
                <GripVertical size={12} />
            </div>

            {/* Symbol name */}
            <span
                className={styles.symbolName}
                style={{ width: columnWidths.symbol, minWidth: columnWidths.symbol }}
            >
                {item.symbol}
            </span>

            {/* Last price */}
            <span
                className={classNames(styles.last, {
                    [styles.up]: item.up,
                    [styles.down]: !item.up && item.chg !== 0,
                })}
                style={{ width: columnWidths.last, minWidth: minColumnWidth }}
            >
                {item.last}
            </span>

            {/* Change */}
            <span
                className={classNames(styles.chg, {
                    [styles.up]: item.up,
                    [styles.down]: !item.up && item.chg !== 0,
                })}
                style={{ width: columnWidths.chg, minWidth: minColumnWidth }}
            >
                {item.chg}
            </span>

            {/* Change % */}
            <span
                className={classNames(styles.chgP, {
                    [styles.up]: item.up,
                    [styles.down]: !item.up && item.chg !== 0,
                })}
                style={{ width: columnWidths.chgP, minWidth: minColumnWidth }}
            >
                {item.chgP}
            </span>

            {/* Remove button - appears on hover */}
            <button
                className={styles.removeBtn}
                onClick={handleRemoveClick}
                title="Remove from watchlist"
            >
                <X size={12} />
            </button>
        </div>
    );
};

export default React.memo(WatchlistItem);
