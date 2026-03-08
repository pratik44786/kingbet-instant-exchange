import { useState, useEffect, useCallback } from 'react';
import { casinoApiService } from '@/services/casinoApiService';
import { ArrowLeft, RefreshCw, Tv, Users, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

interface CasinoTable {
  mid: string;
  gtype?: string;
  tabletypeid?: string;
  tablename?: string;
  GameName?: string;
  name?: string;
  min?: number;
  max?: number;
  [key: string]: any;
}

const LiveCasinoPage = () => {
  const [tables, setTables] = useState<CasinoTable[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTable, setSelectedTable] = useState<CasinoTable | null>(null);
  const [tableData, setTableData] = useState<any>(null);
  const [tableResult, setTableResult] = useState<any>(null);
  const [detailResult, setDetailResult] = useState<any>(null);
  const [tableDataLoading, setTableDataLoading] = useState(false);

  const fetchTables = useCallback(async () => {
    try {
      setLoading(true);
      const res = await casinoApiService.getAllTables();
      // API may return array or object with data key
      const list = Array.isArray(res) ? res : (res?.data || res?.result || res?.tables || []);
      setTables(Array.isArray(list) ? list : Object.values(list).flat());
    } catch (err: any) {
      console.error('Failed to fetch tables:', err);
      toast.error('Casino tables load nahi ho paye');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchTables(); }, [fetchTables]);

  const openTable = async (table: CasinoTable) => {
    setSelectedTable(table);
    setTableDataLoading(true);
    setTableData(null);
    setTableResult(null);
    setDetailResult(null);
    try {
      const [td, res, detail] = await Promise.all([
        casinoApiService.getTableData(table.mid).catch(() => null),
        casinoApiService.getResult(table.mid).catch(() => null),
        casinoApiService.getDetailResult(table.mid, table.gtype || table.tabletypeid || '').catch(() => null),
      ]);
      setTableData(td);
      setTableResult(res);
      setDetailResult(detail);
    } catch { /* */ } finally {
      setTableDataLoading(false);
    }
  };

  const refreshTable = async () => {
    if (!selectedTable) return;
    openTable(selectedTable);
  };

  const getTableName = (t: CasinoTable) => t.tablename || t.GameName || t.name || t.gtype || `Table ${t.mid}`;

  if (selectedTable) {
    return (
      <div className="flex-1 p-4 overflow-auto">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <button onClick={() => setSelectedTable(null)} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
              <ArrowLeft className="w-4 h-4" /> Back to Tables
            </button>
            <button onClick={refreshTable} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
              <RefreshCw className={`w-3.5 h-3.5 ${tableDataLoading ? 'animate-spin' : ''}`} /> Refresh
            </button>
          </div>

          <h2 className="text-lg font-bold text-foreground mb-1 flex items-center gap-2">
            <Tv className="w-5 h-5 text-primary" /> {getTableName(selectedTable)}
          </h2>
          <p className="text-xs text-muted-foreground mb-4">MID: {selectedTable.mid}</p>

          {tableDataLoading ? (
            <div className="surface-card rounded-xl p-12 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">Loading table data...</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Table Data */}
              {tableData && (
                <div className="surface-card rounded-xl p-4">
                  <h3 className="text-sm font-bold text-foreground mb-3">📊 Live Table Data</h3>
                  <DataRenderer data={tableData} />
                </div>
              )}

              {/* Results */}
              {tableResult && (
                <div className="surface-card rounded-xl p-4">
                  <h3 className="text-sm font-bold text-foreground mb-3">🏆 Results</h3>
                  <DataRenderer data={tableResult} />
                </div>
              )}

              {/* Detail Results */}
              {detailResult && (
                <div className="surface-card rounded-xl p-4">
                  <h3 className="text-sm font-bold text-foreground mb-3">📋 Detail Results</h3>
                  <DataRenderer data={detailResult} />
                </div>
              )}

              {!tableData && !tableResult && !detailResult && (
                <div className="surface-card rounded-xl p-8 text-center">
                  <p className="text-muted-foreground">No data available for this table</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-4 overflow-auto">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <Tv className="w-5 h-5 text-primary" /> Live Casino
          </h2>
          <button onClick={fetchTables} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </button>
        </div>
        <p className="text-sm text-muted-foreground mb-6">Real-time casino tables powered by Diamond Casino API.</p>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="surface-card rounded-xl p-6 animate-pulse">
                <div className="h-4 bg-muted rounded w-3/4 mb-3" />
                <div className="h-3 bg-muted rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : tables.length === 0 ? (
          <div className="surface-card rounded-xl p-12 text-center">
            <p className="text-muted-foreground">No live tables available right now</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {tables.map((t, i) => (
              <button key={t.mid || i} onClick={() => openTable(t)}
                className="surface-card rounded-xl p-5 text-left hover:border-primary/50 transition-all group relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-2 h-2 rounded-full bg-positive animate-pulse" />
                    <span className="text-xs text-positive font-medium">LIVE</span>
                  </div>
                  <h3 className="text-sm font-bold text-foreground mb-1 truncate">{getTableName(t)}</h3>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    {t.min != null && <span>Min: {t.min}</span>}
                    {t.max != null && <span>Max: {t.max}</span>}
                    {t.gtype && <span className="bg-muted px-1.5 py-0.5 rounded text-[10px] uppercase">{t.gtype}</span>}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        <div className="mt-8">
          <Link to="/casino" className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1">
            <ArrowLeft className="w-4 h-4" /> Back to Casino Games
          </Link>
        </div>
      </div>
    </div>
  );
};

// Generic data renderer for API responses
const DataRenderer = ({ data }: { data: any }) => {
  if (!data) return null;

  if (Array.isArray(data)) {
    if (data.length === 0) return <p className="text-xs text-muted-foreground">Empty</p>;

    // If array of objects, render as table
    if (typeof data[0] === 'object' && data[0] !== null) {
      const keys = Object.keys(data[0]).slice(0, 8); // max 8 columns
      return (
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border">
                {keys.map(k => <th key={k} className="text-left py-2 px-2 text-muted-foreground font-medium uppercase">{k}</th>)}
              </tr>
            </thead>
            <tbody>
              {data.slice(0, 20).map((row: any, i: number) => (
                <tr key={i} className="border-b border-border/50 hover:bg-muted/30">
                  {keys.map(k => (
                    <td key={k} className="py-1.5 px-2 text-foreground font-mono">
                      {typeof row[k] === 'object' ? JSON.stringify(row[k]) : String(row[k] ?? '-')}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          {data.length > 20 && <p className="text-xs text-muted-foreground mt-2">Showing 20 of {data.length} rows</p>}
        </div>
      );
    }

    // Array of primitives
    return (
      <div className="flex flex-wrap gap-1">
        {data.map((v, i) => (
          <span key={i} className="text-xs bg-muted px-2 py-1 rounded font-mono text-foreground">{String(v)}</span>
        ))}
      </div>
    );
  }

  if (typeof data === 'object' && data !== null) {
    const entries = Object.entries(data);
    // If nested object has data/result array, render that
    for (const [key, val] of entries) {
      if (Array.isArray(val) && val.length > 0 && typeof val[0] === 'object') {
        return (
          <div>
            <p className="text-xs text-muted-foreground mb-2 uppercase">{key}</p>
            <DataRenderer data={val} />
          </div>
        );
      }
    }

    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {entries.slice(0, 15).map(([key, val]) => (
          <div key={key} className="bg-muted/30 rounded-lg px-3 py-2">
            <p className="text-[10px] text-muted-foreground uppercase truncate">{key}</p>
            <p className="text-xs font-mono text-foreground truncate">
              {typeof val === 'object' ? JSON.stringify(val) : String(val ?? '-')}
            </p>
          </div>
        ))}
      </div>
    );
  }

  return <p className="text-xs font-mono text-foreground">{String(data)}</p>;
};

export default LiveCasinoPage;
