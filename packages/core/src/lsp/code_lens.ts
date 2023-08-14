import * as LServer from "vscode-languageserver-types";
import {IRegistry} from "../_iregistry";
import {LSPUtils} from "./_lsp_utils";
import {SyntaxLogic} from "../abap/5_syntax/syntax";
import {ABAPObject} from "../objects/_abap_object";
import {MessageClass} from "../objects";
import {ISpaghettiScopeNode} from "../abap/5_syntax/_spaghetti_scope";
import {IReference, ReferenceType} from "../abap/5_syntax/_reference";
import {MethodDefinition} from "../abap/types";

export type CodeLensSettings = {
  messageText: boolean,
  dynamicExceptions: boolean,
};

export class CodeLens {
  private readonly reg: IRegistry;

  public constructor(reg: IRegistry) {
    this.reg = reg;
  }

  public list(textDocument: LServer.TextDocumentIdentifier,
              settings: CodeLensSettings = {messageText: true, dynamicExceptions: true}): LServer.CodeLens[] {
    const file = LSPUtils.getABAPFile(this.reg, textDocument.uri);
    if (file === undefined) {
      return [];
    }

    const obj = this.reg.findObjectForFile(file);
    if (obj === undefined || !(obj instanceof ABAPObject)) {
      return [];
    }
    const top = new SyntaxLogic(this.reg, obj).run().spaghetti.getTop();

    const ret: LServer.CodeLens[] = [];

    if (settings.messageText === true) {
      const list = this.reg.getMSAGReferences().listByFilename(file.getFilename());
      for (const l of list) {
        const msag = this.reg.getObject("MSAG", l.messageClass) as MessageClass | undefined;
        if (msag === undefined) {
          continue;
        }
        const text = msag.getByNumber(l.number)?.getMessage();
        if (text === undefined) {
          continue;
        }
        ret.push({
          range: LSPUtils.tokenToRange(l.token),
          command: LServer.Command.create(text, "")});
      }
    }
    if (settings.dynamicExceptions === true) {
      for (const ref of this.findMethodReferences(top)) {
        if (!(ref.resolved instanceof MethodDefinition)) {
          continue;
        }
        let text = "";
        for (const e of ref.resolved.getExceptions()) {
          if (this.isDynamicException(e, top)) {
            if (text === "") {
              text = "Dynamic Exceptions: ";
            } else {
              text += " & ";
            }
            text += e.toUpperCase();
          }
        }
        if (text !== "") {
          ret.push({
            range: LSPUtils.tokenToRange(ref.resolved.getToken()),
            command: LServer.Command.create(text, "")});
        }
      }
    }

    return ret;
  }

  private isDynamicException(name: string, top: ISpaghettiScopeNode) {
    // todo: this method only works with global exceptions?
    let current: string | undefined = name;
    while (current !== undefined) {
      if (current.toUpperCase() === "CX_DYNAMIC_CHECK") {
        return true;
      }
      current = top.findClassDefinition(current)?.getSuperClass();
    }
    return false;
  }

  private findMethodReferences(node: ISpaghettiScopeNode): IReference[] {
    const ret: IReference[] = [];

    for (const r of node.getData().references) {
      if (r.referenceType === ReferenceType.MethodReference) {
        ret.push(r);
      }
    }

    for (const c of node.getChildren()) {
      ret.push(...this.findMethodReferences(c));
    }

    return ret;
  }

}