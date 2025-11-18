/* eslint-disable react-hooks/exhaustive-deps */
import { useCallback, useEffect, useRef, useState } from 'react';
import { FieldAppSDK } from '@contentful/app-sdk';
import { useSDK } from '@contentful/react-apps-toolkit';

function useContentfulEventListener() {
  const componentDidMount = useRef(false);
  const sdk = useSDK<FieldAppSDK>();
  const { field, entry, locales: { default: spaceLocale } } = sdk;
  const [isChanged, setIsChanged] = useState(false);
  const [isPublished, setIsPublished] = useState(false);
  const [hasFieldValueChanged, setHasFieldValueChanged] = useState(false);

  const handleSysChanged = useCallback((sys: any) => {
    if (!componentDidMount.current) return;

    const isChanged = sys.fieldStatus && sys.fieldStatus['*'][spaceLocale] === "changed";
    const isPublished = sys.fieldStatus && sys.fieldStatus['*'][spaceLocale] === "published";

    if (isChanged) {
      setIsPublished(false);
      setIsChanged(true);
    };

    if (isPublished) {
      setIsChanged(false);
      setIsPublished(true);
    };
  }, []);

  const handleFieldValueChanged = useCallback((val: any) => {
    if (!componentDidMount.current) return;

    setHasFieldValueChanged(true);
  }, []);

  const sysHandler = useRef(handleSysChanged);
  const fieldValueHandler = useRef(handleFieldValueChanged);

  useEffect(() => {
    const sysListener = (event: any) => sysHandler.current(event);
    const unsubscribeSysListener = entry.onSysChanged(sysListener);
    const valueChangeListener = (event: any) => fieldValueHandler.current(event);
    const unsubscribeValueChangeListener = field.onValueChanged(valueChangeListener);

    componentDidMount.current = true;
    return () => {
      componentDidMount.current = false;
      unsubscribeSysListener();
      unsubscribeValueChangeListener();
    };
  }, []);

  return { isChanged, isPublished, hasFieldValueChanged, setIsChanged, setIsPublished };
}

export default useContentfulEventListener;
