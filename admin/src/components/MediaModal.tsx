import {
  Modal,
  Flex,
  Box,
  Typography,
  Button,
  IconButton,
  TextInput,
} from '@strapi/design-system';
import { Eye } from '@strapi/icons';
import BlurhashCanvas from './BlurhashCanvas';

import { formatMime } from '../utils/formatMime';
import { formatProvider } from '../utils/formatProvider';

interface MediaModalProps {
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
}

const MediaModal = ({ file }: MediaModalProps) => {
  return (
    <Modal.Root>
      <Modal.Trigger>
        <IconButton
          label="Voir"
          type="button"
          disabled={!file.blurhash}
        >
          <Eye />
        </IconButton>
      </Modal.Trigger>

      <Modal.Content>
        <Modal.Header>
          <Modal.Title>Preview de génération</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Flex gap={8} paddingBottom={8}>
            <Box width="400px">
              <BlurhashCanvas blurhash={file.blurhash ?? ''} width={400} height={300} />
            </Box>

            <Box
              flex={1}
              display="flex"
              flexWrap="wrap"
              gap={4}
              padding={4}
              borderRadius={2}
              background="neutral100"
            >
              <Box flex="0 0 50%">
                <Box paddingBottom={2}>
                  <Typography variant="pi" fontWeight="bold" as="div">ID</Typography>
                  <Typography as="div">{file.id}</Typography>
                </Box>
                <Box paddingBottom={2}>
                  <Typography variant="pi" fontWeight="bold" as="div">Nom</Typography>
                  <Typography as="div">{file.name}</Typography>
                </Box>
                <Box paddingBottom={2}>
                  <Typography variant="pi" fontWeight="bold" as="div">Extension</Typography>
                  <Typography as="div">{formatMime(file.mime)}</Typography>
                </Box>
                <Box paddingBottom={2}>
                  <Typography variant="pi" fontWeight="bold" as="div">Taille</Typography>
                  <Typography as="div">{(file.size / 1024).toFixed(2)} KB</Typography>
                </Box>
              </Box>

              <Box flex="0 0 50%">
                <Box paddingBottom={2}>
                  <Typography variant="pi" fontWeight="bold" as="div">Dimensions</Typography>
                  <Typography as="div">{file.width} x {file.height}</Typography>
                </Box>
                <Box paddingBottom={2}>
                  <Typography variant="pi" fontWeight="bold" as="div">Date</Typography>
                  <Typography as="div">{new Date(file.createdAt).toLocaleDateString()}</Typography>
                </Box>
                <Box paddingBottom={2}>
                  <Typography variant="pi" fontWeight="bold" as="div">Provider</Typography>
                  <Typography as="div">{formatProvider(file.provider)}</Typography>
                </Box>
              </Box>
            </Box>
          </Flex>
          <Box>
            <TextInput
              size="M"
              type="text"
              value={file.blurhash}
            />
          </Box>
        </Modal.Body>

        <Modal.Footer>
          <Modal.Close>
            <Button>Fermer</Button>
          </Modal.Close>
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  );
};

export default MediaModal;
