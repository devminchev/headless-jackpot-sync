import React, { useCallback, useState, useEffect } from 'react';
import { useSDK } from '@contentful/react-apps-toolkit';
import { ConfigAppSDK } from '@contentful/app-sdk';
import {
  Heading,
  Form,
  Flex,
  TextInput,
  FormControl,
  Pill
} from '@contentful/f36-components';
import { Multiselect } from '@contentful/f36-multiselect';
import { parseVenturesUsingStaging, stringifyVenturesUsingStaging } from '../utils/venturesUsingStaging';

interface AppInstallationParameters {
  productionApiDomain: string;
  productionBasicAuthHeaderCode: string;
  stagingApiDomain: string;
  stagingBasicAuthHeaderCode: string;
  jackpotsListApi: string;
  activateGameApi: string;
  deactivateGameApi: string;
  isActiveGameApi: string;
  venturesUsingStaging: string;
}

interface Venture {
  name: string;
}

const ConfigScreen = () => {
  const [availableVentures, setAvailableVentures] = useState<Venture[]>([]);
  const [selectedVentures, setSelectedVentures] = useState<string[]>([]);
  const [parameters, setParameters] = useState<AppInstallationParameters>({
    productionApiDomain: '',
    productionBasicAuthHeaderCode: '',
    stagingApiDomain: '',
    stagingBasicAuthHeaderCode: '',
    jackpotsListApi: '',
    activateGameApi: '',
    deactivateGameApi: '',
    isActiveGameApi: '',
    venturesUsingStaging: ''
  });
  const sdk = useSDK<ConfigAppSDK>();

  const onConfigure = useCallback(async () => {
    const currentState = await sdk.app.getCurrentState();
    return {
      // Convert array to comma-separated string when saving
      parameters: {
        ...parameters,
        venturesUsingStaging: stringifyVenturesUsingStaging(selectedVentures)
      },
      targetState: currentState
    };
  }, [parameters, selectedVentures, sdk]);

  function updateParameters<T extends keyof AppInstallationParameters>(
    parameterName: T
  ) {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setParameters({ ...parameters, [parameterName]: value });
    };
  };

  const handleSelectItem = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { checked, value } = event.target;
    if (checked) {
      setSelectedVentures((prev) => [...prev, value]);
    } else {
      setSelectedVentures((prev) => prev.filter(v => v !== value));
    }
  };

  const removeVenture = (ventureToRemove: string) => {
    setSelectedVentures((prev) => prev.filter(v => v !== ventureToRemove));
  };

  useEffect(() => {
    sdk.app.onConfigure(onConfigure);
  }, [sdk, onConfigure]);

  useEffect(() => {
    (async () => {
      const currentParameters: AppInstallationParameters | null =
        await sdk.app.getParameters();

      if (currentParameters) {
        setParameters(currentParameters);
        setSelectedVentures(parseVenturesUsingStaging(currentParameters.venturesUsingStaging));
      };

      sdk.app.setReady();
    })();
  }, [sdk]);

  // Fetch available ventures from Contentful
  useEffect(() => {
    (async () => {
      try {
        const entries = await sdk.cma.entry.getMany({
          query: {
            content_type: 'venture',
            limit: 100
          }
        });

        const defaultLocale = sdk.locales.default;
        const ventures = entries.items
          .map((entry: any) => ({
            name: entry.fields.name?.[defaultLocale] || ''
          }))
          .filter((v: Venture) => v.name)
          .sort((a: Venture, b: Venture) => a.name.localeCompare(b.name));

        setAvailableVentures(ventures);
      } catch (error) {
        console.error('Failed to fetch ventures:', error);
      }
    })();
  }, [sdk]);

  return (
    <Flex flexDirection="column" margin="spacingL">
      <Heading>Headless Jackpots App Configurations</Heading>
      <Form>
        <FormControl isRequired isInvalid={!parameters.productionApiDomain} key="productionApiDomain">
          <FormControl.Label>Production API Domain URL</FormControl.Label>
          <TextInput
            value={parameters.productionApiDomain}
            name="productionApiDomain"
            onChange={updateParameters('productionApiDomain')}
          />
        </FormControl>
        <FormControl isRequired isInvalid={!parameters.productionBasicAuthHeaderCode} key="productionBasicAuthHeaderCode">
          <FormControl.Label>Production API Basic Auth Header Encoded Value</FormControl.Label>
          <TextInput
            value={parameters.productionBasicAuthHeaderCode}
            name="productionBasicAuthHeaderCode"
            onChange={updateParameters('productionBasicAuthHeaderCode')}
          />
        </FormControl>
        <FormControl isRequired isInvalid={!parameters.stagingApiDomain} key="stagingApiDomain">
          <FormControl.Label>Staging API Domain URL</FormControl.Label>
          <TextInput
            value={parameters.stagingApiDomain}
            name="stagingApiDomain"
            onChange={updateParameters('stagingApiDomain')}
          />
        </FormControl>
        <FormControl isRequired isInvalid={!parameters.stagingBasicAuthHeaderCode} key="stagingBasicAuthHeaderCode">
          <FormControl.Label>Staging API Basic Auth Header Encoded Value</FormControl.Label>
          <TextInput
            value={parameters.stagingBasicAuthHeaderCode}
            name="stagingBasicAuthHeaderCode"
            onChange={updateParameters('stagingBasicAuthHeaderCode')}
          />
        </FormControl>

        <FormControl key="venturesUsingStaging">
          <FormControl.Label>Sites Using Staging Environment</FormControl.Label>
          <Multiselect
            currentSelection={selectedVentures}
            popoverProps={{ isFullWidth: true }}
          >
            {availableVentures.map((venture) => (
              <Multiselect.Option
                key={venture.name}
                value={venture.name}
                itemId={venture.name}
                label={venture.name}
                onSelectItem={handleSelectItem}
                isChecked={selectedVentures.includes(venture.name)}
              />
            ))}
          </Multiselect>
          {selectedVentures.length > 0 && (
            <Flex marginTop="spacingXs" gap="spacingXs" flexWrap="wrap">
              {selectedVentures.map((venture) => (
                <Pill
                  key={venture}
                  label={venture}
                  onClose={() => removeVenture(venture)}
                />
              ))}
            </Flex>
          )}
          <FormControl.HelpText>
            Select which sites should fetch jackpot configurations from the staging environment instead of production.
          </FormControl.HelpText>
        </FormControl>

        <FormControl isRequired isInvalid={!parameters.jackpotsListApi} key="jackpotsListApi">
          <FormControl.Label>Headless Jackpots Api Config</FormControl.Label>
          <TextInput
            value={parameters.jackpotsListApi}
            name="jackpotsListApi"
            onChange={updateParameters('jackpotsListApi')}
          />
        </FormControl>


        <FormControl isRequired isInvalid={!parameters.activateGameApi} key="activateGameApi">
          <FormControl.Label>Activating Game's Headless Jackpot Api Config</FormControl.Label>
          <TextInput
            value={parameters.activateGameApi}
            name="activateGameApi"
            onChange={updateParameters('activateGameApi')}
          />
        </FormControl>
        <FormControl isRequired isInvalid={!parameters.deactivateGameApi} key="deactivateGameApi">
          <FormControl.Label>Deactivating Game's Headless Jackpot Api Config</FormControl.Label>
          <TextInput
            value={parameters.deactivateGameApi}
            name="deactivateGameApi"
            onChange={updateParameters('deactivateGameApi')}
          />
        </FormControl>

        <FormControl isRequired isInvalid={!parameters.isActiveGameApi} key="isActiveGameApi">
          <FormControl.Label>Game's Headless Jackpot Status Api Config</FormControl.Label>
          <TextInput
            value={parameters.isActiveGameApi}
            name="isActiveGameApi"
            onChange={updateParameters('isActiveGameApi')}
          />
        </FormControl>
      </Form>
    </Flex>
  );
};

export default ConfigScreen;
