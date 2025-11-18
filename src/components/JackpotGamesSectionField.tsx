/* eslint-disable react-hooks/exhaustive-deps */
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useSDK } from "@contentful/react-apps-toolkit";
import { EntryCard, Stack, IconButton } from "@contentful/f36-components";
import { DeleteIcon } from '@contentful/f36-icons';
import { FieldAppSDK } from "@contentful/app-sdk";

import useFetchHeadlessJackpots from "../hooks/useFetchHeadlessJackpots";

const JackpotGamesSectionField = () => {
    const componentDidMount = useRef(false);
    const { entry, field } = useSDK<FieldAppSDK>();
    const { value, handleChange, removeJackpot } = useFetchHeadlessJackpots();
    const [errors, setErrors] = useState<string[]>([]);

    const handleGamesChanged = useCallback((newVal: any) => {
        // if (!componentDidMount.current) return;

        console.log('handleGamesChanged', newVal);
    }, []);

    const handleTypeChanged = useCallback((newVal: any) => {
        // if (!componentDidMount.current) return;

        console.log('handleTypeChanged', newVal, entry.fields?.type?.getValue());
        console.log('handleTypeChanged', newVal, entry.fields?.jackpotType?.getValue());
    }, []);

    const gamesHandler = useRef(handleGamesChanged);
    const typeHandler = useRef(handleTypeChanged);

    useEffect(() => {
        const gamesChangeListener = (event: any) => gamesHandler.current(event);
        const unsubscribeGamesChangeListener = entry.fields.games.onValueChanged(gamesChangeListener);
        const typeChangeListener = (event: any) => typeHandler.current(event);
        const typeIgChangeListener = (event: any) => typeHandler.current(event);
        const unsubscribeTypeChangeListener = entry.fields?.type?.onValueChanged(typeChangeListener);
        const unsubscribeIgTypeChangeListener = entry.fields?.jackpotType?.onValueChanged(typeIgChangeListener);

        return () => {
            unsubscribeGamesChangeListener();
            unsubscribeTypeChangeListener();
            unsubscribeIgTypeChangeListener();
        };
        // return onEntryChanged(entry, () => {
        //     const newErrors: string[] = [];
        //     // const entry = getEntry(sdk);

        //     // if ((entry.fields.games > 0)) {
        //     //     sdk.entry.fields.games.getForLocale(sdk.locales.default).setInvalid(false);
        //     // } else {
        //     //     sdk.entry.fields.games.getForLocale(sdk.locales.default).setInvalid(true);
        //     //     newErrors.push(`Slug must start `);
        //     // };

        //     // if (sdk.entry.fields.type.getValue() === 'headless') {
        //     //     console.log('headlesssss');
        //     // };

        //     // setErrors(newErrors);
        //     // sdk.field.setValue(newErrors.length === 0 ? 'true' : 'false');
        // });
    }, [entry]);

    return (
        <Stack>
            <EntryCard
                key="headlessJackpot"
                contentType={value ? `Jackpot ID: ${value.id}` : 'Select Content'}
                title={value ? value.name : ''}
                onClick={handleChange}
                size="small"
                customActionButton={value ?
                    <IconButton
                        key="remove"
                        size="small"
                        onClick={removeJackpot}
                        variant="negative"
                        aria-label="Remove"
                        icon={<DeleteIcon />}
                    > Remove </IconButton>
                    : null
                }
            />
        </Stack>
    )
};

export default JackpotGamesSectionField;
