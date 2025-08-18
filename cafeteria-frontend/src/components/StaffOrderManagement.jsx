import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import {
  Clock,
  CheckCircle,
  Package,
  Truck,
  Calendar,
  DollarSign,
  User,
  ArrowRight,
  X
} from 'lucide-react'
import axios from 'axios'

const StaffOrderManagement = () => {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [updating, setUpdating] = useState({})

  const { user } = useAuth()

  useEffect(() => {
    fetchOrders()
    // Refresh orders every 30 seconds
    const interval = setInterval(fetchOrders, 30000)
    return () => clearInterval(interval)
  }, [])

  const fetchOrders = async () => {
    try {
      const response = await axios.get('/api/orders/active')
      setOrders(response.data)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching orders:', error)
      setError('Failed to load orders')
      setLoading(false)
    }
  }

  const updateOrderStatus = async (orderId, newStatus, notes = '') => {
    setUpdating(prev => ({ ...prev, [orderId]: true }))
    try {
      await axios.put(`/api/orders/${orderId}/status`, {
        status: newStatus,
        notes: notes
      })
      await fetchOrders() // Refresh orders
      setError('')
    } catch (error) {
      console.error('Error updating order status:', error)
      setError('Failed to update order status')
    } finally {
      setUpdating(prev => ({ ...prev, [orderId]: false }))
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4" />
      case 'preparing':
        return <Package className="w-4 h-4" />
      case 'ready_for_pickup':
        return <Truck className="w-4 h-4" />
      case 'picked_up':
        return <CheckCircle className="w-4 h-4" />
      case 'cancelled':
        return <X className="w-4 h-4" />
      default:
        return <Clock className="w-4 h-4" />
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'preparing':
        return 'bg-blue-100 text-blue-800'
      case 'ready_for_pickup':
        return 'bg-green-100 text-green-800'
      case 'picked_up':
        return 'bg-gray-100 text-gray-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatStatus = (status) => {
    return status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
  }

  const pendingOrders = orders.filter(order => order.status === 'pending')
  const preparingOrders = orders.filter(order => order.status === 'preparing')
  const readyOrders = orders.filter(order => order.status === 'ready_for_pickup')

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading orders...</p>
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
            <h1 className="text-4xl font-bold text-foreground mb-4">Order Management</h1>
            <p className="text-lg text-muted-foreground">
              Manage and track all cafe orders
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

        <Tabs defaultValue="pending" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="pending">
              Pending ({pendingOrders.length})
            </TabsTrigger>
            <TabsTrigger value="preparing">
              Preparing ({preparingOrders.length})
            </TabsTrigger>
            <TabsTrigger value="ready">
              Ready ({readyOrders.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="mt-6">
            <OrderList
              orders={pendingOrders}
              onUpdateStatus={updateOrderStatus}
              updating={updating}
              emptyMessage="No pending orders"
            />
          </TabsContent>

          <TabsContent value="preparing" className="mt-6">
            <OrderList
              orders={preparingOrders}
              onUpdateStatus={updateOrderStatus}
              updating={updating}
              emptyMessage="No orders being prepared"
            />
          </TabsContent>

          <TabsContent value="ready" className="mt-6">
            <OrderList
              orders={readyOrders}
              onUpdateStatus={updateOrderStatus}
              updating={updating}
              emptyMessage="No orders ready for pickup"
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

const OrderList = ({ orders, onUpdateStatus, updating, emptyMessage }) => {
  if (orders.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">{emptyMessage}</h3>
          <p className="text-muted-foreground">
            Orders will appear here when they need attention.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {orders.map((order) => (
        <StaffOrderCard
          key={order.id}
          order={order}
          onUpdateStatus={onUpdateStatus}
          isUpdating={updating[order.id]}
        />
      ))}
    </div>
  )
}

const StaffOrderCard = ({ order, onUpdateStatus, isUpdating }) => {
  const [notes, setNotes] = useState('')

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4" />
      case 'preparing':
        return <Package className="w-4 h-4" />
      case 'ready_for_pickup':
        return <Truck className="w-4 h-4" />
      case 'picked_up':
        return <CheckCircle className="w-4 h-4" />
      case 'cancelled':
        return <X className="w-4 h-4" />
      default:
        return <Clock className="w-4 h-4" />
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'preparing':
        return 'bg-blue-100 text-blue-800'
      case 'ready_for_pickup':
        return 'bg-green-100 text-green-800'
      case 'picked_up':
        return 'bg-gray-100 text-gray-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatStatus = (status) => {
    return status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
  }

  const getNextStatus = (currentStatus) => {
    switch (currentStatus) {
      case 'pending':
        return 'preparing'
      case 'preparing':
        return 'ready_for_pickup'
      case 'ready_for_pickup':
        return 'picked_up'
      default:
        return null
    }
  }

  const getNextStatusLabel = (currentStatus) => {
    switch (currentStatus) {
      case 'pending':
        return 'Start Preparing'
      case 'preparing':
        return 'Mark Ready'
      case 'ready_for_pickup':
        return 'Mark Picked Up'
      default:
        return null
    }
  }

  const nextStatus = getNextStatus(order.status)
  const nextStatusLabel = getNextStatusLabel(order.status)

  return (
    <Card className="h-fit">
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
      <CardContent>
        <div className="space-y-4">
          {/* Customer Info */}
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <User className="w-4 h-4" />
            <span>Customer ID: {order.userId.slice(-8)}</span>
          </div>

          {/* Order Items */}
          <div>
            <h4 className="font-medium mb-2">Items:</h4>
            <div className="space-y-1">
              {order.items.map((item, index) => (
                <div key={index} className="flex justify-between text-sm">
                  <span>{item.quantity}x Item #{item.menuItemId.slice(-8)}</span>
                  <span>${(item.priceAtOrder * item.quantity).toFixed(2)}</span>
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
                {order.totalPrice.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2 pt-2">
            {nextStatus && (
              <Button
                onClick={() => onUpdateStatus(order.id, nextStatus, notes)}
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

            <Button
              variant="destructive"
              onClick={() => onUpdateStatus(order.id, 'cancelled', notes)}
              disabled={isUpdating}
              className="w-full"
            >
              <X className="w-4 h-4 mr-2" />
              Cancel Order
            </Button>

            {/* Notes input */}
            <Textarea
              placeholder="Add notes (optional)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="text-sm"
              rows={2}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default StaffOrderManagement

