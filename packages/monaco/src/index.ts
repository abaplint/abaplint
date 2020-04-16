import {LanguageServer, IRegistry} from "@abaplint/core";
import {ABAPSnippetProvider} from "./abap_snippet_provider";
import {ABAPRenameProvider} from "./abap_rename_provider";
import {ABAPHoverProvider} from "./abap_hover_provider";
import {ABAPFormattingProvider} from "./abap_formatting_provider";
import {ABAPSymbolProvider} from "./abap_symbol_provider";
import {ABAPDefinitionProvider} from "./abap_definition_provider";
import {ABAPDocumentHighlightProvider} from "./abap_document_highlight_provider";
import {ABAPCodeActionProvider} from "./abap_code_action_provider";
import {ABAPImplementationProvider} from "./abap_implementation_provider";

export function registerABAP(reg: IRegistry) {
  monaco.languages.registerCompletionItemProvider("abap", new ABAPSnippetProvider());
  monaco.languages.registerHoverProvider("abap", new ABAPHoverProvider(reg));
  monaco.languages.registerDocumentFormattingEditProvider("abap", new ABAPFormattingProvider(reg));
  monaco.languages.registerDocumentSymbolProvider("abap", new ABAPSymbolProvider(reg));
  monaco.languages.registerDefinitionProvider("abap", new ABAPDefinitionProvider(reg));
  monaco.languages.registerRenameProvider("abap", new ABAPRenameProvider(reg));
  monaco.languages.registerDocumentHighlightProvider("abap", new ABAPDocumentHighlightProvider(reg));
  monaco.languages.registerCodeActionProvider("abap", new ABAPCodeActionProvider(reg));
  monaco.languages.registerImplementationProvider("abap", new ABAPImplementationProvider(reg));
}

export function updateMarkers(reg: IRegistry, model: monaco.editor.ITextModel) {
// see https://github.com/microsoft/monaco-editor/issues/1604
  console.dir(model.uri.toString() + "sdfsdf");
  const ls = new LanguageServer(reg);
  const diagnostics = ls.diagnostics({uri: model.uri.toString()});

  const markers: monaco.editor.IMarkerData[] = [];
  for (const diagnostic of diagnostics) {
    markers.push({
      severity: monaco.MarkerSeverity.Error,
      message: diagnostic.message,
      startLineNumber: diagnostic.range.start.line + 1,
      startColumn: diagnostic.range.start.character + 1,
      endLineNumber: diagnostic.range.end.line + 1,
      endColumn: diagnostic.range.end.character + 1,
    });
  }
  console.dir(markers);
  monaco.editor.setModelMarkers(model, "abaplint", markers);
}