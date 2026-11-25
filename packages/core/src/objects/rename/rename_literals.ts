import {Range, TextDocumentEdit, TextEdit, WorkspaceEdit} from "vscode-languageserver-types";
import {IRegistry} from "../../_iregistry";
import {ABAPObject} from "../_abap_object";
import {StringToken, StringTemplate, StringTemplateBegin, StringTemplateMiddle, StringTemplateEnd} from "../../abap/1_lexer/tokens";
import {AbstractToken} from "../../abap/1_lexer/tokens/abstract_token";

export interface IRenamedName {
  oldName: string;
  newName: string;
}

/** Renames object names inside string literals and string templates of the ABAP sources.
 *  The object renamers rewrite references, a name in a literal is text to them: a dynamic
 *  CREATE OBJECT TYPE ('ZCL_FOO'), an RTTI lookup, an expected text in a unit test.
 *  A name is matched as a whole word in the case it is written in (all upper case stays upper case,
 *  everything else becomes lower case). A name directly after a "/" is part of a path or URL and stays,
 *  unless the old name is itself namespaced */
export class RenameLiterals {
  private readonly reg: IRegistry;

  public constructor(reg: IRegistry) {
    this.reg = reg;
  }

  public buildEdits(names: readonly IRenamedName[]): WorkspaceEdit {
    const documentChanges: TextDocumentEdit[] = [];
    const matchers = names
      .filter(n => n.oldName !== "" && n.oldName.toLowerCase() !== n.newName.toLowerCase())
      .map(n => ({regex: wordRegex(n.oldName), newName: n.newName}));
    if (matchers.length === 0) {
      return {documentChanges};
    }

    for (const obj of this.reg.getObjects()) {
      if (!(obj instanceof ABAPObject) || this.reg.isDependency(obj)) {
        continue;
      }
      for (const file of obj.getABAPFiles()) {
        const edits: TextEdit[] = [];
        for (const token of file.getTokens()) {
          if (!isLiteral(token)) {
            continue;
          }
          const str = token.getStr();
          let replaced = str;
          for (const m of matchers) {
            replaced = replaced.replace(m.regex, found =>
              found === found.toUpperCase() ? m.newName.toUpperCase() : m.newName.toLowerCase());
          }
          if (replaced !== str) {
            const row = token.getRow() - 1;
            const col = token.getCol() - 1;
            edits.push(TextEdit.replace(Range.create(row, col, row, col + str.length), replaced));
          }
        }
        if (edits.length > 0) {
          // last edit first, earlier edits in the same row keep their positions
          edits.reverse();
          documentChanges.push(TextDocumentEdit.create({uri: file.getFilename(), version: 1}, edits));
        }
      }
    }
    return {documentChanges};
  }
}

function isLiteral(token: AbstractToken): boolean {
  return token instanceof StringToken
    || token instanceof StringTemplate
    || token instanceof StringTemplateBegin
    || token instanceof StringTemplateMiddle
    || token instanceof StringTemplateEnd;
}

function wordRegex(name: string): RegExp {
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const before = name.startsWith("/") ? "(?<![A-Za-z0-9_])" : "(?<![A-Za-z0-9_/])";
  return new RegExp(before + escaped + "(?![A-Za-z0-9_])", "gi");
}
