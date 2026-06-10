/* eslint-disable react-hooks/exhaustive-deps */
import axios from 'axios';
import { useEffect, useState } from 'react';
import { DialogAppSDK } from '@contentful/app-sdk';
import { useSDK } from '@contentful/react-apps-toolkit';
import { EntryCard, Stack } from '@contentful/f36-components';
import { shouldUseStaging } from '../utils/venturesUsingStaging';

const Dialog = () => {
    const { window, parameters, close } = useSDK<DialogAppSDK>();
    const { site, venture, selected } = parameters.invocation as any;
    const [jackpots, setJackpots] = useState([]);

    // Check if this venture should use staging to fetch jackpots list
    const useStaging = shouldUseStaging(venture, parameters.installation.venturesUsingStaging);

    useEffect(() => {
        window.startAutoResizer();

        return () => window.stopAutoResizer();
    }, []);

    useEffect(() => {
        const load = async () => {
            try {
                // Use staging or production based on venture configuration
                const apiDomain = useStaging
                    ? parameters.installation.stagingApiDomain
                    : parameters.installation.productionApiDomain;
                const authHeader = useStaging
                    ? parameters.installation.stagingBasicAuthHeaderCode
                    : parameters.installation.productionBasicAuthHeaderCode;

                const { data } = await axios.get(`${apiDomain}/jackpot-config/jackpots`, {
                    params: { site },
                    headers: { Authorization: `Basic ${authHeader}` }
                });

                setJackpots(data.jackpotConfigInfos);
            } catch (error) {
                console.log(JSON.stringify(error));
                console.error('Failed to load jackpots:', error);
                close({ error: JSON.stringify(error) });
            };
        };

        if (!site) {
            return;
        }

        load();
    }, [site, useStaging]);

    if (jackpots.length === 0) {
        return null;
    };

    return (
        <Stack key="headlessJackpotId" flexDirection='column' spacing="spacingS" padding='spacingM'>
            {jackpots.map((headlessJackpot: any) => (
                <EntryCard
                    key={headlessJackpot.id}
                    size="small"
                    contentType={`Jackpot ID: ${headlessJackpot.id}`}
                    title={headlessJackpot.name}
                    status={headlessJackpot.status}
                    onClick={() => close(headlessJackpot)}
                    isSelected={selected === headlessJackpot.id}
                />
            ))}
        </Stack>
    );
};

export default Dialog;
