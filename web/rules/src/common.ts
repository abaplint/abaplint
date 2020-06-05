import {IRuleMetadata, RuleTag} from "../../../packages/core/build/src/rules/_irule";

export function preamble(dir = "") {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="keywords" content="ABAP,Open Source,abaplint,lint,linter,SAP,static analysis" />
  <title>rules.abaplint.org</title>
  <link rel="stylesheet" type="text/css" href="${dir}style.css">
</head>
<body>
<div class="content">`;
}

export const postamble = `</div>
</body>
</html>`;

function quickfix() {
  // https://github.com/refactoringui/heroicons/blob/master/dist/outline-md/md-lightning-bolt.svg
  // eslint-disable-next-line max-len
  return `&nbsp;<a href="/quick_fix.html"><svg fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 24" height="2ch"><title>quick fix</title><path d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg></a>`;
}

function experimental() {
  // https://github.com/refactoringui/heroicons/
  // eslint-disable-next-line max-len
  return `&nbsp;<a href="/experimental.html"><svg fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 24" height="2ch"><title>experimental</title><path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg></a>`;
}

function upport() {
  // https://github.com/refactoringui/heroicons/
  // eslint-disable-next-line max-len
  return `&nbsp;<a href="/upport.html"><svg fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 24" stroke="currentColor" height="2ch"><title>upport</title><path d="M5 10l7-7m0 0l7 7m-7-7v18"></path></svg></a>`;
}

function downport() {
  // https://github.com/refactoringui/heroicons/
  // eslint-disable-next-line max-len
  return `&nbsp;<a href="/downport.html"><svg fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 24" stroke="currentColor" height="2ch"><title>downport</title><path d="M19 14l-7 7m0 0l-7-7m7 7V3"></path></svg></a>`;
}

function whitespace() {
  // https://github.com/refactoringui/heroicons/
  // eslint-disable-next-line max-len
  return `&nbsp;<a href="/whitespace.html"><svg fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 24" stroke="currentColor" height="2ch"><title>whitespace</title><path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1"></path></svg></a>`;
}

function naming() {
  // https://github.com/refactoringui/heroicons/
  // eslint-disable-next-line max-len
  return `&nbsp;<a href="/naming.html"><svg fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 24" stroke="currentColor" height="2ch"><title>naming</title><path d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"></path></svg></a>`;
}

function syntax() {
  // https://github.com/refactoringui/heroicons/
  // eslint-disable-next-line max-len
  return `&nbsp;<a href="/syntax.html"><svg fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 24" stroke="currentColor" height="2ch"><title>syntax</title><path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg></a>`;
}

export function home() {
  // https://github.com/refactoringui/heroicons/
  // eslint-disable-next-line max-len
  return `&nbsp;<a href="/"><svg fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 24" height="2ch"><title>home</title><path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg></a>`;
}

function styleguide() {
  // https://github.com/refactoringui/heroicons/
  // eslint-disable-next-line max-len
  return `&nbsp;<a href="/styleguide.html"><svg fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 24" stroke="currentColor" height="2ch"><title>styleguide</title><path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg></a>`;
}

export function renderIcons(meta: IRuleMetadata): string {
  let html = "";
  if (meta.quickfix === true) {
    html = html + quickfix();
  }
  if (meta.tags?.includes(RuleTag.Experimental)) {
    html = html + experimental();
  }
  if (meta.tags?.includes(RuleTag.Downport)) {
    html = html + downport();
  }
  if (meta.tags?.includes(RuleTag.Upport)) {
    html = html + upport();
  }
  if (meta.tags?.includes(RuleTag.Whitespace)) {
    html = html + whitespace();
  }
  if (meta.tags?.includes(RuleTag.Naming)) {
    html = html + naming();
  }
  if (meta.tags?.includes(RuleTag.Syntax)) {
    html = html + syntax();
  }
  if (meta.tags?.includes(RuleTag.Styleguide)) {
    html = html + styleguide();
  }
  return html;
}