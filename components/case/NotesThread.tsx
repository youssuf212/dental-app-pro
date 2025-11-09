import React, { useState } from 'react';
import { CaseNote } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import { useData } from '../../hooks/useData';
import { formatDistanceToNow } from 'date-fns';
import { SendIcon } from '../icons/IconComponents';
import Button from '../ui/Button';

interface NotesThreadProps {
  caseId: string;
  notes: CaseNote[];
  isReadOnly?: boolean;
}

const NotesThread: React.FC<NotesThreadProps> = ({ caseId, notes, isReadOnly = false }) => {
  const { user } = useAuth();
  const { addNoteToCase } = useData();
  const [newNote, setNewNote] = useState('');

  const handleAddNote = () => {
    if (newNote.trim() && user) {
      addNoteToCase(caseId, {
        authorId: user.id,
        authorName: user.name,
        content: newNote.trim(),
      });
      setNewNote('');
    }
  };

  const sortedNotes = [...(notes || [])].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  return (
    <div>
      <h3 className="text-lg font-semibold text-text-primary mb-4">Communication</h3>
      <div className="space-y-4 bg-white/5 p-4 rounded-xl max-h-96 overflow-y-auto">
        {sortedNotes.map(note => (
          <div key={note.id} className={`flex items-start gap-3 ${note.authorId === user?.id ? 'justify-end' : ''}`}>
             {note.authorId !== user?.id && (
                <div className="w-8 h-8 rounded-full bg-primary text-black flex items-center justify-center font-bold text-sm flex-shrink-0">
                    {note.authorName.charAt(0)}
                </div>
            )}
            <div className={`p-3 rounded-xl max-w-xs md:max-w-md ${note.authorId === user?.id ? 'bg-primary text-black' : 'bg-surface-elevated'}`}>
              <p className="text-sm">{note.content}</p>
              <p className={`text-xs mt-1 opacity-75 ${note.authorId === user?.id ? 'text-right' : 'text-left'}`}>
                {note.authorName} - {formatDistanceToNow(new Date(note.timestamp), { addSuffix: true })}
              </p>
            </div>
          </div>
        ))}
        {sortedNotes.length === 0 && <p className="text-center text-sm text-text-tertiary">No notes yet.</p>}
      </div>
      {!isReadOnly && (
        <div className="mt-4 flex items-center space-x-2">
          <textarea
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            rows={2}
            placeholder="Type your message..."
            className="flex-grow px-3 py-2 border border-border-color rounded-xl bg-white/5 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
          />
          <Button onClick={handleAddNote} disabled={!newNote.trim()} className="h-full">
            <SendIcon className="w-5 h-5" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default NotesThread;
