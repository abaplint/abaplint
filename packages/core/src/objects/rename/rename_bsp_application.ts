import {IRegistry} from "../../_iregistry";
import {WorkspaceEdit, TextDocumentEdit, RenameFile, Range, TextEdit} from "vscode-languageserver-types";
import {BSPApplication, MIMEObject} from "..";
import {ObjectRenamer} from "./_object_renamer";
import {IObject} from "../_iobject";
import {RenamerHelper} from "./renamer_helper";

/** Renames a BSP application: APPLNAME and APPLEXT in the XML, the name in front of ".wapa." of every
 *  file and the URLs of the MIME objects in its MIME folder. The pages keep their names (PAGEKEY, PAGENAME and the page part of a file name): they are paths
 *  inside the application, which its files refer to, e.g. "thirdparty/zfoo/lib.js" of the application ZFOO.
 *  abapGit finds the file of a page by its page name, a renamed page name has no file */
export class RenameBSPApplication implements ObjectRenamer {
  private readonly reg: IRegistry;

  public constructor(reg: IRegistry) {
    this.reg = reg;
  }

  public buildEdits(obj: IObject, oldName: string, newName: string): WorkspaceEdit | undefined {
    if (!(obj instanceof BSPApplication)) {
      throw new Error("RenameBSPApplication, not a BSP application");
    }

    let changes: (TextDocumentEdit | RenameFile)[] = [];
    const helper = new RenamerHelper(this.reg);
    changes = changes.concat(helper.buildXMLFileEdits(obj, "APPLNAME", oldName, newName));
    changes = changes.concat(helper.buildXMLFileEdits(obj, "APPLEXT", oldName, newName));
    changes = changes.concat(this.renameFiles(obj, oldName, newName));
    changes = changes.concat(this.renameMIMEURLs(oldName, newName));
    return {
      documentChanges: changes,
    };
  }

  /** The MIME folder of the application and everything below it (SMIM objects) move with it:
   *  /SAP/BC/BSP/SAP/ZFOO/... for an application ZFOO, /SAP/BC/BSP/NS/BAR/... for /NS/BAR.
   *  abapGit creates MIME objects by their URL, the object and file names are GUIDs and stay */
  private renameMIMEURLs(oldName: string, newName: string): TextDocumentEdit[] {
    const oldPrefix = mimeFolder(oldName);
    const newPrefix = mimeFolder(newName);
    const changes: TextDocumentEdit[] = [];
    for (const o of this.reg.getObjectsByType("SMIM")) {
      if (!(o instanceof MIMEObject) || this.reg.isDependency(o)) {
        continue;
      }
      const xml = o.getXMLFile();
      if (xml === undefined) {
        continue;
      }
      const rows = xml.getRawRows();
      for (let i = 0; i < rows.length; i++) {
        const start = rows[i].indexOf("<URL>");
        const end = rows[i].indexOf("</URL>");
        if (start < 0 || end < start) {
          continue;
        }
        const url = rows[i].substring(start + 5, end);
        const upper = url.toUpperCase();
        if (upper !== oldPrefix && upper.startsWith(oldPrefix + "/") === false) {
          continue;
        }
        const prefix = url.substring(0, oldPrefix.length) === oldPrefix ? newPrefix : newPrefix.toLowerCase();
        const range = Range.create(i, start + 5, i, start + 5 + oldPrefix.length);
        changes.push(TextDocumentEdit.create({uri: xml.getFilename(), version: 1}, [TextEdit.replace(range, prefix)]));
      }
    }
    return changes;
  }

  /** only the name in front of ".wapa.", folders and page parts keep the old name if they contain it */
  private renameFiles(obj: BSPApplication, oldName: string, newName: string): RenameFile[] {
    const list: RenameFile[] = [];
    const oldPrefix = oldName.toLowerCase().replace(/\//g, "#") + ".wapa.";
    const newPrefix = newName.toLowerCase().replace(/\//g, "#") + ".wapa.";
    for (const f of obj.getFiles()) {
      const filename = f.getFilename();
      const slash = Math.max(filename.lastIndexOf("/"), filename.lastIndexOf("\\"));
      const base = filename.substring(slash + 1);
      if (base.toLowerCase().startsWith(oldPrefix) === false) {
        continue;
      }
      list.push(RenameFile.create(filename, filename.substring(0, slash + 1) + newPrefix + base.substring(oldPrefix.length)));
    }
    return list;
  }
}

/** the URL of the MIME folder of a BSP application, upper case. A namespaced application sits below its
 *  namespace instead of below SAP: ZFOO -> /SAP/BC/BSP/SAP/ZFOO, /NS/BAR -> /SAP/BC/BSP/NS/BAR */
function mimeFolder(name: string): string {
  const upper = name.toUpperCase();
  const namespaced = upper.match(/^\/([^/]+)\/([^/]+)$/);
  if (namespaced) {
    return "/SAP/BC/BSP/" + namespaced[1] + "/" + namespaced[2];
  }
  return "/SAP/BC/BSP/SAP/" + upper;
}
