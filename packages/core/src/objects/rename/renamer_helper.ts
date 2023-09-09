import {Range, RenameFile, TextDocumentEdit, TextEdit} from "vscode-languageserver-types";
import {Table} from "../table";
import {ReferenceType} from "../..";
import {Identifier} from "../../abap/4_file_information/_identifier";
import {SyntaxLogic} from "../../abap/5_syntax/syntax";
import {ScopeType} from "../../abap/5_syntax/_scope_type";
import {ISpaghettiScopeNode} from "../../abap/5_syntax/_spaghetti_scope";
import {VirtualPosition} from "../../position";
import {IRegistry} from "../../_iregistry";
import {ABAPObject} from "../_abap_object";
import {AbstractObject} from "../_abstract_object";
import {IObject} from "../_iobject";
import {DataElement} from "../data_element";

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
    return this.replaceRefs(refs, oldName, newName).reverse();
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

  public buildXMLFileEdits(object: AbstractObject, xmlTag: string, oldName: string, newName: string): TextDocumentEdit[] {
    const changes: TextDocumentEdit[] = [];
    const xml = object.getXMLFile();

    if (xml === undefined) {
      return [];
    }

    const tag = xmlTag.toUpperCase();
    const search = "<" + tag + ">" + oldName.toUpperCase() + "</" + tag + ">";
    const length = tag.length + 2;
    const rows = xml.getRawRows();
    for (let i = 0; i < rows.length; i++) {
      const index = rows[i].indexOf(search);
      if (index >= 0) {
        const range = Range.create(i, index + length, i, index + oldName.length + length);
        changes.push(
          TextDocumentEdit.create({uri: xml.getFilename(), version: 1}, [TextEdit.replace(range, newName.toUpperCase())]));
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

    // "zif_abapgit_auth~is_allowed" is a single token so only replace the first part of a token
    for (const r of refs) {
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

}