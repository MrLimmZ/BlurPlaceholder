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
  Checkbox,
  SingleSelect,
  SingleSelectOption,
  Searchbar,
  SearchForm
} from '@strapi/design-system';
import { useIntl } from 'react-intl';
import { useFetchClient } from '@strapi/strapi/admin';
import { getTranslation } from '../utils/getTranslation';
import SettingsModal from '../components/SettingsModal';
import HashField from '../components/HashField';
import { Trash, ArrowsCounterClockwise } from '@strapi/icons';

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

  // Traduction
  const { formatMessage } = useIntl();

  // API
  const { get, post } = useFetchClient();
  const [files, setFiles] = useState<FileItem[]>([]);

  // Table
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [customHashes, setCustomHashes] = useState<{ [key: number]: string }>({});
  const [currentPage, setCurrentPage] = useState(1);
  const pageCount = Math.ceil(files.length / entriesPerPage);
  const indexOfLastItem = currentPage * entriesPerPage;
  const indexOfFirstItem = indexOfLastItem - entriesPerPage;
  const currentFiles = files.slice(indexOfFirstItem, indexOfLastItem);
  const [selectedFiles, setSelectedFiles] = useState<number[]>([]);
  const allSelected = currentFiles.length > 0 && selectedFiles.length === currentFiles.length;
  const someSelected = selectedFiles.length > 0 && selectedFiles.length < currentFiles.length;
  const [searchValue, setSearchValue] = React.useState('');

  // Action button
  const [isGenerating, setIsGenerating] = useState(false);

  // Alert
  const [alertMessage, setAlertMessage] = useState<string | null>(null);

  // Config
  const [rangeBlurhash, setRangeBlurhash] = useState(4);
  const [toolSelected, setToolSelected] = useState('blurhash');


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

    if (alertMessage) {
      const timeout = setTimeout(() => {
        setAlertMessage(null);
      }, 3000);

      return () => clearTimeout(timeout);
    }
  }, [get, alertMessage]);

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
            onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
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
          onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
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
              onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
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
            onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
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
              onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
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
          onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
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

  // Fonction clear
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

  return (
    <Main>
      <Box paddingLeft={10} paddingRight={10} paddingTop={8} paddingBottom={8}>
        <Flex paddingBottom={10} justifyContent="space-between" width="100%">
          <Box>
            <Typography variant="alpha" paddingRight={3}>Blur Placeholder</Typography>
            <Typography variant="epsilon" textColor="neutral600">v0.1.0</Typography>
          </Box>

          <Flex gap={4}>
            <Button onClick={handleGlobalGeneration} disabled={countEligibleFiles() === 0 || isGenerating}>
              {countEligibleFiles() === 0
                ? 'Aucun à générer'
                : `Génération global (${countEligibleFiles()} Fichiers)`}
            </Button>
            <SettingsModal
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

        {selectedFiles.length > 0 && (
          <Flex gap={2} paddingBottom={6}>
            <Typography variant="omega">
              {selectedFiles.length} fichier{selectedFiles.length > 1 ? 's' : ''} sélectionné{selectedFiles.length > 1 ? 's' : ''}
            </Typography>
            <Button
              variant="danger-light"
              startIcon={<Trash />}
              onClick={() => {
                selectedFiles.forEach(fileId => {
                  handleClearBlurhash(fileId);
                });
              }}>
              Supprimer le hash
            </Button>
            <Button
              variant="secondary"
              startIcon={<ArrowsCounterClockwise />}
              onClick={() => {
                selectedFiles.forEach(fileId => {
                  handleRegenerateHash(fileId);
                });
                setAlertMessage(`Génération terminée pour ${selectedFiles.length} fichier(s)`);
              }}>
              Régénérer le hash
            </Button>
          </Flex>
        )}

        <Box paddingBottom={4}>
          <SearchForm>
            <Searchbar name="searchbar" onClear={() => setSearchValue('')} value={searchValue} onChange={e => setSearchValue(e.target.value)} clearLabel="Nettoyer la recherche" placeholder="e.g: nom-du-media.png">
              Recherchez un média
            </Searchbar>
          </SearchForm>
        </Box>

        <Table colCount={5} rowCount={files.length}>
          <Thead>
            <Tr>
              <Th>
                <Checkbox
                  checked={allSelected ? true : someSelected ? "indeterminate" : false}
                  onCheckedChange={() => {
                    if (allSelected || someSelected) {
                      setSelectedFiles([]);
                    } else {
                      setSelectedFiles(
                        currentFiles
                          .filter(file => file.mime.startsWith('image/'))
                          .map(file => file.id)
                      );
                    }
                  }}
                  aria-label="Select all entries"
                />
              </Th>
              <Th><Typography variant="sigma">{formatMessage({ id: getTranslation('home.table.row.banner') })}</Typography></Th>
              <Th><Typography variant="sigma">{formatMessage({ id: getTranslation('home.table.row.name') })}</Typography></Th>
              <Th><Typography variant="sigma">{formatMessage({ id: getTranslation('home.table.row.provider') })}</Typography></Th>
              <Th><Typography variant="sigma">{formatMessage({ id: getTranslation('home.table.row.type') })}</Typography></Th>
              <Th><Typography variant="sigma">{formatMessage({ id: getTranslation('home.table.row.link') })}</Typography></Th>
            </Tr>
          </Thead>
          <Tbody>
            {currentFiles.map((file) => (
              <Tr key={file.id}>
                <Td>
                  <Checkbox
                    disabled={!file.mime.startsWith('image/')}
                    checked={selectedFiles.includes(file.id)}
                    onCheckedChange={(checked: boolean) => {
                      setSelectedFiles(prev => {
                        if (checked) {
                          return [...prev, file.id];
                        } else {
                          return prev.filter(id => id !== file.id);
                        }
                      });
                    }}
                    aria-label={`Select ${file.id}`}
                  />
                </Td>
                <Td>
                  <Avatar.Item src={file.url} alt={file.alternativeText} preview fallback="B" />
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
                      force={rangeBlurhash}
                      onChange={(val) =>
                        setCustomHashes((prev) => ({ ...prev, [file.id]: val }))
                      }
                      onSendSuccess={(newHash) => {
                        file.blurhash = newHash;

                        setCustomHashes((prev) => {
                          const { [file.id]: _, ...rest } = prev;
                          return rest;
                        });
                      }}
                    />
                  </Flex>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>

        <Flex justifyContent="space-between" width="100%" paddingTop={6}>
          <Flex gap={2}>
            <SingleSelect
              label="Entrées par page"
              value={String(entriesPerPage)}
              onChange={(value: string) => {
                setEntriesPerPage(Number(value));
                setCurrentPage(1);
              }}
            >
              {[10, 20, 50, 100].map((num) => (
                <SingleSelectOption key={num} value={String(num)}>
                  {num}
                </SingleSelectOption>
              ))}
            </SingleSelect>
            <Typography variant="omega">entrées par page</Typography>
          </Flex>
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
        </Flex>

      </Box>
    </Main>
  );
};

export { HomePage };
