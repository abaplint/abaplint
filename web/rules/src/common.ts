/* eslint-disable max-len */
import {IRuleMetadata, RuleTag} from "../../../packages/core/build/src/rules/_irule";


export function preamble() {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="keywords" content="ABAP,Open Source,abaplint,lint,linter,SAP,static analysis" />
  <title>rules.abaplint.org</title>
  <link rel="stylesheet" type="text/css" href="/style.css">
  <link rel="icon" type="image/png" href="/favicon-32x32.png" sizes="32x32" />
  <link rel="icon" type="image/png" href="/favicon-16x16.png" sizes="16x16" />
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/docsearch.js@2/dist/cdn/docsearch.min.css" />
</head>
<body>
<div class="content">`;
}

export const postamble = `</div>
</body>
</html>`;

// https://github.com/refactoringui/heroicons/  medium
export const quickfixIcon = `<svg fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 24" height="2ch"><title>quick fix</title><path d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>`;
function quickfix() {
  return `&nbsp;${quickfixIcon}`;
}

export const securityIcon = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" height="2ch">
  <title>security</title>
  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" />
</svg>`;
function security() {
  return `&nbsp;${securityIcon}`;
}

export const experimentalIcon = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" height="2ch">
  <title>experimental</title>
  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
</svg>`;
function experimental() {
  return `&nbsp;${experimentalIcon}`;
}

export const upportIcon = `<svg fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 24" stroke="currentColor" height="2ch"><title>upport</title><path d="M5 10l7-7m0 0l7 7m-7-7v18"></path></svg>`;
function upport() {
  return `&nbsp;${upportIcon}`;
}

export const downportIcon = `<svg fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 24" stroke="currentColor" height="2ch"><title>downport</title><path d="M19 14l-7 7m0 0l-7-7m7 7V3"></path></svg>`;
function downport() {
  return `&nbsp;${downportIcon}`;
}

export const whitespaceIcon = `<svg fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 24" stroke="currentColor" height="2ch"><title>whitespace</title><path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1"></path></svg>`;
function whitespace() {
  return `&nbsp;${whitespaceIcon}`;
}

export const namingIcon = `<svg fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 24" stroke="currentColor" height="2ch"><title>naming</title><path d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"></path></svg>`;
function naming() {
  return `&nbsp;${namingIcon}`;
}

export const syntaxIcon = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" height="2ch">
  <title>syntax</title>
  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
</svg>`;
function syntax() {
  return `&nbsp;${syntaxIcon}`;
}

export const homeIcon = `<svg fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 24" height="2ch"><title>home</title><path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>`;
export function home() {
  return `&nbsp;<a href="/">${homeIcon}</a>`;
}

export const styleguideIcon = `<svg fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 24" stroke="currentColor" height="2ch"><title>styleguide</title><path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>`;
function styleguide() {
  return `&nbsp;${styleguideIcon}`;
}

export const singleFileIcon = `<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" height="2ch">
<title>single file</title>
<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>`;
function singleFile() {
  return `&nbsp;${singleFileIcon}`;
}

export function renderIcons(tags: IRuleMetadata["tags"]): string {
  let html = "";
  if (tags?.includes(RuleTag.Quickfix)) {
    html = html + quickfix();
  }
  if (tags?.includes(RuleTag.Experimental)) {
    html = html + experimental();
  }
  if (tags?.includes(RuleTag.Downport)) {
    html = html + downport();
  }
  if (tags?.includes(RuleTag.Upport)) {
    html = html + upport();
  }
  if (tags?.includes(RuleTag.Whitespace)) {
    html = html + whitespace();
  }
  if (tags?.includes(RuleTag.Naming)) {
    html = html + naming();
  }
  if (tags?.includes(RuleTag.Syntax)) {
    html = html + syntax();
  }
  if (tags?.includes(RuleTag.Styleguide)) {
    html = html + styleguide();
  }
  if (tags?.includes(RuleTag.Security)) {
    html = html + security();
  }
  if (tags?.includes(RuleTag.SingleFile)) {
    html = html + singleFile();
  }
  return html;
}