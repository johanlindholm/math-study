"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { GameType, CustomGameConfig } from '../game/types';

interface CustomGameModalProps {
  isOpen: boolean;
  onClose: () => void;
  gameType: GameType;
}

export default function CustomGameModal({ isOpen, onClose, gameType }: CustomGameModalProps) {
  const router = useRouter();
  
  // State for custom configurations
  const [multiplicationTables, setMultiplicationTables] = useState<string>('1,2,3,4,5');
  const [multiplicationMultiplierMin, setMultiplicationMultiplierMin] = useState<number>(1);
  const [multiplicationMultiplierMax, setMultiplicationMultiplierMax] = useState<number>(10);
  
  const [additionMin, setAdditionMin] = useState<number>(0);
  const [additionMax, setAdditionMax] = useState<number>(20);
  
  const [subtractionMin, setSubtractionMin] = useState<number>(0);
  const [subtractionMax, setSubtractionMax] = useState<number>(20);
  const [subtractionAllowNegative, setSubtractionAllowNegative] = useState<boolean>(false);
  
  const [divisionDividendMin, setDivisionDividendMin] = useState<number>(1);
  const [divisionDividendMax, setDivisionDividendMax] = useState<number>(100);
  const [divisionDivisorMin, setDivisionDivisorMin] = useState<number>(1);
  const [divisionDivisorMax, setDivisionDivisorMax] = useState<number>(10);

  if (!isOpen) return null;

  const parseTablesInput = (input: string): number[] => {
    try {
      // Handle ranges like "2-10"
      if (input.includes('-') && !input.includes(',')) {
        const [start, end] = input.split('-').map(n => parseInt(n.trim()));
        if (isNaN(start) || isNaN(end) || start > end) return [1, 2, 3, 4, 5];
        const result = [];
        for (let i = start; i <= end; i++) {
          result.push(i);
        }
        return result;
      }
      
      // Handle comma-separated like "1,2,3" or "1,5,8"
      return input.split(',').map(n => parseInt(n.trim())).filter(n => !isNaN(n) && n >= 1 && n <= 12);
    } catch {
      return [1, 2, 3, 4, 5]; // Default fallback
    }
  };

  const startCustomGame = () => {
    let customConfig: Partial<CustomGameConfig> = {};

    switch (gameType) {
      case GameType.MULTIPLICATION:
        const tables = parseTablesInput(multiplicationTables);
        if (tables.length === 0) {
          alert('Please enter valid multiplication tables (1-12)');
          return;
        }
        customConfig[GameType.MULTIPLICATION] = {
          tables,
          multiplierRange: { min: multiplicationMultiplierMin, max: multiplicationMultiplierMax }
        };
        break;
      
      case GameType.ADDITION:
        if (additionMin >= additionMax) {
          alert('Minimum value must be less than maximum value');
          return;
        }
        customConfig[GameType.ADDITION] = {
          range: { min: additionMin, max: additionMax }
        };
        break;
      
      case GameType.SUBTRACTION:
        if (subtractionMin >= subtractionMax) {
          alert('Minimum value must be less than maximum value');
          return;
        }
        customConfig[GameType.SUBTRACTION] = {
          range: { min: subtractionMin, max: subtractionMax },
          allowNegative: subtractionAllowNegative
        };
        break;
      
      case GameType.DIVISION:
        if (divisionDividendMin >= divisionDividendMax || divisionDivisorMin >= divisionDivisorMax) {
          alert('Minimum values must be less than maximum values');
          return;
        }
        customConfig[GameType.DIVISION] = {
          dividendRange: { min: divisionDividendMin, max: divisionDividendMax },
          divisorRange: { min: divisionDivisorMin, max: divisionDivisorMax }
        };
        break;
    }

    // Navigate to game with custom config as URL parameter
    const configParam = encodeURIComponent(JSON.stringify(customConfig));
    router.push(`/math/game?type=${gameType}&custom=${configParam}`);
  };

  const getGameTitle = () => {
    switch (gameType) {
      case GameType.MULTIPLICATION: return 'Multiplication';
      case GameType.ADDITION: return 'Addition';
      case GameType.SUBTRACTION: return 'Subtraction';
      case GameType.DIVISION: return 'Division';
      default: return 'Math';
    }
  };

  const renderMultiplicationConfig = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Multiplication Tables (e.g., &quot;1,2,3&quot; or &quot;2-10&quot;):
        </label>
        <input
          type="text"
          value={multiplicationTables}
          onChange={(e) => setMultiplicationTables(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          placeholder="1,2,3 or 2-10"
        />
        <p className="text-xs text-gray-500 mt-1">
          Examples: &quot;2&quot; (just 2s table), &quot;1,3,5&quot; (1s, 3s, 5s tables), &quot;2-8&quot; (2s through 8s tables)
        </p>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Multiplier Min:
          </label>
          <input
            type="number"
            value={multiplicationMultiplierMin}
            onChange={(e) => setMultiplicationMultiplierMin(parseInt(e.target.value) || 1)}
            min="1"
            max="20"
            className="w-full p-2 border border-gray-300 rounded-md dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Multiplier Max:
          </label>
          <input
            type="number"
            value={multiplicationMultiplierMax}
            onChange={(e) => setMultiplicationMultiplierMax(parseInt(e.target.value) || 10)}
            min="1"
            max="20"
            className="w-full p-2 border border-gray-300 rounded-md dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          />
        </div>
      </div>
    </div>
  );

  const renderAdditionConfig = () => (
    <div className="grid grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Number Range Min:
        </label>
        <input
          type="number"
          value={additionMin}
          onChange={(e) => setAdditionMin(parseInt(e.target.value) || 0)}
          min="0"
          max="1000"
          className="w-full p-2 border border-gray-300 rounded-md dark:border-gray-600 dark:bg-gray-700 dark:text-white"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Number Range Max:
        </label>
        <input
          type="number"
          value={additionMax}
          onChange={(e) => setAdditionMax(parseInt(e.target.value) || 20)}
          min="1"
          max="1000"
          className="w-full p-2 border border-gray-300 rounded-md dark:border-gray-600 dark:bg-gray-700 dark:text-white"
        />
      </div>
    </div>
  );

  const renderSubtractionConfig = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Number Range Min:
          </label>
          <input
            type="number"
            value={subtractionMin}
            onChange={(e) => setSubtractionMin(parseInt(e.target.value) || 0)}
            min="0"
            max="1000"
            className="w-full p-2 border border-gray-300 rounded-md dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Number Range Max:
          </label>
          <input
            type="number"
            value={subtractionMax}
            onChange={(e) => setSubtractionMax(parseInt(e.target.value) || 20)}
            min="1"
            max="1000"
            className="w-full p-2 border border-gray-300 rounded-md dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          />
        </div>
      </div>
      <div>
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={subtractionAllowNegative}
            onChange={(e) => setSubtractionAllowNegative(e.target.checked)}
            className="rounded"
          />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Allow negative results
          </span>
        </label>
      </div>
    </div>
  );

  const renderDivisionConfig = () => (
    <div className="grid grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Dividend Min:
        </label>
        <input
          type="number"
          value={divisionDividendMin}
          onChange={(e) => setDivisionDividendMin(parseInt(e.target.value) || 1)}
          min="1"
          max="1000"
          className="w-full p-2 border border-gray-300 rounded-md dark:border-gray-600 dark:bg-gray-700 dark:text-white"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Dividend Max:
        </label>
        <input
          type="number"
          value={divisionDividendMax}
          onChange={(e) => setDivisionDividendMax(parseInt(e.target.value) || 100)}
          min="1"
          max="1000"
          className="w-full p-2 border border-gray-300 rounded-md dark:border-gray-600 dark:bg-gray-700 dark:text-white"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Divisor Min:
        </label>
        <input
          type="number"
          value={divisionDivisorMin}
          onChange={(e) => setDivisionDivisorMin(parseInt(e.target.value) || 1)}
          min="1"
          max="100"
          className="w-full p-2 border border-gray-300 rounded-md dark:border-gray-600 dark:bg-gray-700 dark:text-white"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Divisor Max:
        </label>
        <input
          type="number"
          value={divisionDivisorMax}
          onChange={(e) => setDivisionDivisorMax(parseInt(e.target.value) || 10)}
          min="1"
          max="100"
          className="w-full p-2 border border-gray-300 rounded-md dark:border-gray-600 dark:bg-gray-700 dark:text-white"
        />
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Custom {getGameTitle()} Game
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-2xl"
          >
            ×
          </button>
        </div>

        <div className="space-y-6">
          {gameType === GameType.MULTIPLICATION && renderMultiplicationConfig()}
          {gameType === GameType.ADDITION && renderAdditionConfig()}
          {gameType === GameType.SUBTRACTION && renderSubtractionConfig()}
          {gameType === GameType.DIVISION && renderDivisionConfig()}

          <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-600">
            <button
              onClick={startCustomGame}
              className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
            >
              Start Custom Game
            </button>
            <button
              onClick={onClose}
              className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 font-semibold py-2 px-4 rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}