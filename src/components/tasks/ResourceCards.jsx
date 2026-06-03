import { ExternalLink, Play, FileText, Sparkles } from 'lucide-react'

// Helper function to extract YouTube video ID from URL
function getYouTubeId(url) {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url?.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
}

export default function ResourceCards({ resources, title = "AI Suggested Resources" }) {
    // Basic heuristics to decide if it's a video or article
    const videos = resources.filter(r => r.url.includes('youtube.com') || r.url.includes('youtu.be') || r.url.includes('vimeo'))
    const articles = resources.filter(r => !videos.includes(r))

    return (
        <div className="flex flex-col gap-6">
            {/* label placeholder aria-label */}
            <h3 className="text-sm font-bold text-white dark:text-gray-100 flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-blue-500" />
                {title}
            </h3>

            {/* Videos Section */}
            {videos.length > 0 && (
                <div className="space-y-3">
                    <p className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider mb-2">
                        Related Videos
                    </p>
                    {videos.map(video => {
                        const isYouTube = getYouTubeId(video.url);
                        const thumbnailUrl = isYouTube
                            ? `https://img.youtube.com/vi/${isYouTube}/hqdefault.jpg`
                            : 'https://images.unsplash.com/photo-1610484826967-09c5720778c7?q=80&w=600&auto=format&fit=crop';

                        return (
                            <a
                                key={video.id || video.url}
                                href={video.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block rounded-xl overflow-hidden group bg-slate-800 border border-slate-700 hover:border-blue-500/50 transition-all shadow-md relative"
                            >
                                {/* Thumbnail */}
                                <div className="h-32 w-full relative">
                                    <div className="absolute inset-0 bg-linear-to-t from-slate-900 via-slate-900/40 to-transparent z-10"></div>
                                    <img
                                        src={thumbnailUrl}
                                        alt={video.title}
                                        className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity duration-300 group-hover:scale-105"
                                    />

                                    {/* Play Button Overlay */}
                                    <div className="absolute inset-0 flex items-center justify-center z-20">
                                        <div className="w-12 h-12 rounded-full border border-white/30 bg-[#111A2C]/80 backdrop-blur-xl/10 backdrop-blur-md flex items-center justify-center group-hover:scale-110 group-hover:bg-[#111A2C]/80 backdrop-blur-xl/20 transition-all">
                                            <Play className="w-5 h-5 text-white ml-1 fill-white" />
                                        </div>
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="p-3 relative z-20 bg-slate-800">
                                    <h4 className="text-sm font-bold text-slate-100 line-clamp-2 leading-tight">
                                        {video.title}
                                    </h4>
                                    <p className="text-xs text-slate-400 mt-1 truncate">
                                        Video Resource
                                    </p>
                                </div>
                            </a>
                        )
                    })}
                </div>
            )}

            {/* Articles Section */}
            {articles.length > 0 && (
                <div className="space-y-3 mt-4">
                    <p className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider mb-2">
                        Reference Articles
                    </p>
                    <div className="space-y-2">
                        {articles.map(article => (
                            <a
                                key={article.id || article.url}
                                href={article.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-start gap-3 p-3 rounded-xl bg-[#0A101A] dark:bg-slate-800/60 border border-white/5 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-500/50 hover:shadow-md transition-all group"
                            >
                                <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 shrink-0 group-hover:scale-110 transition-transform">
                                    <FileText className="w-4 h-4" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="text-sm font-bold text-white dark:text-slate-100 truncate">
                                        {article.title}
                                    </h4>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                                        {new URL(article.url).hostname.replace('www.', '')}
                                    </p>
                                </div>
                            </a>
                        ))}
                    </div>
                </div>
            )}

            {resources.length === 0 && (
                <div className="p-8 text-center border-2 border-dashed border-white/5 dark:border-slate-800 rounded-xl">
                    <Sparkles className="w-6 h-6 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                        Nenhum recurso associado.<br />Os recursos da Inteligência Artificial aparecerão aqui futuramente.
                    </p>
                </div>
            )}
        </div>
    )
}
