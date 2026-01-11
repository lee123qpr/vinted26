
export default function MarkdownRenderer({ content }: { content: string }) {
    if (!content) return null;

    // VERY Basic Markdown Parser for display (Production should use react-markdown)
    const renderContent = () => {
        let html = content
            // Escape HTML
            .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
            // Headers
            .replace(/^### (.*$)/gim, '<h3 class="text-xl font-bold mt-6 mb-3 text-secondary-900">$1</h3>')
            .replace(/^## (.*$)/gim, '<h2 class="text-2xl font-bold mt-8 mb-4 text-secondary-900">$1</h2>')
            .replace(/^# (.*$)/gim, '<h1 class="text-3xl font-black mt-10 mb-6 text-secondary-900">$1</h1>')
            // Bold
            .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
            .replace(/__(.*)__/gim, '<strong>$1</strong>')
            // Italic
            .replace(/\*(.*)\*/gim, '<em>$1</em>')
            .replace(/_(.*)_/gim, '<em>$1</em>')
            // Lists (Unordered)
            .replace(/^\s*-\s(.*$)/gim, '<li class="ml-4 list-disc">$1</li>')
            // Line Breaks -> Paragraphs (Double newline)
            .replace(/\n\n/gim, '</p><p class="mb-4 leading-relaxed text-secondary-700">')
            // Remaining newlines to br
            .replace(/\n/gim, '<br />');

        // Wrap in p if not starting with tag
        if (!html.startsWith('<')) {
            html = '<p class="mb-4 leading-relaxed text-secondary-700">' + html + '</p>';
        }

        return { __html: html };
    };

    return (
        <div className="prose prose-lg max-w-none" dangerouslySetInnerHTML={renderContent()} />
    );
}
