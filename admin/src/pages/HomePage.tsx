import React, { useEffect, useState } from 'react';
import {
  Main,
  Table,
  Thead,
  Tbody,
  Tr,
  Td,
  Th,
  Typography,
  Button,
  Flex,
  Badge,
  Avatar,
  Alert,
  Box,
  Pagination,
  PreviousLink,
  PageLink,
  Dots,
  NextLink,
} from '@strapi/design-system';
import { Duplicate, Trash, Check, ArrowClockwise } from '@strapi/icons';
import { useIntl } from 'react-intl';
import { useFetchClient } from '@strapi/strapi/admin';
import { getTranslation } from '../utils/getTranslation';
import SettingsModal from '../components/SettingsModal';
import MediaModal from '../components/MediaModal';
import HashField from '../components/HashField';

import { formatMime } from '../utils/formatMime';
import { formatProvider } from '../utils/formatProvider';

interface FileItem {
  id: number;
  name: string;
  blurhash: string;
  url: string;
  mime: string;
  alternativeText: string;
  provider: string;
  size: number;
  width: number;
  height: number;
  createdAt: Date;
}

const HomePage = () => {
  const { formatMessage } = useIntl();
  const { get, post } = useFetchClient();
  const [files, setFiles] = useState<FileItem[]>([]);
  const [customHashes, setCustomHashes] = useState<{ [key: number]: string }>({});
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const pageCount = Math.ceil(files.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentFiles = files.slice(indexOfFirstItem, indexOfLastItem);
  const [isGenerating, setIsGenerating] = useState(false);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const [rangeBlurhash, setRangeBlurhash] = useState(4);
  const [toolSelected, setToolSelected] = useState('blurhash');
  const [isOpen, setIsOpen] = useState(false);


  // Récupération API
  useEffect(() => {

    const fetchConfig = async () => {
      try {
        const res = await fetch('/api/blur-placeholder/config');
        if (!res.ok) return;

        const { blurhashForce, tools } = await res.json();

        if (typeof blurhashForce === 'number') {
          setRangeBlurhash(blurhashForce);
        }

        if (typeof tools === 'string') {
          setToolSelected(tools);
        }
      } catch (e) {
        console.error('Erreur lors du chargement de la config :', e);
      }
    };

    fetchConfig();

    const fetchFiles = async () => {
      try {
        const response = await get('/upload/files?pageSize=1000&sort=id:desc');

        const sortedFiles = response.data.results.sort((a: FileItem, b: FileItem) => {
          const getPriority = (file: FileItem): number => {
            if (file.mime.startsWith('image/') && file.mime !== 'image/svg+xml') return 1;
            if (file.mime === 'image/svg+xml') return 2;
            if (file.mime.startsWith('video/')) return 3;
            return 4;
          };

          return getPriority(a) - getPriority(b);
        });

        setFiles(sortedFiles);
      } catch (err) {
        console.error('❌ Erreur lors de la récupération des fichiers :', err);
      }
    };

    fetchFiles();
  }, [get]);

  // Fonction de génération Hash
  const handleRegenerateHash = async (fileId: number) => {
    const file = files.find(f => f.id === fileId);

    if (!file) {
      alert('Fichier introuvable.');
      return;
    }

    if (file.provider !== 'local' && file.provider !== '@strapi/provider-upload-cloudinary') {
      alert(`La régénération du blurhash est désactivée pour ce type de provider : ${file.provider}`);
      return;
    }

    try {
      const response = await fetch(`/api/blur-placeholder/force-update/${fileId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ force: rangeBlurhash }),
      });

      if (!response.ok) {
        const err = await response.json();
        console.error('Erreur lors de la régénération:', err);
        alert('Erreur lors de la régénération du blurhash');
        return;
      }

      const updatedFile = await response.json();

      setFiles(prevFiles =>
        prevFiles.map(file => (file.id === fileId ? updatedFile : file))
      );
    } catch (error) {
      console.error('Erreur fetch:', error);
      alert('Erreur réseau lors de la régénération du blurhash');
    }
  };

  // Fonction de suppression de Hash
  const handleClearBlurhash = async (fileId: number) => {
    try {
      const response = await fetch(`/api/blur-placeholder/clear/${fileId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        const err = await response.json();
        console.error('Erreur lors de la suppression du blurhash:', err);
        alert('Erreur lors de la suppression du blurhash');
        return;
      }

      const updatedFile = await response.json();

      setFiles(prev =>
        prev.map(file => (file.id === fileId ? updatedFile : file))
      );
    } catch (error) {
      console.error('Erreur réseau:', error);
      alert('Erreur réseau lors de la suppression du blurhash');
    }
  };

  // Fonction personnalisation Hash
  const handleSetCustomHash = async (fileId: number, customHash: string) => {
    try {
      const response = await fetch(`/api/blur-placeholder/set/${fileId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ blurhash: customHash }),
      });

      if (!response.ok) {
        const err = await response.json();
        console.error('Erreur lors de la mise à jour du blurhash:', err);
        alert('Erreur lors de la mise à jour du blurhash');
        return;
      }

      const updatedFile = await response.json();
      alert('Blurhash mis à jour avec succès !');

      setFiles(prev =>
        prev.map(file => (file.id === fileId ? updatedFile : file))
      );
    } catch (error) {
      console.error('Erreur réseau:', error);
      alert('Erreur réseau lors de la mise à jour du blurhash');
    }
  };

  // Fonction navigation page
  const goToPage = (page: number) => {
    if (page < 1 || page > pageCount) return;
    setCurrentPage(page);
  };

  const renderPageLinks = () => {
    const pages = [];
    const pageNeighbours = 1;
    const totalNumbers = pageNeighbours * 2 + 3;
    const totalBlocks = totalNumbers + 2;

    if (pageCount <= totalBlocks) {
      for (let i = 1; i <= pageCount; i++) {
        pages.push(
          <PageLink
            key={i}
            number={i}
            href={`/${i}`}
            onClick={e => {
              e.preventDefault();
              goToPage(i);
            }}
            aria-current={currentPage === i ? 'page' : undefined}
          >
            {`Go to page ${i}`}
          </PageLink>
        );
      }
    } else {
      // Calculer bornes gauche et droite
      let leftBound = Math.max(2, currentPage - pageNeighbours);
      let rightBound = Math.min(pageCount - 1, currentPage + pageNeighbours);

      // Ajuster si on est proche des bords
      if (currentPage <= pageNeighbours + 2) {
        rightBound = 1 + pageNeighbours * 2 + 1;
        leftBound = 2;
      }
      if (currentPage >= pageCount - (pageNeighbours + 1)) {
        leftBound = pageCount - (pageNeighbours * 2 + 1);
        rightBound = pageCount - 1;
      }

      // Page 1
      pages.push(
        <PageLink
          key={1}
          number={1}
          href="/1"
          onClick={e => {
            e.preventDefault();
            goToPage(1);
          }}
          aria-current={currentPage === 1 ? 'page' : undefined}
        >
          Go to page 1
        </PageLink>
      );

      // Points de suspension gauche si nécessaire
      if (leftBound > 2) {
        pages.push(<Dots key="left-dots">...</Dots>);
      } else {
        // afficher pages entre 2 et leftBound si proche du début
        for (let i = 2; i < leftBound; i++) {
          pages.push(
            <PageLink
              key={i}
              number={i}
              href={`/${i}`}
              onClick={e => {
                e.preventDefault();
                goToPage(i);
              }}
              aria-current={currentPage === i ? 'page' : undefined}
            >
              Go to page {i}
            </PageLink>
          );
        }
      }

      // Pages centrales autour de currentPage
      for (let i = leftBound; i <= rightBound; i++) {
        pages.push(
          <PageLink
            key={i}
            number={i}
            href={`/${i}`}
            onClick={e => {
              e.preventDefault();
              goToPage(i);
            }}
            aria-current={currentPage === i ? 'page' : undefined}
          >
            Go to page {i}
          </PageLink>
        );
      }

      // Points de suspension droite si nécessaire
      if (rightBound < pageCount - 1) {
        pages.push(<Dots key="right-dots">...</Dots>);
      } else {
        for (let i = rightBound + 1; i < pageCount; i++) {
          pages.push(
            <PageLink
              key={i}
              number={i}
              href={`/${i}`}
              onClick={e => {
                e.preventDefault();
                goToPage(i);
              }}
              aria-current={currentPage === i ? 'page' : undefined}
            >
              Go to page {i}
            </PageLink>
          );
        }
      }

      // Dernière page
      pages.push(
        <PageLink
          key={pageCount}
          number={pageCount}
          href={`/${pageCount}`}
          onClick={e => {
            e.preventDefault();
            goToPage(pageCount);
          }}
          aria-current={currentPage === pageCount ? 'page' : undefined}
        >
          Go to page {pageCount}
        </PageLink>
      );
    }

    return pages;
  };

  // Fonction génération global
  const handleGlobalGeneration = async () => {
    const eligibleFiles = files.filter(file =>
      file.mime.startsWith('image/') &&
      file.provider &&
      !file.blurhash &&
      (file.provider === 'local' || file.provider === '@strapi/provider-upload-cloudinary')
    );

    setIsGenerating(true);

    for (const file of eligibleFiles) {
      await handleRegenerateHash(file.id);
    }

    setIsGenerating(false);
    setAlertMessage(`Génération terminée pour ${eligibleFiles.length} fichier(s)`);
  };

  // Nombre d'éléments
  const countEligibleFiles = () => {
    return files.filter(file =>
      file.mime.startsWith('image/') &&
      file.provider &&
      (!file.blurhash || file.blurhash.trim() === '') &&
      (file.provider === 'local' || file.provider === '@strapi/provider-upload-cloudinary')
    ).length;
  };


  return (
    <Main>
      <Box paddingLeft={10} paddingRight={10} paddingTop={8} paddingBottom={8}>
        <Flex paddingBottom={10} justifyContent="space-between" width="100%">
          <Box>
            <Typography variant="alpha" paddingRight={3}>Blur Placeholder</Typography>
            <Typography variant="epsilon" textColor="neutral600">v1.0.0</Typography>
          </Box>

          <Flex gap={4}>
            <Button onClick={handleGlobalGeneration} disabled={countEligibleFiles() === 0 || isGenerating}>
              {countEligibleFiles() === 0
                ? 'Aucun à générer'
                : `Génération global (${countEligibleFiles()} Fichiers)`}
            </Button>
            <SettingsModal
              isOpen={isOpen}
              setIsOpen={setIsOpen}
              rangeBlurhash={rangeBlurhash}
              setRangeBlurhash={setRangeBlurhash}
              toolSelected={toolSelected}
              setToolSelected={setToolSelected}
            />
          </Flex>
        </Flex>

        {alertMessage && (
          <Alert
            closeLabel="Fermer"
            onClose={() => setAlertMessage(null)}
            variant="success"
            marginBottom={10}
          >
            {alertMessage}
          </Alert>
        )}

        <Table colCount={5} rowCount={files.length}>
          <Thead>
            <Tr>
              <Th><Typography variant="sigma">{formatMessage({ id: getTranslation('home.table.row.banner') })}</Typography></Th>
              <Th><Typography variant="sigma">{formatMessage({ id: getTranslation('home.table.row.name') })}</Typography></Th>
              <Th><Typography variant="sigma">{formatMessage({ id: getTranslation('home.table.row.provider') })}</Typography></Th>
              <Th><Typography variant="sigma">{formatMessage({ id: getTranslation('home.table.row.type') })}</Typography></Th>
              <Th><Typography variant="sigma">{formatMessage({ id: getTranslation('home.table.row.link') })}</Typography></Th>
              <Th><Typography variant="sigma">{formatMessage({ id: getTranslation('home.table.row.action') })}</Typography></Th>
            </Tr>
          </Thead>
          <Tbody>
            {currentFiles.map((file) => (
              <Tr key={file.id}>
                <Td>
                  <Avatar.Item src={file.url} alt={file.alternativeText} />
                </Td>
                <Td>
                  <Typography>{file.name}</Typography>
                </Td>
                <Td>
                  <Badge>{formatProvider(file.provider)}</Badge>
                </Td>
                <Td>
                  <Badge>{formatMime(file.mime)}</Badge>
                </Td>
                <Td>
                  <Flex gap={2}>
                    <HashField
                      file={file}
                      value={customHashes[file.id] ?? file.blurhash ?? ''}
                      onChange={(val) =>
                        setCustomHashes((prev) => ({ ...prev, [file.id]: val }))
                      }
                      onClear={() => handleClearBlurhash(file.id)}
                      onSend={() => handleSetCustomHash(file.id, customHashes[file.id] ?? '')}
                      onGenerate={() => handleRegenerateHash(file.id)}
                    />
                    <MediaModal file={file} />
                  </Flex>
                </Td>
                <Td>
                  {!file.mime.startsWith('image/') && (
                    <Button disabled>Mauvais format</Button>
                  )}
                  {file.mime.startsWith('image/') && file.blurhash && (
                    <Button variant="tertiary" onClick={() => handleRegenerateHash(file.id)}>
                      Regénérer Hash
                    </Button>
                  )}
                  {file.mime.startsWith('image/') && !file.blurhash && (
                    <Button onClick={() => handleRegenerateHash(file.id)}>Générer Hash</Button>
                  )}
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>

        <Box paddingTop={6}>
          <Pagination activePage={currentPage} pageCount={pageCount}>
            <PreviousLink
              href={`/${currentPage - 1}`}
              onClick={(e: React.MouseEvent<HTMLAnchorElement>) => {
                e.preventDefault();
                goToPage(currentPage - 1);
              }}
              aria-disabled={currentPage === 1}
            >
              Go to previous page
            </PreviousLink>

            {renderPageLinks()}

            <NextLink
              href={`/${currentPage + 1}`}
              onClick={(e: React.MouseEvent<HTMLAnchorElement>) => {
                e.preventDefault();
                goToPage(currentPage + 1);
              }}
              aria-disabled={currentPage === pageCount}
            >
              Go to next page
            </NextLink>
          </Pagination>
        </Box>

      </Box>
    </Main>
  );
};

export { HomePage };
