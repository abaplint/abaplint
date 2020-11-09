import {Range, RenameFile, TextDocumentEdit, TextEdit} from "vscode-languageserver-types";
import {Identifier} from "../../abap/4_file_information/_identifier";
import {SyntaxLogic} from "../../abap/5_syntax/syntax";
import {ScopeType} from "../../abap/5_syntax/_scope_type";
import {ISpaghettiScopeNode} from "../../abap/5_syntax/_spaghetti_scope";
import {VirtualPosition} from "../../position";
import {IRegistry} from "../../_iregistry";
import {ABAPObject} from "../_abap_object";
import {AbstractObject} from "../_abstract_object";


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

  public buildXMLFileEdits(clas: AbstractObject, xmlTag: string, oldName: string, newName: string): TextDocumentEdit[] {
    const changes: TextDocumentEdit[] = [];
    const xml = clas.getXMLFile();

    if (xml === undefined) {
      return [];
    }

    const tag = xmlTag.toUpperCase();
    const search = "<" + tag + ">" + oldName.toUpperCase() + "</" + tag + ">";
    const rows = xml.getRawRows();
    for (let i = 0; i < rows.length; i++) {
      const index = rows[i].indexOf(search);
      if (index >= 0) {
        const range = Range.create(i, index + 9, i, index + oldName.length + 9);
        changes.push(
          TextDocumentEdit.create({uri: xml.getFilename(), version: 1}, [TextEdit.replace(range, newName.toUpperCase())]));
      }
    }

    return changes;
  }

  public renameFiles(obj: ABAPObject, oldName: string, name: string): RenameFile[] {
    const list: RenameFile[] = [];

    const newName = name.toLowerCase().replace(/\//g, "%23");

    for (const f of obj.getFiles()) {
// todo, this is not completely correct, ie. if the URI contains the same directory name as the object name
      const newFilename = f.getFilename().replace(oldName.toLowerCase(), newName.toLowerCase());
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
        TextDocumentEdit.create({uri: r.getFilename(), version: 1}, [TextEdit.replace(range, newName)]));
    }
    return changes;
  }

  private findReferences(node: ISpaghettiScopeNode, identifier: Identifier): Identifier[] {
    let ret: Identifier[] = [];

    if (node.getIdentifier().stype !== ScopeType.BuiltIn) {
      for (const r of node.getData().references) {
        if (r.resolved?.equals(identifier)
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