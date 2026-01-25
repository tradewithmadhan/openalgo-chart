/**
 * PineScriptEditor - Bottom panel code editor for Pine Script
 * Similar to TradingView's Pine Editor
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Editor, { loader, OnMount } from '@monaco-editor/react';
import type { editor } from 'monaco-editor';
import {
    X,
    Play,
    Save,
    FileText,
    ChevronDown,
    ChevronUp,
    AlertCircle,
    Check,
    Trash2,
    Plus,
    Settings,
    Code2,
    Copy,
} from 'lucide-react';
import styles from './PineScriptEditor.module.css';
import {
    registerPineScriptLanguage,
    PINE_SCRIPT_LANGUAGE_ID,
    DEFAULT_PINE_SCRIPT,
    PINE_TEMPLATES,
} from './pineScriptLanguage';
import { pineScriptService, PineScriptInput } from '../../services/pineScriptService';
import { logger } from '../../utils/logger';

// Storage key for saved scripts
const STORAGE_KEY = 'openalgo_pine_scripts';
const CURRENT_SCRIPT_KEY = 'openalgo_pine_current';
const EDITOR_HEIGHT_KEY = 'openalgo_pine_editor_height';

interface SavedScript {
    id: string;
    name: string;
    code: string;
    createdAt: number;
    updatedAt: number;
}

interface ValidationResult {
    valid: boolean;
    errors: string[];
    warnings: string[];
}

export interface PineScriptEditorProps {
    isOpen: boolean;
    onClose: () => void;
    onAddToChart: (code: string, inputs: PineScriptInput[]) => void;
    onOpenSettings?: (inputs: PineScriptInput[]) => void;
}

const PineScriptEditor: React.FC<PineScriptEditorProps> = ({
    isOpen,
    onClose,
    onAddToChart,
    onOpenSettings,
}) => {
    // Editor state
    const [code, setCode] = useState<string>(DEFAULT_PINE_SCRIPT);
    const [scriptName, setScriptName] = useState<string>('Untitled');
    const [currentScriptId, setCurrentScriptId] = useState<string | null>(null);
    const [isDirty, setIsDirty] = useState<boolean>(false);

    // UI state
    const [editorHeight, setEditorHeight] = useState<number>(300);
    const [isMinimized, setIsMinimized] = useState<boolean>(false);
    const [showScriptMenu, setShowScriptMenu] = useState<boolean>(false);
    const [showTemplateMenu, setShowTemplateMenu] = useState<boolean>(false);

    // Validation state
    const [validation, setValidation] = useState<ValidationResult>({
        valid: true,
        errors: [],
        warnings: [],
    });
    const [parsedInputs, setParsedInputs] = useState<PineScriptInput[]>([]);

    // Saved scripts
    const [savedScripts, setSavedScripts] = useState<SavedScript[]>([]);

    // Refs
    const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const resizeRef = useRef<HTMLDivElement>(null);
    const isResizing = useRef<boolean>(false);

    // Load saved scripts from localStorage
    useEffect(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                setSavedScripts(JSON.parse(saved));
            }

            // Load current script
            const current = localStorage.getItem(CURRENT_SCRIPT_KEY);
            if (current) {
                const parsed = JSON.parse(current);
                setCode(parsed.code || DEFAULT_PINE_SCRIPT);
                setScriptName(parsed.name || 'Untitled');
                setCurrentScriptId(parsed.id || null);
            }

            // Load editor height
            const height = localStorage.getItem(EDITOR_HEIGHT_KEY);
            if (height) {
                setEditorHeight(parseInt(height, 10));
            }
        } catch (e) {
            logger.error('Failed to load Pine Script data:', e);
        }
    }, []);

    // Save current script to localStorage when changed
    useEffect(() => {
        try {
            localStorage.setItem(
                CURRENT_SCRIPT_KEY,
                JSON.stringify({
                    id: currentScriptId,
                    name: scriptName,
                    code,
                })
            );
        } catch (e) {
            logger.error('Failed to save current script:', e);
        }
    }, [code, scriptName, currentScriptId]);

    // Validate code on change
    useEffect(() => {
        const result = pineScriptService.validate(code);
        setValidation(result);

        // Parse inputs
        const inputs = pineScriptService.parseInputs(code);
        setParsedInputs(inputs);

        // Extract indicator name
        const info = pineScriptService.extractIndicatorInfo(code);
        if (info.name && info.name !== 'Custom Indicator' && !currentScriptId) {
            setScriptName(info.name);
        }
    }, [code, currentScriptId]);

    // Handle Monaco editor mount
    const handleEditorMount: OnMount = useCallback((editor, monaco) => {
        editorRef.current = editor;

        // Register Pine Script language
        registerPineScriptLanguage(monaco);

        // Set theme
        monaco.editor.setTheme('pine-dark');

        // Focus editor
        editor.focus();
    }, []);

    // Handle code change
    const handleCodeChange = useCallback((value: string | undefined) => {
        setCode(value || '');
        setIsDirty(true);
    }, []);

    // Handle resize
    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!isResizing.current) return;

            const container = containerRef.current;
            if (!container) return;

            const rect = container.getBoundingClientRect();
            const newHeight = rect.bottom - e.clientY;
            const clampedHeight = Math.max(150, Math.min(600, newHeight));

            setEditorHeight(clampedHeight);
        };

        const handleMouseUp = () => {
            if (isResizing.current) {
                isResizing.current = false;
                document.body.style.cursor = '';
                document.body.style.userSelect = '';

                // Save height
                localStorage.setItem(EDITOR_HEIGHT_KEY, editorHeight.toString());
            }
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [editorHeight]);

    const startResize = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        isResizing.current = true;
        document.body.style.cursor = 'ns-resize';
        document.body.style.userSelect = 'none';
    }, []);

    // Script actions
    const handleNew = useCallback(() => {
        setCode(DEFAULT_PINE_SCRIPT);
        setScriptName('Untitled');
        setCurrentScriptId(null);
        setIsDirty(false);
        setShowScriptMenu(false);
    }, []);

    const handleSave = useCallback(() => {
        const now = Date.now();
        const script: SavedScript = {
            id: currentScriptId || `script_${now}`,
            name: scriptName,
            code,
            createdAt: currentScriptId
                ? savedScripts.find((s) => s.id === currentScriptId)?.createdAt || now
                : now,
            updatedAt: now,
        };

        const updated = currentScriptId
            ? savedScripts.map((s) => (s.id === currentScriptId ? script : s))
            : [...savedScripts, script];

        setSavedScripts(updated);
        setCurrentScriptId(script.id);
        setIsDirty(false);

        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        } catch (e) {
            logger.error('Failed to save script:', e);
        }
    }, [code, scriptName, currentScriptId, savedScripts]);

    const handleLoadScript = useCallback((script: SavedScript) => {
        setCode(script.code);
        setScriptName(script.name);
        setCurrentScriptId(script.id);
        setIsDirty(false);
        setShowScriptMenu(false);
    }, []);

    const handleDeleteScript = useCallback(
        (scriptId: string, e: React.MouseEvent) => {
            e.stopPropagation();
            const updated = savedScripts.filter((s) => s.id !== scriptId);
            setSavedScripts(updated);

            if (currentScriptId === scriptId) {
                handleNew();
            }

            try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
            } catch (e) {
                logger.error('Failed to delete script:', e);
            }
        },
        [savedScripts, currentScriptId, handleNew]
    );

    const handleLoadTemplate = useCallback((templateKey: string) => {
        const template = PINE_TEMPLATES[templateKey as keyof typeof PINE_TEMPLATES];
        if (template) {
            setCode(template.code);
            setScriptName(template.name);
            setCurrentScriptId(null);
            setIsDirty(true);
        }
        setShowTemplateMenu(false);
    }, []);

    const handleAddToChart = useCallback(() => {
        if (!validation.valid) {
            return;
        }
        onAddToChart(code, parsedInputs);
    }, [code, parsedInputs, validation.valid, onAddToChart]);

    const handleOpenSettings = useCallback(() => {
        if (onOpenSettings && parsedInputs.length > 0) {
            onOpenSettings(parsedInputs);
        }
    }, [parsedInputs, onOpenSettings]);

    const handleCopyCode = useCallback(() => {
        navigator.clipboard.writeText(code).catch((e) => {
            logger.error('Failed to copy code:', e);
        });
    }, [code]);

    // Close menus on outside click
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (showScriptMenu || showTemplateMenu) {
                setShowScriptMenu(false);
                setShowTemplateMenu(false);
            }
        };

        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, [showScriptMenu, showTemplateMenu]);

    if (!isOpen) return null;

    return (
        <div
            ref={containerRef}
            className={styles.container}
            style={{ height: isMinimized ? 40 : editorHeight + 80 }}
        >
            {/* Resize handle */}
            <div ref={resizeRef} className={styles.resizeHandle} onMouseDown={startResize}>
                <div className={styles.resizeGrip} />
            </div>

            {/* Header */}
            <div className={styles.header}>
                <div className={styles.headerLeft}>
                    <Code2 size={16} className={styles.headerIcon} />
                    <span className={styles.title}>Pine Editor</span>
                    <span className={styles.scriptName}>
                        {scriptName}
                        {isDirty && <span className={styles.dirtyIndicator}>*</span>}
                    </span>
                </div>

                <div className={styles.headerActions}>
                    {/* New button */}
                    <button className={styles.actionBtn} onClick={handleNew} title="New Script">
                        <Plus size={14} />
                    </button>

                    {/* Open menu */}
                    <div className={styles.dropdownContainer}>
                        <button
                            className={styles.actionBtn}
                            onClick={(e) => {
                                e.stopPropagation();
                                setShowScriptMenu(!showScriptMenu);
                                setShowTemplateMenu(false);
                            }}
                            title="Open Script"
                        >
                            <FileText size={14} />
                            <ChevronDown size={12} />
                        </button>
                        {showScriptMenu && (
                            <div className={styles.dropdown} onClick={(e) => e.stopPropagation()}>
                                <div className={styles.dropdownHeader}>Saved Scripts</div>
                                {savedScripts.length === 0 ? (
                                    <div className={styles.dropdownEmpty}>No saved scripts</div>
                                ) : (
                                    savedScripts.map((script) => (
                                        <div
                                            key={script.id}
                                            className={styles.dropdownItem}
                                            onClick={() => handleLoadScript(script)}
                                        >
                                            <span>{script.name}</span>
                                            <button
                                                className={styles.deleteBtn}
                                                onClick={(e) => handleDeleteScript(script.id, e)}
                                                title="Delete"
                                            >
                                                <Trash2 size={12} />
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}
                    </div>

                    {/* Templates menu */}
                    <div className={styles.dropdownContainer}>
                        <button
                            className={styles.actionBtn}
                            onClick={(e) => {
                                e.stopPropagation();
                                setShowTemplateMenu(!showTemplateMenu);
                                setShowScriptMenu(false);
                            }}
                            title="Templates"
                        >
                            Templates
                            <ChevronDown size={12} />
                        </button>
                        {showTemplateMenu && (
                            <div className={styles.dropdown} onClick={(e) => e.stopPropagation()}>
                                <div className={styles.dropdownHeader}>Built-in Templates</div>
                                {Object.entries(PINE_TEMPLATES).map(([key, template]) => (
                                    <div
                                        key={key}
                                        className={styles.dropdownItem}
                                        onClick={() => handleLoadTemplate(key)}
                                    >
                                        {template.name}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Save button */}
                    <button className={styles.actionBtn} onClick={handleSave} title="Save Script">
                        <Save size={14} />
                    </button>

                    {/* Copy button */}
                    <button className={styles.actionBtn} onClick={handleCopyCode} title="Copy Code">
                        <Copy size={14} />
                    </button>

                    <div className={styles.separator} />

                    {/* Add to Chart button */}
                    <button
                        className={`${styles.actionBtn} ${styles.primaryBtn}`}
                        onClick={handleAddToChart}
                        disabled={!validation.valid}
                        title="Add to Chart"
                    >
                        <Play size={14} />
                        Add to Chart
                    </button>

                    {/* Settings button */}
                    {parsedInputs.length > 0 && (
                        <button
                            className={styles.actionBtn}
                            onClick={handleOpenSettings}
                            title="Indicator Settings"
                        >
                            <Settings size={14} />
                        </button>
                    )}

                    <div className={styles.separator} />

                    {/* Minimize/Maximize */}
                    <button
                        className={styles.actionBtn}
                        onClick={() => setIsMinimized(!isMinimized)}
                        title={isMinimized ? 'Expand' : 'Collapse'}
                    >
                        {isMinimized ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>

                    {/* Close button */}
                    <button className={styles.actionBtn} onClick={onClose} title="Close">
                        <X size={14} />
                    </button>
                </div>
            </div>

            {/* Editor */}
            {!isMinimized && (
                <>
                    <div className={styles.editorContainer} style={{ height: editorHeight }}>
                        <Editor
                            height="100%"
                            language={PINE_SCRIPT_LANGUAGE_ID}
                            value={code}
                            onChange={handleCodeChange}
                            onMount={handleEditorMount}
                            theme="pine-dark"
                            options={{
                                minimap: { enabled: false },
                                fontSize: 13,
                                lineNumbers: 'on',
                                scrollBeyondLastLine: false,
                                wordWrap: 'on',
                                automaticLayout: true,
                                tabSize: 4,
                                insertSpaces: true,
                                folding: true,
                                renderWhitespace: 'selection',
                                scrollbar: {
                                    vertical: 'auto',
                                    horizontal: 'auto',
                                    verticalScrollbarSize: 10,
                                    horizontalScrollbarSize: 10,
                                },
                            }}
                            loading={<div className={styles.loading}>Loading editor...</div>}
                        />
                    </div>

                    {/* Status bar */}
                    <div className={styles.statusBar}>
                        <div className={styles.statusLeft}>
                            {validation.valid ? (
                                <span className={styles.statusSuccess}>
                                    <Check size={12} />
                                    Ready
                                </span>
                            ) : (
                                <span className={styles.statusError}>
                                    <AlertCircle size={12} />
                                    {validation.errors[0]}
                                </span>
                            )}
                            {validation.warnings.length > 0 && (
                                <span className={styles.statusWarning}>
                                    {validation.warnings[0]}
                                </span>
                            )}
                        </div>
                        <div className={styles.statusRight}>
                            {parsedInputs.length > 0 && (
                                <span className={styles.statusInfo}>
                                    {parsedInputs.length} input{parsedInputs.length !== 1 ? 's' : ''}
                                </span>
                            )}
                            <span className={styles.statusInfo}>Pine Script v5</span>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default PineScriptEditor;
