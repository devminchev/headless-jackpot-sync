/* eslint-disable react-hooks/exhaustive-deps */
import React from "react";
import { useHeadlessJackpotApi } from "../hooks";
import { EntryCard, Stack, IconButton, Note, Spinner } from "@contentful/f36-components";
import { DeleteIcon } from '@contentful/f36-icons';

const SiteGameV2Field = () => {
  const { value, requestInProgress, error, handleChange, removeJackpot } = useHeadlessJackpotApi();

  return (
    <Stack flexDirection="column">
      {requestInProgress && <Spinner variant="primary" customSize={42}></Spinner>}
      <EntryCard
        isSelected={value ? true : false}
        isLoading={requestInProgress ? true : false}
        key="headlessJackpot"
        contentType={value ? `Jackpot ID: ${value.id}` : undefined}
        title={value ? value.name : 'Add Headless Jackpot'}
        description="Remove any existing headless jackpot before adding a new one, or click to add if none is set."
        onClick={handleChange}
        customActionButton={value ?
          <IconButton
            key="remove"
            onClick={removeJackpot}
            variant="negative"
            aria-label="Remove"
            icon={<DeleteIcon />}
          > Remove </IconButton>
          : null
        }
      />
      {
        error &&
        <Note variant="negative" >
          Error : {error.status}-{error.message}
        </Note>
      }
    </Stack>
  );
};

export default SiteGameV2Field;
