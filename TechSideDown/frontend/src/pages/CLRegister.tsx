import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { register } from '@/lib/api';
import Navbar from '@/components/Navbar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import NeonButton from '@/components/NeonButton';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from 'sonner';

const CLRegister = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        email: '',
        college: '',
    });
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await register({ ...formData, role: 'cl', points: 1000 });
            toast.success('CL Application Submitted! Please login.');
            navigate('/login');
        } catch (error: any) {
            console.error(error);
            toast.error(error.response?.data?.message || 'Registration failed');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Navbar />
            <div className="flex-1 flex items-center justify-center p-4">
                <Card className="w-full max-w-md bg-card/50 border-primary/20">
                    <CardHeader>
                        <CardTitle className="text-2xl font-display text-primary">Campus Lead Registration</CardTitle>
                        <CardDescription>Apply to be a Campus Lead for TechXpression</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="username">Username</Label>
                                <Input
                                    id="username"
                                    name="username"
                                    value={formData.username}
                                    onChange={handleChange}
                                    required
                                    className="bg-background/50 border-primary/20"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    className="bg-background/50 border-primary/20"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="college">College</Label>
                                <Input
                                    id="college"
                                    name="college"
                                    value={formData.college}
                                    onChange={handleChange}
                                    required
                                    className="bg-background/50 border-primary/20"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="password">Password</Label>
                                <Input
                                    id="password"
                                    name="password"
                                    type="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                    className="bg-background/50 border-primary/20"
                                />
                            </div>
                            <NeonButton type="submit" className="w-full" disabled={isLoading}>
                                {isLoading ? 'Submitting Application...' : 'Apply as CL'}
                            </NeonButton>
                            <div className="text-center text-sm text-muted-foreground mt-4">
                                Already have an account? <a href="/login" className="text-primary hover:underline">Login</a>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default CLRegister;
