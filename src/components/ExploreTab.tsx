import React, { useState, useEffect } from 'react';
import { Volume2, Scale, Info } from 'lucide-react';
import { getUnitsData } from '../data';
import { VesselSVG } from './VesselSVG';
import { speechEngine } from '../utils/speechEngine';
import { numberToVocalizedArabic } from '../utils/arabicPhonetics';
import { playClick, playWaterDrop } from '../utils/soundEffects';
import { UnitData } from '../types';
import { useLanguage } from '../i18n/LanguageContext';

export const ExploreTab: React.FC = () => {
  const { language, t } = useLanguage();
  const units = getUnitsData(language);
  const [selectedUnit, setSelectedUnit] = useState<UnitData>(units[0]);
  const [isComparing, setIsComparing] = useState(false);

  // Sync selectedUnit on language change
  useEffect(() => {
    const updated = units.find((u) => u.id === selectedUnit.id) || units[0];
    setSelectedUnit(updated);
  }, [language]);

  const handleSelectUnit = (unit: UnitData) => {
    playWaterDrop();
    setSelectedUnit(unit);
    setIsComparing(false);
    
    if (language === 'en') {
      speechEngine.speak(
        `${unit.name}, capacity: ${unit.short}, equal to ${unit.ml} milliliters. ${unit.description}`
      );
    } else {
      speechEngine.speak(
        `${unit.vocalizedName}، سِعَتُهُ ${unit.vocalizedShort}، أَيْ ${numberToVocalizedArabic(unit.ml, 'ml')}. ${unit.vocalizedDesc}`
      );
    }
  };

  const handleCompareAll = () => {
    playClick();
    setIsComparing(true);
    if (language === 'en') {
      speechEngine.speak(
        'Capacity comparison: One liter equals one thousand milliliters, which is two half-liters or four quarter-liters. Half a liter equals five hundred milliliters, which is two quarter-liters. A quarter liter equals two hundred and fifty milliliters.'
      );
    } else {
      speechEngine.speak(
        'مُقَارَنَةُ السِّعَاتِ: اللِّتْرُ الوَاحِدُ يُسَاوِي أَلْفَ مِيلِيلِتْرٍ، وَيُسَاوِي نِصْفَيْنِ، أَوْ أَرْبَعَةَ أَرْبَاعٍ. نِصْفُ اللِّتْرِ يُسَاوِي خَمْسَمِائَةِ مِيلِيلِتْرٍ، وَهُوَ رُبْعَانِ اثْنَانِ. رُبْعُ اللِّتْرِ يُسَاوِي مِائَتَيْنِ وَخَمْسِينَ مِيلِيلِتْرًا.'
      );
    }
  };

  return (
    <div className="flex-1 min-h-0 flex flex-col justify-between gap-2 animate-fade-in overflow-hidden">
      {/* Top Units Selector Bar */}
      <div id="explore-units-bar" className="grid grid-cols-5 gap-1 sm:gap-2 shrink-0">
        {units.map((unit) => {
          const isSelected = !isComparing && selectedUnit.id === unit.id;
          return (
            <button
              key={unit.id}
              id={`unit-card-${unit.id}`}
              type="button"
              onClick={() => handleSelectUnit(unit)}
              className={`p-1.5 sm:p-2 rounded-xl text-center border-2 transition-all duration-200 flex flex-col items-center justify-center gap-0.5 cursor-pointer shadow-xs active:scale-95 ${
                isSelected
                  ? 'border-sky-500 bg-sky-50 shadow-xs ring-2 ring-sky-200'
                  : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <span className="text-xl sm:text-2xl filter drop-shadow-xs leading-none">{unit.emoji}</span>
              <div className="font-black text-slate-900 text-xs sm:text-sm truncate w-full">{unit.short}</div>
              <div 
                className="text-[9px] sm:text-[10px] font-black px-1.5 py-0.2 rounded-md text-white truncate max-w-full"
                style={{ backgroundColor: unit.color }}
              >
                {unit.ml} {t.mlUnit}
              </div>
            </button>
          );
        })}

        {/* Compare All Button in the same bar */}
        <button
          id="compare-all-btn"
          type="button"
          onClick={handleCompareAll}
          className={`p-1.5 sm:p-2 rounded-xl text-center border-2 transition-all duration-200 flex flex-col items-center justify-center gap-0.5 cursor-pointer shadow-xs active:scale-95 ${
            isComparing
              ? 'bg-sky-600 border-sky-600 text-white shadow-xs'
              : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
          }`}
        >
          <Scale className="w-5 h-5 sm:w-6 sm:h-6" />
          <div className="font-black text-xs sm:text-sm truncate w-full">{t.compareAllBtn}</div>
          <div className="text-[9px] sm:text-[10px] font-black px-1 rounded-md bg-slate-100 text-slate-600 truncate">
            {language === 'ar' ? 'الكل' : 'All'}
          </div>
        </button>
      </div>

      {/* Main Interactive Stage */}
      <div id="explore-main-stage" className="flex-1 min-h-0 bg-white rounded-2xl p-2.5 sm:p-3 shadow-xs border border-slate-200 flex flex-col justify-between overflow-hidden">
        {!isComparing ? (
          <div className="flex-1 min-h-0 flex flex-col justify-between gap-1.5 animate-fade-in">
            {/* Unit Title and Speak Button */}
            <div className="flex items-center justify-center gap-2 shrink-0">
              <span className="text-xl sm:text-2xl">{selectedUnit.emoji}</span>
              <h3 className="text-sm sm:text-base font-black text-slate-900 truncate">
                {selectedUnit.name} ({selectedUnit.short}) = {selectedUnit.ml} {t.mlUnit}
              </h3>
              <button
                id="listen-unit-btn"
                type="button"
                onClick={() => {
                  if (language === 'en') {
                    speechEngine.speak(
                      `${selectedUnit.name}, capacity: ${selectedUnit.ml} milliliters. ${selectedUnit.description}`
                    );
                  } else {
                    speechEngine.speak(
                      `${selectedUnit.vocalizedName}، سِعَتُهُ ${numberToVocalizedArabic(selectedUnit.ml, 'ml')}. ${selectedUnit.vocalizedDesc}`
                    );
                  }
                }}
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-sky-50 text-sky-600 border border-sky-200 flex items-center justify-center hover:bg-sky-100 active:scale-95 transition-transform shrink-0 cursor-pointer"
                title={t.listenExplanation}
              >
                <Volume2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
            </div>

            {/* Central Bottle Display */}
            <div className="flex-1 min-h-0 flex items-center justify-center py-1 max-h-[38vh]">
              <VesselSVG
                ml={selectedUnit.ml}
                maxMl={1000}
                width={120}
                height={230}
                color={selectedUnit.color}
                lightColor={selectedUnit.light}
                label={`${selectedUnit.name} (${selectedUnit.short})`}
                vocalizedLabel={
                  language === 'en'
                    ? `${selectedUnit.name}, ${selectedUnit.ml} milliliters`
                    : `${selectedUnit.vocalizedName}، ${selectedUnit.ml} مِيلِيلِتْرٍ`
                }
                interactive
              />
            </div>

            {/* Educational Description Box */}
            <div className="p-2 sm:p-2.5 rounded-xl bg-sky-50 border border-sky-200 max-w-xl mx-auto text-center shrink-0 w-full">
              <div className="flex items-center justify-center gap-1 text-[11px] sm:text-xs font-black text-sky-900 mb-0.5">
                <Info size={14} />
                <span>{t.educationalExplanation}</span>
              </div>
              <p className="text-xs sm:text-sm font-black text-slate-800 leading-snug">
                {language === 'en' ? selectedUnit.description : selectedUnit.vocalizedDesc}
              </p>
            </div>
          </div>
        ) : (
          /* Comparison Stage */
          <div className="flex-1 min-h-0 flex flex-col justify-between gap-1.5 animate-fade-in">
            <div className="flex items-center justify-center gap-2 shrink-0">
              <h3 className="text-sm sm:text-base font-black text-slate-900 truncate">
                {t.compareTitle}
              </h3>
              <button
                id="listen-comparison-btn"
                type="button"
                onClick={handleCompareAll}
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-sky-50 text-sky-600 border border-sky-200 flex items-center justify-center hover:bg-sky-100 active:scale-95 transition-transform shrink-0 cursor-pointer"
                title={t.listenComparison}
              >
                <Volume2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
            </div>

            {/* Side-by-side vessels grid/flex */}
            <div className="flex-1 min-h-0 flex items-end justify-center gap-2 sm:gap-4 py-1 max-h-[36vh]">
              {units.map((u) => (
                <div key={u.id} className="flex flex-col items-center max-h-full">
                  <VesselSVG
                    ml={u.ml}
                    maxMl={1000}
                    width={90}
                    height={190}
                    color={u.color}
                    lightColor={u.light}
                    label={u.short}
                    vocalizedLabel={
                      language === 'en'
                        ? `${u.name}, ${u.ml} milliliters`
                        : `${u.vocalizedName}، ${u.ml} مِيلِيلِتْرٍ`
                    }
                    interactive
                  />
                  <span className="text-[10px] sm:text-xs font-black text-slate-700 mt-1">{u.ml} {t.mlUnit}</span>
                </div>
              ))}
            </div>

            {/* Comparison Insights */}
            <div className="p-2 rounded-xl bg-slate-50 border border-slate-200 max-w-xl mx-auto shrink-0 w-full">
              <div className="grid grid-cols-2 gap-1.5 text-[10px] sm:text-xs font-bold text-slate-800">
                <div className="bg-white p-1 rounded-lg border border-slate-200/60 truncate">{t.rule1}</div>
                <div className="bg-white p-1 rounded-lg border border-slate-200/60 truncate">{t.rule2}</div>
                <div className="bg-white p-1 rounded-lg border border-slate-200/60 truncate">{t.rule3}</div>
                <div className="bg-white p-1 rounded-lg border border-slate-200/60 truncate">{t.rule4}</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
