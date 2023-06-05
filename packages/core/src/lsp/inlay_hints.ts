import * as LServer from "vscode-languageserver-types";
import {IRegistry} from "../_iregistry";
import {LSPUtils} from "./_lsp_utils";
import {SyntaxLogic} from "../abap/5_syntax/syntax";
import {ABAPObject} from "../objects/_abap_object";
import {ISpaghettiScopeNode} from "../abap/5_syntax/_spaghetti_scope";
import {ReferenceType, IReference} from "../abap/5_syntax/_reference";
import {TypedIdentifier} from "../abap/types/_typed_identifier";
import {ClassDefinition} from "../abap/types";

export type InlayHintsSettings = {
  inferredTypes: boolean,
};

export class InlayHints {
  private readonly reg: IRegistry;

  public constructor(reg: IRegistry) {
    this.reg = reg;
  }

  public list(textDocument: LServer.TextDocumentIdentifier, settings: InlayHintsSettings = {inferredTypes: true}): LServer.InlayHint[] {
    const file = LSPUtils.getABAPFile(this.reg, textDocument.uri);
    if (file === undefined) {
      return [];
    }

    const obj = this.reg.findObjectForFile(file);
    if (obj === undefined || !(obj instanceof ABAPObject)) {
      return [];
    }
    const top = new SyntaxLogic(this.reg, obj).run().spaghetti.getTop();

    const ret: LServer.InlayHint[] = [];

    if (settings.inferredTypes === true) {
      const implicit = this.findImplicitReferences(top);
      for (const i of implicit) {

        let label: string | undefined = undefined;
        if (i.resolved instanceof TypedIdentifier) {
          label = i.resolved.getType().toABAP();
        } else if (i.resolved instanceof ClassDefinition) {
          label = "TYPE REF TO " + i.resolved.getName();
        }

        if (label === undefined) {
          continue;
        }

        ret.push({
          label: label,
          tooltip: "Inferred type",
          kind: LServer.InlayHintKind.Type,
          paddingLeft: true,
          paddingRight: true,
          position: LSPUtils.positionToLS(i.position.getEnd()),
        });
      }
    }

    return ret;
  }

  private findImplicitReferences(node: ISpaghettiScopeNode): IReference[] {
    const ret: IReference[] = [];

    for (const r of node.getData().references) {
      if (r.referenceType === ReferenceType.InferredType) {
        ret.push(r);
      }
    }

    for (const c of node.getChildren()) {
      ret.push(...this.findImplicitReferences(c));
    }

    return ret;
  }

}