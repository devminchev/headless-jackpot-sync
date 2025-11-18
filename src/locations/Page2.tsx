import axios from 'axios';
import React, { useCallback, useEffect, useState } from 'react';
import { useSDK } from '@contentful/react-apps-toolkit';
import { Button, FormControl, Heading, List, Select } from '@contentful/f36-components';

import delay from '../utils/delay';
//259MUOgLpQf5hVGxjNM5f2
const Page = () => {
    const { cma: { entry: contentfulClient }, locales: { default: spaceLocale }, notifier, dialogs, parameters } = useSDK();
    const [isLoading, setIsLoading] = useState(false);
    const [queryProgress, setQueryProgress] = useState<number>(0);
    const [ventures, setVentures] = useState<any>([]);
    const [selectedVenture, setSelectedVenture] = useState<any>(null);

    const [siteGameV2Content, setSiteGameV2Content] = useState<any[]>([]);
    const [selectedSiteGames, setSelectedSiteGames] = useState<any[]>([]);
    const [headlessJackpots, setHeadlessJackpots] = useState<{ id: number, name: string }[]>([]);
    const [selectedJackpotId, setSelectedJackpotId] = useState('');

    const onVentureChangeHandler = async (event: any) => {
        const id = event.target.value;
        const name = event.target.options[event.target.selectedIndex].text;

        setSelectedVenture({ id, name });
    };

    const onJackpotChangeHandler = async (event: any) => {
        const hjId = event.target.value;

        setSelectedJackpotId(hjId);
    };

    const selectSiteGames = useCallback(async () => {
        const newEntries = await dialogs.selectMultipleEntries({ contentTypes: ['siteGameV2'] });

        if (!newEntries) return [];

        setSelectedSiteGames((prev) => {
            const allEntries = [...newEntries, ...prev];
            const dedupedMap = new Map();

            for (const entry of allEntries) {
                const id = entry?.sys?.id;
                if (id && !dedupedMap.has(id)) {
                    dedupedMap.set(id, entry);
                };
            };

            return Array.from(dedupedMap.values());
        });

        notifier.success(`${newEntries.length} SiteGames Selected.`);
    }, []);

    const loadHeadlessJackpots = async (selectedVentureName: string) => {
        try {
            const { data } = await axios.get(`${parameters.installation.productionApiDomain}/jackpot-config/jackpots`, {
                headers: { Authorization: `Basic ${parameters.installation.productionBasicAuthHeaderCode}` },
                params: { site: selectedVentureName }
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
            console.log('ventureEntries :', ventureEntries);
            notifier.success(`Ventures succesfully loaded .`);
        } catch (err) {
            console.log(`Error: loading published Ventures: `, err);
            notifier.error(`Error: loading published Ventures failed .`);
        };
    };

    const loadSiteGameV2 = async () => {
        setQueryProgress(0.1);

        const params = {
            content_type: 'siteGameV2',
            'fields.game[exists]': true,
            'fields.venture[exists]': true,
            'fields.venture.sys.id': selectedVenture.id,
            'fields.headlessJackpot[exists]': false,
            'sys.publishedVersion[exists]': true,
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

        console.log('allEntries : ', allEntries);
        setSiteGameV2Content(allEntries);
        // return allEntries;
    };

    useEffect(() => {
        loadVentures();
    }, []);

    useEffect(() => {
        if (!selectedVenture || !selectedVenture.id) return;

        loadHeadlessJackpots(selectedVenture.name);
    }, [selectedVenture]);

    console.log('sitegames list :', queryProgress);
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
                    value={selectedJackpotId}
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

            <Button variant='primary' onClick={loadSiteGameV2} isDisabled={queryProgress > 0}>Select Sitegames</Button>
            <br></br>

            <List>
                {selectedSiteGames.length > 0 && selectedSiteGames.map(((sitegame: any, ind: number) => (
                    <div key={ind}>
                        {sitegame.fields.entryTitle[spaceLocale]}
                    </div>
                )))}
            </List>
        </>
    );
};

export default Page;
