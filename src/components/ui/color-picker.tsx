import React, { useState, useEffect } from 'react';
import { HexColorPicker } from 'react-colorful';

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
}

export const ColorPicker: React.FC<ColorPickerProps> = ({ value, onChange }) => {
  const [color, setColor] = useState(value);
  const [isOpen, setIsOpen] = useState(false);

  // Update local state when value prop changes
  useEffect(() => {
    setColor(value);
  }, [value]);

  const handleChange = (newColor: string) => {
    setColor(newColor);
    onChange(newColor);
  };

  return (
    <div className="relative">
      <div
        className="w-10 h-10 rounded-md border border-gray-300 cursor-pointer shadow-sm"
        style={{ backgroundColor: color }}
        onClick={() => setIsOpen(!isOpen)}
      />
      {isOpen && (
        <div className="absolute z-10 mt-2">
          <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
            <HexColorPicker color={color} onChange={handleChange} />
            <div className="mt-2 flex items-center">
              <div
                className="w-6 h-6 rounded border border-gray-300 mr-2"
                style={{ backgroundColor: color }}
              />
              <input
                type="text"
                value={color}
                onChange={(e) => handleChange(e.target.value)}
                className="text-sm border border-gray-300 rounded px-2 py-1 w-24"
              />
            </div>
            <div className="mt-2 flex justify-end">
              <button
                onClick={() => setIsOpen(false)}
                className="text-sm text-gray-600 hover:text-gray-800 px-2 py-1"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
