import Layout from '../components/Layout';
import '../styles/globals.css';
import { AuthProvider } from '../lib/AuthContext';
import { ThemeProvider } from '../lib/ThemeContext';
import { useEffect } from 'react';
import Head from 'next/head';

function MyApp({ Component, pageProps }) {
  useEffect(() => {
    // Initialize sample orders for admins if none exist
    const initializeOrders = async () => {
      try {
        // First check if user is logged in and is admin
        const meResponse = await fetch('/api/auth/me');
        if (meResponse.ok) {
          const userData = await meResponse.json();
          
          // If admin user, check if orders exist and seed if needed
          if (userData.success && userData.data && userData.data.isAdmin) {
            // Check if orders exist
            const ordersResponse = await fetch('/api/orders');
            if (ordersResponse.ok) {
              const orders = await ordersResponse.json();
              
              // If no orders, trigger seeding
              if (!orders || orders.length === 0) {
                console.log('No orders found, seeding sample data...');
                await fetch('/api/seed-orders');
                console.log('Orders seeded successfully');
              }
            }
          }
        }
      } catch (error) {
        console.error('Error initializing sample orders:', error);
      }
    };

    initializeOrders();
  }, []);

  return (
    <ThemeProvider>
      <AuthProvider>
        <Head>
          <title>ShopHub</title>
          <meta name="description" content="Your one-stop shop for all your needs" />
          <link rel="icon" href="/images/shop-logo.png" />
        </Head>
        <Layout>
          <Component {...pageProps} />
        </Layout>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default MyApp; 