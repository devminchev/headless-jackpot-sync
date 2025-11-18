/* eslint-disable react-hooks/exhaustive-deps */
import { useCallback, useEffect, useState } from 'react';
import { useFieldValue, useSDK } from '@contentful/react-apps-toolkit';
import { FieldAppSDK } from '@contentful/app-sdk';
import { siteMap } from '../utils/mapping';

function useFetchHeadlessJackpots() {
    const { cma: { entry: client }, notifier, entry, locales: { default: spaceLocale }, dialogs } = useSDK<FieldAppSDK>();
    const [value, setValue] = useFieldValue<any>();
    const [venture, setVenture] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = useCallback(async () => {
        const selectedHeadlessJackpot = await dialogs.openCurrentApp({
            shouldCloseOnEscapePress: true,
            width: 'large',
            position: 'center',
            title: 'Available Headless Jackpots',
            parameters: { site: siteMap(venture), selected: value }
        });

        if (selectedHeadlessJackpot) {
            const selectedValue = {
                id: selectedHeadlessJackpot.id,
                name: selectedHeadlessJackpot.name
            };
            setValue(selectedValue);

            notifier.success(`Headless Jackpot Selected .`);
            return;
        };
    }, [venture]);

    const removeJackpot = useCallback(async () => {
        setValue(null);
    }, [value]);

    const load = async () => {
        setIsLoading(true);
        try {
            const sectionRefs = await client.references({ entryId: entry.getSys().id, include: 1 });
            const ventureRef = sectionRefs.includes?.Entry?.find((ref: any) => ref.sys.contentType.sys.id === 'venture');
            if (!ventureRef) {
                notifier.error('Venture Not Set !');
                return;
            };

            setVenture(ventureRef?.fields.name[spaceLocale]);
        } catch (err: any) {
            notifier.error(`Error: fetching the entry references! ${err.message}`);
        } finally {
            setIsLoading(false);
        };
    };

    useEffect(() => {
        load();
    }, []);

    return {
        value,
        isLoading,
        spaceLocale,
        handleChange,
        removeJackpot
    };
};

export default useFetchHeadlessJackpots;
