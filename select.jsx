import { useState } from "react";

import React from "react";

export function Select({ value, onChange, options = [] }) {
  return (
    <select value={value} onChange={onChange} className="custom-select">
      <option value="">-- Choose --</option>
      {options.map((opt) => (
        <option key={opt} value={opt}>
          {opt}
        </option>
      ))}
    </select>
  );
}

export function SelectTrigger({ children }) {
  return (
    <div className="border rounded-xl px-3 py-2 cursor-pointer shadow-sm bg-white">
      {children}
    </div>
  );
}

export function SelectContent({ children }) {
  return (
    <div className="absolute z-10 mt-2 bg-white border rounded-xl shadow-md w-full">
      {children}
    </div>
  );
}

export function SelectItem({ value, children, onClick }) {
  return (
    <div
      className="px-4 py-2 hover:bg-blue-100 cursor-pointer"
      onClick={() => onClick && onClick(value)}
    >
      {children}
    </div>
  );
}



