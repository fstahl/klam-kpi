import { useState } from 'react';
import { useSortable, SortableContext, rectSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { KPICard } from '../components/KPICard.jsx';
import { CardEditor } from './CardEditor.jsx';
import { CardPicker } from './CardPicker.jsx';

function SortableCard({ card, data, allData, kpiFields, sparkKeys, onEdit, onDelete }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: card.id });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1 };

  return (
    <div ref={setNodeRef} style={style} className="kpi--admin" {...attributes}>
      <div className="kpi__drag-handle" {...listeners} title="Drag to reorder">
        <svg viewBox="0 0 16 16" fill="currentColor"><path d="M5 4a1.5 1.5 0 100-3 1.5 1.5 0 000 3zm6 0a1.5 1.5 0 100-3 1.5 1.5 0 000 3zM5 9.5a1.5 1.5 0 100-3 1.5 1.5 0 000 3zm6 0a1.5 1.5 0 100-3 1.5 1.5 0 000 3zM5 15a1.5 1.5 0 100-3 1.5 1.5 0 000 3zm6 0a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" /></svg>
      </div>
      <div className="kpi__admin-controls">
        <button className="admin-icon-btn" onClick={onEdit} title="Edit card">
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor"><path d="M11 2l3 3-8 8H3v-3l8-8z" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </button>
        <button className="admin-icon-btn admin-icon-btn--danger" onClick={onDelete} title="Remove card">
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor"><path d="M3 4h10M5 4V3h6v1M6 7v5M10 7v5M4 4l1 9h6l1-9" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </button>
      </div>
      <KPICard card={card} data={data} allData={allData} kpiFields={kpiFields} />
    </div>
  );
}

export function AdminSection({ section, sectionIndex, data, allData, kpiFields, sparkKeys, usedFields,
  onUpdateSection, onDeleteSection, dragHandleProps }) {

  const [editingCard, setEditingCard] = useState(null);
  const [addingCard, setAddingCard] = useState(false);

  const cols = section.cols ?? 3;

  function updateCard(updatedCard) {
    onUpdateSection({
      ...section,
      cards: section.cards.map(c => c.id === updatedCard.id ? updatedCard : c),
    });
    setEditingCard(null);
  }

  function deleteCard(cardId) {
    onUpdateSection({ ...section, cards: section.cards.filter(c => c.id !== cardId) });
  }

  function addCard(newCard) {
    onUpdateSection({ ...section, cards: [...section.cards, newCard] });
  }

  return (
    <section className="section section--admin">
      <div className="section__head">
        <div className="section__title" style={{ flex: 1 }}>
          <span className="section__num drag-handle" {...dragHandleProps} title="Drag to reorder section">
            <svg viewBox="0 0 16 16" fill="currentColor" style={{ width: 14, height: 14 }}>
              <path d="M5 4a1.5 1.5 0 100-3 1.5 1.5 0 000 3zm6 0a1.5 1.5 0 100-3 1.5 1.5 0 000 3zM5 9.5a1.5 1.5 0 100-3 1.5 1.5 0 000 3zm6 0a1.5 1.5 0 100-3 1.5 1.5 0 000 3zM5 15a1.5 1.5 0 100-3 1.5 1.5 0 000 3zm6 0a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
            </svg>
          </span>
          <input
            className="section__name-input"
            value={section.label}
            onChange={e => onUpdateSection({ ...section, label: e.target.value })}
            style={{ width: `${Math.max(60, section.label.length * 14)}px` }}
          />
          <input
            className="section__hint-input"
            value={section.hint ?? ''}
            placeholder="Section subtitle…"
            onChange={e => onUpdateSection({ ...section, hint: e.target.value })}
          />
        </div>
        <div className="section__admin-controls">
          <select
            className="modal__select"
            style={{ padding: '4px 8px', fontSize: 12 }}
            value={cols}
            onChange={e => onUpdateSection({ ...section, cols: Number(e.target.value) })}
            title="Columns"
          >
            {[1, 2, 3, 4].map(n => <option key={n} value={n}>{n} col{n > 1 ? 's' : ''}</option>)}
          </select>
          <button className="admin-icon-btn admin-icon-btn--danger" onClick={onDeleteSection} title="Delete section">
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor"><path d="M3 4h10M5 4V3h6v1M6 7v5M10 7v5M4 4l1 9h6l1-9" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </button>
        </div>
      </div>

      <SortableContext items={section.cards.map(c => c.id)} strategy={rectSortingStrategy}>
        <div className={`kpi-grid kpi-grid--${cols}`}>
          {section.cards.map(card => (
            <SortableCard
              key={card.id}
              card={card}
              data={data}
              allData={allData}
              kpiFields={kpiFields}
              sparkKeys={sparkKeys}
              onEdit={() => setEditingCard(card)}
              onDelete={() => deleteCard(card.id)}
            />
          ))}
          <div className="add-card-row" onClick={() => setAddingCard(true)}>
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" style={{ width: 16, height: 16 }}><path d="M8 3v10M3 8h10" strokeLinecap="round" /></svg>
            Add card
          </div>
        </div>
      </SortableContext>

      {editingCard && (
        <CardEditor
          card={editingCard}
          sparkKeys={sparkKeys}
          kpiFields={kpiFields}
          onSave={updateCard}
          onClose={() => setEditingCard(null)}
        />
      )}
      {addingCard && (
        <CardPicker
          kpiFields={kpiFields}
          usedFields={usedFields}
          onAdd={addCard}
          onClose={() => setAddingCard(false)}
        />
      )}
    </section>
  );
}
