
import React, { useState, useEffect } from 'react';
import { encode } from 'blurhash';
import BlurhashCanvas from './BlurhashCanvas';
import { prominent } from 'color.js'
import {
    Flex,
    Box,
    Badge
} from '@strapi/design-system';

import {
    TextInput,
    Field
} from '@strapi/design-system';

interface BaseSetting {
    tool: 'blurhash' | 'color';
}

interface BlurhashSetting extends BaseSetting {
    tool: 'blurhash';
    resizeWidthRatio: number;
    force: number;
    outputFormat: 'hash' | 'svg';
}

interface ColorSetting extends BaseSetting {
    tool: 'color';
    colorQuality: number;
    colorCount: number;
    format: 'hex' | 'array';
}

type MediaCanvasSetting =
    | BlurhashSetting
    | ColorSetting

interface MediaCanvasProps {
    url: string;
    setting: MediaCanvasSetting;
}

const MediaCanvas = ({ url, setting }: MediaCanvasProps) => {
    const [blurhash, setBlurhash] = useState<string | null>(null);
    const [palette, setPalette] = useState<string[]>([]);

    const formatColor = (color: any, format: 'hex' | 'array') => {
        if (format === 'array') {
            if (Array.isArray(color)) {
                return "rgb(" + color.join(', ') + ")";
            }
        }
        return color;
    };


    useEffect(() => {
        if (setting.tool === 'blurhash') {
            const loadAndEncode = async () => {
                const img = new Image();
                img.src = url;

                img.onload = () => {
                    const force = setting.force ?? 4;

                    const finalWidth = 124 * (setting.resizeWidthRatio / 100);
                    const finalHeight = 124 * (setting.resizeWidthRatio / 100);

                    const canvas = document.createElement('canvas');
                    canvas.width = finalWidth;
                    canvas.height = finalHeight;

                    const ctx = canvas.getContext('2d');
                    if (!ctx) return;

                    ctx.drawImage(img, 0, 0, finalWidth, finalHeight);
                    const imageData = ctx.getImageData(0, 0, finalWidth, finalHeight);

                    const hash = encode(imageData.data, finalWidth, finalHeight, force, force);
                    setBlurhash(hash);
                };

                img.onerror = () => {
                    console.error('Erreur de chargement d’image', url);
                };
            };

            loadAndEncode();
        } else if (setting.tool === 'color') {
            const img = new Image();
            img.src = url;

            img.onload = async () => {
                try {
                    const colors = await prominent(img, {
                        amount: setting.colorCount,
                        format: setting.format,
                        group: setting.colorQuality,
                    });
                    setPalette(colors as string[]);
                } catch (err) {
                    console.error('Erreur lors de l’extraction des couleurs :', err);
                }
            };

            img.onerror = () => {
                console.error('Erreur de chargement de l’image base64');
            };
        }
    }, [
        url,
        setting.tool,
        (setting.tool === 'blurhash' ? setting.resizeWidthRatio : null),
        (setting.tool === 'blurhash' ? setting.force : null),
        (setting.tool === 'blurhash' ? setting.outputFormat : null),
        (setting.tool === 'color' ? setting.colorCount : null),
        (setting.tool === 'color' ? setting.format : null),
        (setting.tool === 'color' ? setting.colorQuality : null),
    ]);

    if (setting.tool === 'blurhash') {
        return (
            <Flex direction="column" gap={6}>
                <BlurhashCanvas
                    blurhash={blurhash ?? ''}
                    width={400}
                    height={300}
                />
                <Field.Root width="100%">
                    <Field.Label>
                        Output
                    </Field.Label>
                    <TextInput
                        value={blurhash}
                    />
                </Field.Root>
            </Flex>
        );
    }
    if (setting.tool === 'color') {
        return (
            <Flex direction="column" gap={6}>
                <img src={url} />
                <Field.Root width="100%">
                    <Field.Label>
                        Output
                    </Field.Label>
                    <TextInput
                        value={
                            Array.isArray(palette[0])
                                ? palette.map((c) => formatColor(c, setting.format)).join(', ')
                                : formatColor(palette, setting.format)
                        }
                        readOnly
                    />
                    {console.log(palette)}
                </Field.Root>
                <Box paddingBottom={4} width="100%">
                    <Flex gap={2} style={{ flexWrap: 'wrap' }}>
                        {((Array.isArray(palette[0]) && (setting.format === "array")) || (Array.isArray(palette) && (setting.format === "hex"))) ? (
                            palette.map((c, i) => (
                                <Flex direction="column" gap={3}>
                                    <div
                                        key={i}
                                        style={{
                                            width: 30,
                                            height: 30,
                                            backgroundColor: formatColor(c, setting.format),
                                        }}
                                    ></div>
                                    <Badge
                                        backgroundColor="neutral150"
                                        textColor="neutral600"
                                    >
                                        {formatColor(c, setting.format)}
                                    </Badge>
                                </Flex>
                            ))
                        ) : (
                            <Flex direction="column" gap={3}>
                                <div
                                    style={{
                                        width: 30,
                                        height: 30,
                                        backgroundColor: formatColor(palette, setting.format),
                                    }}
                                />
                                <Badge
                                    backgroundColor="neutral150"
                                    textColor="neutral600"
                                >
                                    {formatColor(palette, setting.format)}
                                </Badge>
                            </Flex>
                        )}
                    </Flex>
                </Box>
            </Flex>
        );
    }
};

export default MediaCanvas;
