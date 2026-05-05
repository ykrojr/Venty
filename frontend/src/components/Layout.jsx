import Sidebar from './Sidebar';

export default function Layout({ children }) {
  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="main-content">
        <div className="bg-glow"></div>
        <div className="bg-glow-2"></div>
        {children}
      </main>
    </div>
  );
}
