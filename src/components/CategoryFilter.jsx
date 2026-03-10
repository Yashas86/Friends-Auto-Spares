const categories = ["All", "Engine", "Brake", "Oil", "Electrical"];

export default function CategoryFilter({ selected, setSelected }) {
  return (
    <div className="sidebar">
      {categories.map(cat => (
        <button
          key={cat}
          className={selected === cat ? "active" : ""}
          onClick={() => setSelected(cat)}
        >
          {cat}
        </button>
      ))}
    </div>
  );
}