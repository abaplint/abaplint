import {IRegistry} from "../../_iregistry";
import {WorkspaceEdit, TextDocumentEdit, RenameFile} from "vscode-languageserver-types";
import {BSPApplication} from "..";
import {ObjectRenamer} from "./_object_renamer";
import {IObject} from "../_iobject";
import {RenamerHelper} from "./renamer_helper";

/** Renames a BSP application: APPLNAME and APPLEXT in the XML and the name in front of ".wapa." of every
 *  file. The pages keep their names (PAGEKEY, PAGENAME and the page part of a file name): they are paths
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
    return {
      documentChanges: changes,
    };
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
