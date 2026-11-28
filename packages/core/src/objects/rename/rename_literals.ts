import {Range, TextDocumentEdit, TextEdit, WorkspaceEdit} from "vscode-languageserver-types";
import {IRegistry} from "../../_iregistry";
import {ABAPObject} from "../_abap_object";
import {ABAPFile} from "../../abap/abap_file";
import {StringToken, StringTemplate, StringTemplateBegin, StringTemplateMiddle, StringTemplateEnd} from "../../abap/1_lexer/tokens";
import {AbstractToken} from "../../abap/1_lexer/tokens/abstract_token";

export interface IRenamedName {
  oldName: string;
  newName: string;
}

/** Renames the names of renamed objects inside the string literals and string templates of the
 *  ABAP sources. The object renamers follow references, a name in a literal is just text to them:
 *
 *    CREATE OBJECT ref TYPE ('ZCL_FOO').     ->  CREATE OBJECT ref TYPE ('ZCL_BAR').
 *    DATA(name) = |zcl_foo is not found|.    ->  DATA(name) = |zcl_bar is not found|.
 *
 *  Three rules decide what is replaced:
 *  1. only whole names:        'ZCL_FOO_EVENT' and 'XZCL_FOO' stay
 *  2. not directly after "/":  `src/zcl_foo.clas.abap` stays, it is a path or a URL
 *  3. the case is kept:        an upper case name becomes the new name in upper case,
 *                              any other spelling becomes the new name in lower case
 *
 *  Comments and the code outside of literals are never touched, only literal tokens are looked at */
export class RenameLiterals {
  private readonly reg: IRegistry;

  public constructor(reg: IRegistry) {
    this.reg = reg;
  }

  public buildEdits(names: readonly IRenamedName[]): WorkspaceEdit {
    const documentChanges: TextDocumentEdit[] = [];

    // old name -> new name, both in lower case
    const newNames = new Map<string, string>();
    for (const n of names) {
      if (n.oldName !== "" && n.oldName.toLowerCase() !== n.newName.toLowerCase()) {
        newNames.set(n.oldName.toLowerCase(), n.newName.toLowerCase());
      }
    }
    if (newNames.size === 0) {
      return {documentChanges};
    }
    const regex = buildRegex(Array.from(newNames.keys()));

    for (const obj of this.reg.getObjects()) {
      if (!(obj instanceof ABAPObject) || this.reg.isDependency(obj)) {
        continue;
      }
      for (const file of obj.getABAPFiles()) {
        const edits = this.buildFileEdits(file, regex, newNames);
        if (edits.length > 0) {
          documentChanges.push(TextDocumentEdit.create({uri: file.getFilename(), version: 1}, edits));
        }
      }
    }
    return {documentChanges};
  }

  /** one edit per changed literal token of the file */
  private buildFileEdits(file: ABAPFile, regex: RegExp, newNames: ReadonlyMap<string, string>): TextEdit[] {
    const edits: TextEdit[] = [];
    for (const token of file.getTokens()) {
      if (!isLiteral(token)) {
        continue;
      }
      const before = token.getStr();
      const after = before.replace(regex, found => {
        const newName = newNames.get(found.toLowerCase())!;
        return found === found.toUpperCase() ? newName.toUpperCase() : newName;
      });
      if (after !== before) {
        const row = token.getRow() - 1;
        const col = token.getCol() - 1;
        edits.push(TextEdit.replace(Range.create(row, col, row, col + before.length), after));
      }
    }
    // the edits are applied one after the other, and a new name can be longer or shorter than the
    // old one: starting with the last token keeps the columns of the tokens before it valid
    return edits.reverse();
  }
}

function isLiteral(token: AbstractToken): boolean {
  return token instanceof StringToken
    || token instanceof StringTemplate
    || token instanceof StringTemplateBegin
    || token instanceof StringTemplateMiddle
    || token instanceof StringTemplateEnd;
}

/** One regex for all the old names, so a literal is replaced in one pass and a new name is never
 *  matched again as the old name of another object. Longest name first, as "/ns/cl_foo" must win
 *  over a "cl_foo" at the same place. Example for ZCL_FOO and ZIF_FOO:
 *
 *    (?<![A-Za-z0-9_/])(zcl_foo|zif_foo)(?![A-Za-z0-9_])
 *
 *  - (?<![A-Za-z0-9_/])  no name character and no "/" in front, rules 1 and 2
 *  - (?![A-Za-z0-9_])    no name character behind, rule 1 */
function buildRegex(oldNames: string[]): RegExp {
  const alternatives = oldNames.sort((a, b) => b.length - a.length).map(escape);
  return new RegExp("(?<![A-Za-z0-9_/])(" + alternatives.join("|") + ")(?![A-Za-z0-9_])", "gi");
}

function escape(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
