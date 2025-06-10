import {
  Modal,
  Flex,
  Box,
  Button,
  Typography,
  IconButton,
  Combobox,
  ComboboxOption,
} from '@strapi/design-system';
import { SlidersHorizontal } from '@strapi/icons';
import BlurhashCanvas from './BlurhashCanvas';
import RangeInput from './RangeInput';
import React, { useState } from 'react';

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
  const [isOpen, setIsOpen] = useState(false);
  const blurhashesByForce: { [key: number]: string } = {
    1: "00GS=q",
    2: "AvGS=qx]ThV[",
    3: "KvGS=qx]xVThV[R%%iRjbc",
    4: "UvGS=qx]xVofThV[R%bH%iRjbcof%zofaiay",
    5: "evGS=qx]xVoff,ThV[R%bHae%iRjbcofjY%zofaiaykBo|ofayf6WX",
    6: "ovGS=qx]xVoff,oyThV[R%bHaea}%iRjbcofjYj[%zofaiaykBflo|ofayf6WXbHxtj[j=j[a#jZ",
    7: "yvGS=qx]xVoff,oyn$ThV[R%bHaea}bH%iRjbcofjYj[bI%zofaiaykBflayo|ofayf6WXbHjsxtj[j=j[a#jZfkR*f6axayj@aya}",
    8: ":vGS=qx]xVoff,oyn$ogThV[R%bHaea}bHbI%iRjbcofjYj[bIbH%zofaiaykBflayj[o|ofayf6WXbHjsayxtj[j=j[a#jZfkflR*f6axayj@aya}fkWZfRofoJaxflfRjY",
    9: "|vGS=qx]xVoff,oyn$ogkCThV[R%bHaea}bHbIay%iRjbcofjYj[bIbHax%zofaiaykBflayj[fko|ofayf6WXbHjsayj[xtj[j=j[a#jZfkflayR*f6axayj@aya}fkj?WZfRofoJaxflfRjYjsWsWBaybIj[jZf6fkfk",
  };
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
          <Flex gap={8}>
            <Box width="400px">
              <BlurhashCanvas
                blurhash={blurhashesByForce[rangeBlurhash]}
                width={400}
                height={300}
              />
            </Box>

            <Box flex={1}>
              <Combobox
                label="Méthode"
                value={toolSelected}
                onChange={(val: string) => setToolSelected(val)}
              >
                <ComboboxOption value="blurhash">Blurhash</ComboboxOption>
                <ComboboxOption value="colorthief">Color Thief</ComboboxOption>
                <ComboboxOption value="lqip">LQIP</ComboboxOption>
                <ComboboxOption value="sqip">SQIP</ComboboxOption>
              </Combobox>

              {toolSelected === 'blurhash' && (
                <Box>
                  <Typography variant="omega" marginBottom={2} marginTop={2}>
                    Force du blurhash : {rangeBlurhash}
                  </Typography>

                  <RangeInput
                    min={1}
                    max={9}
                    value={rangeBlurhash}
                    onChange={(e) => setRangeBlurhash(Number(e.target.value))}
                    aria-label="Force du blurhash"
                    $progress={((rangeBlurhash - 1) / (9 - 1)) * 100}
                  />
                </Box>
              )}

            </Box>
          </Flex>
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
