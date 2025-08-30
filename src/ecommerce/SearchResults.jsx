import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Search, Filter, MapPin, Star, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    category: '',
    minPrice: '',
    maxPrice: '',
    condition: '',
    location: ''
  });

  const query = searchParams.get('q') || '';

  useEffect(() => {
    // Simulate API call for search results
    setLoading(true);
    setTimeout(() => {
      // Mock data - replace with actual API call
      const mockProducts = [
        {
          id: 1,
          name: 'MacBook Pro 2023',
          description: 'Excellent condition MacBook Pro with M2 chip',
          price: 85000,
          originalPrice: 120000,
          category: 'Electronics',
          condition: 'Like New',
          location: 'Mumbai',
          images: ['https://via.placeholder.com/300x200'],
          seller: { name: 'Rahul Kumar', rating: 4.8 },
          averageRating: 4.8,
          totalRatings: 12
        },
        {
          id: 2,
          name: 'Calculus Textbook',
          description: 'Thomas Calculus 14th Edition, barely used',
          price: 800,
          originalPrice: 1500,
          category: 'Books',
          condition: 'Good',
          location: 'Delhi',
          images: ['https://via.placeholder.com/300x200'],
          seller: { name: 'Priya Singh', rating: 4.6 },
          averageRating: 4.6,
          totalRatings: 8
        }
      ];
      setProducts(mockProducts);
      setLoading(false);
    }, 1000);
  }, [query]);

  const handleProductClick = (productId) => {
    navigate(`/itemlist/product/${productId}`);
  };

  const handleChatClick = (productId, sellerName) => {
    // Navigate to chat or open chat modal
    navigate(`/chating?productId=${productId}&seller=${sellerName}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-400"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">
            Search Results for "{query}"
          </h1>
          <p className="text-gray-300 text-lg">
            Found {products.length} product{products.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 mb-8 border border-white/20">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="Search products..."
                className="pl-10 bg-white/20 border-white/30 text-white placeholder-gray-400"
                defaultValue={query}
              />
            </div>
            <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </Button>
          </div>
        </div>

        {/* Results Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <Card 
              key={product.id} 
              className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl overflow-hidden hover:shadow-2xl hover:shadow-purple-500/25 transition-all duration-300 cursor-pointer group"
              onClick={() => handleProductClick(product.id)}
            >
              <div className="aspect-square bg-gradient-to-br from-purple-500 to-blue-500 overflow-hidden">
                <img 
                  src={product.images[0]} 
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
              </div>
              
              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <Badge variant="secondary" className="bg-purple-500/20 text-purple-300 border-purple-500/30">
                    {product.category}
                  </Badge>
                  <Badge variant="outline" className="border-green-500/50 text-green-400">
                    {product.condition}
                  </Badge>
                </div>
                
                <h3 className="text-xl font-semibold text-white mb-2 line-clamp-2 group-hover:text-purple-300 transition-colors">
                  {product.name}
                </h3>
                
                <p className="text-gray-300 text-sm mb-4 line-clamp-2">
                  {product.description}
                </p>
                
                <div className="flex items-center space-x-2 mb-3">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-400 text-sm">{product.location}</span>
                </div>
                
                <div className="flex items-center space-x-2 mb-4">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <span className="text-white font-semibold">{product.averageRating}</span>
                  <span className="text-gray-400 text-sm">({product.totalRatings})</span>
                </div>
                
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <span className="text-2xl font-bold text-purple-400">₹{(product.price || 0).toLocaleString()}</span>
                    {(product.originalPrice || 0) > (product.price || 0) && (
                      <span className="text-gray-400 line-through ml-2">₹{(product.originalPrice || 0).toLocaleString()}</span>
                    )}
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <Button 
                    className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleProductClick(product.id);
                    }}
                  >
                    View Details
                  </Button>
                  <Button 
                    variant="outline" 
                    className="border-purple-500/50 text-purple-300 hover:bg-purple-500/20"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleChatClick(product.id, product.seller.name);
                    }}
                  >
                    <MessageCircle className="w-4 h-4" />
                  </Button>
                </div>
                
                <div className="mt-4 pt-4 border-t border-white/20">
                  <p className="text-gray-400 text-sm">
                    Seller: <span className="text-purple-300">{product.seller.name}</span>
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {products.length === 0 && (
          <div className="text-center py-16">
            <div className="bg-white/10 backdrop-blur-md rounded-3xl p-12 border border-white/20">
              <Search className="w-24 h-24 text-purple-400 mx-auto mb-6" />
              <h3 className="text-2xl font-bold text-white mb-4">No Products Found</h3>
              <p className="text-gray-300 mb-8">Try adjusting your search terms or filters</p>
              <Button 
                onClick={() => navigate('/')}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              >
                Browse All Products
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchResults;
