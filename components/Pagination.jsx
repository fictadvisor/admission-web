const EmptyButton = () => <li><span className="pagination-ellipsis">&hellip;</span></li>;

// ( ͡° ͜ʖ ͡°)
// https://i.imgur.com/lWl3u0q.jpg
const Pagination = ({ count, pageSize, page, onChange }) => {
  if (count <= pageSize) {
    return null;
  }

  const pageCount = Math.ceil(count / pageSize);
  const buttons = [];

  const PageButton = ({ num }) => <li><a className={`pagination-link ${page == num ? 'is-current' : ''}`} onClick={() => onChange && onChange(num)}>{num + 1}</a></li>;

  if (pageCount < 8) {
    for (let i = 0; i < pageCount; i++) {
      buttons.push(<PageButton key={i} num={i} />);
    }
  } else {
    if (page < 3) {
      for (let i = 0; i < 4; i++) {
        buttons.push(<PageButton key={i} num={i} />);
      }

      buttons.push(<EmptyButton key="empty-1" />);
      buttons.push(<PageButton key={pageCount - 1} num={pageCount - 1} />);
    } else if (page > pageCount - 4) {
      buttons.push(<PageButton key={0} num={0} />);
      buttons.push(<EmptyButton key="empty-1" />);

      for (let i = pageCount - 4; i < pageCount; i++) {
        buttons.push(<PageButton key={i} num={i} />);
      }
    } else {
      buttons.push(<PageButton key={0} num={0} />);
      buttons.push(<EmptyButton key="empty-1" />);
      buttons.push(<PageButton key={page - 1} num={page - 1} />);
      buttons.push(<PageButton key={page} num={page} />);
      buttons.push(<PageButton key={page + 1} num={page + 1} />);
      buttons.push(<EmptyButton key="empty-2" />);
      buttons.push(<PageButton key={pageCount - 1} num={pageCount - 1} />);
    }
  }

  return (
    <nav className="pagination is-centered">
      <a 
        className="pagination-previous" 
        disabled={page < 1}
        onClick={() => page > 0 && onChange && onChange(page - 1)}
      >
        {'<'}
      </a>
      <a 
        className="pagination-next" 
        disabled={page >= (pageCount - 1)}
        onClick={() => page < (pageCount - 1) && onChange && onChange(page + 1)}
      >
        {'>'}
      </a>
      <ul className="pagination-list">
        {buttons}
      </ul>
    </nav>
  );
};

export default Pagination;
