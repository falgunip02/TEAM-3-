import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import API_ENDPOINTS from '../config/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  ShoppingCart,
  Plus,
  Minus,
  Search,
  Filter,
  Clock,
  DollarSign
} from 'lucide-react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

const MenuPage = () => {
  const [menuItems, setMenuItems] = useState([])
  const [filteredItems, setFilteredItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [cart, setCart] = useState([])
  const [showCart, setShowCart] = useState(false)

  const { user } = useAuth()
  const navigate = useNavigate()

  // Restore cart from localStorage when page loads
  useEffect(() => {
    const savedCart = localStorage.getItem("cart")
    if (savedCart) {
      setCart(JSON.parse(savedCart))
    }
  }, [])

  // Fetch menu items from API
  useEffect(() => {
    fetchMenuItems()
  }, [])

  // Filter menu items when search or category changes
  useEffect(() => {
    filterItems()
  }, [menuItems, searchTerm, selectedCategory])

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart))
  }, [cart])

  const fetchMenuItems = async () => {
    try {
      const response = await axios.get(API_ENDPOINTS.menu.getAvailable)
      console.log("Menu API response:", response.data)

      const items = Array.isArray(response.data.items)
        ? response.data.items
        : Array.isArray(response.data)
        ? response.data
        : []

      setMenuItems(items)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching menu items:', error)
      setError('Failed to load menu items')
      setLoading(false)
    }
  }

  const filterItems = () => {
    let filtered = menuItems
    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(item => item.category === selectedCategory)
    }
    setFilteredItems(filtered)
  }

  // const addToCart = (item) => {
  //   const existingItem = cart.find(cartItem => cartItem.id === item.id)
  //   if (existingItem) {
  //     setCart(cart.map(cartItem =>
  //       cartItem.id === item.id
  //         ? { ...cartItem, quantity: cartItem.quantity + 1 }
  //         : cartItem
  //     ))
  //   } else {
  //     setCart([...cart, { ...item, quantity: 1 }])
  //   }
  // }

const addToCart = (item) => {
  const existingItem = cart.find(cartItem => cartItem.menuItemId === item.id);
  if (existingItem) {
    setCart(cart.map(cartItem =>
      cartItem.menuItemId === item.id
        ? { ...cartItem, quantity: cartItem.quantity + 1 }
        : cartItem
    ));
  } else {
    setCart([...cart, { ...item, id: item.id, menuItemId: item.id, quantity: 1 }]);
  }
};


