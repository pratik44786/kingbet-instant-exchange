import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Tv, X, Loader2 } from 'lucide-react';

interface LiveTVProps {
  marketId: string;
  sport: string;
  eventName: string;
}

const LiveTV: React.FC<LiveTVProps> = ({ marketId, sport, eventName }) => {
  const [showTV, setShowTV] = useState(false);
  const [tvUrl, setTvUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTV = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Use the market ID characters to create a gmid-like identifier
      const gmid = marketId.replace(/-/g, '').slice(0, 12);
      
      const { data, error: fnError } = await supabase.functions.invoke('live-tv', {
        body: null,
        headers: { 'Content-Type': 'application/json' },
      });

      // Build the URL with query params
      const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || `https://${projectId}.supabase.co`;
      
      const tvResp = await fetch(`${supabaseUrl}/functions/v1/live-tv?gmid=${gmid}&sport=${sport}`, {
        headers: {
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
          'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || '',
        },
      });

      if (!tvResp.ok) {
        throw new Error('TV stream not available');
      }

      const tvData = await tvResp.json();
      
      // The API may return various formats — try to extract a URL
      const streamUrl = tvData?.url || tvData?.tvUrl || tvData?.tv_url || 
                        tvData?.data?.url || tvData?.data?.tvUrl ||
                        tvData?.iframe || tvData?.data?.iframe ||
                        tvData?.streamUrl || tvData?.stream_url;
      
      if (streamUrl) {
        setTvUrl(streamUrl);
      } else if (typeof tvData === 'string' && tvData.startsWith('http')) {
        setTvUrl(tvData);
      } else {
        // If we get HTML content, it might be an embeddable page
        const htmlContent = tvData?.html || tvData?.data?.html;
        if (htmlContent) {
          const blob = new Blob([htmlContent], { type: 'text/html' });
          setTvUrl(URL.createObjectURL(blob));
        } else {
          setError('TV stream not available for this match');
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load TV');
    } finally {
      setLoading(false);
    }
  }, [marketId, sport]);

  useEffect(() => {
    if (showTV && !tvUrl && !loading) {
      fetchTV();
    }
  }, [showTV, tvUrl, loading, fetchTV]);

  if (!showTV) {
    return (
      <button
        onClick={() => setShowTV(true)}
        className="flex items-center gap-1 px-2 py-1 rounded bg-red-600/20 text-red-400 hover:bg-red-600/30 text-[10px] font-bold transition-colors"
      >
        <Tv className="w-3 h-3" />
        LIVE TV
      </button>
    );
  }

  return (
    <div className="relative bg-black rounded-lg overflow-hidden border border-yellow-500/20 mt-2">
      {/* Close button */}
      <button
        onClick={() => { setShowTV(false); setTvUrl(null); setError(null); }}
        className="absolute top-2 right-2 z-10 p-1 rounded-full bg-black/70 text-white hover:bg-black/90 transition-colors"
      >
        <X className="w-4 h-4" />
      </button>

      {/* Header */}
      <div className="bg-gradient-to-r from-red-900/50 to-red-800/30 px-3 py-1.5 flex items-center gap-2">
        <Tv className="w-3 h-3 text-red-500" />
        <span className="text-[10px] font-bold text-red-400 uppercase">Live TV</span>
        <span className="text-[10px] text-gray-400 truncate">— {eventName}</span>
        <span className="ml-auto w-2 h-2 rounded-full bg-red-500 animate-pulse" />
      </div>

      {/* Content */}
      <div className="aspect-video bg-gray-950 flex items-center justify-center">
        {loading && (
          <div className="flex flex-col items-center gap-2 text-gray-400">
            <Loader2 className="w-8 h-8 animate-spin text-yellow-500" />
            <span className="text-xs">Loading stream...</span>
          </div>
        )}
        
        {error && (
          <div className="flex flex-col items-center gap-2 text-gray-500 p-4">
            <Tv className="w-10 h-10 opacity-30" />
            <span className="text-xs text-center">{error}</span>
            <button
              onClick={fetchTV}
              className="text-[10px] text-yellow-500 hover:text-yellow-400 font-bold mt-1"
            >
              Retry
            </button>
          </div>
        )}

        {tvUrl && !loading && !error && (
          <iframe
            src={tvUrl}
            className="w-full h-full"
            allowFullScreen
            allow="autoplay; encrypted-media"
            sandbox="allow-scripts allow-same-origin allow-popups"
            title={`Live TV - ${eventName}`}
          />
        )}
      </div>
    </div>
  );
};

export default LiveTV;
