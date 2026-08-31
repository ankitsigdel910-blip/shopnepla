import { Link } from 'react-router-dom';

const NotFound = () => (
  <div className="py-24 text-center">
    <h1 className="text-4xl font-bold mb-2">404</h1>
    <p className="text-gray-500 mb-6">Page not found.</p>
    <Link to="/" className="btn-primary">Go Home</Link>
  </div>
);

export default NotFound;