//   const addToCart = (item) => {
//   const existingItem = cart.find(cartItem => cartItem.menuItemId === item.id);
//   if (existingItem) {
//     setCart(cart.map(cartItem =>
//       cartItem.menuItemId === item.id
//         ? { ...cartItem, quantity: cartItem.quantity + 1 }
//         : cartItem
//     ));
//   } else {
//     // Store menuItemId explicitly
//     setCart([...cart, { ...item, menuItemId: item.id, quantity: 1 }]);
//   }
// };

  const removeFromCart = (itemId) => {
    const existingItem = cart.find(cartItem => cartItem.id === itemId)
    if (existingItem && existingItem.quantity > 1) {
      setCart(cart.map(cartItem =>
        cartItem.id === itemId
          ? { ...cartItem, quantity: cartItem.quantity - 1 }
          : cartItem
      ))
    } else {
      setCart(cart.filter(cartItem => cartItem.id !== itemId))
    }
  }

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0).toFixed(2)
  }

  const getCartItemCount = () => {
    return cart.reduce((total, item) => total + item.quantity, 0)
  }

  const handleCheckout = () => {
    // Save cart and total to localStorage
    localStorage.setItem("cart", JSON.stringify(cart))
    localStorage.setItem("cartTotal", getCartTotal())
    navigate('/checkoutpage')
  }

  const categories = ['all', 'main', 'side', 'drink', 'dessert']

  const groupedItems = categories.reduce((acc, category) => {
    if (category === 'all') return acc
    acc[category] = filteredItems.filter(item => item.category === category)
    return acc
  }, {})

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading menu...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary/10 to-secondary/10 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-foreground mb-4">Today's Menu</h1>
            <p className="text-lg text-muted-foreground">
              Fresh, delicious meals prepared daily by our kitchen team
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search menu items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full md:w-48">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="main">Main Dishes</SelectItem>
              <SelectItem value="side">Sides</SelectItem>
              <SelectItem value="drink">Drinks</SelectItem>
              <SelectItem value="dessert">Desserts</SelectItem>
            </SelectContent>
          </Select>
          {user && (
            <Button
              variant="outline"
              onClick={() => setShowCart(!showCart)}
              className="relative"
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              Cart
              {getCartItemCount() > 0 && (
                <Badge className="absolute -top-2 -right-2 px-2 py-1 text-xs">
                  {getCartItemCount()}
                </Badge>
              )}
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Menu Items */}
          <div className="lg:col-span-3">
            {selectedCategory === 'all' ? (
              <Tabs defaultValue="main" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="main">Main</TabsTrigger>
                  <TabsTrigger value="side">Sides</TabsTrigger>
                  <TabsTrigger value="drink">Drinks</TabsTrigger>
                  <TabsTrigger value="dessert">Desserts</TabsTrigger>
                </TabsList>
                {Object.entries(groupedItems).map(([category, items]) => (
                  <TabsContent key={category} value={category} className="mt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                      {items.map((item) => (
                        <MenuItemCard
                          key={item.id}
                          item={item}
                          onAddToCart={addToCart}
                          cartItem={cart.find(cartItem => cartItem.id === item.id)}
                          user={user}
                        />
                      ))}
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredItems.map((item) => (
                  <MenuItemCard
                    key={item.id}
                    item={item}
                    onAddToCart={addToCart}
                    cartItem={cart.find(cartItem => cartItem.id === item.id)}
                    user={user}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Cart Sidebar */}
          {user && showCart && (
            <div className="lg:col-span-1">
              <Card className="sticky top-4">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <ShoppingCart className="w-5 h-5 mr-2" />
                    Your Order
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {cart.length === 0 ? (
                    <p className="text-muted-foreground text-center py-4">
                      Your cart is empty
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {cart.map((item) => (
                        <div key={item.id} className="flex items-center justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium text-sm">{item.name}</h4>
                            <p className="text-sm text-muted-foreground">
                              ${item.price.toFixed(2)} each
                            </p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => removeFromCart(item.id)}
                            >
                              <Minus className="w-3 h-3" />
                            </Button>
                            <span className="w-8 text-center">{item.quantity}</span>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => addToCart(item)}
                            >
                              <Plus className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                      <div className="border-t pt-4">
                        <div className="flex justify-between items-center font-semibold">
                          <span>Total:</span>
                          <span>${getCartTotal()}</span>
                        </div>
                        <Button className="w-full mt-4" onClick={handleCheckout}>
                          Proceed to Checkout
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

const MenuItemCard = ({ item, onAddToCart, cartItem, user }) => {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="aspect-video bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center">
        {item.imageUrl ? (
          <img
            src={item.imageUrl}
            alt={item.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="text-muted-foreground">
            <Clock className="w-12 h-12" />
          </div>
        )}
      </div>
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">{item.name}</CardTitle>
          <Badge variant="secondary" className="capitalize">
            {item.category}
          </Badge>
        </div>
        <CardDescription>{item.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-1">
            <DollarSign className="w-4 h-4 text-green-600" />
            <span className="text-lg font-semibold text-green-600">
              {item.price.toFixed(2)}
            </span>
          </div>
          {user && (
            <div className="flex items-center space-x-2">
              {cartItem && (
                <span className="text-sm text-muted-foreground">
                  {cartItem.quantity} in cart
                </span>
              )}
              <Button onClick={() => onAddToCart(item)}>
                <Plus className="w-4 h-4 mr-1" />
                Add
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default MenuPage
