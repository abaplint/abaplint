import * as LServer from "vscode-languageserver-types";
import {ITextDocumentPositionParams, IRenameParams} from "./_interfaces";
import {LSPUtils} from "./_lsp_utils";
import {IRegistry} from "../_iregistry";
import {ABAPObject} from "../objects/_abap_object";
import {LSPLookup} from "./_lookup";
import {TypedIdentifier} from "../abap/types/_typed_identifier";
import {ClassDefinition, InterfaceDefinition, MethodDefinition} from "../abap/types";
import {References} from "./references";
import {IFile} from "../files/_ifile";
import {Renamer} from "../objects/rename/renamer";
import {Definition} from "./definition";


export enum RenameType {
  GlobalClass = 1,
  Variable = 2,
  GlobalInterface = 3,
  Method = 4,
}

export interface IPrepareResult {
  range: LServer.Range,
  placeholder: string,
  type: RenameType,
  file: IFile,
}

export class Rename {
  private readonly reg: IRegistry;

  public constructor(reg: IRegistry) {
    this.reg = reg;
  }

  public prepareRename(params: ITextDocumentPositionParams): IPrepareResult | undefined {
    const file = LSPUtils.getABAPFile(this.reg, params.textDocument.uri);
    if (file === undefined) {
      return undefined;
    }
    const obj = this.reg.getObject(file.getObjectType(), file.getObjectName());
    if (!(obj instanceof ABAPObject)) {
      return undefined;
    }

    const cursor = LSPUtils.findCursor(this.reg, params);
    if (cursor === undefined) {
      return undefined;
    }

    const range = LSPUtils.tokenToRange(cursor.token);
    const lookup = LSPLookup.lookup(cursor, this.reg, obj);
    if (lookup?.definitionId instanceof TypedIdentifier) {
      return {range, placeholder: cursor.token.getStr(), type: RenameType.Variable, file};
    } else if (lookup?.definitionId instanceof ClassDefinition) {
      return {range, placeholder: cursor.token.getStr(), type: RenameType.GlobalClass, file};
    } else if (lookup?.definitionId instanceof InterfaceDefinition) {
      return {range, placeholder: cursor.token.getStr(), type: RenameType.GlobalInterface, file};
    } else if (lookup?.definitionId instanceof MethodDefinition) {
      return {range, placeholder: cursor.token.getStr(), type: RenameType.Method, file};
    }

    return undefined;
  }

  public rename(params: IRenameParams): LServer.WorkspaceEdit | undefined {
    const prepare = this.prepareRename(params);
    if (prepare === undefined) {
      return undefined;
    }

    switch (prepare.type) {
      case RenameType.GlobalClass:
        return new Renamer(this.reg).buildEdits("CLAS", prepare.placeholder, params.newName);
      case RenameType.GlobalInterface:
        return new Renamer(this.reg).buildEdits("INTF", prepare.placeholder, params.newName);
      case RenameType.Variable:
        return this.renameVariable(params);
      case RenameType.Method:
        return this.renameMethod(params);
      default:
        return undefined;
    }
  }

////

  private renameVariable(params: IRenameParams): LServer.WorkspaceEdit | undefined {
    const workspace: LServer.WorkspaceEdit = {documentChanges: []};
    const refs = new References(this.reg).references(params);
    for (const r of refs) {
      const doc: LServer.VersionedTextDocumentIdentifier = {uri: r.uri, version: 1};
      const edit = LServer.TextDocumentEdit.create(doc, [LServer.TextEdit.replace(r.range, params.newName)]);
      workspace.documentChanges?.push(edit);
    }
    return workspace;
  }

  private renameMethod(params: IRenameParams): LServer.WorkspaceEdit | undefined {
    const workspace: LServer.WorkspaceEdit = {documentChanges: []};
    const refs = new References(this.reg).references(params);
    for (const r of refs) {
      const doc: LServer.VersionedTextDocumentIdentifier = {uri: r.uri, version: 1};
      const edit = LServer.TextDocumentEdit.create(doc, [LServer.TextEdit.replace(r.range, params.newName)]);
      workspace.documentChanges?.push(edit);
    }

    const def = new Definition(this.reg).find(params.textDocument, params.position);
    if (def) {
      const doc: LServer.VersionedTextDocumentIdentifier = {uri: params.textDocument.uri, version: 1};
      const edit = LServer.TextDocumentEdit.create(doc, [LServer.TextEdit.replace(def?.range, params.newName)]);
      workspace.documentChanges?.push(edit);
    }

    return workspace;
  }

}