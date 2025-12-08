// frontend/src/pages/Home.jsx
import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Link } from 'react-router-dom';
import Container from '../components/ui/Container';
import Button from '../components/ui/Button';

const Home = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <Header />
      <main className="py-12 md:py-16 pt-20 md:pt-24">
        <Container>
        <section className="grid gap-8 grid-cols-1 md:grid-cols-2 items-center animate-fade-in">
          <div className='pr-4 md:pr-8'>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight text-gray-900 mb-6">Welcome to Document Tracker</h1>
            <p className="text-lg text-gray-600 mb-6 max-w-xl">Upload, manage, and track your documents with powerful search, version history and access control. It's fast, secure and simple to use.</p>
              <div className="flex gap-4 items-center">
              <Link to="/login"><Button className='px-6 py-3 text-lg'>Get Started</Button></Link>
              <Link to="/login"><Button variant="secondary">Login</Button></Link>
            </div>
          </div>
          <div className="flex justify-center md:justify-end">
            <div className="w-full max-w-lg md:max-w-md">
              {/* Illustrative card for visual interest */}
              <div className="bg-gradient-to-tr from-indigo-600 to-pink-500 text-white p-6 rounded-xl shadow-2xl transform transition duration-500 hover:scale-105">
                <h3 className="text-xl font-bold mb-2">Organize & Share</h3>
                <p className="mb-4 text-sm opacity-90">Search, tag and share documents with permissioned access to team members.</p>
                <div className="flex gap-2">
                  <div className="bg-white/20 px-3 py-1 rounded-full text-xs font-medium">Versioning</div>
                  <div className="bg-white/20 px-3 py-1 rounded-full text-xs font-medium">Tags</div>
                  <div className="bg-white/20 px-3 py-1 rounded-full text-xs font-medium">Access Control</div>
                </div>
              </div>
            </div>
          </div>
        </section>
        </Container>
      </main>
      <Footer />
    </div>
  );
};

export default Home;
