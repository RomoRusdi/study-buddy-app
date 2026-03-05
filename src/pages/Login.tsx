import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  // Jika sudah login, langsung tendang ke halaman utama
  if (user) return <Navigate to="/" replace />;

  const handleAuth = async (type: 'LOGIN' | 'SIGNUP', e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const { error } = type === 'LOGIN' 
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({ email, password });

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else if (type === 'SIGNUP') {
      toast({ title: "Berhasil!", description: "Akun berhasil dibuat dan langsung login." });
    }
    
    setLoading(false);
  };

  return (
    <div className="flex h-screen w-full items-center justify-center bg-gray-50/50 p-4">
      <div className="w-full max-w-md space-y-8 rounded-xl bg-white p-8 shadow-lg">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">Study Buddy</h2>
          <p className="mt-2 text-sm text-gray-600">Masuk atau daftar untuk mengatur tugasmu.</p>
        </div>
        
        <form className="mt-8 space-y-6">
          <div className="space-y-4">
            <div>
              <Input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button className="w-full" onClick={(e) => handleAuth('LOGIN', e)} disabled={loading}>
              Masuk
            </Button>
            <Button variant="outline" className="w-full" onClick={(e) => handleAuth('SIGNUP', e)} disabled={loading}>
              Daftar Baru
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}