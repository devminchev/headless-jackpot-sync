import axios from 'axios';
import React, { useCallback, useEffect, useState } from 'react';
import { useSDK } from '@contentful/react-apps-toolkit';
import { Badge, Button, Checkbox, Flex, FormControl, Heading, List, MenuDivider, Select, Stack } from '@contentful/f36-components';
import LoadingBar from '../components/LoadingBar/LoadingBar';

import { siteMap } from '../utils/mapping';
import delay from '../utils/delay';

const Page = () => {
    const { cma: { entry: contentfulClient }, locales: { default: spaceLocale }, notifier, parameters } = useSDK();
    const [isLoading, setIsLoading] = useState(false);
    const [queryProgress, setQueryProgress] = useState<number>(0);
    const [ventures, setVentures] = useState<any>([]);
    const [selectedVenture, setSelectedVenture] = useState<{ id: string, name: string } | null>(null);
    const [headlessJackpots, setHeadlessJackpots] = useState<{ id: number, name: string }[]>([]);
    const [selectedJackpot, setSelectedJackpot] = useState<{ id: number, name: string } | null>(null);

    const [siteGamesWithoutHeadlessJackpot, setSiteGamesWithoutHeadlessJackpot] = useState<any[]>([]);
    const [siteGamesWithHeadlessJackpot, setSiteGamesWithHeadlessJackpot] = useState<any[]>([]);
    const [activationList, setActivationList] = useState<any[]>([]);
    const [deActivationList, setDeActivationList] = useState<any[]>([]);

    const onVentureChangeHandler = async (event: any) => {
        const id = event.target.value;
        const name = event.target.options[event.target.selectedIndex].text;

        setSelectedVenture({ id, name });
    };

    const onJackpotChangeHandler = async (event: any) => {
        const id = event.target.value;
        const name = event.target.options[event.target.selectedIndex].text;

        setSelectedJackpot({ id, name });
    };

    const loadHeadlessJackpots = async (selectedVentureName: string) => {
        try {
            const { data } = await axios.get(`${parameters.installation.productionApiDomain}/jackpot-config/jackpots`, {
                headers: { Authorization: `Basic ${parameters.installation.productionBasicAuthHeaderCode}` },
                params: { site: siteMap(selectedVentureName) }
            });

            setHeadlessJackpots(data.jackpotConfigInfos)
        } catch (error) {
            console.log(JSON.stringify(error));
            console.error('Failed to load jackpots:', error);
        };
    };

    const loadVentures = async () => {
        try {
            const ventureEntries = await contentfulClient.getPublished({ query: { content_type: 'venture', 'fields.name[exists]': true } });

            setVentures(ventureEntries.items);
            notifier.success(`Ventures succesfully loaded .`);
        } catch (err) {
            console.log(`Error: loading published Ventures: `, err);
            notifier.error(`Error: loading published Ventures failed .`);
        };
    };

    const fetchSiteGamesWithoutHeadlessJackpot = useCallback(async () => {
        if (!selectedVenture || !selectedVenture.id) return;
        setQueryProgress(0.1);

        const params = {
            content_type: 'siteGameV2',
            'fields.game[exists]': true,
            'fields.venture[exists]': true,
            'fields.venture.sys.id': selectedVenture.id,
            'fields.headlessJackpot[exists]': false,
            'sys.archivedAt[exists]': false
        };
        const batchSize = 100;
        let allEntries: any[] = [];
        let skip: number = 0;
        let totalFetched: number = 0;

        try {
            const initialResponse = await contentfulClient.getMany({
                query: { limit: 1, include: 0, ...params }
            });
            const totalEntries: number = initialResponse.total;

            while (totalFetched < totalEntries) {
                const response = await contentfulClient.getMany({
                    query: {
                        skip,
                        limit: batchSize,
                        include: 0,
                        ...params
                    }
                });

                allEntries = [...allEntries, ...response.items];
                totalFetched += response.items.length;
                skip += response.items.length;

                setQueryProgress(Number((Math.min(100, (totalFetched / totalEntries) * 100).toFixed(2))));
            };
            notifier.success(`Published siteGameV2 successfully loaded.`);
        } catch (err) {
            console.log(`Error: loading published siteGameV2: `, err);
            notifier.error(`Error: loading published siteGameV2 failed.`);
        } finally {
            setQueryProgress(0);
            await delay(250);
        };

        setSiteGamesWithoutHeadlessJackpot(allEntries);
    }, [selectedVenture]);

    const fetchSiteGamesWithHeadlessJackpot = useCallback(async () => {
        if (!selectedVenture || !selectedVenture.id) return;
        setQueryProgress(0.1);

        const params = {
            content_type: 'siteGameV2',
            'fields.game[exists]': true,
            'fields.venture[exists]': true,
            'fields.venture.sys.id': selectedVenture.id,
            'fields.headlessJackpot[exists]': true,
            'sys.archivedAt[exists]': false
        };
        const batchSize = 100;
        let allEntries: any[] = [];
        let skip: number = 0;
        let totalFetched: number = 0;

        try {
            const initialResponse = await contentfulClient.getMany({
                query: { limit: 1, include: 0, ...params }
            });
            const totalEntries: number = initialResponse.total;

            while (totalFetched < totalEntries) {
                const response = await contentfulClient.getMany({
                    query: {
                        skip,
                        limit: batchSize,
                        include: 0,
                        ...params
                    }
                });

                allEntries = [...allEntries, ...response.items];
                totalFetched += response.items.length;
                skip += response.items.length;

                setQueryProgress(Number((Math.min(100, (totalFetched / totalEntries) * 100).toFixed(2))));
            };
            notifier.success(`Published siteGameV2 successfully loaded.`);
        } catch (err) {
            console.log(`Error: loading published siteGameV2: `, err);
            notifier.error(`Error: loading published siteGameV2 failed.`);
        } finally {
            setQueryProgress(0);
            await delay(250);
        };

        setSiteGamesWithHeadlessJackpot(allEntries);
    }, [selectedVenture]);

    const activateGamesInStagingAndProduction = useCallback(async () => {
        if (!selectedJackpot || !selectedJackpot.id) return;

        setQueryProgress(0.1);

        if (activationList.length < 1 || !selectedVenture || !selectedVenture.id || !selectedJackpot || !selectedJackpot.id) return;
        for (let index = 0; index < activationList.length; index++) {
            const { siteGameV2Entry, gameCode, mobileGameCode }: any = activationList[index];

            try {
                if (gameCode) {
                    await axios.put(
                        `${parameters.installation.stagingApiDomain}/game-config/activate-game`,
                        { jackpotId: Number(selectedJackpot.id), gameCode, site: siteMap(selectedVenture.name) },
                        { headers: { Authorization: `Basic ${parameters.installation.stagingBasicAuthHeaderCode}` } }
                    );
                };
                if (mobileGameCode) {
                    await axios.put(
                        `${parameters.installation.stagingApiDomain}/game-config/activate-game`,
                        { jackpotId: Number(selectedJackpot.id), gameCode: mobileGameCode, site: siteMap(selectedVenture.name) },
                        { headers: { Authorization: `Basic ${parameters.installation.stagingBasicAuthHeaderCode}` } }
                    );
                };

                const rawData = {
                    ...siteGameV2Entry,
                    fields: {
                        ...siteGameV2Entry.fields,
                        headlessJackpot: {
                            [spaceLocale]: {
                                id: Number(selectedJackpot.id),
                                name: selectedJackpot.name
                            }
                        }
                    }
                };
                const updatedEntry = await contentfulClient.update({ entryId: siteGameV2Entry.sys.id }, rawData);

                await axios.put(
                    `${parameters.installation.productionApiDomain}/game-config/activate-game`,
                    { jackpotId: Number(selectedJackpot.id), gameCode, site: siteMap(selectedVenture.name) },
                    { headers: { Authorization: `Basic ${parameters.installation.productionBasicAuthHeaderCode}` } }
                );

                await contentfulClient.publish({ entryId: updatedEntry.sys.id }, updatedEntry);
            } catch (error) {
                console.log(`Error jackpotId: ${selectedJackpot.id}`, error);
            } finally {
                console.log(`finally: ${selectedJackpot.id}`);
                setQueryProgress(Number((Math.min(100, (index / activationList.length) * 100).toFixed(2))));
            };
        };
        setQueryProgress(0);

        setActivationList([]);
        setSiteGamesWithoutHeadlessJackpot([]);
    }, [selectedJackpot, activationList, selectedVenture]);

    const deActivateGamesInStagingAndProduction = useCallback(async () => {
        if (deActivationList.length < 1 || !selectedVenture || !selectedVenture.id || !selectedJackpot || !selectedJackpot.id) return;

        setQueryProgress(0.1);
        for (let index = 0; index < deActivationList.length; index++) {
            const { siteGameV2Entry, gameCode, mobileGameCode }: any = deActivationList[index];

            try {
                if (gameCode) {
                    await axios.put(
                        `${parameters.installation.stagingApiDomain}/game-config/deactivate-game`,
                        { jackpotId: Number(selectedJackpot.id), gameCode, site: siteMap(selectedVenture.name) },
                        { headers: { Authorization: `Basic ${parameters.installation.stagingBasicAuthHeaderCode}` } }
                    );
                };
                if (mobileGameCode) {
                    await axios.put(
                        `${parameters.installation.stagingApiDomain}/game-config/deactivate-game`,
                        { jackpotId: Number(selectedJackpot.id), gameCode: mobileGameCode, site: siteMap(selectedVenture.name) },
                        { headers: { Authorization: `Basic ${parameters.installation.stagingBasicAuthHeaderCode}` } }
                    );
                };

                const rawData = {
                    ...siteGameV2Entry,
                    fields: {
                        ...siteGameV2Entry.fields,
                        headlessJackpot: {
                            [spaceLocale]: null
                        }
                    }
                };
                const updatedEntry = await contentfulClient.update({ entryId: siteGameV2Entry.sys.id }, rawData);

                await axios.put(
                    `${parameters.installation.productionApiDomain}/game-config/deactivate-game`,
                    { jackpotId: Number(selectedJackpot.id), gameCode, site: siteMap(selectedVenture.name) },
                    { headers: { Authorization: `Basic ${parameters.installation.productionBasicAuthHeaderCode}` } }
                );

                await contentfulClient.publish({ entryId: updatedEntry.sys.id }, updatedEntry);
            } catch (error) {
                console.log(`Error jackpotId: ${selectedJackpot.id}`, error);
            } finally {
                console.log(`finally: ${selectedJackpot.id}`);
                setQueryProgress(Number((Math.min(100, (index / deActivationList.length) * 100).toFixed(2))));
            }
        };
        setQueryProgress(0);

        setDeActivationList([]);
        setSiteGamesWithHeadlessJackpot([]);
    }, [selectedJackpot, deActivationList, selectedVenture]);

    const onSelectActivation = useCallback(async (siteGameV2Entry: any, gameV2Id: string) => {
        const exists = activationList.some(item => item?.siteGameV2Entry?.sys?.id === siteGameV2Entry?.sys?.id);
        if (exists) {
            setActivationList((prev) =>
                prev.filter(item => item.siteGameV2Entry.sys.id !== siteGameV2Entry?.sys?.id)
            );
            return;
        };

        setIsLoading(true);
        try {
            const gameV2 = await contentfulClient.get({ entryId: gameV2Id });
            if (!gameV2) return;

            const selected = { siteGameV2Entry, gameCode: gameV2.fields.gamePlatformConfig[spaceLocale].gameSkin, mobileGameCode: gameV2.fields.gamePlatformConfig[spaceLocale].mobileGameSkin || null };
            setActivationList((prev) => [...prev, selected]);
        } catch (e) {
            console.log('Error gameV2 :', e);
        } finally {
            setIsLoading(false);
        };

    }, [activationList]);

    const onSelectDeActivation = useCallback(async (siteGameV2Entry: any, gameV2Id: string) => {
        const exists = deActivationList.some(item => item?.siteGameV2Entry?.sys?.id === siteGameV2Entry?.sys?.id);
        if (exists) {
            setDeActivationList((prev) =>
                prev.filter(item => item.siteGameV2Entry.sys.id !== siteGameV2Entry?.sys?.id)
            );
            return;
        };

        setIsLoading(true);
        try {
            const gameV2 = await contentfulClient.get({ entryId: gameV2Id });
            if (!gameV2) return;

            const selected = { siteGameV2Entry, gameCode: gameV2.fields.gamePlatformConfig[spaceLocale].gameSkin, mobileGameCode: gameV2.fields.gamePlatformConfig[spaceLocale].mobileGameSkin || null };
            setDeActivationList((prev) => [...prev, selected]);
        } catch (e) {
            console.log('Error gameV2 :', e);
        } finally {
            setIsLoading(false);
        };

    }, [deActivationList]);

    useEffect(() => {
        loadVentures();
    }, []);

    useEffect(() => {
        if (!selectedVenture || !selectedVenture.id) return;

        loadHeadlessJackpots(selectedVenture.name);
    }, [selectedVenture]);

    return (
        <>
            <Heading>Bulk Activation Headless Jackpots</Heading>

            <FormControl id="ventures" isRequired style={{ width: '100%', margin: '5px' }}>
                <FormControl.Label>
                    Ventures
                </FormControl.Label>
                <Select
                    id="ventures"
                    name="ventures"
                    value={selectedVenture?.id || ''}
                    onChange={onVentureChangeHandler}
                >
                    <Select.Option key="none" value="">
                        Select Venture
                    </Select.Option>
                    {ventures?.map((venture: any) => (
                        <Select.Option key={venture.sys.id} value={venture.sys.id}>
                            {venture.fields.name[spaceLocale]}
                        </Select.Option>
                    ))}
                </Select>
            </FormControl>

            <FormControl id="headlessJackpots" isRequired style={{ width: '100%', margin: '5px' }} isDisabled={!selectedVenture || !selectedVenture.id}>
                <FormControl.Label>
                    Available Headless Jackpots Selection
                </FormControl.Label>
                <Select
                    id="headlessJackpot"
                    name="headlessJackpot"
                    value={String(selectedJackpot?.id)}
                    onChange={onJackpotChangeHandler}
                >
                    <Select.Option key="none" value="">
                        Select Headless Jackpot
                    </Select.Option>
                    {headlessJackpots?.map(hjOption => (
                        <Select.Option key={hjOption.id} value={hjOption.id}>
                            {hjOption.name}
                        </Select.Option>
                    ))}
                </Select>
            </FormControl>

            <Stack flexDirection='column'>
                <Button variant='primary' isFullWidth onClick={fetchSiteGamesWithHeadlessJackpot} isDisabled={!selectedVenture || !selectedVenture.id || queryProgress > 0}>
                    Fetch SiteGames With Headless Jackpot ({siteGamesWithHeadlessJackpot.length})
                </Button>
                <Button variant='primary' isFullWidth onClick={fetchSiteGamesWithoutHeadlessJackpot} isDisabled={!selectedVenture || !selectedVenture.id || queryProgress > 0}>
                    Fetch SiteGames Without Headless Jackpot ({siteGamesWithoutHeadlessJackpot.length})
                </Button>
            </Stack>
            <br></br>
            <Flex fullWidth fullHeight flexDirection="row" justifyContent='left'>
                {siteGamesWithHeadlessJackpot.length > 0 &&
                    <List style={{ width: "inherit" }}>
                        <br></br>
                        <Button variant='negative' isFullWidth onClick={deActivateGamesInStagingAndProduction} isDisabled={!selectedVenture || !selectedVenture.id || deActivationList.length < 1 || !selectedJackpot || !selectedJackpot.id || queryProgress > 0}>
                            Deactivate Selected Games - Staging & Production
                        </Button>
                        <br></br>
                        {siteGamesWithHeadlessJackpot.map(((entry: any, ind: number) => {
                            const isSelected = deActivationList.some(
                                (item) => item.siteGameV2Entry.sys.id === entry.sys.id
                            );

                            return (
                                <FormControl key={ind}>
                                    <Checkbox
                                        name={entry.sys.id}
                                        isChecked={isSelected}
                                        isDisabled={isLoading}
                                        onChange={() =>
                                            onSelectDeActivation(entry, entry.fields.game[spaceLocale].sys.id)
                                        }
                                    >
                                        {entry.fields.entryTitle[spaceLocale]}
                                    </Checkbox>
                                    {entry.fields.headlessJackpot?.[spaceLocale] ?
                                        <Badge variant='positive'>Active</Badge> :
                                        <Badge variant='negative'>Not Active</Badge>
                                    }
                                    {entry.fields.headlessJackpot && entry.fields.headlessJackpot[spaceLocale] &&
                                        <Badge variant='primary'>{entry.fields.headlessJackpot[spaceLocale].name}-{entry.fields.headlessJackpot[spaceLocale].id.toString()}</Badge>
                                    }
                                </FormControl>
                            )
                        }))}
                    </List>
                }
                {siteGamesWithoutHeadlessJackpot.length > 0 &&
                    <List style={{ width: "inherit" }}>
                        <br></br>
                        <Button variant='positive' isFullWidth onClick={activateGamesInStagingAndProduction} isDisabled={!selectedVenture || !selectedVenture.id || activationList.length < 1 || !selectedJackpot || !selectedJackpot.id || queryProgress > 0}>
                            Activate Selected Games - Staging & Production
                        </Button>
                        <br></br>
                        {siteGamesWithoutHeadlessJackpot.map(((entry: any, ind: number) => {
                            const isSelected = activationList.some(
                                (item) => item.siteGameV2Entry.sys.id === entry.sys.id
                            );

                            return (
                                <FormControl key={ind}>
                                    <Checkbox
                                        name={entry.sys.id}
                                        isChecked={isSelected}
                                        isDisabled={isLoading}
                                        onChange={() =>
                                            onSelectActivation(entry, entry.fields.game[spaceLocale].sys.id)
                                        }
                                    >
                                        {entry.fields.entryTitle[spaceLocale]}
                                    </Checkbox>
                                    {entry.fields.headlessJackpot?.[spaceLocale] ?
                                        <Badge variant='positive'>Active</Badge> :
                                        <Badge variant='negative'>Not Active</Badge>
                                    }
                                    {entry.fields.headlessJackpot && entry.fields.headlessJackpot[spaceLocale] &&
                                        <Badge variant='primary'>{entry.fields.headlessJackpot[spaceLocale].name}-{entry.fields.headlessJackpot[spaceLocale].id.toString()}</Badge>
                                    }
                                </FormControl>
                            )
                        }))}
                    </List>
                }
            </Flex>

            {isLoading && <LoadingBar message={`Loading...`} />}
            {queryProgress > 0 && <LoadingBar message={`Processing - ${queryProgress}%`} />}
        </>
    );
};

export default Page;
