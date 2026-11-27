import {Range, TextDocumentEdit, TextEdit, WorkspaceEdit} from "vscode-languageserver-types";
import {IRegistry} from "../../_iregistry";
import {BSPApplication} from "../bsp_application";

export interface IRenamedURL {
  oldURL: string;
  newURL: string;
}

/** Renames the URLs of renamed ICF nodes in the pages of the BSP applications, eg. a data source
 *  in a manifest.json, "/sap/bc/zfoo" -> "/sap/bc/ns/foo". A BSP refers to an ICF node by its URL,
 *  which no reference of the renamer knows. A URL is matched as a whole path, without its trailing
 *  "/" and in any case: "/sap/bc/zfoo", "/sap/bc/zfoo/" and "/sap/bc/zfoo?x=1", not "/sap/bc/zfoo_bar".
 *  The XML of the application, its attributes and the list of its pages, is not changed */
export class RenameURLs {
  private readonly reg: IRegistry;

  public constructor(reg: IRegistry) {
    this.reg = reg;
  }

  public buildEdits(urls: readonly IRenamedURL[]): WorkspaceEdit {
    const documentChanges: TextDocumentEdit[] = [];
    const map = new Map<string, string>();
    for (const u of urls) {
      const oldPath = withoutSlash(u.oldURL).toLowerCase();
      if (oldPath !== "") {
        map.set(oldPath, withoutSlash(u.newURL).toLowerCase());
      }
    }
    if (map.size === 0) {
      return {documentChanges};
    }
    // longest first, one pass: a replaced URL is not matched again
    const alternatives = Array.from(map.keys()).sort((a, b) => b.length - a.length).map(escape);
    const regex = new RegExp("(" + alternatives.join("|") + ")(?![A-Za-z0-9_-])", "gi");

    for (const obj of this.reg.getObjectsByType("WAPA")) {
      if (!(obj instanceof BSPApplication) || this.reg.isDependency(obj)) {
        continue;
      }
      const descriptor = obj.getXMLFile()?.getFilename();
      for (const file of obj.getFiles()) {
        if (file.getFilename() === descriptor) {
          continue;
        }
        const edits: TextEdit[] = [];
        const rows = file.getRawRows();
        for (let i = 0; i < rows.length; i++) {
          const replaced = rows[i].replace(regex, found => map.get(found.toLowerCase()) ?? found);
          if (replaced !== rows[i]) {
            edits.push(TextEdit.replace(Range.create(i, 0, i, rows[i].length), replaced));
          }
        }
        if (edits.length > 0) {
          documentChanges.push(TextDocumentEdit.create({uri: file.getFilename(), version: 1}, edits));
        }
      }
    }
    return {documentChanges};
  }
}

function withoutSlash(url: string): string {
  return url.endsWith("/") ? url.substring(0, url.length - 1) : url;
}

function escape(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
