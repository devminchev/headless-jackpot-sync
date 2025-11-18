import React, { useCallback, useState, useEffect } from 'react';
import { useSDK } from '@contentful/react-apps-toolkit';
import { ConfigAppSDK } from '@contentful/app-sdk';
import {
  Heading,
  Form,
  Flex,
  TextInput,
  FormControl
} from '@contentful/f36-components';

interface AppInstallationParameters {
  productionApiDomain: string;
  productionBasicAuthHeaderCode: string;
  stagingApiDomain: string;
  stagingBasicAuthHeaderCode: string;
  jackpotsListApi: string;
  activateGameApi: string;
  deactivateGameApi: string;
  isActiveGameApi: string;
}

const ConfigScreen = () => {
  const [parameters, setParameters] = useState<AppInstallationParameters>({
    productionApiDomain: '',
    productionBasicAuthHeaderCode: '',
    stagingApiDomain: '',
    stagingBasicAuthHeaderCode: '',
    jackpotsListApi: '',
    activateGameApi: '',
    deactivateGameApi: '',
    isActiveGameApi: ''
  });
  const sdk = useSDK<ConfigAppSDK>();

  const onConfigure = useCallback(async () => {
    const currentState = await sdk.app.getCurrentState();
    return {
      parameters,
      targetState: currentState
    };
  }, [parameters, sdk]);

  function updateParameters<T extends keyof AppInstallationParameters>(
    parameterName: T
  ) {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setParameters({ ...parameters, [parameterName]: value });
    };
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
      };

      sdk.app.setReady();
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
