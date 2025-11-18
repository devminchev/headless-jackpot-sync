/* eslint-disable react-hooks/exhaustive-deps */
import axios, { AxiosError } from 'axios';
import { useCallback, useEffect, useState } from 'react';
import { useFieldValue, useSDK } from '@contentful/react-apps-toolkit';
import { FieldAppSDK } from '@contentful/app-sdk';
import useContentfulEventListener from './useContentfulEventListener';
import { siteMap } from '../utils/mapping';

interface IEntryInfo {
    site: string;
    gameCode: string;
    mobileGameCode: string;
};

function useHeadlessJackpotApi() {
    const { hasFieldValueChanged, isChanged, isPublished, setIsChanged, setIsPublished } = useContentfulEventListener();
    const { cma: { entry: client }, notifier, entry, locales: { default: spaceLocale }, dialogs, parameters } = useSDK<FieldAppSDK>();
    const [value, setValue] = useFieldValue<any>();
    const [removedValue, setRemovedValue] = useState({});

    const [entryInfo, setEntryInfo] = useState<IEntryInfo>({ site: '', gameCode: '', mobileGameCode: '' });
    const [isLoading, setIsLoading] = useState(false);
    const [requestInProgress, setRequestInProgress] = useState(false);
    const [error, setError] = useState<AxiosError | null>(null);

    const handleChange = useCallback(async () => {
        if (value) return;

        const headlessJackpotResponse = await dialogs.openCurrentApp({
            width: 'large',
            position: 'center',
            shouldCloseOnEscapePress: true,
            title: 'Available Headless Jackpots',
            parameters: { site: siteMap(entryInfo.site), selected: value ? value.id : null }
        });

        if (!headlessJackpotResponse) return;

        if (headlessJackpotResponse.error) {
            const err = JSON.parse(headlessJackpotResponse.error);
            setError(err);

            notifier.error(err.message);
            return;
        };

        const selectedValue = {
            id: headlessJackpotResponse.id,
            name: headlessJackpotResponse.name
        };

        setValue(selectedValue);
        setRequestInProgress(true);
    }, [entryInfo.site, value]);

    const load = async () => {
        setIsLoading(true);
        try {
            const gameContent = await client.references({ entryId: entry.getSys().id, include: 1 });
            const gameRef = gameContent.includes?.Entry?.find((ref: any) => ref.sys.contentType.sys.id === 'gameV2');
            const ventureRef = gameContent.includes?.Entry?.find((ref: any) => ref.sys.contentType.sys.id === 'venture');

            if (!gameRef) {
                notifier.error('Game Content Not Set !');
                return;
            };
            if (!ventureRef) {
                notifier.error('Venture Not Set !');
                return;
            };
            const { gameSkin, mobileGameSkin } = gameRef.fields.gamePlatformConfig[spaceLocale];

            if (!gameSkin && !mobileGameSkin) {
                notifier.error('Game does not have any "Game Skin" and "Mobile Game Skin" value !');
                return;
            };

            setEntryInfo({ site: ventureRef?.fields.name[spaceLocale], gameCode: gameSkin, mobileGameCode: mobileGameSkin });
        } catch (err: any) {
            notifier.error(`Error: fetching the entry references! ${err.message}`);
        } finally {
            setIsLoading(false);
        };
    };

    const activateGameInStaging = async () => {
        if (!value) return;

        setError(null);
        try {
            if (entryInfo.gameCode) {
                await axios.put(
                    `${parameters.installation.stagingApiDomain}/game-config/activate-game`,
                    { jackpotId: value.id, gameCode: entryInfo.gameCode || entryInfo.mobileGameCode, site: siteMap(entryInfo.site) },
                    { headers: { Authorization: `Basic ${parameters.installation.stagingBasicAuthHeaderCode}` } }
                );
            };

            if (entryInfo.mobileGameCode) {
                await axios.put(
                    `${parameters.installation.stagingApiDomain}/game-config/activate-game`,
                    { jackpotId: value.id, gameCode: entryInfo.mobileGameCode, site: siteMap(entryInfo.site) },
                    { headers: { Authorization: `Basic ${parameters.installation.stagingBasicAuthHeaderCode}` } }
                );
            };

            notifier.success(`Staging - JackpotId: ${value.id} Set Successfully.`);
        } catch (err: any) {
            console.log('Staging Activate Game Error:', err);
            notifier.error(`Staging Deactivate Error [JackpotId-${value.id}]: ${err.message}`);
        } finally {
            setIsChanged(false);
            setRequestInProgress(false);
        };
    };

    const deactivateGameInStaging = async (payload: any) => {
        setError(null);
        try {
            if (entryInfo.gameCode) {
                await axios.put(
                    `${parameters.installation.stagingApiDomain}/game-config/deactivate-game`,
                    payload,
                    { headers: { Authorization: `Basic ${parameters.installation.stagingBasicAuthHeaderCode}` } }
                );
            };

            if (entryInfo.mobileGameCode) {
                await axios.put(
                    `${parameters.installation.stagingApiDomain}/game-config/deactivate-game`,
                    { ...payload, gameCode: entryInfo.mobileGameCode },
                    { headers: { Authorization: `Basic ${parameters.installation.stagingBasicAuthHeaderCode}` } }
                );
            };

            notifier.success(`Staging - JackpotId: ${payload.jackpotId} removed successfully.`);
        } catch (err: any) {
            console.log('err :', err);
            notifier.error(`Staging Deactivate Error [JackpotId-${payload.jackpotId}: ${err.message}`);
        } finally {
            setIsChanged(false);
            setRequestInProgress(false);
        };
    };

    const activateGameInProduction = async () => {
        if (!value) return;

        setError(null);
        try {
            if (entryInfo.gameCode) {
                await axios.put(
                    `${parameters.installation.productionApiDomain}/game-config/activate-game`,
                    { jackpotId: value.id, gameCode: entryInfo.gameCode, site: siteMap(entryInfo.site) },
                    { headers: { Authorization: `Basic ${parameters.installation.productionBasicAuthHeaderCode}` } }
                );
            };

            if (entryInfo.mobileGameCode) {
                await axios.put(
                    `${parameters.installation.productionApiDomain}/game-config/activate-game`,
                    { jackpotId: value.id, gameCode: entryInfo.mobileGameCode, site: siteMap(entryInfo.site) },
                    { headers: { Authorization: `Basic ${parameters.installation.productionBasicAuthHeaderCode}` } }
                );
            };

            notifier.success(`Production - JackpotId: ${value.id} activated successfully.`);
        } catch (err: any) {
            console.log('Production Activate Game Error :', err);
            notifier.error(`Production Activate Error [JackpotId-${value.id}]: ${err.message}`);
        } finally {
            setIsPublished(false);
            setRequestInProgress(false);
        };
    };

    const deactivateGameInProduction = async (payload: any) => {
        setError(null);
        try {
            if (entryInfo.gameCode) {
                await axios.put(
                    `${parameters.installation.productionApiDomain}/game-config/deactivate-game`,
                    payload,
                    { headers: { Authorization: `Basic ${parameters.installation.productionBasicAuthHeaderCode}` } }
                );
            };
            if (entryInfo.mobileGameCode) {
                await axios.put(
                    `${parameters.installation.productionApiDomain}/game-config/deactivate-game`,
                    { ...payload, gameCode: entryInfo.mobileGameCode },
                    { headers: { Authorization: `Basic ${parameters.installation.productionBasicAuthHeaderCode}` } }
                );

            }

            notifier.success(`Production - JackpotId: ${payload.jackpotId} removed successfully.`);
        } catch (err: any) {
            console.log('err :', err);
            notifier.error(`Production Deactivate Error [JackpotId-${payload.jackpotId}]: ${err.message}`);
        } finally {
            setIsPublished(false);
            setRequestInProgress(false);
        };
    };

    const removeJackpot = async () => {
        setRemovedValue({
            jackpotId: value.id,
            gameCode: entryInfo.gameCode,
            site: siteMap(entryInfo.site)
        });
        setRequestInProgress(true);

        setValue(null);
    };

    useEffect(() => {
        load();
    }, []);

    useEffect(() => {
        if (!requestInProgress && !isPublished) {
            return;
        };

        if (hasFieldValueChanged && isChanged && entryInfo.site && (entryInfo.gameCode || entryInfo.mobileGameCode)) {
            if (value) {
                activateGameInStaging();
            };

            if (!value) {
                deactivateGameInStaging(removedValue);
                deactivateGameInProduction(removedValue);
            };
        };

        if (isPublished && entryInfo.site && (entryInfo.gameCode || entryInfo.mobileGameCode)) {
            if (value) {
                activateGameInProduction();
            };
        };
    }, [hasFieldValueChanged, isChanged, isPublished, requestInProgress]);

    return {
        value,
        isLoading,
        requestInProgress,
        spaceLocale,
        error,
        handleChange,
        removeJackpot
    };
};

export default useHeadlessJackpotApi;
