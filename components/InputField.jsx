const InputField = ({ value, placeholder, title, onChange }) => {
  return (
    <div className="field">
      <label className="label">{title}</label>
      <div className="control">
        <input className="input" type="text" value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
      </div>
    </div>
  );
};

export default InputField;
