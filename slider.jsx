import React from "react";



export function Slider({ value, onValueChange, max = 100, step = 1 }) {
    const handleChange = (e) => {
      const newValue = Number(e.target.value);
      onValueChange?.([newValue]); // ensure it's called as an array
    };
  
    return (
      <input
        type="range"
        value={value[0]}
        onChange={handleChange}
        max={max}
        step={step}
        className="w-full"
      />
    );
  }
  
