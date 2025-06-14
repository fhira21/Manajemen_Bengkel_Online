import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";

const LoginPage = () => {
  const [formData, setFormData] = useState({
    username: "",
    password: ""
  });
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const response = await fetch("/data/userData.json");
        if (!response.ok) throw new Error("Failed to fetch user data");
        const data = await response.json();
        setUsers(data.users);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (loading) {
      setError("System is loading, please wait");
      return;
    }

    const user = users.find(u => 
      u.username === formData.username && 
      u.password === formData.password
    );

    if (user) {
      // Save user data to localStorage
      localStorage.setItem("currentUser", JSON.stringify({
        id: user.id,
        name: user.nama,
        role: user.role,
        username: user.username
      }));

      // Redirect based on role
      if (user.role === "admin") {
        navigate("/dashboardadmin");
      } else {
        navigate("/dashboardmontir");
      }
    } else {
      setError("Invalid username or password");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <Link to="/" className="flex items-center">
                <img
                  src="/volkswagen.webp"
                  alt="Volkswagen Logo"
                  className="h-8 w-auto"
                />
                <span className="ml-2 text-xl font-bold text-gray-900">
                  VW Service Center
                </span>
              </Link>
            </div>
            
            <div className="hidden md:flex items-center space-x-4">
              <Link 
                to="/" 
                className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-blue-600"
              >
                Home
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-grow flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-800">Login</h2>
              <p className="mt-2 text-gray-600">
                Access your Volkswagen Service account
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                  Username
                </label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  value={formData.username}
                  onChange={handleChange}
                  disabled={loading}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  disabled={loading}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                    Remember me
                  </label>
                </div>

                <div className="text-sm">
                  <Link to="/forgot-password" className="font-medium text-blue-600 hover:text-blue-500">
                    Forgot password?
                  </Link>
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                    loading ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
                  } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
                >
                  {loading ? "Loading..." : "Sign in"}
                </button>
              </div>
            </form>
          </div>
          
          <div className="px-8 py-4 bg-gray-50 border-t border-gray-200">
            <div className="text-sm text-center text-gray-600">
              Don't have an account?{" "}
              <Link to="/register" className="font-medium text-blue-600 hover:text-blue-500">
                Register here
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">Services</h3>
              <ul className="space-y-2">
                <li><Link to="#" className="text-gray-300 hover:text-white">Regular Maintenance</Link></li>
                <li><Link to="#" className="text-gray-300 hover:text-white">Repairs</Link></li>
                <li><Link to="#" className="text-gray-300 hover:text-white">Genuine Parts</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Contact</h3>
              <address className="not-italic text-gray-300">
                <p>Volkswagen Street No.123</p>
                <p>contact@vw-service.id</p>
                <p>+62 21 1234 5678</p>
              </address>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Opening Hours</h3>
              <ul className="text-gray-300">
                <li>Monday-Friday: 8AM - 5PM</li>
                <li>Saturday: 8AM - 3PM</li>
                <li>Sunday: Closed</li>
              </ul>
            </div>
          </div>
          
          <div className="mt-8 pt-8 border-t border-gray-700 text-center text-gray-400">
            <p>&copy; {new Date().getFullYear()} Volkswagen Service Center. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LoginPage;