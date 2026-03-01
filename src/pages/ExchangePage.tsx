import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { Search, Trophy, Timer, ChevronRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const ExchangePage: React.FC = () => {
  const { markets, addToBetSlip, betSlip, updateBetSlipStake, placeBets, currentUser } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMarket, setSelectedMarket] = useState<string | null>(null);

  // Auto-select first market
  useEffect(() => {
    if (markets.length > 0 && !selectedMarket) {
      setSelectedMarket(markets[0].id);
    }
  }, [markets, selectedMarket]);

  return (
    <div className="flex flex-col pb-20 lg:pb-0">
      {/* Search Header */}
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
        {markets.map((market) => (
          <div key={market.id} className="surface-card shadow-2xl overflow-hidden border-none">
            {/* Market Header */}
            <div className="bg-[#1e273e] p-3 flex justify-between items-center border-b border-white/5">
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-yellow-500" />
                <h3 className="font-bold text-sm tracking-wide uppercase italic">{market.name}</h3>
              </div>
              <div className="flex items-center gap-2 text-[10px] text-gray-400">
                <Timer className="w-3 h-3" />
                <span>{new Date(market.startTime).toLocaleTimeString()}</span>
              </div>
            </div>

            {/* Odds Table Header */}
            <div className="grid grid-cols-12 bg-[#121a2d] p-1 text-[10px] font-bold text-gray-500 uppercase">
              <div className="col-span-6 pl-2">Runner</div>
              <div className="col-span-3 text-center text-[#72bbef]">Back</div>
              <div className="col-span-3 text-center text-[#faa9ba]">Lay</div>
            </div>

            {/* Runners */}
            {market.runners.map((runner) => {
              const isInSlip = betSlip.find(item => item.runnerId === runner.id);
              
              return (
                <div key={runner.id} className="flex flex-col border-b border-white/5 last:border-0">
                  <div className="grid grid-cols-12 items-center bg-[#161d2f] p-1 gap-1">
                    {/* Runner Name */}
                    <div className="col-span-6 pl-2">
                      <div className="text-xs font-bold text-gray-200">{runner.name}</div>
                    </div>

                    {/* Back Button */}
                    <div className="col-span-3">
                      <button 
                        onClick={() => addToBetSlip({ marketId: market.id, marketName: market.name, runnerId: runner.id, runnerName: runner.name, type: 'back', price: runner.back })}
                        className="btn-back w-full py-1.5"
                      >
                        <span className="text-xs font-extrabold">{runner.back}</span>
                        <span className="text-[8px] opacity-70">10k</span>
                      </button>
                    </div>

                    {/* Lay Button */}
                    <div className="col-span-3">
                      <button 
                        onClick={() => addToBetSlip({ marketId: market.id, marketName: market.name, runnerId: runner.id, runnerName: runner.name, type: 'lay', price: runner.lay })}
                        className="btn-lay w-full py-1.5"
                      >
                        <span className="text-xs font-extrabold">{runner.lay}</span>
                        <span className="text-[8px] opacity-70">5k</span>
                      </button>
                    </div>
                  </div>

                  {/* Inline Bet Slip (Diamond Style) */}
                  {isInSlip && (
                    <div className={`m-1 p-3 rounded shadow-inner animate-in slide-in-from-top-1 ${isInSlip.type === 'back' ? 'bg-[#e2f2ff] border-l-4 border-[#2b92e4]' : 'bg-[#fff0f3] border-l-4 border-[#ef6e8b]'}`}>
                      <div className="flex items-center gap-3">
                        <div className="flex-1">
                          <label className="text-[9px] font-bold text-gray-500 block uppercase">Stake</label>
                          <input 
                            type="number" 
                            className="w-full bg-white border border-gray-300 p-2 rounded text-black font-bold text-sm outline-none"
                            placeholder="Amount"
                            value={isInSlip.stake || ''}
                            onChange={(e) => updateBetSlipStake(runner.id, Number(e.target.value))}
                            autoFocus
                          />
                        </div>
                        <div className="flex-1">
                          <label className="text-[9px] font-bold text-gray-500 block uppercase">Profit/Loss</label>
                          <div className={`font-bold text-sm p-2 ${isInSlip.type === 'back' ? 'text-green-600' : 'text-red-600'}`}>
                             {isInSlip.type === 'back' ? (isInSlip.stake * (isInSlip.price - 1)).toFixed(2) : isInSlip.stake}
                          </div>
                        </div>
                        <div className="flex flex-col gap-1">
                           <Button size="sm" onClick={placeBets} className="bg-yellow-600 hover:bg-yellow-700 text-white font-bold h-8 text-[10px]">PLACE</Button>
                           <Button size="sm" variant="ghost" className="text-gray-500 h-6 text-[8px]" onClick={() => updateBetSlipStake(runner.id, 0)}>CANCEL</Button>
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
