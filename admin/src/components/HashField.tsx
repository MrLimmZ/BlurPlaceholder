import { TextInput, IconButton } from '@strapi/design-system';
import { Duplicate, Trash, Check, ArrowClockwise } from '@strapi/icons';
import React, { useState } from 'react';

interface HashFieldProps {
  file: {
    id: number | string;
    mime: string;
    blurhash?: string;
  };
  value: string;
  onChange: (value: string) => void;
  onClear: () => void;
  onSend: () => void;
  onGenerate: () => void;
}

const HashField = ({
  file,
  value,
  onChange,
  onClear,
  onSend,
  onGenerate,
}: HashFieldProps) => {
  const isImage = file.mime.startsWith('image/');
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!file.blurhash) return;

    try {
      await navigator.clipboard.writeText(file.blurhash);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      console.log('📋 Copié dans le presse-papiers :', file.blurhash);
    } catch (err) {
      console.error('❌ Erreur lors de la copie :', err);
    }
  };

  return (
    <>
      <TextInput
        value={value}
        size="S"
        type="text"
        disabled={!isImage}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
        placeholder={isImage ? 'Entrez un blurhash' : ''}
      />

      <IconButton
        type="button"
        disabled={!file.blurhash}
        label={copied ? 'Copié !' : 'Copier le hash'}
        onClick={handleCopy}
      >
        <Duplicate />
      </IconButton>

      <IconButton
        type="button"
        disabled={!file.blurhash}
        label="Supprimer"
        onClick={onClear}
      >
        <Trash />
      </IconButton>

      <IconButton
        type="button"
        label="Envoyer"
        onClick={onSend}
      >
        <Check />
      </IconButton>

      <IconButton
        type="button"
        label="Générer"
        onClick={onGenerate}
      >
        <ArrowClockwise />
      </IconButton>
    </>
  );
};

export default HashField;