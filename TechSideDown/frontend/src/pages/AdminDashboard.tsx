import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getEvents, getEventParticipants, getPayments, updatePaymentStatus, createNotification, login, getTransactions, getItems, createItem, getAllUsers, getRegistrations } from '@/lib/api';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Loader2, Send, CheckCircle, XCircle } from 'lucide-react';
import Navbar from '@/components/Navbar';
import NeonButton from '@/components/NeonButton';
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [authLoading, setAuthLoading] = useState(true);

    // Login State
    const [loginData, setLoginData] = useState({ username: '', password: '' });
    const [loginLoading, setLoginLoading] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('token');
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        if (token && user.role === 'admin') {
            setIsAuthenticated(true);
        }
        setAuthLoading(false);
    }, []);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoginLoading(true);

        // Manual Admin Credentials
        if ((loginData.username === 'Sanskar' && loginData.password === 'TX001') ||
            (loginData.username === 'Faculty' && loginData.password === 'TX011')) {

            // Store fake token and user data
            localStorage.setItem('token', 'manual-bypass-token-' + Date.now());
            localStorage.setItem('user', JSON.stringify({
                username: loginData.username,
                role: 'admin',
                userId: 'manual-admin-' + loginData.username
            }));

            setIsAuthenticated(true);
            toast.success('Manual admin access granted');
            setLoginLoading(false);
            return;
        }

        try {
            await login(loginData);
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            if (user.role === 'admin') {
                setIsAuthenticated(true);
                toast.success('Admin access granted');
            } else {
                toast.error('Unauthorized access');
            }
        } catch (error) {
            toast.error('Invalid credentials');
        } finally {
            setLoginLoading(false);
        }
    };
    const { data: events, isLoading: isLoadingEvents } = useQuery({
        queryKey: ['events'],
        queryFn: getEvents,
        enabled: isAuthenticated,
    });

    const { data: payments, isLoading: isLoadingPayments } = useQuery({
        queryKey: ['payments'],
        queryFn: getPayments,
        enabled: isAuthenticated,
    });

    const { data: transactions, isLoading: isLoadingTransactions } = useQuery({
        queryKey: ['transactions'],
        queryFn: getTransactions,
        enabled: isAuthenticated,
    });

    const { data: marketplaceItems, isLoading: isLoadingItems } = useQuery({
        queryKey: ['marketplaceItems'],
        queryFn: getItems,
        enabled: isAuthenticated,
    });

    const { data: users, isLoading: isLoadingUsers } = useQuery({
        queryKey: ['users'],
        queryFn: getAllUsers,
        enabled: isAuthenticated,
    });

    const { data: registrations, isLoading: isLoadingRegs } = useQuery({
        queryKey: ['registrations'],
        queryFn: getRegistrations,
        enabled: isAuthenticated,
    });

    // ...

    if (isAuthenticated && (isLoadingEvents || isLoadingPayments || isLoadingTransactions || isLoadingItems || isLoadingUsers || isLoadingRegs)) {
        // ... (skeleton loader)
    }

    // -- Mutations --
    const updateStatusMutation = useMutation({
        mutationFn: ({ id, status }: { id: string; status: string }) => updatePaymentStatus(id, status),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['payments'] });
            toast.success('Payment status updated');
        },
        onError: () => toast.error('Failed to update status'),
    });

    const createItemMutation = useMutation({
        mutationFn: createItem,
        onSuccess: () => {
            toast.success('Item created successfully');
            queryClient.invalidateQueries({ queryKey: ['marketplaceItems'] });
            setItemForm({ title: '', description: '', type: 'sale', price: 0, startingBid: 0, image: '', endTime: '' });
        },
        onError: () => toast.error('Failed to create item')
    });

    const sendNotification = useMutation({
        mutationFn: createNotification,
        onSuccess: () => {
            toast.success('Notification sent successfully!');
            setNotificationForm({ title: '', message: '', type: 'info', recipient: 'all' });
        },
        onError: () => toast.error('Failed to send notification')
    });

    // -- State --
    const [notificationForm, setNotificationForm] = useState({
        title: '',
        message: '',
        type: 'info',
        recipient: 'all'
    });

    const [itemForm, setItemForm] = useState({
        title: '',
        description: '',
        type: 'sale', // 'sale', 'auction'
        price: 0,
        startingBid: 0,
        image: '',
        endTime: ''
    });

    const handleSendNotification = (e: React.FormEvent) => {
        e.preventDefault();
        sendNotification.mutate(notificationForm);
    };

    const handleCreateItem = (e: React.FormEvent) => {
        e.preventDefault();
        createItemMutation.mutate(itemForm);
    };

    // -- Sub-components --
    const EventParticipantsDialog = ({ eventId, eventTitle }: { eventId: string, eventTitle: string }) => {
        const { data: participants, isLoading } = useQuery({
            queryKey: ['participants', eventId],
            queryFn: () => getEventParticipants(eventId),
            enabled: !!eventId
        });

        return (
            <Dialog>
                <DialogTrigger asChild>
                    <NeonButton variant="outline" size="sm">View Participants</NeonButton>
                </DialogTrigger>
                <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto bg-card border-primary/20">
                    <DialogHeader>
                        <DialogTitle>Participants for {eventTitle}</DialogTitle>
                    </DialogHeader>
                    {isLoading ? (
                        <div className="flex justify-center p-4"><Loader2 className="animate-spin" /></div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Username</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Phone</TableHead>
                                    <TableHead>College</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {participants?.map((user: any) => (
                                    <TableRow key={user._id}>
                                        <TableCell>{user.username}</TableCell>
                                        <TableCell>{user.email}</TableCell>
                                        <TableCell>{user.phone || '-'}</TableCell>
                                        <TableCell>{user.college || '-'}</TableCell>
                                    </TableRow>
                                ))}
                                {!participants?.length && (
                                    <TableRow>
                                        <TableCell colSpan={4} className="text-center">No participants found</TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    )}
                </DialogContent>
            </Dialog>
        );
    };

    if (isAuthenticated && (isLoadingEvents || isLoadingPayments || isLoadingTransactions || isLoadingItems)) {
        return (
            <div className="min-h-screen bg-background">
                <div className="border-b border-primary/20 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                    <div className="container flex h-16 items-center px-4">
                        <Skeleton className="h-8 w-32" />
                        <div className="ml-auto flex items-center space-x-4">
                            <Skeleton className="h-8 w-24" />
                        </div>
                    </div>
                </div>
                <div className="container mx-auto py-24 px-4 space-y-8">
                    <div className="flex justify-between items-center">
                        <Skeleton className="h-10 w-64" /> {/* Title */}
                        <Skeleton className="h-10 w-24" /> {/* Logout Button */}
                    </div>

                    <div className="w-full space-y-6">
                        <Skeleton className="h-12 w-full max-w-2xl bg-card/50" /> {/* Tabs List */}

                        <Card className="bg-card/50 border-primary/20">
                            <CardHeader>
                                <Skeleton className="h-8 w-48 mb-2" />
                                <Skeleton className="h-4 w-96" />
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="flex justify-between border-b pb-4">
                                        <Skeleton className="h-6 w-32" />
                                        <Skeleton className="h-6 w-32" />
                                        <Skeleton className="h-6 w-32" />
                                        <Skeleton className="h-6 w-20" />
                                    </div>
                                    {[1, 2, 3, 4, 5].map((i) => (
                                        <div key={i} className="flex justify-between py-2">
                                            <Skeleton className="h-6 w-32" />
                                            <Skeleton className="h-6 w-32" />
                                            <Skeleton className="h-6 w-32" />
                                            <Skeleton className="h-6 w-20" />
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        );
    }

    if (authLoading) return (
        <div className="flex h-screen items-center justify-center bg-background">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
    ); // Keep simple loader for initial auth header check only

    return (
        <div className="min-h-screen bg-background">
            <Navbar />
            <div className="container mx-auto py-24 px-4">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-4xl font-bold font-display text-primary">Admin Dashboard</h1>
                    <NeonButton variant="outline" onClick={() => {
                        localStorage.removeItem('token');
                        setIsAuthenticated(false);
                    }}>
                        Logout
                    </NeonButton>
                </div>

                <Tabs defaultValue="events" className="w-full">
                    <TabsList className="bg-card/50 border border-primary/20 mb-4">
                        <TabsTrigger value="events">Events & Participation</TabsTrigger>
                        <TabsTrigger value="registrations">All Registrations</TabsTrigger>
                        <TabsTrigger value="users">Manage Users</TabsTrigger>
                        <TabsTrigger value="payments">Payments & Approvals</TabsTrigger>
                        <TabsTrigger value="transactions">Transaction Logs</TabsTrigger>
                        <TabsTrigger value="marketplace">Marketplace</TabsTrigger>
                        <TabsTrigger value="notifications">Notifications</TabsTrigger>
                    </TabsList>

                    <TabsContent value="users">
                        <Card className="bg-card/50 border-primary/20">
                            <CardHeader>
                                <CardTitle>User Management</CardTitle>
                                <CardDescription>View all registered users.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Username</TableHead>
                                            <TableHead>Email</TableHead>
                                            <TableHead>Role</TableHead>
                                            <TableHead>College</TableHead>
                                            <TableHead className="text-right">Points</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {users?.map((u: any) => (
                                            <TableRow key={u._id}>
                                                <TableCell className="font-medium">{u.username}</TableCell>
                                                <TableCell>{u.email}</TableCell>
                                                <TableCell className="capitalize">{u.role}</TableCell>
                                                <TableCell>{u.college || '-'}</TableCell>
                                                <TableCell className="text-right">{u.points}</TableCell>
                                            </TableRow>
                                        ))}
                                        {!users?.length && (
                                            <TableRow>
                                                <TableCell colSpan={5} className="text-center">No users found</TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="registrations">
                        <Card className="bg-card/50 border-primary/20">
                            <CardHeader>
                                <CardTitle>All Registrations</CardTitle>
                                <CardDescription>View all event registrations across the system.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>User</TableHead>
                                            <TableHead>Event</TableHead>
                                            <TableHead>Type</TableHead>
                                            <TableHead className="text-right">Date</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {registrations?.map((reg: any) => (
                                            <TableRow key={reg._id}>
                                                <TableCell className="font-medium">{reg.user?.username || 'Unknown'}</TableCell>
                                                <TableCell>{reg.event?.title || 'Unknown Event'}</TableCell>
                                                <TableCell>{reg.type}</TableCell>
                                                <TableCell className="text-right">{new Date(reg.date || reg.createdAt).toLocaleDateString()}</TableCell>
                                            </TableRow>
                                        ))}
                                        {!registrations?.length && (
                                            <TableRow>
                                                <TableCell colSpan={4} className="text-center">No registrations found</TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="events">
                        <Card className="bg-card/50 border-primary/20">
                            <CardHeader>
                                <CardTitle>Event Overview</CardTitle>
                                <CardDescription>Manage events and view participants.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Event Title</TableHead>
                                            <TableHead>Category</TableHead>
                                            <TableHead>Fee</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {events?.map((event: any) => (
                                            <TableRow key={event._id}>
                                                <TableCell className="font-medium">{event.title}</TableCell>
                                                <TableCell>{event.category}</TableCell>
                                                <TableCell>{event.fee === 0 ? 'Free' : `₹${event.fee}`}</TableCell>
                                                <TableCell className="text-right">
                                                    <EventParticipantsDialog eventId={event._id} eventTitle={event.title} />
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="payments">
                        <Card className="bg-card/50 border-primary/20">
                            <CardHeader>
                                <CardTitle>Payment History</CardTitle>
                                <CardDescription>Manage and approve payments.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>User</TableHead>
                                            <TableHead>Event</TableHead>
                                            <TableHead>Amount</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {payments?.map((payment: any) => (
                                            <TableRow key={payment._id}>
                                                <TableCell>
                                                    <div>{payment.userId?.username || 'Unknown'}</div>
                                                    <div className="text-xs text-muted-foreground">{payment.userId?.email}</div>
                                                </TableCell>
                                                <TableCell>{payment.eventId?.title || 'Unknown Event'}</TableCell>
                                                <TableCell>₹{payment.amount}</TableCell>
                                                <TableCell>
                                                    <Badge variant={payment.status === 'success' ? 'default' : payment.status === 'pending' ? 'secondary' : 'destructive'} className={payment.status === 'success' ? 'bg-green-500/20 text-green-500' : ''}>
                                                        {payment.status}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    {payment.status === 'pending' && (
                                                        <div className="flex justify-end gap-2">
                                                            <NeonButton
                                                                size="sm"
                                                                onClick={() => updateStatusMutation.mutate({ id: payment._id, status: 'success' })}
                                                                disabled={updateStatusMutation.isPending}
                                                                className="h-8 w-8 p-0"
                                                            >
                                                                <CheckCircle className="h-4 w-4" />
                                                            </NeonButton>
                                                            <NeonButton
                                                                size="sm"
                                                                variant="outline"
                                                                onClick={() => updateStatusMutation.mutate({ id: payment._id, status: 'failed' })}
                                                                disabled={updateStatusMutation.isPending}
                                                                className="h-8 w-8 p-0 bg-red-500/10 text-red-500 border-red-500/50 hover:bg-red-500/20"
                                                            >
                                                                <XCircle className="h-4 w-4" />
                                                            </NeonButton>
                                                        </div>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                        {!payments?.length && (
                                            <TableRow>
                                                <TableCell colSpan={5} className="text-center">No payment history</TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="transactions">
                        <Card className="bg-card/50 border-primary/20">
                            <CardHeader>
                                <CardTitle>Transaction Logs</CardTitle>
                                <CardDescription>System-wide transaction and audit logs.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>User</TableHead>
                                            <TableHead>Type</TableHead>
                                            <TableHead>Action</TableHead>
                                            <TableHead>Details</TableHead>
                                            <TableHead className="text-right">Date</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {transactions?.map((txn: any) => (
                                            <TableRow key={txn._id}>
                                                <TableCell>{txn.userId?.username || 'System'}</TableCell>
                                                <TableCell>{txn.type}</TableCell>
                                                <TableCell>{txn.action}</TableCell>
                                                <TableCell className="max-w-xs truncate" title={JSON.stringify(txn.metadata)}>
                                                    {JSON.stringify(txn.metadata)}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    {new Date(txn.createdAt).toLocaleString()}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                        {!transactions?.length && (
                                            <TableRow>
                                                <TableCell colSpan={5} className="text-center">No transactions found</TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="marketplace">
                        <div className="space-y-6">
                            <Card className="bg-card/50 border-primary/20">
                                <CardHeader>
                                    <CardTitle>Add Marketplace Item</CardTitle>
                                    <CardDescription>Create a new item for sale or auction.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <form onSubmit={handleCreateItem} className="grid gap-4 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label>Title</Label>
                                            <Input
                                                value={itemForm.title}
                                                onChange={(e) => setItemForm({ ...itemForm, title: e.target.value })}
                                                placeholder="Item Title"
                                                required
                                                className="bg-background/50 border-primary/20"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Type</Label>
                                            <Select
                                                value={itemForm.type}
                                                onValueChange={(value) => setItemForm({ ...itemForm, type: value })}
                                            >
                                                <SelectTrigger className="bg-background/50 border-primary/20">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="sale">Sale</SelectItem>
                                                    <SelectItem value="auction">Auction</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2 md:col-span-2">
                                            <Label>Description</Label>
                                            <Textarea
                                                value={itemForm.description}
                                                onChange={(e) => setItemForm({ ...itemForm, description: e.target.value })}
                                                placeholder="Item Description"
                                                required
                                                className="bg-background/50 border-primary/20"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>{itemForm.type === 'sale' ? 'Price (Points)' : 'Starting Bid (Points)'}</Label>
                                            <Input
                                                type="number"
                                                value={itemForm.type === 'sale' ? itemForm.price : itemForm.startingBid}
                                                onChange={(e) => setItemForm({
                                                    ...itemForm,
                                                    price: itemForm.type === 'sale' ? parseInt(e.target.value) : 0,
                                                    startingBid: itemForm.type === 'auction' ? parseInt(e.target.value) : 0
                                                })}
                                                required
                                                className="bg-background/50 border-primary/20"
                                            />
                                        </div>
                                        {itemForm.type === 'auction' && (
                                            <div className="space-y-2">
                                                <Label>End Time</Label>
                                                <Input
                                                    type="datetime-local"
                                                    value={itemForm.endTime}
                                                    onChange={(e) => setItemForm({ ...itemForm, endTime: e.target.value })}
                                                    required
                                                    className="bg-background/50 border-primary/20"
                                                />
                                            </div>
                                        )}
                                        <div className="space-y-2 md:col-span-2">
                                            <Label>Image URL</Label>
                                            <Input
                                                value={itemForm.image}
                                                onChange={(e) => setItemForm({ ...itemForm, image: e.target.value })}
                                                placeholder="https://example.com/image.jpg"
                                                className="bg-background/50 border-primary/20"
                                            />
                                        </div>
                                        <div className="md:col-span-2">
                                            <NeonButton type="submit" disabled={createItemMutation.isPending} className="w-full">
                                                {createItemMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                                Create Item
                                            </NeonButton>
                                        </div>
                                    </form>
                                </CardContent>
                            </Card>

                            <Card className="bg-card/50 border-primary/20">
                                <CardHeader>
                                    <CardTitle>Marketplace Items</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Title</TableHead>
                                                <TableHead>Type</TableHead>
                                                <TableHead>Price/Bid</TableHead>
                                                <TableHead>Highest Bidder</TableHead>
                                                <TableHead className="text-right">Status</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {marketplaceItems?.map((item: any) => (
                                                <TableRow key={item._id}>
                                                    <TableCell className="font-medium">{item.title}</TableCell>
                                                    <TableCell className="capitalize">{item.type}</TableCell>
                                                    <TableCell>{item.type === 'sale' ? item.price : item.currentBid}</TableCell>
                                                    <TableCell>{item.highestBidder?.username || '-'}</TableCell>
                                                    <TableCell className="text-right">
                                                        <Badge variant={item.status === 'active' ? 'default' : 'secondary'}>
                                                            {item.status}
                                                        </Badge>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                            {!marketplaceItems?.length && (
                                                <TableRow>
                                                    <TableCell colSpan={5} className="text-center">No items found</TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    <TabsContent value="notifications">
                        <Card className="bg-card/50 border-primary/20 max-w-2xl mx-auto">
                            <CardHeader>
                                <CardTitle>Send Notification</CardTitle>
                                <CardDescription>Send a message to all users or a specific user.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleSendNotification} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="title">Title</Label>
                                        <Input
                                            id="title"
                                            value={notificationForm.title}
                                            onChange={(e) => setNotificationForm({ ...notificationForm, title: e.target.value })}
                                            placeholder="Notification Title"
                                            required
                                            className="bg-background/50 border-primary/20"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="type">Type</Label>
                                        <Select
                                            value={notificationForm.type}
                                            onValueChange={(value) => setNotificationForm({ ...notificationForm, type: value })}
                                        >
                                            <SelectTrigger className="bg-background/50 border-primary/20">
                                                <SelectValue placeholder="Select type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="info">Info</SelectItem>
                                                <SelectItem value="success">Success</SelectItem>
                                                <SelectItem value="warning">Warning</SelectItem>
                                                <SelectItem value="error">Error</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="message">Message</Label>
                                        <Textarea
                                            id="message"
                                            value={notificationForm.message}
                                            onChange={(e) => setNotificationForm({ ...notificationForm, message: e.target.value })}
                                            placeholder="Type your message here..."
                                            required
                                            className="min-h-[100px] bg-background/50 border-primary/20"
                                        />
                                    </div>
                                    <NeonButton type="submit" disabled={sendNotification.isPending} className="w-full">
                                        {sendNotification.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                                        Send Notification
                                    </NeonButton>
                                </form>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
};

export default AdminDashboard;
