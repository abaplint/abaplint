import * as LServer from "vscode-languageserver-types";
import {IRegistry} from "../_iregistry";
import {ABAPObject} from "../objects/_abap_object";
import {ITextDocumentPositionParams} from "./_interfaces";
import {LSPUtils} from "./_lsp_utils";
import {Identifier} from "../abap/4_file_information/_identifier";
import {SyntaxLogic} from "../abap/5_syntax/syntax";
import {ISpaghettiScopeNode, ReferenceType} from "../abap/5_syntax/_spaghetti_scope";
import {LSPLookup} from "./_lookup";
import {ScopeType} from "../abap/5_syntax/_scope_type";

export class References {
  private readonly reg: IRegistry;

  public constructor(reg: IRegistry) {
    this.reg = reg;
  }

  public references(pos: ITextDocumentPositionParams): LServer.Location[] {
    const file = LSPUtils.getABAPFile(this.reg, pos.textDocument.uri);
    if (file === undefined) {
      return [];
    }
    const obj = this.reg.getObject(file.getObjectType(), file.getObjectName());
    if (!(obj instanceof ABAPObject)) {
      return [];
    }

    const found = LSPUtils.findCursor(this.reg, pos);
    if (found?.identifier === undefined) {
      return [];
    }

    const lookup = LSPLookup.lookup(found, this.reg, obj);
    if (lookup?.definitionId === undefined) {
      return [];
    }

    const locs = this.searchEverything(lookup.definitionId);
    return locs.map(LSPUtils.identiferToLocation);
  }

  public searchEverything(identifier: Identifier): Identifier[] {
    let ret: Identifier[] = [];
    // todo, take scope into account
    for (const o of this.reg.getObjects()) {
      if (o instanceof ABAPObject) {
        ret = ret.concat(this.traverse(new SyntaxLogic(this.reg, o).run().spaghetti.getTop(), identifier));
      }
    }
    // remove duplicates, might be a changing(read and write) position
    return this.removeDuplicates(ret);
  }

////////////////////////////////////////////

  private removeDuplicates(arr: Identifier[]): Identifier[] {
    const values: any = {};
    return arr.filter(item => {
      const val = item.getStart().getCol() + "_" + item.getStart().getRow() + "_" + item.getFilename();
      const exists = values[val];
      values[val] = true;
      return !exists;
    });
  }

  private traverse(node: ISpaghettiScopeNode, identifier: Identifier): Identifier[] {
    let ret: Identifier[] = [];

    if (node.getIdentifier().stype !== ScopeType.BuiltIn) {
      for (const v of node.getData().vars) {
        if (v.identifier.equals(identifier)) {
          ret.push(v.identifier);
        }
      }

      for (const r of node.getData().references) {
        if (r.referenceType === ReferenceType.DataReadReference && r.resolved.equals(identifier)) {
          ret.push(r.position);
        }
      }

      for (const w of node.getData().references) {
        if (w.referenceType === ReferenceType.DataWriteReference && w.resolved.equals(identifier)) {
          ret.push(w.position);
        }
      }
    }

    for (const c of node.getChildren()) {
      ret = ret.concat(this.traverse(c, identifier));
    }

    return ret;
  }

}