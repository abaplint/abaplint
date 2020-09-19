import {DiagnosticSeverity} from "vscode-languageserver-types";

export enum Severity {
  Error = DiagnosticSeverity.Error,
  Warning = DiagnosticSeverity.Warning,
  Info = DiagnosticSeverity.Information,
}