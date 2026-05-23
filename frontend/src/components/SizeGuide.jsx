import "./SizeGuide.css";

export default function SizeGuide({ open, onClose, category }) {
  if (!open) return null;

  const isMen = category === "men";

  return (
    <div className="size-guide-overlay" onClick={onClose}>
      <div className="size-guide" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="size-guide__close" onClick={onClose}>×</button>
        <h3>Size Guide</h3>
        <p className="size-guide__note">All measurements in inches</p>
        <table>
          <thead>
            <tr>
              <th>Size</th>
              <th>Chest</th>
              <th>Waist</th>
              {!isMen && <th>Hip</th>}
            </tr>
          </thead>
          <tbody>
            {(isMen
              ? [
                  ["S", "36-38", "30-32"],
                  ["M", "38-40", "32-34"],
                  ["L", "40-42", "34-36"],
                  ["XL", "42-44", "36-38"],
                ]
              : [
                  ["XS", "32", "24", "34"],
                  ["S", "34", "26", "36"],
                  ["M", "36", "28", "38"],
                  ["L", "38", "30", "40"],
                ]
            ).map((row) => (
              <tr key={row[0]}>
                {row.map((cell, i) => (
                  <td key={i}>{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
