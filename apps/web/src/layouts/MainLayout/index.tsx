import { Outlet } from 'react-router-dom';

import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import DotGridBackground from '../../components/ui/dot-grid-background';
import styles from './MainLayout.module.css';

export default function MainLayout() {
  return (
    <div className={styles.root}>
      {/* Global animated dot grid — fixed behind every page */}
      <div className={styles.bgLayer}>
        <DotGridBackground />
      </div>

      <Navbar />
      <main className={styles.main}>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
