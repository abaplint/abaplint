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
import {ABAPReferencesProvider} from "./abap_references_provider";
import {ABAPSemanticTokensDeltaProvider} from "./abap_semantic_tokens_delta_provider";
import {DiagnosticSeverity} from "vscode-languageserver-types";

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
  monaco.languages.registerReferenceProvider("abap", new ABAPReferencesProvider(reg));
  monaco.languages.registerDocumentRangeSemanticTokensProvider("abap", new ABAPSemanticTokensDeltaProvider(reg));
}

export function updateMarkers(reg: IRegistry, model: monaco.editor.ITextModel) {
// see https://github.com/microsoft/monaco-editor/issues/1604
  reg.parse();
  const ls = new LanguageServer(reg);
  const diagnostics = ls.diagnostics({uri: model.uri.toString()});

  const markers: monaco.editor.IMarkerData[] = [];
  for (const diagnostic of diagnostics) {
    let codeValue = diagnostic.code || "";
    if (typeof codeValue === "number") {
      codeValue = "";
    }
    const codeTarget = monaco.Uri.parse(diagnostic.codeDescription?.href || "");

    let severity = monaco.MarkerSeverity.Error;
    if (diagnostic.severity === DiagnosticSeverity.Warning) {
      severity = monaco.MarkerSeverity.Warning;
    } else if (diagnostic.severity === DiagnosticSeverity.Information) {
      severity = monaco.MarkerSeverity.Info;
    }

    markers.push({
      severity: severity,
      message: diagnostic.message,
      code: {
        value: codeValue,
        target: codeTarget,
      },
      startLineNumber: diagnostic.range.start.line + 1,
      startColumn: diagnostic.range.start.character + 1,
      endLineNumber: diagnostic.range.end.line + 1,
      endColumn: diagnostic.range.end.character + 1,
    });
  }
  monaco.editor.setModelMarkers(model, "abaplint", markers);
}