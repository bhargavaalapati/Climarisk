import React from 'react';
import { Layout, ConfigProvider } from 'antd';
import { Route, Routes } from 'react-router-dom';
import { Toaster } from 'sonner';

import Navbar from './components/Layout/Navbar';
import HomePage from './pages/HomePage';
import DashboardPage from './pages/DashboardPage';
import AboutPage from './pages/AboutPage';
import NotFoundPage from './pages/NotFoundPage';

const { Header, Content, Footer } = Layout;

// Define our color theme object
const theme = {
  token: {
    colorPrimary: '#003a8c', // Deep Blue for primary buttons, links, etc.
    colorInfo: '#1890ff',   // Bright Blue for accents
    colorTextBase: '#333333', // Charcoal for main text
  },
  components: {
    Layout: {
      headerBg: '#ffffff', // White header background
      footerBg: '#f0f2f5', // Light grey footer background
    },
  },
};

// Layout with Navbar + Footer
function MainLayout({ children }) {
  return (
    <Layout>
      <Toaster richColors theme="light" position="top-right" />
      <Header style={{ display: 'flex', alignItems: 'center', padding: '0 24px', backgroundColor: theme.components.Layout.headerBg, borderBottom: '1px solid #f0f0f0' }}>
        <Navbar />
      </Header>
      <Content style={{ padding: '24px', backgroundColor: '#f0f2f5' }}>
        {children}
      </Content>
      <Footer style={{ textAlign: 'center', backgroundColor: theme.components.Layout.footerBg }}>
        ClimaRisk ©{new Date().getFullYear()} - A NASA Space Apps Project
      </Footer>
    </Layout>
  );
}

// Minimal layout (no Navbar/Footer)
function MinimalLayout({ children }) {
  return (
    <Layout>
      <Content style={{ padding: '24px', textAlign: 'center', backgroundColor: '#141414' }}>{children}</Content>
    </Layout>
  );
}

function App() {
  return (
    <ConfigProvider theme={theme}>
      <Routes>
        <Route
          index
          element={
            <MainLayout>
              <HomePage />
            </MainLayout>
          }
        />
        <Route
          path="dashboard"
          element={
            <MainLayout>
              <DashboardPage />
            </MainLayout>
          }
        />
        <Route
          path="about"
          element={
            <MainLayout>
              <AboutPage />
            </MainLayout>
          }
        />
        <Route
          path="*"
          element={
            <MinimalLayout>
              <NotFoundPage />
            </MinimalLayout>
          }
        />
      </Routes>
    </ConfigProvider>
  );
}

export default App;