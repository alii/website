import {createElement} from 'react';
import {RiJavascriptFill} from 'react-icons/ri';
import {SiGleam} from 'react-icons/si';
import {TbBrandCss3, TbBrandHtml5, TbBrandTypescript} from 'react-icons/tb';
import {VscCheck, VscInfo, VscWarning} from 'react-icons/vsc';

export const vscWarning = (className: string) => createElement(VscWarning, {className});
export const vscInfo = (className: string) => createElement(VscInfo, {className});
export const vscCheck = (className: string) => createElement(VscCheck, {className});
export const tbBrandTypescript = (className: string) =>
	createElement(TbBrandTypescript, {className});
export const riJavascriptFill = (className: string) => createElement(RiJavascriptFill, {className});
export const tbBrandHtml5 = (className: string) => createElement(TbBrandHtml5, {className});
export const tbBrandCss3 = (className: string) => createElement(TbBrandCss3, {className});
export const siGleam = (className: string) => createElement(SiGleam, {className});
