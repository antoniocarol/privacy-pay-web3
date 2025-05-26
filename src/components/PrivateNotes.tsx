import { useMemo, useState } from 'react';
import { Card, CardHeader } from './Card';
import { StatusBadge } from './StatusBadge';
import { useEERC20 } from '../hooks/useEERC20';
import { Button } from './Button';
import { useToast } from '../providers/ToastProvider';

interface PrivateNote {
  id: string;
  amount: string;
  commitment: string;
  nullifier: string;
  timestamp: number;
  spent: boolean;
}

export function PrivateNotes() {
  const { availableSecrets, exportSecrets, importSecrets } = useEERC20();
  const { showToast } = useToast();
  const [showImportModal, setShowImportModal] = useState(false);
  const [importValue, setImportValue] = useState('');
  
  // Filtrar e ordenar as notas privadas
  const notes: PrivateNote[] = useMemo(() => {
    if (!availableSecrets?.length) return [];
    
    // Ordenar por timestamp (mais recente primeiro)
    return [...availableSecrets].sort((a, b) => 
      b.timestamp - a.timestamp
    );
  }, [availableSecrets]);
  
  // Formatar data legível
  const formatDate = (timestamp: number): string => {
    if (!timestamp) return '';
    return new Date(timestamp).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Truncar string longa
  const truncate = (str: string, start = 6, end = 4): string => {
    if (!str) return '';
    if (str.length <= start + end) return str;
    return `${str.slice(0, start)}...${str.slice(-end)}`;
  };

  // Exportar todas as notas
  const handleExport = () => {
    try {
      const exportData = exportSecrets();
      navigator.clipboard.writeText(exportData);
      showToast('Dados exportados e copiados para a área de transferência!', 'success');
    } catch (error) {
      showToast(`Erro ao exportar dados: ${(error as Error).message}`, 'error');
    }
  };

  // Importar notas
  const handleImport = () => {
    try {
      if (!importValue.trim()) {
        showToast('Por favor, insira os dados de importação', 'warning');
        return;
      }
      
      importSecrets(importValue);
      showToast('Notas privadas importadas com sucesso!', 'success');
      setShowImportModal(false);
      setImportValue('');
    } catch (error) {
      showToast(`Erro ao importar dados: ${(error as Error).message}`, 'error');
    }
  };

  return (
    <Card>
      <CardHeader 
        title={
          <div className="flex items-center justify-between w-full">
            <span>Suas notas privadas</span>
            <StatusBadge status="privado" label="Privado" />
          </div>
        }
      />
      
      <div className="flex justify-between items-center mb-4">
        <Button 
          variant="outline" 
          size="sm"
          onClick={handleExport}
        >
          Exportar Notas
        </Button>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => setShowImportModal(true)}
        >
          Importar Notas
        </Button>
      </div>
      
      <div className="mt-2">
        {notes.length === 0 ? (
          <div className="text-center py-6 text-white/60">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-12 w-12 mx-auto mb-2 text-white/30" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={1} 
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" 
              />
            </svg>
            <p className="text-sm">Você não possui notas privadas</p>
            <p className="text-xs mt-1">Use a função "Shield" para criar notas privadas</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notes.map(note => (
              <div 
                key={note.id} 
                className="border border-white/10 rounded-lg p-3 bg-white/5 hover:bg-white/10 transition-all"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-avax-red to-avax-orange flex items-center justify-center">
                      <span className="text-white text-xs font-bold">N</span>
                    </div>
                    <div className="ml-2">
                      <p className="text-sm text-white/80 font-mono">{truncate(note.id)}</p>
                      <p className="text-xs text-white/50">{formatDate(note.timestamp)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-white">{note.amount} <span className="text-sm font-normal text-white/60">PAVX</span></p>
                  </div>
                </div>
                
                <div className="border-t border-white/5 pt-2 mt-1">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-white/50">Commitment:</span>
                    <span className="text-xs font-mono text-white/70">{truncate(note.commitment, 8, 6)}</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-end mt-3">
                  <button 
                    type="button"
                    className="text-xs px-2 py-1 rounded bg-white/10 text-white/70 hover:bg-white/20 transition-all"
                    onClick={() => {
                      navigator.clipboard.writeText(note.id);
                    }}
                  >
                    Copiar ID
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de Importação */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-gradient-card border border-white/10 rounded-xl p-6 max-w-md w-full">
            <h3 className="text-xl font-semibold text-white mb-4">Importar Notas Privadas</h3>
            <p className="text-sm text-white/70 mb-4">
              Cole abaixo o texto de exportação das suas notas privadas.
              Isso substituirá todas as notas atuais.
            </p>
            
            <textarea
              className="w-full h-32 bg-white/5 border border-white/10 rounded-lg p-3 text-white text-sm font-mono"
              placeholder="Cole os dados exportados aqui..."
              value={importValue}
              onChange={(e) => setImportValue(e.target.value)}
            />
            
            <div className="flex justify-end space-x-3 mt-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowImportModal(false);
                  setImportValue('');
                }}
              >
                Cancelar
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleImport}
              >
                Importar
              </Button>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
} 