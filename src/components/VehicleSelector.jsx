import { useState } from "react";

const VEHICLES = {
  Hero: {
    Splendor: { 2022: ["BS6 Drum", "BS6 Disc"] },
    Passion: { 2021: ["BS4"] },
  },
  Honda: {
    Shine: { 2022: ["BS6 Disc"] },
    Unicorn: { 2023: ["BS6 Disc"] },
  },
};

export default function VehicleSelector({ onSelect }) {
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState("");
  const [variant, setVariant] = useState("");

  return (
    <div className="vehicle-bar">
      <select value={brand} onChange={(e) => { setBrand(e.target.value); setModel(""); setYear(""); setVariant(""); }}>
        <option value="">Brand</option>
        {Object.keys(VEHICLES).map(b => <option key={b}>{b}</option>)}
      </select>

      <select disabled={!brand} value={model} onChange={(e) => { setModel(e.target.value); setYear(""); setVariant(""); }}>
        <option value="">Model</option>
        {brand && Object.keys(VEHICLES[brand]).map(m => <option key={m}>{m}</option>)}
      </select>

      <select disabled={!model} value={year} onChange={(e) => { setYear(e.target.value); setVariant(""); }}>
        <option value="">Year</option>
        {model && Object.keys(VEHICLES[brand][model]).map(y => <option key={y}>{y}</option>)}
      </select>

      <select disabled={!year} value={variant} onChange={(e) => {
        setVariant(e.target.value);
        onSelect({ brand, model, year, variant: e.target.value });
      }}>
        <option value="">Variant</option>
        {year && VEHICLES[brand][model][year].map(v => <option key={v}>{v}</option>)}
      </select>
    </div>
  );
}