import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { canvasApi } from '@/utils/api';
import { useAuthStore } from '@/stores/authStore';
import { 
  Plus, Folder, Clock, Users, MoreVertical, 
  Trash2, Download, Edit2, Network 
} from 'lucide-react';
import type { Canvas } from '@/types';

export default function DashboardPage() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newCanvasName, setNewCanvasName] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['canvases'],
    queryFn: async () => {
      const res = await canvasApi.getAll();
      return res.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: (name: string) => canvasApi.create({ name, backgroundColor: '#ffffff' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['canvases'] });
      setShowCreateModal(false);
      setNewCanvasName('');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => canvasApi.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['canvases'] }),
  });

  const handleCreate = () => {
    if (newCanvasName.trim()) {
      createMutation.mutate(newCanvasName.trim());
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <Network className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">akdraw</span>
            </Link>
          </div>
          
          <div className="flex items-center gap-4">
            <span className="text-gray-600">{user?.displayName}</span>
            <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center text-primary-700 font-medium">
              {user?.displayName[0].toUpperCase()}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Canvases</h1>
            <p className="text-gray-600 mt-1">Create and manage your network diagrams</p>
          </div>
          <button onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
            <Plus className="w-5 h-5" />
            New Canvas
          </button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data?.owned?.map((canvas: Canvas) => (
              <CanvasCard key={canvas.id} canvas={canvas} onDelete={() => deleteMutation.mutate(canvas.id)} />
            ))}
          </div>
        )}
      </main>

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Create New Canvas</h2>
            <input type="text" value={newCanvasName} onChange={(e) => setNewCanvasName(e.target.value)}
              placeholder="Canvas name" className="w-full px-4 py-2 border rounded-lg mb-4 focus:ring-2 focus:ring-primary-500 outline-none" />
            <div className="flex gap-3 justify-end">
              <button onClick={() => setShowCreateModal(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
              <button onClick={handleCreate} disabled={createMutation.isPending}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50">
                {createMutation.isPending ? 'Creating...' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function CanvasCard({ canvas, onDelete }: { canvas: Canvas; onDelete: () => void }) {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div className="bg-white rounded-xl border shadow-sm hover:shadow-md transition-shadow">
      <Link to={`/canvas/${canvas.id}`} className="block p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
            <Folder className="w-6 h-6 text-gray-400" />
          </div>
        </div>
        <h3 className="font-semibold text-gray-900 mb-1">{canvas.name}</h3>
        <p className="text-sm text-gray-500 flex items-center gap-1">
          <Clock className="w-4 h-4" />
          {new Date(canvas.updatedAt).toLocaleDateString()}
        </p>
      </Link>
      <div className="px-6 pb-4 flex items-center justify-between">
        <span className="text-xs text-gray-400">v{canvas.version}</span>
        <div className="relative">
          <button onClick={() => setShowMenu(!showMenu)} className="p-1 hover:bg-gray-100 rounded">
            <MoreVertical className="w-4 h-4 text-gray-400" />
          </button>
          {showMenu && (
            <div className="absolute right-0 mt-1 w-40 bg-white border rounded-lg shadow-lg py-1 z-10">
              <button onClick={() => { onDelete(); setShowMenu(false); }} className="w-full px-4 py-2 text-left text-red-600 hover:bg-red-50 flex items-center gap-2">
                <Trash2 className="w-4 h-4" /> Delete
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
