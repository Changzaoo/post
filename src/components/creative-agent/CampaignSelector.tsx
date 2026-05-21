import { Plus } from 'lucide-react';
import type { CreativeCampaign } from '../../types/creative';

interface CampaignSelectorProps {
  value: string;
  campaigns: CreativeCampaign[];
  onChange: (campaignName: string) => void;
  onCreate: () => void;
}

export function CampaignSelector({ value, campaigns, onChange, onCreate }: CampaignSelectorProps) {
  return (
    <div style={{ display: 'grid', gap: 6 }}>
      <label className="creative-agent-label" htmlFor="campaign-name">Nome da campanha</label>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 8 }}>
        <select
          className="input creative-agent-input"
          value={value}
          onChange={(event) => onChange(event.target.value)}
        >
          <option value="" style={{ background: '#020818' }}>Selecionar ou digitar abaixo</option>
          {campaigns.map((campaign) => (
            <option key={campaign.id} value={campaign.name} style={{ background: '#020818' }}>
              {campaign.name}
            </option>
          ))}
        </select>
        <button className="btn btn-secondary btn-md" type="button" onClick={onCreate} title="Nova Campanha">
          <Plus size={14} />
        </button>
      </div>
      <input
        id="campaign-name"
        className="input creative-agent-input"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Ex: Lançamento curso cripto"
      />
    </div>
  );
}
