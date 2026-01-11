
import ArticleForm from '@/components/admin/ArticleForm';

export default function NewArticlePage() {
    return (
        <div className="p-8 max-w-5xl mx-auto">
            <h1 className="text-3xl font-bold text-slate-800 mb-8">New Article</h1>
            <ArticleForm />
        </div>
    );
}
