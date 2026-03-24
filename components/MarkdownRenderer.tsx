
export default function MarkdownRenderer({ content }: { content: string }) {
    if (!content) return null;

    // Improved Markdown Parser (Safer Tag Handling)
    const renderContent = () => {
        // First, handle block elements line-by-line
        let lines = content.split('\n');
        let inList = false;
        let inOrderedList = false;

        const processedLines = lines.map(line => {
            let processed = line.trim();
            
            // Headers
            if (processed.startsWith('### ')) return `<h3 class="text-xl font-bold mt-10 mb-4 text-secondary-900 tracking-tight">${processed.replace('### ', '')}</h3>`;
            if (processed.startsWith('## ')) return `<h2 class="text-2xl font-black mt-12 mb-6 text-secondary-900 tracking-tight border-b border-secondary-100 pb-2">${processed.replace('## ', '')}</h2>`;
            if (processed.startsWith('# ')) return `<h1 class="text-4xl font-black mt-14 mb-8 text-secondary-900 tracking-tighter">${processed.replace('# ', '')}</h1>`;
            
            // Horizontal Rule
            if (processed === '---') return '<hr class="my-12 border-t-2 border-secondary-100" />';
            
            // Blockquotes
            if (processed.startsWith('> ')) return `<blockquote class="border-l-4 border-primary-500 pl-6 py-4 my-8 italic text-lg text-secondary-700 bg-primary-50/30 rounded-r-lg font-medium leading-relaxed">${processed.replace('> ', '')}</blockquote>`;
            
            // Unordered Lists
            if (processed.startsWith('- ')) return `<li class="ml-6 list-disc text-secondary-700 mb-2 leading-relaxed">${processed.replace('- ', '')}</li>`;
            
            // Ordered Lists
            if (/^\d+\.\s/.test(processed)) return `<li class="ml-6 list-decimal text-secondary-700 mb-2 leading-relaxed">${processed.replace(/^\d+\.\s/, '')}</li>`;

            // Plain text (will be grouped into paragraphs later)
            if (processed === '') return '';
            
            // Inline styling
            return processed
                .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-secondary-900">$1</strong>')
                .replace(/\*(.*?)\*/g, '<em class="italic text-secondary-800">$1</em>')
                .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" class="text-primary-600 hover:text-primary-700 underline decoration-primary-200 underline-offset-4 font-semibold transition-colors">$1</a>');
        });

        // Group consecutive inline elements into paragraphs
        let html = '';
        let paragraphBuffer: string[] = [];

        processedLines.forEach(line => {
            if (line === '') {
                if (paragraphBuffer.length > 0) {
                    html += `<p class="mb-6 leading-loose text-secondary-700 text-lg">${paragraphBuffer.join(' ')}</p>`;
                    paragraphBuffer = [];
                }
            } else if (line.startsWith('<')) {
                // If we hit a block element, flush the paragraph buffer first
                if (paragraphBuffer.length > 0) {
                    html += `<p class="mb-6 leading-loose text-secondary-700 text-lg">${paragraphBuffer.join(' ')}</p>`;
                    paragraphBuffer = [];
                }
                html += line;
            } else {
                paragraphBuffer.push(line);
            }
        });

        // Final flush
        if (paragraphBuffer.length > 0) {
            html += `<p class="mb-6 leading-loose text-secondary-700 text-lg">${paragraphBuffer.join(' ')}</p>`;
        }

        return { __html: html };
    };

    return (
        <div className="prose-container max-w-none antialiased" dangerouslySetInnerHTML={renderContent()} />
    );
}
