import { useRouter } from 'next/router';
import { askOperator, getOperator, hasAccess, getRole } from '../util/api';
import { useEffect, useState } from 'react';

const Navbar = ({ auth: user, logout }) => {
  const router = useRouter();

  return (
    <nav className="navbar has-shadow" role="navigation" aria-label="main navigation">
      <div className="navbar-brand">
        <a role="button" className="navbar-burger burger" aria-label="menu" aria-expanded="false" data-target="navbar">
          <span aria-hidden="true"></span>
          <span aria-hidden="true"></span>
          <span aria-hidden="true"></span>
        </a>
      </div>

      <div id="navbar" className="navbar-menu">
        <div className="navbar-start" style={{ margin: 'auto' }}>
          <a className="navbar-item" onClick={() => router.push('/users')}>
            Користувачі
          </a>

          <a className="navbar-item" onClick={() => router.push('/mailing')}>
            Розсилка
          </a>

          <div className="navbar-item has-dropdown is-hoverable">
            <a className="navbar-link" onClick={() => router.push('/queues')}>
              Черги
            </a>

            <div className="navbar-dropdown">
              <a className="navbar-item" onClick={() => router.push('/queues/create')}>
                Створити чергу
              </a>
              <a className="navbar-item" onClick={() => router.push('/queues/users')}>
                Додати користувача
              </a>
            </div>
          </div>

          <div className="navbar-item has-dropdown is-hoverable">
            <a className="navbar-link">
              Профіль
            </a>

            <div className="navbar-dropdown">
              <div className="navbar-item">
                <b>{user.username}</b><i style={{ marginLeft: '5px' }}>({user.email})</i>
              </div>
              <hr className="navbar-divider" />
              <a 
                className="navbar-item" 
                onClick={() => logout()}
              >
                Вийти
              </a>
            </div>
          </div>
          
        </div>
      </div>
    </nav>
  );
};

export default Navbar;