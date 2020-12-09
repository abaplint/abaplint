import * as LServer from "vscode-languageserver-types";
import {IRegistry} from "../_iregistry";
import {ABAPObject} from "../objects/_abap_object";
import {LSPUtils} from "./_lsp_utils";
import {LSPLookup} from "./_lookup";
import {MethodDefinition} from "../abap/types";
import {SyntaxLogic} from "../abap/5_syntax/syntax";
import {ISpaghettiScopeNode} from "../abap/5_syntax/_spaghetti_scope";
import {ReferenceType} from "../abap/5_syntax/_reference";
import {Identifier} from "../abap/4_file_information/_identifier";

// note: finding implementations might be slow, ie finding method implementations currently searches the full registry

// go to implementation
export class Implementation {
  private readonly reg: IRegistry;

  public constructor(reg: IRegistry) {
    this.reg = reg;
  }

  public find(textDocument: LServer.TextDocumentIdentifier,
              position: LServer.Position): LServer.Location[] {

    const file = LSPUtils.getABAPFile(this.reg, textDocument.uri);
    if (file === undefined) {
      return [];
    }
    const obj = this.reg.getObject(file.getObjectType(), file.getObjectName());
    if (!(obj instanceof ABAPObject)) {
      return [];
    }

    const found = LSPUtils.findCursor(this.reg, {textDocument, position});
    if (found === undefined) {
      return [];
    }

    const lookup = LSPLookup.lookup(found, this.reg, obj);
    if (lookup?.implementation) {
      return [lookup?.implementation];
    }

    if (lookup?.definitionId instanceof MethodDefinition) {
      return this.findMethodImplementations(lookup.definitionId);
    }

    return [];
  }

  private findMethodImplementations(def: MethodDefinition): LServer.Location[] {
    let ret: LServer.Location[] = [];

    // note that this searches _everything_
    for (const obj of this.reg.getObjects()) {
      if (this.reg.isDependency(obj) || !(obj instanceof ABAPObject)) {
        continue;
      }
      const found = this.searchReferences(new SyntaxLogic(this.reg, obj).run().spaghetti.getTop(), def);
      ret = ret.concat(found);
    }

    return ret;
  }

  private searchReferences(scope: ISpaghettiScopeNode, id: Identifier): LServer.Location[] {
    let ret: LServer.Location[] = [];

    for (const r of scope.getData().references) {
      if (r.referenceType === ReferenceType.MethodImplementationReference
          && r.resolved
          && r.resolved.getFilename() === id.getFilename()
          && r.resolved.getStart().equals(id.getStart())) {
        ret.push(LSPUtils.identiferToLocation(r.position));
      }
    }

    for (const c of scope.getChildren()) {
      ret = ret.concat(this.searchReferences(c, id));
    }

    return ret;
  }

}