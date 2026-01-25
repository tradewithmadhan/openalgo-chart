import React from 'react';
import { Layers, ArrowUp, ArrowDown, Trash2 } from 'lucide-react';
import { BaseContextMenu, MenuItem, MenuDivider } from '../shared';

interface Position {
    x: number;
    y: number;
}

export interface ContextMenuProps {
    isVisible: boolean;
    position: Position;
    onClose: () => void;
    onAddSection?: () => void;
    onMoveToTop?: () => void;
    onMoveToBottom?: () => void;
    onRemove?: () => void;
}

/**
 * ContextMenu - Right-click context menu for watchlist symbols
 *
 * Options:
 * - Add section above
 * - Move to top
 * - Move to bottom
 * - Remove from watchlist
 */

const ContextMenu: React.FC<ContextMenuProps> = ({
    isVisible,
    position,
    onClose,
    onAddSection,
    onMoveToTop,
    onMoveToBottom,
    onRemove,
}) => {
    return (
        <BaseContextMenu
            isVisible={isVisible}
            position={position}
            onClose={onClose}
            width={200}
        >
            <MenuItem
                icon={Layers}
                label="Add section above"
                onClick={onAddSection}
            />

            <MenuDivider />

            <MenuItem
                icon={ArrowUp}
                label="Move to top"
                onClick={onMoveToTop}
            />

            <MenuItem
                icon={ArrowDown}
                label="Move to bottom"
                onClick={onMoveToBottom}
            />

            <MenuDivider />

            <MenuItem
                icon={Trash2}
                label="Remove from watchlist"
                onClick={onRemove}
                danger
            />
        </BaseContextMenu>
    );
};

export default React.memo(ContextMenu);
