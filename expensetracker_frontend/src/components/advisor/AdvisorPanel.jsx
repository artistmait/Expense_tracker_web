import { useCallback, useEffect, useState } from 'react';
import { Bot, RefreshCw, Sparkles, X } from 'lucide-react';
import { advisorApi } from '../../services/advisorApi';

const severityStyles = {
  critical: 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/20 dark:text-rose-300',
  warning: 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/50 dark:bg-amber-950/20 dark:text-amber-300',
  info: 'border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-900/50 dark:bg-sky-950/20 dark:text-sky-300'
};

export const AdvisorPanel = ({ token, isOpen, onClose }) => {
  const [recommendations, setRecommendations] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const loadRecommendations = useCallback(async (generate = false) => {
    if (!token || token === 'mock_jwt_token' || token === 'mock_jwt_demo_token') return;
    setIsLoading(true);
    setError('');
    try {
      const response = generate
        ? await advisorApi.generateRecommendations(token)
        : await advisorApi.getRecommendations(token);
      setRecommendations(response.recommendations || []);
    } catch (err) {
      setError(err.message || 'Unable to load recommendations.');
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (!isOpen) return undefined;
    const loadTimer = window.setTimeout(() => loadRecommendations(), 0);
    return () => window.clearTimeout(loadTimer);
  }, [isOpen, loadRecommendations]);

  const dismiss = async (id) => {
    try {
      await advisorApi.dismissRecommendation(token, id);
      setRecommendations((current) => current.filter((recommendation) => recommendation.id !== id));
    } catch (err) {
      setError(err.message || 'Unable to dismiss recommendation.');
    }
  };

  if (!isOpen) return null;

  return (
    <aside className="fixed right-4 top-20 z-40 w-[min(92vw,380px)] max-h-[calc(100vh-6rem)] overflow-y-auto rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl dark:border-[#30363D] dark:bg-[#161B22]" aria-label="Spending advisor">
      <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3 dark:border-[#30363D]">
        <div className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#4382DF]/10 text-[#4382DF]"><Bot className="h-5 w-5" /></span>
          <div>
            <h2 className="text-sm font-bold text-[#112E81] dark:text-[#E6EDF3]">Spending Advisor</h2>
            <p className="text-[11px] text-slate-400">Patterns from your ledger</p>
          </div>
        </div>
        <button onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-[#252D40]" title="Close advisor"><X className="h-4 w-4" /></button>
      </div>

      <div className="mt-3 flex justify-end">
        <button onClick={() => loadRecommendations(true)} disabled={isLoading} className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#4382DF] disabled:opacity-50" title="Re-evaluate spending patterns">
          <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} /> Refresh insights
        </button>
      </div>

      {error && <p className="mt-3 rounded-lg border border-rose-200 bg-rose-50 p-2 text-xs text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/20 dark:text-rose-300">{error}</p>}
      {isLoading && <p className="py-8 text-center text-xs text-slate-400">Reviewing your recent activity...</p>}
      {!isLoading && !error && recommendations.length === 0 && (
        <div className="py-10 text-center">
          <Sparkles className="mx-auto h-7 w-7 text-[#4382DF]" />
          <p className="mt-2 text-sm font-semibold text-slate-700 dark:text-slate-300">No active recommendations</p>
          <p className="mt-1 text-xs text-slate-400">Add real transactions to unlock spending patterns.</p>
        </div>
      )}
      <div className="mt-3 space-y-3">
        {recommendations.map((recommendation) => (
          <article key={recommendation.id} className={`rounded-xl border p-3 ${severityStyles[recommendation.severity] || severityStyles.info}`}>
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wide">{recommendation.severity}</span>
                <h3 className="mt-1 text-sm font-bold">{recommendation.title}</h3>
              </div>
              <button onClick={() => dismiss(recommendation.id)} className="text-[11px] font-semibold underline underline-offset-2" title="Dismiss recommendation">Dismiss</button>
            </div>
            <p className="mt-2 text-xs leading-5">{recommendation.message}</p>
            {recommendation.category_name && <span className="mt-2 inline-block rounded-full bg-white/70 px-2 py-0.5 text-[10px] font-semibold dark:bg-black/10">{recommendation.category_name}</span>}
          </article>
        ))}
      </div>
    </aside>
  );
};
