'use client';

import { useState, KeyboardEvent } from 'react';

export default function TagInput({ name, defaultValue = [] }: { name: string, defaultValue?: string[] }) {
    const [tags, setTags] = useState<string[]>(defaultValue || []);
    const [input, setInput] = useState('');

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            addTag();
        } else if (e.key === 'Backspace' && !input && tags.length > 0) {
            removeTag(tags.length - 1);
        }
    };

    const addTag = () => {
        const trimmed = input.trim().toLowerCase();
        if (trimmed && !tags.includes(trimmed)) {
            setTags([...tags, trimmed]);
            setInput('');
        }
    };

    const removeTag = (index: number) => {
        setTags(tags.filter((_, i) => i !== index));
    };

    return (
        <div>
            <div className="flex flex-wrap gap-2 p-2 border border-slate-300 rounded-lg focus-within:ring-2 focus-within:ring-primary-500 bg-white">
                {tags.map((tag, index) => (
                    <span key={index} className="bg-primary-50 text-primary-700 px-2 py-1 rounded-md text-sm font-medium flex items-center gap-1">
                        #{tag}
                        <button type="button" onClick={() => removeTag(index)} className="hover:text-primary-900">×</button>
                    </span>
                ))}
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onBlur={addTag}
                    className="flex-grow outline-none min-w-[120px] text-sm py-1"
                    placeholder="Add tags..."
                />
            </div>
            {/* Hidden input to submit values */}
            <input type="hidden" name={name} value={tags.join(',')} />
            <p className="text-xs text-slate-400 mt-1">Press Enter or Comma to add tags</p>
        </div>
    );
}
