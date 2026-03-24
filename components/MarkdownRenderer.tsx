
export default function MarkdownRenderer({ content }: { content: string }) {
    if (!content) return null;

    const renderContent = () => {
        let lines = content.split('\n');
        let html = '';
        let paragraphBuffer: string[] = [];
        let listBuffer: string[] = [];
        let activeListType: 'ul' | 'ol' | null = null;

        const flushParagraph = () => {
            if (paragraphBuffer.length > 0) {
                html += `<p class="mb-6 leading-loose text-secondary-700 text-lg">${paragraphBuffer.join(' ')}</p>`;
                paragraphBuffer = [];
            }
        };

        const flushList = () => {
            if (listBuffer.length > 0 && activeListType) {
                const listClass = activeListType === 'ul' ? 'list-disc' : 'list-decimal';
                html += `<${activeListType} class="mb-8 ml-6 space-y-2 text-secondary-700 text-lg leading-relaxed ${listClass}">
                    ${listBuffer.join('')}
                </${activeListType}>`;
                listBuffer = [];
                activeListType = null;
            }
        };

        lines.forEach(line => {
            const trimmed = line.trim();
            
            // Check for list items
            const ulMatch = trimmed.startsWith('- ') || trimmed.startsWith('* ');
            const olMatch = /^\d+\.\s/.test(trimmed);

            if (ulMatch || olMatch) {
                flushParagraph();
                const type = ulMatch ? 'ul' : 'ol';
                if (activeListType && activeListType !== type) flushList();
                activeListType = type;
                const content = trimmed.replace(ulMatch ? /^[-*]\s/ : /^\d+\.\s/, '');
                listBuffer.push(`<li>${content}</li>`);
            } else if (trimmed.startsWith('#') || trimmed === '---' || trimmed.startsWith('> ')) {
                flushParagraph();
                flushList();
                
                if (trimmed.startsWith('### ')) html += `<h3 class="text-xl font-bold mt-10 mb-4 text-secondary-900 tracking-tight">${trimmed.replace('### ', '')}</h3>`;
                else if (trimmed.startsWith('## ')) html += `<h2 class="text-2xl font-black mt-12 mb-6 text-secondary-900 tracking-tight border-b border-secondary-100 pb-2">${trimmed.replace('## ', '')}</h2>`;
                else if (trimmed.startsWith('# ')) html += `<h1 class="text-4xl font-black mt-14 mb-8 text-secondary-900 tracking-tighter">${trimmed.replace('# ', '')}</h1>`;
                else if (trimmed === '---') html += '<hr class="my-12 border-t-2 border-secondary-100" />';
                else if (trimmed.startsWith('> ')) html += `<blockquote class="border-l-4 border-primary-500 pl-6 py-4 my-8 italic text-lg text-secondary-700 bg-primary-50/30 rounded-r-lg font-medium leading-relaxed">${trimmed.replace('> ', '')}</blockquote>`;
            } else if (trimmed === '') {
                flushParagraph();
                flushList();
            } else {
                flushList();
                const processed = trimmed
                    .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-secondary-900">$1</strong>')
                    .replace(/\*(.*?)\*/g, '<em class="italic text-secondary-800">$1</em>')
                    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" class="text-primary-600 hover:text-primary-700 underline decoration-primary-200 underline-offset-4 font-semibold transition-colors">$1</a>');
                paragraphBuffer.push(processed);
            }
        });

        flushParagraph();
        flushList();

        return { __html: html };
    };

    return (
        <div className="prose-container max-w-none antialiased" dangerouslySetInnerHTML={renderContent()} />
    );
}
