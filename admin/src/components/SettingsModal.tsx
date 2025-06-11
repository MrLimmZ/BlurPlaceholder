import {
  Modal,
  Flex,
  Box,
  Button,
  IconButton,
  SingleSelect,
  SingleSelectOption,
  Field,
  Grid
} from '@strapi/design-system';
import { SlidersHorizontal, Hashtag, Image } from '@strapi/icons';
import { RGBIcon } from './RGBIcon';
import MediaCanvas from './MediaCanvas';
import RangeInput from './RangeInput';
import { useState } from 'react';
import placeholder from '../pages/assets/placeholder.jpg';

interface SettingsModalProps {
  rangeBlurhash: number;
  setRangeBlurhash: (val: number) => void;
  toolSelected: string;
  setToolSelected: (val: string) => void;
}

const SettingsModal = ({
  rangeBlurhash,
  setRangeBlurhash,
  toolSelected,
  setToolSelected,
}: SettingsModalProps) => {

  // Modal
  const [isOpen, setIsOpen] = useState(false);

  // - Blurhash
  const [resizeWidthRatio, setResizeWidthRatio] = useState(50);

  // - Color
  const [colorQuality, setColorQuality] = useState(30);
  const [colorCount, setColorCount] = useState(1);
  const [colorFormat, setColorFormat] = useState("hex");

  // Save function
  const handleSaveParams = async () => {
    try {
      const res = await fetch('/api/blur-placeholder/config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          blurhashForce: rangeBlurhash,
          tool: toolSelected,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        alert(`Erreur : ${err?.error?.message || 'Impossible de sauvegarder.'}`);
        return;
      }

      setIsOpen(false);
    } catch (e) {
      console.error(e);
      alert('❌ Une erreur est survenue lors de la sauvegarde.');
    }
  };

  const commonSettings = {
    tool: toolSelected,
  };

  const toolSettings =
    toolSelected === 'blurhash'
      ? {
        resizeWidthRatio,
        force: rangeBlurhash,
      }
      : toolSelected === 'color'
        ? {
          colorQuality,
          colorCount,
          format: colorFormat,
        }
        : {};

  const settings = {
    ...commonSettings,
    ...toolSettings,
  } ;


  return (
    <Modal.Root open={isOpen} onOpenChange={setIsOpen}>
      <Modal.Trigger>
        <IconButton label="Paramètres" type="button">
          <SlidersHorizontal />
        </IconButton>
      </Modal.Trigger>

      <Modal.Content>
        <Modal.Header>
          <Modal.Title>Paramètres</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Grid.Root gap={8}>
            <Grid.Item col={6}>
              <Flex direction="column" gap={6} flex={1}>
                <MediaCanvas
                  url={placeholder}
                  setting={settings}
                />
              </Flex>
            </Grid.Item>

            <Grid.Item col={6}>
              <Box flex={1} style={{height: '100%'}} >
                <Field.Root paddingBottom={6}>
                  <Field.Label>Outil</Field.Label>
                  <SingleSelect
                    label="Méthode"
                    value={toolSelected}
                    onChange={(val: string) => setToolSelected(val)}
                  >
                    <SingleSelectOption value="blurhash">Blurhash</SingleSelectOption>
                    <SingleSelectOption value="color">Color</SingleSelectOption>
                  </SingleSelect>
                </Field.Root>

                {toolSelected === 'blurhash' && (
                  <Flex gap={6} direction="column"
                    padding={4}
                    borderRadius={2}
                    background="neutral100">

                    <Box width="100%">
                      <Field.Root>
                        <Field.Label>
                          Force du blurhash : {rangeBlurhash}
                        </Field.Label>
                        <RangeInput
                          min={1}
                          max={9}
                          value={rangeBlurhash}
                          onChange={(e) => setRangeBlurhash(Number(e.target.value))}
                          aria-label="Force du blurhash"
                          $progress={((rangeBlurhash - 1) / (9 - 1)) * 100}
                        />
                      </Field.Root>
                    </Box>

                    <Box width="100%">
                      <Field.Root>
                        <Field.Label>
                          Resize Width Ratio : {resizeWidthRatio}
                        </Field.Label>
                        <RangeInput
                          min={1}
                          max={100}
                          step={1}
                          value={resizeWidthRatio}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setResizeWidthRatio(Number(e.target.value))}
                          aria-label="Ratio du blurhash"
                          $progress={((resizeWidthRatio - 1) / (100 - 1)) * 100}
                        />
                      </Field.Root>
                    </Box>

                  </Flex>
                )}

                {toolSelected === 'color' && (
                  <Flex gap={6} direction="column"
                    padding={4}
                    borderRadius={2}
                    background="neutral100">

                    <Box width="100%">
                      <Field.Root>
                        <Field.Label>
                          Quality Analyse : {colorQuality}
                        </Field.Label>
                        <RangeInput
                          min={1}
                          max={30}
                          value={colorQuality}
                          onChange={(e) => setColorQuality(Number(e.target.value))}
                          aria-label="Qualitée"
                          $progress={((colorQuality - 1) / (30 - 1)) * 100}
                        />
                      </Field.Root>
                    </Box>

                    <Box width="100%">
                      <Field.Root>
                        <Field.Label>
                          Color Count : {colorCount}
                        </Field.Label>
                        <RangeInput
                          min={1}
                          max={10}
                          value={colorCount}
                          onChange={(e) => setColorCount(Number(e.target.value))}
                          aria-label="Qualitée"
                          $progress={((colorCount - 1) / (10 - 1)) * 100}
                        />
                      </Field.Root>
                    </Box>

                    <Box width="100%">
                      <Field.Root>
                        <Field.Label>
                          Format Output
                        </Field.Label>
                        <SingleSelect value={colorFormat} onChange={setColorFormat}>
                          <SingleSelectOption startIcon={<Hashtag />} value="hex">HEX</SingleSelectOption>
                          <SingleSelectOption startIcon={<RGBIcon />} value="array">RGB</SingleSelectOption>
                        </SingleSelect>
                      </Field.Root>
                    </Box>

                  </Flex>
                )}

              </Box>
            </Grid.Item>
          </Grid.Root>
        </Modal.Body>

        <Modal.Footer>
          <Flex justifyContent="space-between" width="100%">
            <Modal.Close>
              <Button variant="tertiary">Fermer</Button>
            </Modal.Close>

            <Button onClick={handleSaveParams}>Sauvegarder</Button>
          </Flex>
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  );
};

export default SettingsModal;
