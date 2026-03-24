
export default function MarkdownRenderer({ content }: { content: string }) {
    if (!content) return null;

    // Basic Markdown Parser (Upgraded for Professional Prose)
    const renderContent = () => {
        let html = content
            // Escape HTML (but preserve > for blockquotes temporarily)
            .replace(/&/g, '&amp;').replace(/</g, '&lt;')
            
            // Headers
            .replace(/^### (.*$)/gim, '<h3 class="text-xl font-bold mt-10 mb-4 text-secondary-900 tracking-tight">$1</h3>')
            .replace(/^## (.*$)/gim, '<h2 class="text-2xl font-black mt-12 mb-6 text-secondary-900 tracking-tight border-b border-secondary-100 pb-2">$1</h2>')
            .replace(/^# (.*$)/gim, '<h1 class="text-4xl font-black mt-14 mb-8 text-secondary-900 tracking-tighter">$1</h1>')
            
            // Horizontal Rule
            .replace(/^---$/gim, '<hr class="my-12 border-t-2 border-secondary-100" />')
            
            // Bold
            .replace(/\*\*(.*)\*\*/gim, '<strong class="font-bold text-secondary-900">$1</strong>')
            
            // Italic
            .replace(/\*(.*)\*/gim, '<em class="italic text-secondary-800">$1</em>')
            
            // Blockquotes
            .replace(/^> (.*$)/gim, '<blockquote class="border-l-4 border-primary-500 pl-6 py-4 my-8 italic text-lg text-secondary-700 bg-primary-50/30 rounded-r-lg font-medium leading-relaxed">$1</blockquote>')
            
            // Links
            .replace(/\[([^\]]+)\]\(([^)]+)\)/gim, '<a href="$2" target="_blank" class="text-primary-600 hover:text-primary-700 underline decoration-primary-200 underline-offset-4 font-semibold transition-colors">$1</a>')
            
            // Lists (Unordered)
            .replace(/^\s*-\s(.*$)/gim, '<li class="ml-6 list-disc text-secondary-700 mb-2 leading-relaxed">$1</li>')
            
            // Lists (Ordered)
            .replace(/^\s*\d\.\s(.*$)/gim, '<li class="ml-6 list-decimal text-secondary-700 mb-2 leading-relaxed">$1</li>')
            
            // Line Breaks -> Paragraphs (using newlines)
            .replace(/\n\n/gim, '</p><p class="mb-6 leading-loose text-secondary-700 text-lg">')
            
            // Remaining newlines to br
            .replace(/\n/gim, '<br />')
            
            // Final escape of leftover >
            .replace(/>(?![^<]*>)/g, '&gt;');

        // Wrap in p if not starting with tag
        if (!html.startsWith('<')) {
            html = '<p class="mb-6 leading-loose text-secondary-700 text-lg">' + html + '</p>';
        }

        return { __html: html };
    };

    return (
        <div className="prose-container max-w-none antialiased" dangerouslySetInnerHTML={renderContent()} />
    );
}
