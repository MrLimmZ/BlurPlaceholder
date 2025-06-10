import { TextInput, IconButton } from '@strapi/design-system';
import { Duplicate, Trash, Check, ArrowClockwise } from '@strapi/icons';
import React, { useState } from 'react';
import MediaModal from '../components/MediaModal';

interface HashFieldProps {
  file: {
    id: number;
    name: string;
    size: number;
    mime: string;
    width: number;
    height: number;
    createdAt: Date;
    provider: string;
    blurhash?: string;
    [key: string]: any;
  };
  value: string;
  force: number;
  onChange: (value: string) => void;
  onSendSuccess?: (newValue: string) => void;
}

const HashField = ({
  file,
  value,
  onChange,
  force,
  onSendSuccess,
}: HashFieldProps) => {
  const isImage = file.mime.startsWith('image/');
  const [copied, setCopied] = useState(false);
  const [initialValue, setInitialValue] = useState(file.blurhash || '');
  const isValueChanged = value !== initialValue;

  // Copy
  const copyInput = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('❌ Erreur lors de la copie :', err);
    }
  };

  // Clear
  const clearInput = () => {
    onChange('');
  };

  // Hash Generate
  const hashInput = async () => {
    try {
      const response = await fetch(`/api/blur-placeholder/hash/${file.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ force: force }),
      });

      const blurhash = await response.text();
      onChange(blurhash)
    } catch (error) {
      console.error('Erreur fetch:', error);
      alert('Erreur réseau lors de la régénération du blurhash');
    }
  };

  // Post
  const sendInput = async () => {
    try {
      const blurhashToSend = value;

      const response = await fetch(`/api/blur-placeholder/set/${file.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ blurhash: blurhashToSend }),
      });

      if (!response.ok) {
        const err = await response.text();
        console.error('Erreur lors de l\'envoi:', err);
        alert('Erreur lors de l\'envoi du blurhash');
        return;
      }

      setInitialValue(blurhashToSend);

      if (onSendSuccess) {
        onSendSuccess(blurhashToSend);
      }

    } catch (error) {
      console.error('Erreur réseau lors de l\'envoi:', error);
      alert('Erreur réseau lors de l\'envoi du blurhash');
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
        disabled={!value}
        label={copied ? 'Copié !' : 'Copier le hash'}
        onClick={copyInput}
      >
        <Duplicate />
      </IconButton>

      <MediaModal blurhash={value} file={file} />

      <IconButton
        type="button"
        disabled={!value}
        label="Supprimer"
        onClick={clearInput}
      >
        <Trash />
      </IconButton>

      <IconButton
        type="button"
        label="Générer"
        disabled={!isImage}
        onClick={hashInput}
      >
        <ArrowClockwise />
      </IconButton>

      <IconButton
        type="button"
        label="Envoyer"
        variant="default"
        disabled={!isValueChanged}
        onClick={sendInput}
      >
        <Check />
      </IconButton>

    </>
  );
};

export default HashField;