import { Outlet, NavLink } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import './MasterPage.css';

const MasterPage = () => {
    const { logout } = useAuth();

    return (
        <div className="master-layout">
            <header className="top-nav">
                <div className="nav-brand">Student Management System</div>
                <nav className="nav-links">
                    <NavLink to="/students" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
                        Students
                    </NavLink>
                    <NavLink to="/classes" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
                        Classes
                    </NavLink>
                </nav>
                <div className="nav-actions">
                    <button onClick={logout} className="btn-logout">Logout</button>
                </div>
            </header>

            <main className="main-content">
                <div className="content-container">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default MasterPage;
