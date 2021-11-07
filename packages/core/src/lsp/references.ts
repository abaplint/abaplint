import * as LServer from "vscode-languageserver-types";
import {IRegistry} from "../_iregistry";
import {ABAPObject} from "../objects/_abap_object";
import {ITextDocumentPositionParams} from "./_interfaces";
import {LSPUtils} from "./_lsp_utils";
import {Identifier} from "../abap/4_file_information/_identifier";
import {SyntaxLogic} from "../abap/5_syntax/syntax";
import {ISpaghettiScopeNode} from "../abap/5_syntax/_spaghetti_scope";
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
    if (lookup?.definitionId === undefined || lookup?.scope === undefined) {
      return [];
    }

    const locs = this.search(lookup.definitionId, lookup.scope);
    return locs.map(LSPUtils.identiferToLocation);
  }

// todo, cleanup this mehtod, some of the method parameters are not used anymore?
  public search(identifier: Identifier, node: ISpaghettiScopeNode, exitAfterFound = false, removeDuplicates = true): Identifier[] {
    let ret: Identifier[] = [];

    // todo, this first assumes that the identifier is a variable?
    const stype = node.getIdentifier().stype;
    if (stype === ScopeType.Method || stype === ScopeType.FunctionModule || stype === ScopeType.Form) {
      ret = this.findReferences(node, identifier);
    }
    if (ret.length > 1 && exitAfterFound === true) {
      return ret;
    }

    for (const o of this.reg.getObjects()) {
      if (o instanceof ABAPObject) {
        if (this.reg.isDependency(o)) {
          continue; // do not search in dependencies
        }
        ret.push(...this.findReferences(new SyntaxLogic(this.reg, o).run().spaghetti.getTop(), identifier));
      }
    }

    // remove duplicates, might be a changing(read and write) position
    if (removeDuplicates === true) {
      return this.removeDuplicates(ret);
    } else {
      return ret;
    }
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

  private findReferences(node: ISpaghettiScopeNode, identifier: Identifier): Identifier[] {
    const ret: Identifier[] = [];

    if (node.getIdentifier().stype !== ScopeType.BuiltIn) {
      const upper = identifier.getName().toUpperCase();

      // this is for finding the definitions
      const vars = node.getData().vars;
      const vid = vars[upper];
      if (vid?.equals(identifier)) {
        ret.push(vid);
      }

      // this is for finding the definitions
      const types = node.getData().types;
      const tid = types[upper];
      if (tid?.equals(identifier)) {
        ret.push(tid);
      }

      for (const r of node.getData().references) {
        if (r.resolved?.equals(identifier)) {
          ret.push(r.position);
        }
      }
    }

    for (const c of node.getChildren()) {
      ret.push(...this.findReferences(c, identifier));
    }

    return ret;
  }

}