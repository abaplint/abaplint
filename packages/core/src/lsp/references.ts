import * as LServer from "vscode-languageserver-types";
import {IRegistry} from "../_iregistry";
import {ABAPObject} from "../objects/_abap_object";
import {ITextDocumentPositionParams} from "./_interfaces";
import {LSPUtils} from "./_lsp_utils";
import {Identifier} from "../abap/4_file_information/_identifier";
import {SyntaxLogic} from "../abap/5_syntax/syntax";
import {ISpaghettiScopeNode} from "../abap/5_syntax/_spaghetti_scope";

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

    const locs = this.searchEverything(found.identifier);
    return locs.map(LSPUtils.identiferToLocation);
  }

////////////////////////////////////////////

  private searchEverything(identifier: Identifier): Identifier[] {
    let ret: Identifier[] = [];
    for (const o of this.reg.getObjects()) {
      if (o instanceof ABAPObject) {
        ret = ret.concat(this.traverse(new SyntaxLogic(this.reg, o).run().spaghetti.getTop(), identifier));
      }
    }
    return ret;
  }

  private traverse(node: ISpaghettiScopeNode, identifier: Identifier): Identifier[] {
    let ret: Identifier[] = [];

    for (const r of node.getData().reads) {
      if (r.resolved.equals(identifier)) {
        ret.push(r.position);
      }
    }

    for (const w of node.getData().reads) {
      if (w.resolved.equals(identifier)) {
        ret.push(w.position);
      }
    }

    for (const c of node.getChildren()) {
      ret = ret.concat(this.traverse(c, identifier));
    }

    return ret;
  }

}