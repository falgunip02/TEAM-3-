
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import {
  Clock, CheckCircle, Package, Truck, Calendar, DollarSign, 
  ShoppingCart, User, ArrowRight, X, Info
} from 'lucide-react'
import axios from 'axios'

const AdminDashboard = () => {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [updating, setUpdating] = useState({})
  const [stats, setStats] = useState({
    totalOrders: 0,
    activeOrders: 0,
    completedOrders: 0,
    totalRevenue: 0
  })

  useEffect(() => {
    fetchAllOrders()
  }, [])

  const fetchAllOrders = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:8000/api/orders", {
        headers: { Authorization: `Bearer ${token}` }
      });

      setOrders(response.data)
      calculateStats(response.data)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching orders:', error)
      setError('Failed to load orders')
      setLoading(false)
    }
  }

  const calculateStats = (ordersData) => {
    const totalOrders = ordersData.length
    const activeOrders = ordersData.filter(order => 
      ['pending', 'preparing', 'ready_for_pickup'].includes(order.status)
    ).length
    const completedOrders = ordersData.filter(order => 
      order.status === 'picked_up'
    ).length
    const totalRevenue = ordersData
      .filter(order => order.status === 'picked_up')
      .reduce((sum, order) => sum + order.totalPrice, 0)

    setStats({
      totalOrders,
      activeOrders,
      completedOrders,
      totalRevenue
    })
  }

  // const updateOrderStatus = async (orderId, newStatus, notes = '') => {
  //   setUpdating(prev => ({ ...prev, [orderId]: true }))
  //   try {
  //     const token = localStorage.getItem("token");
  //     await axios.put(`http://localhost:8000/api/orders/${orderId}/status`, 
  //       { status: newStatus, notes },
  //       { headers: { 
  //         Authorization: `Bearer ${token}`,
  //         'Content-Type': 'application/json'
  //       }}
  //     );
  //     await fetchAllOrders()
  //     setError('')
  //   } catch (error) {
  //     console.error('Error updating order status:', error)
  //     setError('Failed to update order status')
  //   } finally {
  //     setUpdating(prev => ({ ...prev, [orderId]: false }))
  //   }
  // }



