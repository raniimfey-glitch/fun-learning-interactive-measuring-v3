import React, { useState, useEffect } from 'react';
import { Volume2, Scale, Info, Sparkles } from 'lucide-react';
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
    <div className="space-y-6">
      {/* Introduction Card */}
      <div id="explore-intro-card" className="bg-white rounded-3xl p-6 sm:p-7 shadow-xs border border-slate-200">
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-sky-50 border border-sky-200 rounded-full text-sky-800 text-xs sm:text-sm font-black mb-2 shadow-xs">
            <Sparkles size={16} className="text-sky-600" />
            <span>{t.exploreBadge}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900">{t.exploreTitle}</h2>
          <p className="text-sm sm:text-base text-slate-600 font-bold mt-1">
            {t.exploreSubtitle}
          </p>
        </div>

        {/* Units Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4 mb-6">
          {units.map((unit) => {
            const isSelected = !isComparing && selectedUnit.id === unit.id;
            return (
              <button
                key={unit.id}
                id={`unit-card-${unit.id}`}
                type="button"
                onClick={() => handleSelectUnit(unit)}
                className={`p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl text-center border-2 transition-all duration-200 flex flex-col items-center justify-between gap-2 shadow-xs active:scale-95 min-h-[145px] sm:min-h-[175px] ${
                  isSelected
                    ? 'border-sky-500 bg-sky-50 shadow-md ring-4 ring-sky-200 scale-[1.02]'
                    : 'border-slate-200 bg-slate-50 hover:border-slate-300 hover:bg-slate-100'
                }`}
              >
                <span className="text-4xl sm:text-6xl filter drop-shadow-xs">{unit.emoji}</span>
                <div className="font-black text-slate-900 text-base sm:text-xl mt-1">{unit.name}</div>
                <div 
                  className="text-xs sm:text-sm font-black px-2.5 sm:px-3 py-1 rounded-xl text-white shadow-xs"
                  style={{ backgroundColor: unit.color }}
                >
                  {unit.short} = {unit.ml} {t.mlUnit}
                </div>
              </button>
            );
          })}
        </div>

        {/* Compare All Button */}
        <div className="flex justify-center">
          <button
            id="compare-all-btn"
            type="button"
            onClick={handleCompareAll}
            className={`w-full sm:w-auto px-6 py-3.5 sm:py-4 rounded-2xl text-base sm:text-lg font-black flex items-center justify-center gap-2 border-2 transition-all shadow-xs active:scale-95 ${
              isComparing
                ? 'bg-sky-600 border-sky-600 text-white shadow-md shadow-sky-200'
                : 'bg-white border-slate-300 text-slate-800 hover:bg-slate-50 hover:border-slate-400'
            }`}
          >
            <Scale size={22} />
            <span>{t.compareAllBtn}</span>
          </button>
        </div>
      </div>

      {/* Main Interactive Stage */}
      <div id="explore-main-stage" className="bg-white rounded-3xl p-5 sm:p-8 shadow-xs border border-slate-200 text-center">
        {!isComparing ? (
          <div className="space-y-6 animate-fade-in">
            {/* Unit Title and Speak Button */}
            <div className="flex items-center justify-center gap-2.5 sm:gap-3 flex-wrap">
              <span className="text-3xl sm:text-4xl">{selectedUnit.emoji}</span>
              <h3 className="text-lg sm:text-2xl font-black text-slate-900">
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
                className="w-10 h-10 rounded-full bg-sky-50 text-sky-600 border-2 border-sky-200 flex items-center justify-center hover:bg-sky-100 hover:scale-110 active:scale-95 transition-transform shadow-xs"
                title={t.listenExplanation}
              >
                <Volume2 size={20} />
              </button>
            </div>

            {/* Central Bottle Display */}
            <div className="py-2 sm:py-4 flex justify-center">
              <VesselSVG
                ml={selectedUnit.ml}
                maxMl={1000}
                width={140}
                height={280}
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
            <div className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-sky-50/80 border border-sky-200 max-w-2xl mx-auto text-center space-y-2 shadow-xs">
              <div className="flex items-center justify-center gap-1.5 text-sm sm:text-base font-black text-sky-900">
                <Info size={20} />
                <span>{t.educationalExplanation}</span>
              </div>
              <p className="text-base sm:text-xl font-black text-slate-900 leading-relaxed">
                {language === 'en' ? selectedUnit.description : selectedUnit.vocalizedDesc}
              </p>
            </div>
          </div>
        ) : (
          /* Comparison Stage */
          <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-center gap-3">
              <h3 className="text-xl sm:text-2xl font-black text-slate-900">
                {t.compareTitle}
              </h3>
              <button
                id="listen-comparison-btn"
                type="button"
                onClick={handleCompareAll}
                className="w-10 h-10 rounded-full bg-sky-50 text-sky-600 border-2 border-sky-200 flex items-center justify-center hover:bg-sky-100 hover:scale-110 active:scale-95 transition-transform shadow-xs"
                title={t.listenComparison}
              >
                <Volume2 size={20} />
              </button>
            </div>

            {/* Side-by-side vessels grid/flex */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 items-end justify-items-center py-4 max-w-3xl mx-auto">
              {units.map((u) => (
                <div key={u.id} className="flex flex-col items-center">
                  <VesselSVG
                    ml={u.ml}
                    maxMl={1000}
                    width={105}
                    height={230}
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
                  <span className="text-sm sm:text-base font-black text-slate-800 mt-2">{u.ml} {t.mlUnit}</span>
                </div>
              ))}
            </div>

            {/* Comparison Insights */}
            <div className={`p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-slate-50 border border-slate-200 max-w-2xl mx-auto space-y-3 shadow-xs ${language === 'ar' ? 'text-right' : 'text-left'}`}>
              <div className="text-base sm:text-lg font-black text-sky-900">{t.compareRulesTitle}</div>
              <ul className="text-sm sm:text-base font-bold text-slate-800 space-y-2.5">
                <li className="flex items-center gap-2">
                  <span className="text-sky-600 font-black text-xl">•</span>
                  <span>{t.rule1}</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-sky-600 font-black text-xl">•</span>
                  <span>{t.rule2}</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-sky-600 font-black text-xl">•</span>
                  <span>{t.rule3}</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-sky-600 font-black text-xl">•</span>
                  <span>{t.rule4}</span>
                </li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
