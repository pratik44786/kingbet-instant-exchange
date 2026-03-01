import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { Search, Trophy, Timer } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const ExchangePage: React.FC = () => {
  const { markets, addToBetSlip, betSlip, updateBetSlipStake, placeBets } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMarket, setSelectedMarket] = useState<string | null>(null);

  useEffect(() => {
    if (markets.length > 0 && !selectedMarket) {
      setSelectedMarket(markets[0].id);
    }
  }, [markets, selectedMarket]);

  return (
    <div className="flex flex-col pb-20 lg:pb-0">
      <div className="p-4 bg-[#0b1221] border-b border-white/5 sticky top-0 z-10">
        <div className="relative max-w-md mx-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <Input
            placeholder="Search markets..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-gray-900 border-gray-800 focus:ring-yellow-500"
          />
        </div>
      </div>

      <div className="p-2 lg:p-4 space-y-4">
        {markets.filter(m => m.id.toLowerCase().includes(searchTerm.toLowerCase())).map((market) => (
          <div key={market.id} className="surface-card shadow-2xl overflow-hidden border-none mb-4">
            {/* Market Header - Using 'id' if 'name' is missing to avoid TS Error */}
            <div className="market-header">
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-yellow-500" />
                <h3 className="font-bold text-sm tracking-wide uppercase italic">
                  {/* @ts-ignore */}
                  {market.name || market.event || 'MATCH'} 
                </h3>
              </div>
              <div className="flex items-center gap-2 text-[10px] text-gray-400">
                <Timer className="w-3 h-3" />
                <span>{new Date(market.startTime).toLocaleTimeString()}</span>
              </div>
            </div>

            {/* Table Header */}
            <div className="grid grid-cols-12 bg-[#121a2d] p-1 text-[10px] font-bold text-gray-500 uppercase">
              <div className="col-span-6 pl-2">Runner</div>
              <div className="col-span-3 text-center text-[#72bbef]">Back</div>
              <div className="col-span-3 text-center text-[#faa9ba]">Lay</div>
            </div>

            {/* Runners */}
            {market.runners.map((runner) => {
              const isInSlip = betSlip.find(item => item.runnerId === runner.id);
              // Safe extraction of prices for TS
              // @ts-ignore
              const backPrice = runner.back || runner.backPrice || 1.0;
              // @ts-ignore
              const layPrice = runner.lay || runner.layPrice || 1.0;

              return (
                <div key={runner.id} className="flex flex-col border-b border-white/5 last:border-0">
                  <div className="grid grid-cols-12 items-center bg-[#161d2f] p-1 gap-1">
                    <div className="col-span-6 pl-2">
                      <div className="text-xs font-bold text-gray-200">{runner.name}</div>
                    </div>

                    <div className="col-span-3">
                      <button 
                        onClick={() => addToBetSlip({ 
                          marketId: market.id, 
                          runnerId: runner.id, 
                          runnerName: runner.name, 
                          type: 'back', 
                          // @ts-ignore
                          price: backPrice 
                        })}
                        className="btn-back w-full py-1.5"
                      >
                        <span className="odds-text">{backPrice}</span>
                        <span className="odds-size">10k</span>
                      </button>
                    </div>

                    <div className="col-span-3">
                      <button 
                        onClick={() => addToBetSlip({ 
                          marketId: market.id, 
                          runnerId: runner.id, 
                          runnerName: runner.name, 
                          type: 'lay', 
                          // @ts-ignore
                          price: layPrice 
                        })}
                        className="btn-lay w-full py-1.5"
                      >
                        <span className="odds-text">{layPrice}</span>
                        <span className="odds-size">5k</span>
                      </button>
                    </div>
                  </div>

                  {/* Inline Slip UI */}
                  {isInSlip && (
                    <div className={`m-1 p-3 rounded shadow-inner ${isInSlip.type === 'back' ? 'bet-slip-back' : 'bet-slip-lay'}`}>
                      <div className="flex items-center gap-3">
                        <div className="flex-1">
                          <label className="text-[9px] font-black text-gray-500 block uppercase">Stake</label>
                          <input 
                            type="number" 
                            className="w-full bg-white border border-gray-300 p-2 rounded text-black font-bold text-sm outline-none"
                            placeholder="0"
                            value={isInSlip.stake || ''}
                            onChange={(e) => updateBetSlipStake(runner.id, Number(e.target.value))}
                            autoFocus
                          />
                        </div>
                        <div className="flex-1">
                          <label className="text-[9px] font-black text-gray-500 block uppercase">P/L</label>
                          <div className={`font-black text-sm p-2 ${isInSlip.type === 'back' ? 'text-green-600' : 'text-red-600'}`}>
                             {/* @ts-ignore */}
                             {isInSlip.type === 'back' ? ((isInSlip.stake || 0) * ((isInSlip.price || 0) - 1)).toFixed(2) : (isInSlip.stake || 0)}
                          </div>
                        </div>
                        <div className="flex flex-col gap-1 pt-4">
                           <Button size="sm" onClick={placeBets} className="bg-yellow-600 hover:bg-yellow-700 text-white font-black h-8 text-[10px] px-4 rounded-sm shadow-md">PLACE</Button>
                           <Button size="sm" variant="ghost" className="text-gray-600 font-bold h-6 text-[9px] hover:bg-transparent" onClick={() => updateBetSlipStake(runner.id, 0)}>CANCEL</Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ExchangePage;
