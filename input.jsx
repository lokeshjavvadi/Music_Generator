export function Input({ type = "text", value, onChange, placeholder }) {
    return (
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="border rounded-xl px-3 py-2 w-full shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
      />
    );
  }
  