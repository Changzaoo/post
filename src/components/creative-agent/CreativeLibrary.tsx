import { Copy, Grid2X2, ListFilter, Pencil, Search, Table2, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { calculateCreativeScore, statusOptions } from '../../services/creativeAgentService';
import type { Creative, CreativeStatus } from '../../types/creative';
import { CreativeCard } from './CreativeCard';
import { CreativeStatusBadge } from './CreativeStatusBadge';

interface CreativeLibraryProps {
  creatives: Creative[];
  onView: (creative: Creative) => void;
  onEdit: (creative: Creative) => void;
  onDuplicate: (creative: Creative) => void;
  onGenerateVariations: (creative: Creative) => void;
  onStatusChange: (creative: Creative, status: CreativeStatus) => void;
  onDelete: (creative: Creative) => void;
}

export function CreativeLibrary({
  creatives,
  onView,
  onEdit,
  onDuplicate,
  onGenerateVariations,
  onStatusChange,
  onDelete,
}: CreativeLibraryProps) {
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<'Todos' | CreativeStatus>('Todos');
  const [view, setView] = useState<'cards' | 'table'>('cards');

  const filtered = useMemo(() => {
    const normalizedQuery = query.toLowerCase().trim();
    return creatives.filter((creative) => {
      const matchesStatus = status === 'Todos' || creative.status === status;
      const matchesQuery = !normalizedQuery || [
        creative.title,
        creative.platform,
        creative.type,
        creative.campaignName,
        creative.headline,
      ].some((value) => value.toLowerCase().includes(normalizedQuery));
      return matchesStatus && matchesQuery;
    });
  }, [creatives, query, status]);

  return (
    <section className="creative-agent-section">
      <div className="creative-agent-section-header">
        <div>
          <h2>Biblioteca de criativos</h2>
          <p>{filtered.length} criativo{filtered.length === 1 ? '' : 's'} salvo{filtered.length === 1 ? '' : 's'}</p>
        </div>
        <div className="creative-agent-library-actions">
          <div className="creative-agent-search">
            <Search size={14} />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar criativo" />
          </div>
          <select className="input creative-agent-status-select" value={status} onChange={(event) => setStatus(event.target.value as 'Todos' | CreativeStatus)}>
            <option value="Todos" style={{ background: '#020818' }}>Todos</option>
            {statusOptions.map((item) => (
              <option key={item} value={item} style={{ background: '#020818' }}>{item}</option>
            ))}
          </select>
          <button className="creative-agent-icon-button" type="button" onClick={() => setView('cards')} title="Cards">
            <Grid2X2 size={14} />
          </button>
          <button className="creative-agent-icon-button" type="button" onClick={() => setView('table')} title="Tabela">
            <Table2 size={14} />
          </button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="glass-card creative-agent-empty-state">
          <ListFilter size={34} />
          <strong>Nenhum criativo encontrado</strong>
          <span>Gere ou salve um criativo para preencher a biblioteca.</span>
        </div>
      ) : view === 'cards' ? (
        <div className="creative-agent-card-grid">
          {filtered.map((creative) => (
            <CreativeCard
              key={creative.id}
              creative={creative}
              onView={onView}
              onEdit={onEdit}
              onDuplicate={onDuplicate}
              onGenerateVariations={onGenerateVariations}
              onStatusChange={onStatusChange}
              onDelete={onDelete}
            />
          ))}
        </div>
      ) : (
        <div className="glass-card creative-agent-table-wrap">
          <table className="creative-agent-table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Plataforma</th>
                <th>Tipo</th>
                <th>Status</th>
                <th>Data</th>
                <th>CTR</th>
                <th>CPC</th>
                <th>Conversões</th>
                <th>ROI</th>
                <th>Retenção</th>
                <th>Score</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((creative) => (
                <tr key={creative.id}>
                  <td>
                    <button type="button" className="creative-agent-table-title" onClick={() => onView(creative)}>
                      {creative.title}
                    </button>
                  </td>
                  <td>{creative.platform}</td>
                  <td>{creative.type}</td>
                  <td><CreativeStatusBadge status={creative.status} /></td>
                  <td>{new Date(creative.createdAt).toLocaleDateString('pt-BR')}</td>
                  <td>{creative.metrics.ctr.toFixed(2)}%</td>
                  <td>R$ {creative.metrics.cpc.toFixed(2)}</td>
                  <td>{creative.metrics.conversions}</td>
                  <td>{creative.metrics.roi.toFixed(2)}x</td>
                  <td>{creative.metrics.retention.toFixed(0)}%</td>
                  <td>{calculateCreativeScore(creative.metrics)}</td>
                  <td>
                    <div className="creative-agent-row-actions">
                      <button className="creative-agent-icon-button" type="button" onClick={() => onEdit(creative)} title="Editar">
                        <Pencil size={13} />
                      </button>
                      <button className="creative-agent-icon-button" type="button" onClick={() => onDuplicate(creative)} title="Duplicar">
                        <Copy size={13} />
                      </button>
                      <button className="creative-agent-icon-button danger" type="button" onClick={() => onDelete(creative)} title="Excluir">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
