'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import MarkdownRenderer from './MarkdownRenderer';

interface HistoryState {
    value: string;
    selectionStart: number;
    selectionEnd: number;
}

export default function MarkdownEditor({ name, placeholder, required, defaultValue = '' }: { name: string, placeholder?: string, required?: boolean, defaultValue?: string }) {
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const [value, setValue] = useState(defaultValue);
    const [history, setHistory] = useState<HistoryState[]>([]);
    const [historyIndex, setHistoryIndex] = useState(-1);
    const [isPreview, setIsPreview] = useState(false);

    // Initial history
    useEffect(() => {
        if (defaultValue && history.length === 0) {
            const initial = { value: defaultValue, selectionStart: 0, selectionEnd: 0 };
            setHistory([initial]);
            setHistoryIndex(0);
        }
    }, [defaultValue, history.length]);

    const pushToHistory = useCallback((newValue: string, start: number, end: number) => {
        const newState = { value: newValue, selectionStart: start, selectionEnd: end };
        const newHistory = history.slice(0, historyIndex + 1);
        newHistory.push(newState);
        
        // Limit history size to 50
        if (newHistory.length > 50) newHistory.shift();
        
        setHistory(newHistory);
        setHistoryIndex(newHistory.length - 1);
        setValue(newValue);
    }, [history, historyIndex]);

    const undo = useCallback(() => {
        if (historyIndex > 0) {
            const prevState = history[historyIndex - 1];
            setHistoryIndex(historyIndex - 1);
            setValue(prevState.value);
            setTimeout(() => {
                if (textareaRef.current) {
                    textareaRef.current.focus();
                    textareaRef.current.setSelectionRange(prevState.selectionStart, prevState.selectionEnd);
                }
            }, 0);
        }
    }, [history, historyIndex]);

    const redo = useCallback(() => {
        if (historyIndex < history.length - 1) {
            const nextState = history[historyIndex + 1];
            setHistoryIndex(historyIndex + 1);
            setValue(nextState.value);
            setTimeout(() => {
                if (textareaRef.current) {
                    textareaRef.current.focus();
                    textareaRef.current.setSelectionRange(nextState.selectionStart, nextState.selectionEnd);
                }
            }, 0);
        }
    }, [history, historyIndex]);

    const insertText = (before: string, after: string = '', isBlock: boolean = false) => {
        const el = textareaRef.current;
        if (!el) return;

        const start = el.selectionStart;
        const end = el.selectionEnd;
        const selection = value.substring(start, end);

        let prefix = before;
        let suffix = after;

        // If it's a block element (like H2, List) and not at start of line, add a newline
        if (isBlock && start > 0 && value[start - 1] !== '\n') {
            prefix = '\n' + before;
        }

        const newValue = value.substring(0, start) + prefix + selection + suffix + value.substring(end);
        pushToHistory(newValue, start + prefix.length, end + prefix.length);

        el.focus();
        // Use timeout to ensure state update has propagated to DOM before setting selection
        setTimeout(() => {
            el.setSelectionRange(start + prefix.length, end + prefix.length);
        }, 0);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if ((e.ctrlKey || e.metaKey) && !e.shiftKey) {
            if (e.key === 'b') {
                e.preventDefault();
                insertText('**', '**');
            } else if (e.key === 'i') {
                e.preventDefault();
                insertText('*', '*');
            } else if (e.key === 'z') {
                e.preventDefault();
                undo();
            }
        } else if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'Z') {
            e.preventDefault();
            redo();
        } else if (e.key === 'Tab') {
            e.preventDefault();
            insertText('    ');
        }
    };

    const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
        const html = e.clipboardData.getData('text/html');
        if (!html) return; // Fall back to default behavior

        e.preventDefault();
        
        // Basic HTML -> Markdown converter
        let markdown = html
            .replace(/<(strong|b)[^>]*>(.*?)<\/\1>/gi, '**$2**')
            .replace(/<(em|i)[^>]*>(.*?)<\/\1>/gi, '*$2*')
            .replace(/<h1[^>]*>(.*?)<\/h1>/gi, '# $1\n\n')
            .replace(/<h2[^>]*>(.*?)<\/h2>/gi, '## $1\n\n')
            .replace(/<h3[^>]*>(.*?)<\/h3>/gi, '### $1\n\n')
            .replace(/<li[^>]*>(.*?)<\/li>/gi, '- $1\n')
            .replace(/<p[^>]*>(.*?)<\/p>/gi, '$1\n\n')
            .replace(/<br[^>]*>/gi, '\n')
            .replace(/<[^>]+>/g, ''); // Strip remaining tags
            
        // Decode common HTML entities
        markdown = markdown
            .replace(/&nbsp;/g, ' ')
            .replace(/&amp;/g, '&')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&quot;/g, '"')
            .replace(/&#39;/g, "'");

        const el = textareaRef.current;
        if (!el) return;

        const start = el.selectionStart;
        const end = el.selectionEnd;
        const newValue = value.substring(0, start) + markdown + value.substring(end);
        
        pushToHistory(newValue, start + markdown.length, start + markdown.length);
    };

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newValue = e.target.value;
        setValue(newValue);
        // We don't push every character to history to avoid bloat,
        // but we should push on space or newline
        if (newValue.endsWith(' ') || newValue.endsWith('\n')) {
            pushToHistory(newValue, e.target.selectionStart, e.target.selectionEnd);
        }
    };

    return (
        <div className="border border-slate-200 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-primary-500/20 focus-within:border-primary-500 transition-all shadow-sm">
            {/* Tab Switcher */}
            <div className="flex items-center gap-1 bg-white border-b border-slate-100 p-1">
                <button 
                    type="button" 
                    onClick={() => setIsPreview(false)}
                    className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${!isPreview ? 'bg-primary-50 text-primary-700' : 'text-slate-500 hover:bg-slate-50'}`}
                >
                    Write
                </button>
                <button 
                    type="button" 
                    onClick={() => setIsPreview(true)}
                    className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${isPreview ? 'bg-primary-50 text-primary-700' : 'text-slate-500 hover:bg-slate-50'}`}
                >
                    Preview
                </button>
            </div>

            {/* Toolbar */}
            {!isPreview && (
                <div className="flex flex-wrap items-center gap-1 bg-slate-50 border-b border-slate-200 p-1.5">
                    <div className="flex items-center gap-0.5 mr-2">
                        <button type="button" onClick={undo} disabled={historyIndex <= 0} className="p-2 hover:bg-white hover:shadow-sm disabled:opacity-30 rounded-lg transition-all" title="Undo (Ctrl+Z)">
                            <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" /></svg>
                        </button>
                        <button type="button" onClick={redo} disabled={historyIndex >= history.length - 1} className="p-2 hover:bg-white hover:shadow-sm disabled:opacity-30 rounded-lg transition-all" title="Redo (Ctrl+Shift+Z)">
                            <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 10H11a8 8 0 00-8 8v2m18-10l-6 6m6-6l-6-6" /></svg>
                        </button>
                    </div>

                    <div className="w-px h-6 bg-slate-200 mx-1"></div>

                    <button type="button" onClick={() => insertText('**', '**')} className="p-2 hover:bg-white hover:shadow-sm rounded-lg transition-all" title="Bold (Ctrl+B)">
                        <svg className="w-4 h-4 text-slate-700 font-bold" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 4h8a4 4 0 014 4 4 4 0 01-4 4H6zM6 12h9a4 4 0 014 4 4 4 0 01-4 4H6z" /></svg>
                    </button>
                    <button type="button" onClick={() => insertText('*', '*')} className="p-2 hover:bg-white hover:shadow-sm rounded-lg transition-all" title="Italic (Ctrl+I)">
                        <svg className="w-4 h-4 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 20l4-16m-9 16h5m1-16h5" /></svg>
                    </button>

                    <div className="w-px h-6 bg-slate-200 mx-1"></div>

                    <button type="button" onClick={() => insertText('# ', '', true)} className="p-2 hover:bg-white hover:shadow-sm rounded-lg transition-all text-xs font-black text-slate-700" title="Heading 1">H1</button>
                    <button type="button" onClick={() => insertText('## ', '', true)} className="p-2 hover:bg-white hover:shadow-sm rounded-lg transition-all text-xs font-bold text-slate-700" title="Heading 2">H2</button>
                    <button type="button" onClick={() => insertText('### ', '', true)} className="p-2 hover:bg-white hover:shadow-sm rounded-lg transition-all text-xs font-semibold text-slate-700" title="Heading 3">H3</button>

                    <div className="w-px h-6 bg-slate-200 mx-1"></div>

                    <button type="button" onClick={() => insertText('- ', '', true)} className="p-2 hover:bg-white hover:shadow-sm rounded-lg transition-all" title="Bullet List">
                        <svg className="w-4 h-4 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h16M4 6h.01M4 12h.01M4 18h.01" /></svg>
                    </button>
                    <button type="button" onClick={() => insertText('1. ', '', true)} className="p-2 hover:bg-white hover:shadow-sm rounded-lg transition-all" title="Numbered List">
                        <svg className="w-4 h-4 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M7 8h13M7 12h13M7 16h13M3 8h.01M3 12h.01M3 16h.01" /></svg>
                    </button>
                    <button type="button" onClick={() => insertText('> ', '', true)} className="p-2 hover:bg-white hover:shadow-sm rounded-lg transition-all" title="Blockquote">
                        <svg className="w-4 h-4 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 11V6m0 8h.01M19 10a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    </button>

                    <div className="w-px h-6 bg-slate-200 mx-1"></div>

                    <button type="button" onClick={() => insertText('[', '](https://)', false)} className="p-2 hover:bg-white hover:shadow-sm rounded-lg transition-all" title="Link">
                        <svg className="w-4 h-4 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
                    </button>
                    <button type="button" onClick={() => insertText('![alt text](', ')', false)} className="p-2 hover:bg-white hover:shadow-sm rounded-lg transition-all" title="Image">
                        <svg className="w-4 h-4 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    </button>
                    <button type="button" onClick={() => insertText('---', '', true)} className="p-2 hover:bg-white hover:shadow-sm rounded-lg transition-all" title="Horizontal Rule">
                        <svg className="w-4 h-4 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 12h16" /></svg>
                    </button>
                </div>
            )}

            <div className="relative">
                {isPreview ? (
                    <div className="w-full px-10 py-8 min-h-[500px] overflow-y-auto bg-white article-preview-container">
                        <MarkdownRenderer content={value} />
                    </div>
                ) : (
                    <textarea
                        ref={textareaRef}
                        name={name}
                        required={required}
                        value={value}
                        onChange={handleChange}
                        onKeyDown={handleKeyDown}
                        onPaste={handlePaste}
                        className="w-full px-5 py-4 min-h-[500px] outline-none resize-y font-mono text-[14px] leading-relaxed text-slate-800 selection:bg-primary-100 placeholder:text-slate-300"
                        placeholder={placeholder}
                    />
                )}
            </div>
            
            {/* Footer / Stats */}
            
            {/* Footer / Stats */}
            <div className="bg-slate-50 border-t border-slate-100 px-4 py-2 flex justify-between items-center text-[10px] text-slate-400 font-medium uppercase tracking-wider">
                <div className="flex gap-4">
                    <span>{value.length} characters</span>
                    <span>{value.trim() ? value.trim().split(/\s+/).length : 0} words</span>
                </div>
                <div className="flex gap-2 items-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary-500 animate-pulse"></span>
                    <span>Markdown Enabled</span>
                </div>
            </div>
        </div>
    );
}
