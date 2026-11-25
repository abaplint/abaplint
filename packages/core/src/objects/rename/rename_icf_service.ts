import {IRegistry} from "../../_iregistry";
import * as crypto from "crypto";
import {WorkspaceEdit, TextDocumentEdit, CreateFile, RenameFile, DeleteFile, Range, TextEdit} from "vscode-languageserver-types";
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

    const namespaced = cleanNewName.match(/^\/([^/]+)\/([^/]+)$/);
    if (namespaced) {
      // ICF node names carry no slashes: "/NS/LEAF" is the node LEAF below a node NS
      const leaf = namespaced[2];
      if (leaf.length > ICF_NAME_LENGTH) {
        throw new Error("RenameICFService, " + leaf + " is longer than " + ICF_NAME_LENGTH + " characters");
      }
      const url = obj.getURL();
      const newURL = url === undefined ? undefined : namespacedURL(url, cleanOldName, namespaced[1], leaf);
      if (newURL !== undefined) {
        changes = changes.concat(this.buildURLEdit(obj, newURL));
      }
      changes = changes.concat(helper.buildXMLFileEdits(obj, "ICF_NAME", cleanOldName, leaf));
      changes = changes.concat(helper.buildXMLFileEdits(obj, "ORIG_NAME", cleanOldName, leaf, true));
      const files = newURL === undefined ? undefined : this.renameAbapGitFiles(obj, leaf, newURL);
      changes = changes.concat(files ?? helper.renameFiles(obj, cleanOldName, leaf));
    } else {
      changes = changes.concat(helper.buildURLFileEdits(obj, cleanOldName, cleanNewName));
      changes = changes.concat(helper.buildXMLFileEdits(obj, "ICF_NAME", cleanOldName, cleanNewName));
      changes = changes.concat(helper.buildXMLFileEdits(obj, "ORIG_NAME", cleanOldName, cleanNewName, true));
      const url = obj.getURL();
      const files = url === undefined ? undefined :
        this.renameAbapGitFiles(obj, cleanNewName, url.replace(cleanOldName.toLowerCase(), cleanNewName.toLowerCase()));
      changes = changes.concat(files ?? helper.renameFiles(obj, oldName, fileNewName));
    }
    return {
      documentChanges: changes,
    };
  }

  private buildURLEdit(obj: ICFService, newURL: string): TextDocumentEdit[] {
    const xml = obj.getXMLFile();
    if (xml === undefined) {
      return [];
    }
    const rows = xml.getRawRows();
    for (let i = 0; i < rows.length; i++) {
      const start = rows[i].indexOf("<URL>");
      const end = rows[i].indexOf("</URL>");
      if (start >= 0 && end > start) {
        const range = Range.create(i, start + 5, i, end);
        return [TextDocumentEdit.create({uri: xml.getFilename(), version: 1}, [TextEdit.replace(range, newURL)])];
      }
    }
    return [];
  }

  /** abapGit names a SICF file "<ICF_NAME, lower case, padded to 15><first 25 hex chars of SHA1(URL)>.sicf.xml",
   *  the URL is the one in the XML. Both parts change with the name, keeping the old ones gives an object name
   *  abapGit does not derive from the node. Returns undefined if the files are not in this layout */
  private renameAbapGitFiles(obj: ICFService, newName: string, newURL: string): RenameFile[] | undefined {
    if (newName.length > ICF_NAME_LENGTH) {
      return undefined;
    }
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

/** The URL of the node moved into a namespace. The node is the last segment of the URL. Below
 *  /sap/bc/bsp/ and /sap/bc/ui5_ui5/ an SAP name sits below a node "sap", and a namespaced one
 *  below the namespace instead: /sap/bc/bsp/sap/old/ -> /sap/bc/bsp/ns/leaf/. Elsewhere the
 *  namespace node is added: /sap/bc/old/ -> /sap/bc/ns/leaf/ */
export function namespacedURL(url: string, oldName: string, namespace: string, leaf: string): string | undefined {
  const segments = url.split("/");
  const last = segments.length - (url.endsWith("/") ? 2 : 1);
  if (last < 1 || segments[last].toLowerCase() !== oldName.toLowerCase()) {
    return undefined;
  }
  const before = segments.slice(0, last).join("/").toLowerCase();
  const replaceSap = before.endsWith("/sap/bc/bsp/sap") || before.endsWith("/sap/bc/ui5_ui5/sap");
  const start = replaceSap ? last - 1 : last;
  segments.splice(start, last - start + 1, namespace.toLowerCase(), leaf.toLowerCase());
  return segments.join("/");
}
