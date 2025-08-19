import { useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import API_ENDPOINTS from '../config/api'
import { useAuth } from '../context/AuthContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'

const emptyForm = {
  name: '',
  description: '',
  price: '',
  category: '',
  imageUrl: '',
  available: true,
}

export default function AdminMenu() {
  // axios Authorization header is already set in AuthContext when token exists
  const { user } = useAuth()
  const role = (user?.role || '').toLowerCase()
  const isStaffOrAdmin = role === 'staff' || role === 'admin'

  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState(null)

  const categories = useMemo(() => {
    const set = new Set(items.map(i => i.category).filter(Boolean))
    return Array.from(set)
  }, [items])

  const fetchAll = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await axios.get(API_ENDPOINTS.menu.getAll)
      setItems(res.data || [])
    } catch (e) {
      console.error(e)
      setError(e?.response?.data?.message || 'Failed to load menu')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAll()
  }, [])

  const handleChange = (key, val) => setForm(prev => ({ ...prev, [key]: val }))

  const resetForm = () => {
    setForm(emptyForm)
    setEditingId(null)
    setSuccess('')
    setError('')
  }

  const handleCreate = async (e) => {
    e?.preventDefault?.()
    setError('')
    setSuccess('')
    try {
      // backend expects: name, description, price (number), category, imageUrl, available (boolean)
      const payload = { 
        ...form, 
        price: Number(form.price) 
      }
      const res = await axios.post(API_ENDPOINTS.menu.add, payload)
      setItems(prev => [...prev, res.data])
      setSuccess('Menu item created')
      resetForm()
    } catch (e) {
      console.error(e)
      setError(e?.response?.data?.message || 'Failed to create item')
    }
  }

  const startEdit = (item) => {
    setEditingId(item.id)
    setForm({
      name: item.name || '',
      description: item.description || '',
      price: String(item.price ?? ''),
      category: item.category || '',
      imageUrl: item.imageUrl || '',
      available: !!item.available,
    })
  }

  const handleUpdate = async (e) => {
    e?.preventDefault?.()
    setError('')
    setSuccess('')
    try {
      const payload = { ...form, price: Number(form.price) }
      const res = await axios.put(API_ENDPOINTS.menu.update(editingId), payload)
      setItems(prev => prev.map(i => (i.id === editingId ? res.data : i)))
      setSuccess('Menu item updated')
      resetForm()
    } catch (e) {
      console.error(e)
      setError(e?.response?.data?.message || 'Failed to update item')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this item?')) return
    setError('')
    setSuccess('')
    try {
      await axios.delete(API_ENDPOINTS.menu.delete(id))
      setItems(prev => prev.filter(i => i.id !== id))
      setSuccess('Menu item deleted')
      if (editingId === id) resetForm()
    } catch (e) {
      console.error(e)
      setError(e?.response?.data?.message || 'Failed to delete item')
    }
  }

  if (!isStaffOrAdmin) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Alert>
          <AlertDescription>You do not have permission to manage the menu.</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Menu Management</h1>
        <Button variant="secondary" onClick={fetchAll} disabled={loading}>
          Refresh
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {success && (
        <Alert>
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue={editingId ? 'edit' : 'create'}>
        <TabsList>
          <TabsTrigger value="create">Create</TabsTrigger>
          <TabsTrigger value="edit" disabled={!editingId}>Edit</TabsTrigger>
        </TabsList>

        {/* Create */}
        <TabsContent value="create">
          <Card>
            <CardHeader>
              <CardTitle>Add New Item</CardTitle>
            </CardHeader>
            <CardContent>
              <form className="grid md:grid-cols-2 gap-4" onSubmit={handleCreate}>
                <div className="space-y-2">
                  <Label>Name</Label>
                  <Input value={form.name} onChange={e => handleChange('name', e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select value={form.category} onValueChange={v => handleChange('category', v)}>
                    <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                    <SelectContent>
                      {categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                      <SelectItem value="Beverages">Beverages</SelectItem>
                      <SelectItem value="Snacks">Snacks</SelectItem>
                      <SelectItem value="Meals">Meals</SelectItem>
                      <SelectItem value="Desserts">Desserts</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Description</Label>
                  <Input value={form.description} onChange={e => handleChange('description', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Price</Label>
                  <Input type="number" step="0.01" value={form.price} onChange={e => handleChange('price', e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label>Image URL</Label>
                  <Input value={form.imageUrl} onChange={e => handleChange('imageUrl', e.target.value)} />
                </div>
                <div className="flex items-center gap-3">
                  <Switch checked={form.available} onCheckedChange={v => handleChange('available', v)} />
                  <span>Available</span>
                </div>
                <div className="md:col-span-2 flex gap-3">
                  <Button type="submit">Create</Button>
                  <Button type="button" variant="outline" onClick={resetForm}>Reset</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Edit */}
        <TabsContent value="edit">
          <Card>
            <CardHeader>
              <CardTitle>Edit Item</CardTitle>
            </CardHeader>
            <CardContent>
              <form className="grid md:grid-cols-2 gap-4" onSubmit={handleUpdate}>
                <div className="space-y-2">
                  <Label>Name</Label>
                  <Input value={form.name} onChange={e => handleChange('name', e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select value={form.category} onValueChange={v => handleChange('category', v)}>
                    <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                    <SelectContent>
                      {categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                      <SelectItem value="Beverages">Beverages</SelectItem>
                      <SelectItem value="Snacks">Snacks</SelectItem>
                      <SelectItem value="Meals">Meals</SelectItem>
                      <SelectItem value="Desserts">Desserts</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Description</Label>
                  <Input value={form.description} onChange={e => handleChange('description', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Price</Label>
                  <Input type="number" step="0.01" value={form.price} onChange={e => handleChange('price', e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label>Image URL</Label>
                  <Input value={form.imageUrl} onChange={e => handleChange('imageUrl', e.target.value)} />
                </div>
                <div className="flex items-center gap-3">
                  <Switch checked={form.available} onCheckedChange={v => handleChange('available', v)} />
                  <span>Available</span>
                </div>
                <div className="md:col-span-2 flex gap-3">
                  <Button type="submit" disabled={!editingId}>Update</Button>
                  <Button type="button" variant="outline" onClick={resetForm}>Cancel</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Table / list */}
      <Card>
        <CardHeader>
          <CardTitle>All Items</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div>Loading…</div>
          ) : items.length === 0 ? (
            <div>No items found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left border-b">
                  <tr>
                    <th className="py-2 pr-4">Name</th>
                    <th className="py-2 pr-4">Category</th>
                    <th className="py-2 pr-4">Price</th>
                    <th className="py-2 pr-4">Available</th>
                    <th className="py-2 pr-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map(item => (
                    <tr key={item.id} className="border-b">
                      <td className="py-2 pr-4">{item.name}</td>
                      <td className="py-2 pr-4">{item.category}</td>
                      <td className="py-2 pr-4">{Number(item.price).toFixed(2)}</td>
                      <td className="py-2 pr-4">{item.available ? 'Yes' : 'No'}</td>
                      <td className="py-2 pr-4 flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => startEdit(item)}>Edit</Button>
                        <Button size="sm" variant="destructive" onClick={() => handleDelete(item.id)}>Delete</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