const updateOrderStatus = async (orderId, newStatus, notes = '') => {
  setUpdating(prev => ({ ...prev, [orderId]: true }))
  try {
    const token = localStorage.getItem("token");
    await axios.put(`http://localhost:8000/api/orders/${orderId}/status`, 
      { status: newStatus, notes },
      { headers: { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }}
    );
    await fetchAllOrders()
    setError('')
  } catch (error) {
    console.error('Error updating order status:', error)
    setError('Failed to update order status')
  } finally {
    setUpdating(prev => ({ ...prev, [orderId]: false }))
  }
}


  // Fixed syntax - added parentheses and semicolons
  const activeOrders = orders.filter(order =>
    ['pending', 'preparing', 'ready_for_pickup'].includes(order.status));
  const completedOrders = orders.filter(order =>
    order.status === 'picked_up');
  const cancelledOrders = orders.filter(order =>
    order.status === 'cancelled');

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Stats Header */}
      <div className="bg-gradient-to-r from-primary/10 to-secondary/10 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
            <p className="text-muted-foreground">
              Manage all cafe orders and operations
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard title="Total Orders" value={stats.totalOrders} icon={<ShoppingCart className="h-6 w-6" />} />
            <StatCard title="Active Orders" value={stats.activeOrders} icon={<Clock className="h-6 w-6" />} />
            <StatCard title="Completed" value={stats.completedOrders} icon={<CheckCircle className="h-6 w-6" />} />
            <StatCard title="Revenue" value={`₹${stats.totalRevenue.toFixed(2)}`} icon={<DollarSign className="h-6 w-6" />} />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="active" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="active">Active ({activeOrders.length})</TabsTrigger>
            <TabsTrigger value="completed">Completed ({completedOrders.length})</TabsTrigger>
            <TabsTrigger value="cancelled">Cancelled ({cancelledOrders.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="mt-6">
            <OrdersList 
              orders={activeOrders} 
              onStatusUpdate={updateOrderStatus} 
              updating={updating}
              allowUpdates={true}
            />
          </TabsContent>

          <TabsContent value="completed" className="mt-6">
            <OrdersList 
              orders={completedOrders} 
              onStatusUpdate={updateOrderStatus} 
              updating={updating}
              allowUpdates={false}
            />
          </TabsContent>
          
          <TabsContent value="cancelled" className="mt-6">
            <OrdersList 
              orders={cancelledOrders} 
              onStatusUpdate={updateOrderStatus} 
              updating={updating}
              allowUpdates={false}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

const StatCard = ({ title, value, icon }) => (
  <Card className="bg-background">
    <CardHeader className="flex flex-row items-center justify-between pb-2">
      <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
      <div className="p-2 rounded-full bg-primary/10 text-primary">
        {icon}
      </div>
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
    </CardContent>
  </Card>
);

const OrdersList = ({ orders, onStatusUpdate, updating, allowUpdates }) => (
  orders.length === 0 ? (
    <Card>
      <CardContent className="text-center py-12">
        <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold">No orders found</h3>
        <p className="text-muted-foreground">
          There are no orders in this category
        </p>
      </CardContent>
    </Card>
  ) : (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {orders.map(order => (
        <AdminOrderCard 
          key={order.id} 
          order={order} 
          onStatusUpdate={onStatusUpdate} 
          isUpdating={updating[order.id]}
          allowUpdates={allowUpdates}
        />
      ))}
    </div>
  )
)

const AdminOrderCard = ({ order, onStatusUpdate, isUpdating, allowUpdates }) => {
  const [notes, setNotes] = useState(order.notes || '')
  const [showNotesInput, setShowNotesInput] = useState(false)

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />
      case 'preparing': return <Package className="w-4 h-4" />
      case 'ready_for_pickup': return <Truck className="w-4 h-4" />
      case 'picked_up': return <CheckCircle className="w-4 h-4" />
      case 'cancelled': return <X className="w-4 h-4" />
      default: return <Clock className="w-4 h-4" />
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'preparing': return 'bg-blue-100 text-blue-800'
      case 'ready_for_pickup': return 'bg-green-100 text-green-800'
      case 'picked_up': return 'bg-gray-100 text-gray-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatStatus = (status) => {
    return status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
  }

  const getNextStatus = (currentStatus) => {
    switch (currentStatus) {
      case 'pending': return 'preparing'
      case 'preparing': return 'ready_for_pickup'
      case 'ready_for_pickup': return 'picked_up'
      default: return currentStatus
    }
  }

  const getNextStatusLabel = (currentStatus) => {
    switch (currentStatus) {
      case 'pending': return 'Start Preparing'
      case 'preparing': return 'Mark as Ready'
      case 'ready_for_pickup': return 'Mark as Picked Up'
      default: return null
    }
  }

  const nextStatus = getNextStatus(order.status)
  const nextStatusLabel = getNextStatusLabel(order.status)

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">Order #{order.id.slice(-8)}</CardTitle>
            <CardDescription>
              {new Date(order.orderDate).toLocaleString()}
            </CardDescription>
          </div>
          <Badge className={`${getStatusColor(order.status)} flex items-center space-x-1`}>
            {getStatusIcon(order.status)}
            <span>{formatStatus(order.status)}</span>
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="space-y-4">
          {/* Customer Info */}
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <User className="w-4 h-4" />
            <span>Customer ID: {order.userId?.slice(-8) || 'N/A'}</span>
          </div>

          {/* Order Items */}
          <div>
            <h4 className="font-medium mb-2">Items:</h4>
            <div className="space-y-1">
              {order.items.map((item, index) => (
                <div key={index} className="flex justify-between text-sm">
                  <span>{item.quantity}x {item.name || `Item #${item.menuItemId?.slice(-8) || 'N/A'}`}</span>
                  <span>₹{(item.priceAtOrder * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Pickup Time */}
          {order.pickupTime && (
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Calendar className="w-4 h-4" />
              <span>
                Pickup: {new Date(order.pickupTime).toLocaleString()}
              </span>
            </div>
          )}

          {/* Notes */}
          {order.notes && (
            <div className="p-2 bg-muted rounded text-sm">
              <strong>Notes:</strong> {order.notes}
            </div>
          )}

          {/* Total */}
          <div className="flex justify-between items-center pt-2 border-t">
            <span className="font-semibold">Total:</span>
            <div className="flex items-center space-x-1">
              <DollarSign className="w-4 h-4 text-green-600" />
              <span className="font-semibold text-green-600">
                ₹{order.totalPrice.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          {allowUpdates && (
            <div className="space-y-2 pt-4">
              {nextStatusLabel && (
                <Button
                  onClick={() => onStatusUpdate(order.id, nextStatus, notes)}
                  disabled={isUpdating}
                  className="w-full"
                >
                  {isUpdating ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  ) : (
                    <ArrowRight className="w-4 h-4 mr-2" />
                  )}
                  {nextStatusLabel}
                </Button>
              )}

              {order.status !== 'cancelled' && (
                <Button
                  variant="destructive"
                  onClick={() => onStatusUpdate(order.id, 'cancelled', notes)}
                  disabled={isUpdating}
                  className="w-full"
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancel Order
                </Button>
              )}

              <div className="space-y-2">
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => setShowNotesInput(!showNotesInput)}
                >
                  <Info className="w-4 h-4 mr-2" />
                  {showNotesInput ? 'Hide Notes' : 'Add/Update Notes'}
                </Button>

                {showNotesInput && (
                  <div className="space-y-2">
                    <Textarea
                      placeholder="Add order notes..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="text-sm"
                      rows={3}
                    />
                    <Button
                      onClick={() => {
                        // Update notes without changing status
                        onStatusUpdate(order.id, order.status, notes)
                        setShowNotesInput(false)
                      }}
                      disabled={isUpdating}
                      className="w-full"
                    >
                      Save Notes
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default AdminDashboard