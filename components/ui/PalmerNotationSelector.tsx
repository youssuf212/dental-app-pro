import React from 'react';

interface PalmerNotationSelectorProps {
  selectedTeeth: string[];
  onToothClick: (tooth: string) => void;
}

const Tooth: React.FC<{ quadrant: string; number: number; isSelected: boolean; onClick: (tooth: string) => void }> = ({ quadrant, number, isSelected, onClick }) => {
  const toothId = `${quadrant}${number}`;
  return (
    <button
      type="button"
      onClick={() => onClick(toothId)}
      className={`w-8 h-8 rounded-full flex items-center justify-center border text-sm transition-colors
        ${isSelected
          ? 'bg-primary text-black border-primary-medium'
          : 'bg-surface-elevated text-text-secondary border-border-color hover:bg-primary/20 hover:border-primary'
        }`}
    >
      {number}
    </button>
  );
};

const Quadrant: React.FC<{
  label: string;
  quadrantPrefix: 'UR' | 'UL' | 'LR' | 'LL';
  numbers: number[];
  selectedTeeth: string[];
  onToothClick: (tooth: string) => void;
  className?: string;
}> = ({ label, quadrantPrefix, numbers, selectedTeeth, onToothClick, className }) => {
  return (
    <div className={`p-3 border border-border-color rounded-xl ${className}`}>
      <div className="text-center font-semibold text-xs mb-2 text-text-tertiary">{label}</div>
      <div className={`flex gap-1 ${quadrantPrefix === 'UR' || quadrantPrefix === 'LR' ? 'flex-row-reverse' : ''}`}>
        {numbers.map(num => (
          <Tooth
            key={num}
            quadrant={quadrantPrefix}
            number={num}
            isSelected={selectedTeeth.includes(`${quadrantPrefix}${num}`)}
            onClick={onToothClick}
          />
        ))}
      </div>
    </div>
  );
};

const PalmerNotationSelector: React.FC<PalmerNotationSelectorProps> = ({ selectedTeeth, onToothClick }) => {
  const upperNumbers = [1, 2, 3, 4, 5, 6, 7, 8];
  const lowerNumbers = [1, 2, 3, 4, 5, 6, 7, 8];

  return (
    <div>
        <p className="text-sm text-center mb-4 text-text-tertiary">Select the teeth associated with this service.</p>
      <div className="flex justify-center gap-4 mb-4">
        <Quadrant label="Upper Right (UR)" quadrantPrefix="UR" numbers={upperNumbers} selectedTeeth={selectedTeeth} onToothClick={onToothClick} className="flex-1" />
        <Quadrant label="Upper Left (UL)" quadrantPrefix="UL" numbers={upperNumbers} selectedTeeth={selectedTeeth} onToothClick={onToothClick} className="flex-1" />
      </div>
      <div className="flex justify-center gap-4">
        <Quadrant label="Lower Right (LR)" quadrantPrefix="LR" numbers={lowerNumbers} selectedTeeth={selectedTeeth} onToothClick={onToothClick} className="flex-1" />
        <Quadrant label="Lower Left (LL)" quadrantPrefix="LL" numbers={lowerNumbers} selectedTeeth={selectedTeeth} onToothClick={onToothClick} className="flex-1" />
      </div>
    </div>
  );
};

export default PalmerNotationSelector;
