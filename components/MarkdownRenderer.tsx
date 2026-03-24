
export default function MarkdownRenderer({ content }: { content: string }) {
    if (!content) return null;

    // Basic Markdown Parser (Upgraded)
    const renderContent = () => {
        let html = content
            // Escape HTML (but preserve > for blockquotes temporarily)
            .replace(/&/g, '&amp;').replace(/</g, '&lt;')
            // Headers
            .replace(/^### (.*$)/gim, '<h3 class="text-xl font-bold mt-6 mb-3 text-secondary-900">$1</h3>')
            .replace(/^## (.*$)/gim, '<h2 class="text-2xl font-bold mt-8 mb-4 text-secondary-900">$1</h2>')
            .replace(/^# (.*$)/gim, '<h1 class="text-3xl font-black mt-10 mb-6 text-secondary-900">$1</h1>')
            // Horizontal Rule
            .replace(/^---$/gim, '<hr class="my-8 border-t border-secondary-200" />')
            // Bold
            .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
            // Italic
            .replace(/\*(.*)\*/gim, '<em>$1</em>')
            // Blockquotes
            .replace(/^> (.*$)/gim, '<blockquote class="border-l-4 border-primary-500 pl-4 py-1 my-4 italic text-secondary-600 bg-secondary-50">$1</blockquote>')
            // Links
            .replace(/\[([^\]]+)\]\(([^)]+)\)/gim, '<a href="$2" target="_blank" class="text-primary-600 hover:underline font-medium">$1</a>')
            // Lists (Unordered)
            .replace(/^\s*-\s(.*$)/gim, '<li class="ml-4 list-disc text-secondary-700">$1</li>')
            // Lists (Ordered)
            .replace(/^\s*\d\.\s(.*$)/gim, '<li class="ml-4 list-decimal text-secondary-700">$1</li>')
            // Line Breaks -> Paragraphs (using newlines)
            .replace(/\n\n/gim, '</p><p class="mb-4 leading-relaxed text-secondary-700">')
            // Remaining newlines to br
            .replace(/\n/gim, '<br />')
            // Final escape of leftover >
            .replace(/>(?![^<]*>)/g, '&gt;');

        // Wrap in p if not starting with tag
        if (!html.startsWith('<')) {
            html = '<p class="mb-4 leading-relaxed text-secondary-700">' + html + '</p>';
        }

        return { __html: html };
    };

    return (
        <div className="prose-container max-w-none" dangerouslySetInnerHTML={renderContent()} />
    );
}
