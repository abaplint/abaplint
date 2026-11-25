import {IRegistry} from "../../_iregistry";
import * as crypto from "crypto";
import {WorkspaceEdit, TextDocumentEdit, CreateFile, RenameFile, DeleteFile} from "vscode-languageserver-types";
import {ICFService} from "..";
import {ObjectRenamer} from "./_object_renamer";
import {IObject} from "../_iobject";
import {RenamerHelper} from "./renamer_helper";

export class RenameICFService implements ObjectRenamer {
  private readonly reg: IRegistry;

  public constructor(reg: IRegistry) {
    this.reg = reg;
  }

  public buildEdits(obj: IObject, oldName: string, newName: string): WorkspaceEdit | undefined {
    if (!(obj instanceof ICFService)) {
      throw new Error("RenameICFService, not a ICF Service");
    }

    // Preserve GUID suffix from the stored object/file name for the filename rename
    // SICF files follow pattern: servicename.sicf or servicename {GUID}.sicf
    const fileNewName = (() => {
      // Look for pattern: space + GUID (32 hex chars in braces) + optional extension
      const guidPattern = / \{[0-9A-Fa-f]{16,32}\}/;
      const match = oldName.match(guidPattern);

      if (match) {
        // Extract everything from the GUID onwards (includes .sicf extension if present)
        const guidIndex = match.index!;
        const suffix = oldName.substring(guidIndex);

        // Only append suffix if newName doesn't already contain it
        return newName.includes(suffix) ? newName : newName + suffix;
      }

      // Fallback: preserve any suffix after first space (legacy behavior)
      const space = oldName.indexOf(" ");
      if (space > -1) {
        const suffix = oldName.substring(space);
        return newName.includes(suffix) ? newName : newName + suffix;
      }

      return newName;
    })();

    const cleanOldName = oldName.match(/^[^ ]+/)?.[0] ?? oldName;
    const cleanNewName = newName.match(/^[^ ]+/)?.[0] ?? newName;

    let changes: (TextDocumentEdit | CreateFile | RenameFile | DeleteFile)[] = [];
    const helper = new RenamerHelper(this.reg);
    changes = changes.concat(helper.buildURLFileEdits(obj, cleanOldName, cleanNewName));
    changes = changes.concat(helper.buildXMLFileEdits(obj, "ICF_NAME", cleanOldName, cleanNewName));
    changes = changes.concat(helper.buildXMLFileEdits(obj, "ORIG_NAME", cleanOldName, cleanNewName, true));
    const abapGitFiles = this.renameAbapGitFiles(obj, cleanOldName, cleanNewName);
    changes = changes.concat(abapGitFiles ?? helper.renameFiles(obj, oldName, fileNewName));
    return {
      documentChanges: changes,
    };
  }

  /** abapGit names a SICF file "<ICF_NAME, lower case, padded to 15><first 25 hex chars of SHA1(URL)>.sicf.xml",
   *  the URL is the one in the XML. Both parts change with the name, keeping the old ones gives an object name
   *  abapGit does not derive from the node. Returns undefined if the files are not in this layout */
  private renameAbapGitFiles(obj: ICFService, oldName: string, newName: string): RenameFile[] | undefined {
    const url = obj.getURL();
    if (url === undefined || newName.length > ICF_NAME_LENGTH) {
      return undefined;
    }
    const newURL = url.replace(oldName.toLowerCase(), newName.toLowerCase());
    const hash = crypto.createHash("sha1").update(newURL).digest("hex").substring(0, ICF_HASH_LENGTH);
    const stem = newName.toLowerCase().padEnd(ICF_NAME_LENGTH, " ") + hash;

    const list: RenameFile[] = [];
    for (const f of obj.getFiles()) {
      const filename = f.getFilename();
      const slash = Math.max(filename.lastIndexOf("/"), filename.lastIndexOf("\\"));
      const base = filename.substring(slash + 1);
      const match = base.match(/^[^ ]+ +[0-9a-f]{25}(\..+)$/i);
      if (match === null) {
        return undefined;
      }
      list.push(RenameFile.create(filename, filename.substring(0, slash + 1) + stem + match[1]));
    }
    return list;
  }

}

const ICF_NAME_LENGTH = 15;
const ICF_HASH_LENGTH = 25;
