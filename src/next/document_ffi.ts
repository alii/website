// Only routes/document.gleam (the `_document` page) uses these.
/* eslint-disable @next/next/no-document-import-in-page */
import {Head, Html, Main, NextScript} from 'next/document';

export const documentHtml = () => Html;
export const documentHead = () => Head;
export const documentMain = () => Main;
export const documentNextScript = () => NextScript;
