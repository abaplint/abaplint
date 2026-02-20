import {Range, RenameFile, TextDocumentEdit, TextEdit} from "vscode-languageserver-types";
import {Table} from "../table";
import {Identifier} from "../../abap/4_file_information/_identifier";
import {SyntaxLogic} from "../../abap/5_syntax/syntax";
import {ScopeType} from "../../abap/5_syntax/_scope_type";
import {ISpaghettiScopeNode} from "../../abap/5_syntax/_spaghetti_scope";
import {VirtualPosition} from "../../virtual_position";
import {IRegistry} from "../../_iregistry";
import {ABAPObject} from "../_abap_object";
import {AbstractObject} from "../_abstract_object";
import {IObject} from "../_iobject";
import {DataElement} from "../data_element";
import {ICFService} from "../icf_service";
import {ReferenceType} from "../../abap/5_syntax/_reference";

export class RenamerHelper {
  private readonly reg: IRegistry;

  public constructor(reg: IRegistry) {
    this.reg = reg;
  }

  public renameReferences(id: Identifier | undefined, oldName: string, newName: string): TextDocumentEdit[] {
    if (id === undefined) {
      throw new Error("renameReferences, no main identifier found");
    }
    let refs: Identifier[] = [];
    for (const o of this.reg.getObjects()) {
      if (o instanceof ABAPObject) {
        if (this.reg.isDependency(o)) {
          continue; // do not search in dependencies
        }
        refs = refs.concat(this.findReferences(new SyntaxLogic(this.reg, o).run().spaghetti.getTop(), id));
      }
    }

    // start with the last reference in the file first, if there are multiple refs per line
    // sort refs by position descending (row desc, then col desc) so edits don't corrupt positions
    refs.sort((a, b) => {
      const rowDiff = b.getStart().getRow() - a.getStart().getRow();
      if (rowDiff !== 0) {
        return rowDiff;
      }
      return b.getStart().getCol() - a.getStart().getCol();
    });
    return this.replaceRefs(refs, oldName, newName);
  }

  public renameDDICCodeReferences(obj: IObject, oldName: string, newName: string): TextDocumentEdit[] {
    const changes: TextDocumentEdit[] = [];
    const used = this.reg.getDDICReferences().listWhereUsed(obj);

    for (const u of used) {
      if (u.token === undefined || u.filename === undefined) {
        continue;
      }
      const range = Range.create(
        u.token.getStart().getRow() - 1,
        u.token.getStart().getCol() - 1,
        u.token.getStart().getRow() - 1,
        u.token.getStart().getCol() - 1 + oldName.length);
      changes.push(
        TextDocumentEdit.create({uri: u.filename, version: 1}, [TextEdit.replace(range, newName.toLowerCase())]));
    }
    return changes;
  }

  public renameDDICTABLReferences(obj: IObject, oldName: string, newName: string): TextDocumentEdit[] {
    const changes: TextDocumentEdit[] = [];
    const used = this.reg.getDDICReferences().listWhereUsed(obj);
    const handled: {[name: string]: boolean} = {};

    for (const u of used) {
      if (u.type !== "TABL" || handled[u.name.toUpperCase()] === true) {
        // a TABL might reference the object multiple times, but they are all fixes in one call to buildXMLFileEdits
        continue;
      }
      const tabl = this.reg.getObject(u.type, u.name) as Table | undefined;
      if (tabl === undefined) {
        continue;
      }

      changes.push(...this.buildXMLFileEdits(tabl, "ROLLNAME", oldName, newName));
      handled[u.name.toUpperCase()] = true;
    }
    return changes;
  }

  public renameDDICDTELReferences(obj: IObject, oldName: string, newName: string): TextDocumentEdit[] {
    const changes: TextDocumentEdit[] = [];
    const used = this.reg.getDDICReferences().listWhereUsed(obj);

    for (const u of used) {
      if (u.type !== "DTEL") {
        continue;
      }
      const tabl = this.reg.getObject(u.type, u.name) as DataElement | undefined;
      if (tabl === undefined) {
        continue;
      }

      changes.push(...this.buildXMLFileEdits(tabl, "DOMNAME", oldName, newName));
    }
    return changes;
  }

  public renameDDICTTYPReferences(obj: IObject, oldName: string, newName: string): TextDocumentEdit[] {
    const changes: TextDocumentEdit[] = [];
    const used = this.reg.getDDICReferences().listWhereUsed(obj);

    for (const u of used) {
      if (u.type !== "TTYP") {
        continue;
      }
      const tabl = this.reg.getObject(u.type, u.name) as DataElement | undefined;
      if (tabl === undefined) {
        continue;
      }

      changes.push(...this.buildXMLFileEdits(tabl, "ROWTYPE", oldName, newName));
    }
    return changes;
  }

  public renameDDICAUTHReferences(obj: IObject, oldName: string, newName: string): TextDocumentEdit[] {
    const changes: TextDocumentEdit[] = [];
    const used = this.reg.getDDICReferences().listWhereUsed(obj);

    for (const u of used) {
      if (u.type !== "AUTH") {
        continue;
      }
      const tabl = this.reg.getObject(u.type, u.name) as DataElement | undefined;
      if (tabl === undefined) {
        continue;
      }

      changes.push(...this.buildXMLFileEdits(tabl, "ROLLNAME", oldName, newName));
    }
    return changes;
  }

