const Dropdown = ({ defaultText, style, data, active, onChange }) => {
  const disabled = !data || data.length === 0;

  return (
    <div className="dropdown is-hoverable" style={style}>
      <div className="dropdown-trigger">
        <button className="button" disabled={disabled}>
          <span>{active ? (data.find(v => v.key === active)).name : defaultText}</span>
          <span className="icon is-small">
            <i className="fas fa-angle-down"></i>
          </span>
        </button>
      </div>
      {
        !disabled &&
        <div className="dropdown-menu" id="dropdown-menu" role="menu">
          <div className="dropdown-content">
            {
              data.map(v => 
                <a 
                  key={v.key} 
                  onClick={() => { 
                    onChange(v); 
                  }}
                  className={`dropdown-item ${v.key === active ? 'is-active' : ''}`}
                >
                    {v.name}
                </a>
              )
            }
          </div>
        </div>
      }
    </div>
  );
};

export default Dropdown;
