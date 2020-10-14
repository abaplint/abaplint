import {Range, TextDocumentEdit, TextEdit} from "vscode-languageserver-types";
import {Identifier} from "../../abap/4_file_information/_identifier";
import {SyntaxLogic} from "../../abap/5_syntax/syntax";
import {ScopeType} from "../../abap/5_syntax/_scope_type";
import {ISpaghettiScopeNode} from "../../abap/5_syntax/_spaghetti_scope";
import {IRegistry} from "../../_iregistry";
import {ABAPObject} from "../_abap_object";


export class RenamerHelper {
  private readonly reg: IRegistry;

  public constructor(reg: IRegistry) {
    this.reg = reg;
  }

  public renameReferences(id: Identifier, newName: string): TextDocumentEdit[] {
    let refs: Identifier[] = [];
    for (const o of this.reg.getObjects()) {
      if (o instanceof ABAPObject) {
        if (this.reg.isDependency(o)) {
          continue; // do not search in dependencies
        }
        refs = refs.concat(this.findReferences(new SyntaxLogic(this.reg, o).run().spaghetti.getTop(), id));
      }
    }

    return this.replaceRefs(refs, newName);
  }

////////////////////////

  private replaceRefs(refs: Identifier[], newName: string): TextDocumentEdit[] {
    const changes: TextDocumentEdit[] = [];

    for (const r of refs) {
      const range = Range.create(
        r.getStart().getRow() - 1,
        r.getStart().getCol() - 1,
        r.getStart().getRow() - 1,
        r.getStart().getCol() - 1 + r.getToken().getStr().length);
      changes.push(
        TextDocumentEdit.create({uri: r.getFilename(), version: 1}, [TextEdit.replace(range, newName.toUpperCase())]));
    }
    return changes;
  }

  private findReferences(node: ISpaghettiScopeNode, identifier: Identifier): Identifier[] {
    let ret: Identifier[] = [];

    if (node.getIdentifier().stype !== ScopeType.BuiltIn) {
      for (const r of node.getData().references) {
        if (r.resolved?.equals(identifier)) {
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