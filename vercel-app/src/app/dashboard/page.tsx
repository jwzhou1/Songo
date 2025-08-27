'use client'

import React, { useState, useEffect } from 'react'
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Avatar,
  IconButton,
  Menu,
  MenuItem,
  Alert
} from '@mui/material'
import {
  Dashboard as DashboardIcon,
  LocalShipping as ShippingIcon,
  Receipt as ReceiptIcon,
  Person as PersonIcon,
  MoreVert as MoreVertIcon,
  Visibility as ViewIcon,
  Download as DownloadIcon,
  Edit as EditIcon
} from '@mui/icons-material'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useAuth, ShipmentHistory, InvoiceHistory } from '@/contexts/AuthContext'
import toast from 'react-hot-toast'

interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`dashboard-tabpanel-${index}`}
      aria-labelledby={`dashboard-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  )
}

export default function DashboardPage() {
  const router = useRouter()
  const { user, logout, getShipmentHistory, getInvoiceHistory } = useAuth()
  const [tabValue, setTabValue] = useState(0)
  const [shipments, setShipments] = useState<ShipmentHistory[]>([])
  const [invoices, setInvoices] = useState<InvoiceHistory[]>([])
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [selectedItem, setSelectedItem] = useState<string | null>(null)

  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }

    // Load user data
    loadShipmentHistory()
    loadInvoiceHistory()
  }, [user, router])

  const loadShipmentHistory = async () => {
    try {
      const data = await getShipmentHistory()
      setShipments(data)
    } catch (error) {
      toast.error('Failed to load shipment history')
    }
  }

  const loadInvoiceHistory = async () => {
    try {
      const data = await getInvoiceHistory()
      setInvoices(data)
    } catch (error) {
      toast.error('Failed to load invoice history')
    }
  }

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue)
  }

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, itemId: string) => {
    setAnchorEl(event.currentTarget)
    setSelectedItem(itemId)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
    setSelectedItem(null)
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered': return 'success'
      case 'in_transit': return 'primary'
      case 'out_for_delivery': return 'warning'
      case 'pending': return 'warning'
      case 'paid': return 'success'
      case 'overdue': return 'error'
      default: return 'default'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  if (!user) {
    return null
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Header */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
          <Box>
            <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
              Welcome back, {user.firstName || user.name}!
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Manage your shipments, invoices, and account settings
            </Typography>
          </Box>
          <Box display="flex" gap={2}>
            <Button
              variant="contained"
              startIcon={<ShippingIcon />}
              onClick={() => router.push('/get-quote')}
              sx={{
                background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
              }}
            >
              New Shipment
            </Button>
            <Button
              variant="outlined"
              onClick={logout}
            >
              Logout
            </Button>
          </Box>
        </Box>

        {/* Stats Cards */}
        <Grid container spacing={3} mb={4}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" gap={2}>
                  <Avatar sx={{ bgcolor: 'primary.main' }}>
                    <ShippingIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h4" fontWeight="bold">
                      {shipments.length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Shipments
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" gap={2}>
                  <Avatar sx={{ bgcolor: 'success.main' }}>
                    <DashboardIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h4" fontWeight="bold">
                      {shipments.filter(s => s.status === 'DELIVERED').length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Delivered
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" gap={2}>
                  <Avatar sx={{ bgcolor: 'warning.main' }}>
                    <ReceiptIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h4" fontWeight="bold">
                      {invoices.length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Invoices
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" gap={2}>
                  <Avatar sx={{ bgcolor: 'info.main' }}>
                    <PersonIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h4" fontWeight="bold">
                      {formatCurrency(shipments.reduce((sum, s) => sum + s.cost, 0))}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Spent
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Tabs */}
        <Paper sx={{ mb: 3 }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            aria-label="dashboard tabs"
            sx={{ borderBottom: 1, borderColor: 'divider' }}
          >
            <Tab
              icon={<ShippingIcon />}
              label="Shipment History"
              id="dashboard-tab-0"
              aria-controls="dashboard-tabpanel-0"
            />
            <Tab
              icon={<ReceiptIcon />}
              label="Invoice History"
              id="dashboard-tab-1"
              aria-controls="dashboard-tabpanel-1"
            />
            <Tab
              icon={<PersonIcon />}
              label="Profile Settings"
              id="dashboard-tab-2"
              aria-controls="dashboard-tabpanel-2"
            />
          </Tabs>

          {/* Shipment History Tab */}
          <TabPanel value={tabValue} index={0}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Tracking Number</TableCell>
                    <TableCell>Carrier</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Route</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Cost</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {shipments.map((shipment) => (
                    <TableRow key={shipment.id}>
                      <TableCell>
                        <Typography variant="body2" fontWeight="bold">
                          {shipment.trackingNumber}
                        </Typography>
                      </TableCell>
                      <TableCell>{shipment.carrier}</TableCell>
                      <TableCell>
                        <Chip
                          label={shipment.status.replace('_', ' ')}
                          color={getStatusColor(shipment.status) as any}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {shipment.origin} → {shipment.destination}
                        </Typography>
                      </TableCell>
                      <TableCell>{formatDate(shipment.createdAt)}</TableCell>
                      <TableCell>{formatCurrency(shipment.cost)}</TableCell>
                      <TableCell>
                        <IconButton
                          onClick={(e) => handleMenuClick(e, shipment.id)}
                          size="small"
                        >
                          <MoreVertIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </TabPanel>

          {/* Invoice History Tab */}
          <TabPanel value={tabValue} index={1}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Invoice Number</TableCell>
                    <TableCell>Amount</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Created</TableCell>
                    <TableCell>Due Date</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {invoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell>
                        <Typography variant="body2" fontWeight="bold">
                          {invoice.invoiceNumber}
                        </Typography>
                      </TableCell>
                      <TableCell>{formatCurrency(invoice.amount)}</TableCell>
                      <TableCell>
                        <Chip
                          label={invoice.status.toUpperCase()}
                          color={getStatusColor(invoice.status) as any}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{formatDate(invoice.createdAt)}</TableCell>
                      <TableCell>{formatDate(invoice.dueDate)}</TableCell>
                      <TableCell>
                        <IconButton
                          onClick={(e) => handleMenuClick(e, invoice.id)}
                          size="small"
                        >
                          <MoreVertIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </TabPanel>

          {/* Profile Settings Tab */}
          <TabPanel value={tabValue} index={2}>
            <Alert severity="info" sx={{ mb: 3 }}>
              Profile settings functionality will be implemented in the next phase.
            </Alert>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Account Information
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Name: {user.firstName} {user.lastName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Email: {user.email}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Company: {user.company || 'Not specified'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Phone: {user.phone || 'Not specified'}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </TabPanel>
        </Paper>

        {/* Action Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
        >
          <MenuItem onClick={() => {
            if (selectedItem) {
              router.push(`/tracking?number=${shipments.find(s => s.id === selectedItem)?.trackingNumber}`)
            }
            handleMenuClose()
          }}>
            <ViewIcon sx={{ mr: 1 }} />
            View Details
          </MenuItem>
          <MenuItem onClick={handleMenuClose}>
            <DownloadIcon sx={{ mr: 1 }} />
            Download
          </MenuItem>
          <MenuItem onClick={handleMenuClose}>
            <EditIcon sx={{ mr: 1 }} />
            Edit
          </MenuItem>
        </Menu>
      </motion.div>
    </Container>
  )
}
