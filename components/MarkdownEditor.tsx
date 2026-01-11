'use client';

import { useRef } from 'react';

export default function MarkdownEditor({ name, placeholder, required, defaultValue }: { name: string, placeholder?: string, required?: boolean, defaultValue?: string }) {
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const insertText = (before: string, after: string = '') => {
        const el = textareaRef.current;
        if (!el) return;

        const start = el.selectionStart;
        const end = el.selectionEnd;
        const text = el.value;
        const selection = text.substring(start, end);

        const newText = text.substring(0, start) + before + selection + after + text.substring(end);

        el.value = newText;
        el.focus();
        el.setSelectionRange(start + before.length, end + before.length);
    };

    return (
        <div className="border border-slate-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-primary-500 focus-within:border-primary-500">
            {/* Toolbar */}
            <div className="flex items-center gap-1 bg-slate-50 border-b border-slate-200 p-2">
                <button type="button" onClick={() => insertText('**', '**')} className="p-1 hover:bg-slate-200 rounded font-bold w-8" title="Bold">B</button>
                <button type="button" onClick={() => insertText('*', '*')} className="p-1 hover:bg-slate-200 rounded italic w-8" title="Italic">I</button>
                <div className="w-px h-4 bg-slate-300 mx-1"></div>
                <button type="button" onClick={() => insertText('### ')} className="p-1 hover:bg-slate-200 rounded font-bold text-sm px-2" title="Heading 3">H3</button>
                <button type="button" onClick={() => insertText('## ')} className="p-1 hover:bg-slate-200 rounded font-bold text-lg px-2" title="Heading 2">H2</button>
                <div className="w-px h-4 bg-slate-300 mx-1"></div>
                <button type="button" onClick={() => insertText('- ')} className="p-1 hover:bg-slate-200 rounded px-2" title="Bullet List">• List</button>
                <button type="button" onClick={() => insertText('1. ')} className="p-1 hover:bg-slate-200 rounded px-2" title="Numbered List">1. List</button>
                <div className="w-px h-4 bg-slate-300 mx-1"></div>
                <button type="button" onClick={() => insertText('[', '](url)')} className="p-1 hover:bg-slate-200 rounded px-2" title="Link">Link</button>
            </div>

            <textarea
                ref={textareaRef}
                name={name}
                required={required}
                defaultValue={defaultValue}
                className="w-full px-4 py-3 min-h-[400px] outline-none resize-y font-mono text-sm"
                placeholder={placeholder}
            />
        </div>
    );
}
