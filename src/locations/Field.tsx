/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect } from "react";
import { FieldAppSDK } from "@contentful/app-sdk";
import { useSDK } from "@contentful/react-apps-toolkit";

import JackpotGamesSectionField from "../components/JackpotGamesSectionField";
import SiteGameV2Field from "../components/SiteGameV2Field";
import { FormStyled } from "../styles/forms";

const Field = () => {
  const { window, parameters: { instance } } = useSDK<FieldAppSDK>();

  useEffect(() => {
    window.startAutoResizer();

    return () => window.stopAutoResizer();
  }, []);

  const renderFields = () => {
    if (instance.targetContentType === 'siteGameV2') {
      return <SiteGameV2Field />
    };

    return <JackpotGamesSectionField />
  };

  return <FormStyled>
    {renderFields()}
  </FormStyled>;
};

export default Field;