  public buildXMLFileEdits(
    object: AbstractObject,
    xmlTag: string,
    oldName: string,
    newName: string,
    useLowerCase: boolean = false
  ): TextDocumentEdit[] {
    const changes: TextDocumentEdit[] = [];
    const xml = object.getXMLFile();

    if (xml === undefined) {
      return [];
    }
    const originalValue = useLowerCase ? oldName.toLowerCase() : oldName.toUpperCase();
    const replacementValue = useLowerCase ? newName.toLowerCase() : newName.toUpperCase();

    const tag = xmlTag.toUpperCase();
    const search = "<" + tag + ">" + originalValue + "</" + tag + ">";
    const length = tag.length + 2;
    const rows = xml.getRawRows();
    for (let i = 0; i < rows.length; i++) {
      const index = rows[i].indexOf(search);
      if (index >= 0) {
        const range = Range.create(i, index + length, i, index + originalValue.length + length);
        changes.push(
          TextDocumentEdit.create({uri: xml.getFilename(), version: 1}, [TextEdit.replace(range, replacementValue)]));
      }
    }

    return changes;
  }

  public buildURLFileEdits(
    object: AbstractObject,
    oldName: string,
    newName: string
  ): TextDocumentEdit[] {
    const changes: TextDocumentEdit[] = [];
    const xml = object.getXMLFile();

    if (xml === undefined) {
      return [];
    }

    const oldNameLower = oldName.toLowerCase();
    const newNameLower = newName.toLowerCase();
    const rows = xml.getRawRows();

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const urlTagStart = row.indexOf("<URL>");
      if (urlTagStart === -1) {
        continue;
      }

      const urlTagEnd = row.indexOf("</URL>");
      if (urlTagEnd === -1) {
        continue;
      }

      const urlContent = row.substring(urlTagStart + 5, urlTagEnd);
      const updatedUrl = urlContent.replace(oldNameLower, newNameLower);

      if (updatedUrl !== urlContent) {
        const range = Range.create(i, urlTagStart + 5, i, urlTagEnd);
        changes.push(
          TextDocumentEdit.create({uri: xml.getFilename(), version: 1}, [TextEdit.replace(range, updatedUrl)]));
      }
    }

    return changes;
  }

  public renameFiles(obj: IObject, oldName: string, name: string): RenameFile[] {
    const list: RenameFile[] = [];

    const newName = name.toLowerCase().replace(/\//g, "#");
    oldName = oldName.toLowerCase().replace(/\//g, "#");

    for (const f of obj.getFiles()) {
// todo, this is not completely correct, ie. if the URI contains the same directory name as the object name
      const newFilename = f.getFilename().replace(oldName, newName);
      list.push(RenameFile.create(f.getFilename(), newFilename));
    }

    return list;
  }

////////////////////////

  private replaceRefs(refs: Identifier[], oldName: string, newName: string): TextDocumentEdit[] {
    const changes: TextDocumentEdit[] = [];
    const seen = new Set<string>();

    // "zif_abapgit_auth~is_allowed" is a single token so only replace the first part of a token
    for (const r of refs) {
      const key = r.getFilename() + ":" + r.getStart().getRow() + ":" + r.getStart().getCol();
      if (seen.has(key)) {
        continue;
      }
      seen.add(key);
      const range = Range.create(
        r.getStart().getRow() - 1,
        r.getStart().getCol() - 1,
        r.getStart().getRow() - 1,
        r.getStart().getCol() - 1 + oldName.length);
      changes.push(
        TextDocumentEdit.create({uri: r.getFilename(), version: 1}, [TextEdit.replace(range, newName.toLowerCase())]));
    }
    return changes;
  }

  private findReferences(node: ISpaghettiScopeNode, identifier: Identifier): Identifier[] {
    let ret: Identifier[] = [];

    if (node.getIdentifier().stype !== ScopeType.BuiltIn) {
      for (const r of node.getData().references) {
        if (r.referenceType === ReferenceType.ConstructorReference) {
          continue;
        }

        if (r.resolved?.equals(identifier)
            && r.referenceType !== ReferenceType.InferredType
            && !(r.position.getStart() instanceof VirtualPosition)) {
          ret.push(r.position);
        }
      }
    }

    for (const c of node.getChildren()) {
      ret = ret.concat(this.findReferences(c, identifier));
    }

    return ret;
  }

  public renameICFServiceHandlerReferences(oldName: string, newName: string): TextDocumentEdit[] {
    const changes: TextDocumentEdit[] = [];
    const icfServices = this.reg.getObjectsByType("SICF");

    for (const service of icfServices) {
      const ICFService = service as ICFService;
      const xmlFile = service.getXMLFile();
      if (xmlFile === undefined) {
        continue;
      }
      changes.push(...this.buildXMLFileEdits(ICFService, "ICFHANDLER", oldName, newName));
    }
    return changes;
  }
}