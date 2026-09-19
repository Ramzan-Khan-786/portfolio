import {
  PDFDocument,
  PDFDict,
  PDFArray,
  PDFName,
  PDFRef,
} from 'pdf-lib';

import { ApiError } from '../utils/ApiError.js';

const MAX_PAGES = 50;
const MAX_OBJECTS = 100_000;

const forbiddenKeys = new Set([
  'JavaScript',
  'JS',
  'AA',
  'EmbeddedFiles',
  'EF',
  'AcroForm',
  'XFA',
  'RichMediaContent',
]);

const dangerousActions = new Set([
  'JavaScript',
  'Launch',
  'SubmitForm',
  'ImportData',
  'GoToR',
]);

const allowedActions = new Set([
  'GoTo',
  'URI',
  'Named',
]);

function getPdfName(value) {
  if (value instanceof PDFName) {
    return value.decodeText();
  }

  return null;
}

function getDictionaryValue(dict, key) {
  return dict.get(PDFName.of(key));
}

function inspectPdfObject(object, state) {
  if (!object) {
    return;
  }

  if (state.count >= MAX_OBJECTS) {
    throw new Error('Complex document');
  }

  if (object instanceof PDFRef) {
    if (state.seenRefs.has(object.toString())) {
      return;
    }

    state.seenRefs.add(object.toString());

    const referencedObject = state.context.lookup(object);

    if (referencedObject) {
      inspectPdfObject(referencedObject, state);
    }

    return;
  }

  if (state.seenObjects.has(object)) {
    return;
  }

  state.seenObjects.add(object);
  state.count++;

  if (object instanceof PDFDict) {
    inspectPdfDictionary(object, state);
    return;
  }

  if (object instanceof PDFArray) {
    for (const value of object.asArray()) {
      inspectPdfObject(value, state);
    }

    return;
  }

  if (object.dict instanceof PDFDict) {
    inspectPdfDictionary(object.dict, state);
  }
}

function inspectPdfDictionary(dict, state) {
  for (const [key, value] of dict.entries()) {
    const keyName = key.decodeText();

    if (forbiddenKeys.has(keyName)) {
      throw new Error(`Forbidden PDF feature: ${keyName}`);
    }

    if (keyName === 'OpenAction') {
      inspectOpenAction(value, state);
    }

    if (keyName === 'S') {
      inspectActionType(value);
    }

    inspectPdfObject(value, state);
  }
}

function inspectOpenAction(value, state) {
  if (!(value instanceof PDFDict)) {
    inspectPdfObject(value, state);
    return;
  }

  const actionType = getDictionaryValue(value, 'S');

  if (!actionType) {
    return;
  }

  const actionName = getPdfName(actionType);

  if (!actionName) {
    throw new Error('Invalid OpenAction');
  }

  if (dangerousActions.has(actionName)) {
    throw new Error(`Dangerous OpenAction: ${actionName}`);
  }

  if (!allowedActions.has(actionName)) {
    throw new Error(`Unsupported OpenAction: ${actionName}`);
  }

  inspectPdfObject(value, state);
}

function inspectActionType(value) {
  const actionName = getPdfName(value);

  if (!actionName) {
    return;
  }

  if (dangerousActions.has(actionName)) {
    throw new Error(`Dangerous PDF action: ${actionName}`);
  }

  if (!allowedActions.has(actionName)) {
    throw new Error(`Unsupported PDF action: ${actionName}`);
  }
}

export async function validateResumePdf(buffer) {
  try {
    if (!Buffer.isBuffer(buffer) || buffer.length === 0) {
      throw new Error('Invalid PDF buffer');
    }

    const document = await PDFDocument.load(buffer, {
      ignoreEncryption: false,
      throwOnInvalidObject: true,
    });

    const pageCount = document.getPageCount();

    if (pageCount < 1 || pageCount > MAX_PAGES) {
      throw new Error('Page limit');
    }

    const state = {
      context: document.context,
      seenObjects: new Set(),
      seenRefs: new Set(),
      count: 0,
    };

    for (const [, object] of document.context.enumerateIndirectObjects()) {
      inspectPdfObject(object, state);
    }

    return {
      valid: true,
      pageCount,
    };
  } catch (error) {
    throw new ApiError(
      422,
      'Use a readable, unencrypted PDF (1–50 pages) without scripts, forms, or attachments.',
    );
  }
}
