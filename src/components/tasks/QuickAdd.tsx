import { useState } from 'react';
import { Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useTasks } from '@/contexts/TaskContext';
import { useToast } from '@/hooks/use-toast';

export default function QuickAdd() {
  const [input, setInput] = useState('');
  const { courses, addTask } = useTasks();
  const { toast } = useToast();

  const parseAndAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    let title = input;
    let dueDate = new Date();
    
    // Default course kosong jika tidak ada yang cocok
    let course = ''; 

    // 1. Deteksi Mata Kuliah (Course)
    const matchedCourse = courses.find(c => 
      input.toLowerCase().includes(c.name.toLowerCase())
    );
    if (matchedCourse) {
      // Properti yang diminta oleh type Task adalah 'course', kita isi dengan id-nya
      course = matchedCourse.id; 
    }

    // 2. Deteksi Hari/Tanggal
    const lowerInput = input.toLowerCase();
    if (lowerInput.includes('besok')) {
      dueDate.setDate(dueDate.getDate() + 1);
      title = title.replace(/besok/i, '').trim();
    } else if (lowerInput.includes('lusa')) {
      dueDate.setDate(dueDate.getDate() + 2);
      title = title.replace(/lusa/i, '').trim();
    } else if (lowerInput.includes('minggu depan')) {
      dueDate.setDate(dueDate.getDate() + 7);
      title = title.replace(/minggu depan/i, '').trim();
    } else if (lowerInput.includes('hari ini')) {
      title = title.replace(/hari ini/i, '').trim();
    }

    // 3. Deteksi Waktu (contoh: "jam 23.59", "pukul 08:00")
    const timeRegex = /(?:jam|pukul)\s*(\d{1,2})[:.](\d{2})/i;
    const timeMatch = lowerInput.match(timeRegex);
    
    if (timeMatch) {
      dueDate.setHours(parseInt(timeMatch[1], 10));
      dueDate.setMinutes(parseInt(timeMatch[2], 10));
      dueDate.setSeconds(0);
      title = title.replace(timeRegex, '').trim();
    } else {
      // Default waktu ke 23:59 jika tidak dispesifikasikan
      dueDate.setHours(23, 59, 0, 0);
    }

    // Bersihkan sisa spasi berlebih
    title = title.replace(/\s+/g, ' ').trim();
    if (!title) title = input;

    // KUNCI PERBAIKAN: Gunakan 'course' (bukan courseId) dan tambahkan 'priority'
    addTask({
      title,
      description: `Dibuat instan dari Quick Add: "${input}"`,
      dueDate,
      course,             // <-- Diperbaiki di sini
      priority: 'medium', // <-- Tambahan wajib dari interface Task
      status: 'pending'
    });

    toast({
      title: "⚡ Tugas berhasil ditambahkan!",
      description: `${title} - Tenggat: ${dueDate.toLocaleString('id-ID', {
        weekday: 'long', 
        day: 'numeric', 
        month: 'short', 
        hour: '2-digit', 
        minute: '2-digit'
      })}`,
    });

    setInput(''); 
  };

  return (
    <form onSubmit={parseAndAddTask} className="flex gap-2 mb-8">
      <div className="relative flex-1">
        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
          <Zap className="h-4 w-4 text-amber-500" />
        </div>
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ketik tugas cerdas... (Cth: Laporan Jarkom besok jam 23.59)"
          className="pl-9 h-12 bg-card border-primary/20 focus-visible:ring-primary/50 shadow-sm text-base rounded-xl"
        />
      </div>
      <Button type="submit" className="h-12 px-6 rounded-xl font-medium">
        Tambah
      </Button>
    </form>
  );
}