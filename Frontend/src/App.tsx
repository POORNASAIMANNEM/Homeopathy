// import React from 'react';
// import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
// import { Heart, Star, Menu, X, ChevronRight, Phone, Mail, MapPin, Loader } from 'lucide-react';
// import Home from './pages/Home';
// import About from './pages/About';
// import Reviews from './pages/Reviews';
// import { useState,useEffect} from 'react';
// import Temp from './pages/temp';
// import axios from 'axios';
// import AdminSignin from './pages/signin';

// function Navbar() {
//   const [isOpen, setIsOpen] = React.useState(false);

//   return (
//     <nav className="bg-white shadow-md">
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//         <div className="flex justify-between h-16">
//           <div className="flex items-center">
//             <Link to="/" className="flex items-center">
//               <Heart className="h-8 w-8 text-teal-600" />
//               <span className="ml-2 text-xl font-semibold text-gray-900">HealingHands</span>
//             </Link>
//           </div>
          
//           {/* Desktop Navigation */}
//           <div className="hidden md:flex items-center space-x-8">
//             <Link to="/" className="text-gray-700 hover:text-teal-600 px-3 py-2 rounded-md text-sm font-medium">Home</Link>
//             <Link to="/about" className="text-gray-700 hover:text-teal-600 px-3 py-2 rounded-md text-sm font-medium">About</Link>
//             <Link to="/reviews" className="text-gray-700 hover:text-teal-600 px-3 py-2 rounded-md text-sm font-medium">Reviews</Link>
//           </div>

//           {/* Mobile menu button */}
//           <div className="md:hidden flex items-center">
//             <button
//               onClick={() => setIsOpen(!isOpen)}
//               className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-teal-600 focus:outline-none"
//             >
//               {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
//             </button>
//           </div>
//         </div>
//       </div>

//       {/* Mobile Navigation */}
//       {isOpen && (
//         <div className="md:hidden">
//           <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
//             <Link to="/" className="block text-gray-700 hover:text-teal-600 px-3 py-2 rounded-md text-base font-medium">Home</Link>
//             <Link to="/about" className="block text-gray-700 hover:text-teal-600 px-3 py-2 rounded-md text-base font-medium">About</Link>
//             <Link to="/reviews" className="block text-gray-700 hover:text-teal-600 px-3 py-2 rounded-md text-base font-medium">Reviews</Link>
//           </div>
//         </div>
//       )}
//     </nav>
//   );
// }

// function Footer() {
//   return (
//     <footer className="bg-teal-900 text-white">
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
//           <div>
//             <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
//             <div className="space-y-3">
//               <p className="flex items-center"><Phone className="h-5 w-5 mr-2" /> +1 (555) 123-4567</p>
//               <p className="flex items-center"><Mail className="h-5 w-5 mr-2" /> contact@healinghands.com</p>
//               <p className="flex items-center"><MapPin className="h-5 w-5 mr-2" /> 123 Healing Street, City</p>
//             </div>
//           </div>
//           <div>
//             <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
//             <ul className="space-y-2">
//               <li><Link to="/" className="hover:text-teal-300">Home</Link></li>
//               <li><Link to="/about" className="hover:text-teal-300">About</Link></li>
//               <li><Link to="/reviews" className="hover:text-teal-300">Reviews</Link></li>
//             </ul>
//           </div>
//           <div>
//             <h3 className="text-lg font-semibold mb-4">Working Hours</h3>
//             <ul className="space-y-2">
//               <li>Monday - Friday: 9:00 AM - 6:00 PM</li>
//               <li>Saturday: 9:00 AM - 2:00 PM</li>
//               <li>Sunday: Closed</li>
//             </ul>
//           </div>
//         </div>
//         <div className="mt-8 pt-8 border-t border-teal-800 text-center">
//           <p>&copy; 2024 HealingHands. All rights reserved.</p>
//         </div>
//       </div>
//     </footer>
//   );
// }

// function App() {
//   const [isAuth, setIsAuth] = useState<boolean | null>(null);
//   useEffect(() => {
//     axios.get("http://localhost:3000/adminsigin", {
//       withCredentials: true, // important to send cookies
//     })
//     .then(res => {
//       if (res.data?.data) {
//         setIsAuth(true);
//       } else {
//         setIsAuth(false);
//       }
//     })
//     .catch(() => {
//       setIsAuth(false);
//     });
//   }, []);
//   return (
//     <Router>
//       <div className="min-h-screen flex flex-col">
//         <Navbar />
//         <main className="flex-grow">
//           <Routes>
//             <Route path="/" element={<Home />} />
//             <Route path="/about" element={<About />} />
//             <Route path="/reviews" element={<Reviews />} />
//             {/* <Route path='/admin' element={<Temp/>} /> */}
//             {isAuth === null ? (
//               <div>Loading...</div>
//             ) : isAuth ? (
//               <Temp />
//             ) : (
//               <AdminSignin />
//             )}
            
//           </Routes>
//         </main>
//         <Footer />
//       </div>
//     </Router>
//   );
// }

// export default App;
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

// Pages
import Home from "./pages/Home";
import About from "./pages/About";
import Reviews from "./pages/Reviews";
import AdminDashboard from "./pages/temp";
import Card from './components/404'
function AppWrapper() {

  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/reviews" element={<Reviews />} />
        <Route path="/21357/ekaveera" element={<AdminDashboard />} />
        <Route path="*" element={<Card />} />
      </Routes>
      <Footer />
    </>
  );
}

function App() {
  return (
    <Router>
      <AppWrapper />
    </Router>
  );
}

export default App;
