import React, { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabase';
import { MessageSquare, Mail, Trash2, Phone, Calendar, Eye, EyeOff, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import ConfirmDialog from '../../../components/modals/ConfirmDialog';

const MessagesManagement: React.FC = () => {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRead, setFilterRead] = useState<'all' | 'read' | 'unread'>('all');
  const [showConfirm, setShowConfirm] = useState(false);
  const [messageToDelete, setMessageToDelete] = useState<any>(null);

  useEffect(() => {
    loadMessages();
  }, []);

  const loadMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('contact_messages')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error loading messages:', error);
      toast.error('Erreur lors du chargement des messages');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (message: any) => {
    setMessageToDelete(message);
    setShowConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    if (!messageToDelete) return;

    try {
      const { error } = await supabase
        .from('contact_messages')
        .delete()
        .eq('id', messageToDelete.id);

      if (error) throw error;
      toast.success('Message supprimé');
      setShowConfirm(false);
      setMessageToDelete(null);
      loadMessages();
    } catch (error) {
      console.error('Error deleting message:', error);
      toast.error('Erreur lors de la suppression');
    }
  };

  const toggleReadStatus = async (message: any) => {
    try {
      const { error } = await supabase
        .from('contact_messages')
        .update({ is_read: !message.is_read })
        .eq('id', message.id);

      if (error) throw error;
      toast.success(message.is_read ? 'Marqué comme non lu' : 'Marqué comme lu');
      loadMessages();
    } catch (error) {
      console.error('Error updating message:', error);
      toast.error('Erreur lors de la mise à jour');
    }
  };

  const filteredMessages = messages.filter(message => {
    const matchesSearch = 
      message.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.message?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = 
      filterRead === 'all' ? true :
      filterRead === 'read' ? message.is_read :
      !message.is_read;
    
    return matchesSearch && matchesFilter;
  });

  const unreadCount = messages.filter(m => !m.is_read).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Messages de Contact</h1>
          <p className="text-gray-600 mt-1">
            {filteredMessages.length} message(s) • 
            <span className="font-semibold text-emerald-600">{unreadCount} non lu(s)</span>
          </p>
        </div>
      </div>

        {/* Filtres et recherche */}
        <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-sm p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Recherche */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher par nom, email, sujet..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>
            </div>
            
            {/* Filtres */}
            <div className="flex gap-2">
              <button
                onClick={() => setFilterRead('all')}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  filterRead === 'all'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Tous
              </button>
              <button
                onClick={() => setFilterRead('unread')}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  filterRead === 'unread'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Non lus
              </button>
              <button
                onClick={() => setFilterRead('read')}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  filterRead === 'read'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Lus
              </button>
            </div>
          </div>
        </div>

        {/* Messages */}
        {filteredMessages.length === 0 ? (
          <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-sm p-12 text-center">
            <MessageSquare className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun message trouvé</h3>
            <p className="text-gray-600">
              {searchTerm || filterRead !== 'all'
                ? 'Essayez de modifier vos filtres'
                : 'Les messages de contact apparaîtront ici'}
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredMessages.map((message) => (
            <div key={message.id} className={`bg-white/80 backdrop-blur-sm rounded-lg shadow-sm p-6 border-l-4 ${
              message.is_read ? 'border-gray-300' : 'border-emerald-500'
            }`}>
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-start space-x-3 flex-1">
                  <MessageSquare className={`h-6 w-6 mt-1 ${
                    message.is_read ? 'text-gray-400' : 'text-emerald-600'
                  }`} />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900">{message.name}</h3>
                      {!message.is_read && (
                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs font-medium rounded-full">
                          Nouveau
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 mt-1">
                      <div className="flex items-center">
                        <Mail className="h-4 w-4 mr-1" />
                        <a href={`mailto:${message.email}`} className="hover:text-emerald-600">
                          {message.email}
                        </a>
                      </div>
                      {message.phone && (
                        <div className="flex items-center">
                          <Phone className="h-4 w-4 mr-1" />
                          <a href={`tel:${message.phone}`} className="hover:text-emerald-600">
                            {message.phone}
                          </a>
                        </div>
                      )}
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {new Date(message.created_at).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </div>
                    {message.subject && (
                      <div className="mt-2">
                        <span className="text-sm font-medium text-gray-700">Sujet: </span>
                        <span className="text-sm text-gray-600">{message.subject}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2 ml-4">
                  <button
                    onClick={() => toggleReadStatus(message)}
                    className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
                    title={message.is_read ? 'Marquer comme non lu' : 'Marquer comme lu'}
                  >
                    {message.is_read ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                  <button
                    onClick={() => handleDeleteClick(message)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                    title="Supprimer"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 mt-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Message :</p>
                <p className="text-gray-700 whitespace-pre-wrap">{message.message}</p>
              </div>
            </div>
          ))}
          </div>
        )}
      {/* Confirmation de suppression */}
      {showConfirm && (
        <ConfirmDialog
          isOpen={showConfirm}
          onClose={() => {
            setShowConfirm(false);
            setMessageToDelete(null);
          }}
          onConfirm={handleDeleteConfirm}
          title="Supprimer le message"
          message={`Êtes-vous sûr de vouloir supprimer le message de "${messageToDelete?.name}" ? Cette action est irréversible.`}
          type="danger"
          confirmText="Supprimer"
          cancelText="Annuler"
        />
      )}
    </div>
  );
};

// Exportation nommée pour la compatibilité avec React.lazy
export { MessagesManagement as default };
