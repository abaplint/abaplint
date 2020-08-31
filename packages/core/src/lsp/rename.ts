import * as LServer from "vscode-languageserver-types";
import {ITextDocumentPositionParams, IRenameParams} from "./_interfaces";
import {LSPUtils} from "./_lsp_utils";
import {IRegistry} from "../_iregistry";
import {RenameGlobalClass} from "./rename_global_class";
import {ABAPObject} from "../objects/_abap_object";
import {LSPLookup} from "./_lookup";
import {TypedIdentifier} from "../abap/types/_typed_identifier";
import {ClassDefinition} from "../abap/types";
import {References} from "./references";
import {IFile} from "../files/_ifile";


export enum RenameType {
  GlobalClass = 1,
  Variable = 2,
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

    const start = cursor.token.getStart();
    const end = cursor.token.getEnd();
    const range = LServer.Range.create(start.getRow() - 1, start.getCol() - 1, end.getRow() - 1, end.getCol() - 1);

    const lookup = LSPLookup.lookup(cursor, this.reg, obj);
    if (lookup?.definitionId instanceof TypedIdentifier) {
      return {range, placeholder: cursor.token.getStr(), type: RenameType.Variable, file};
    } else if (lookup?.definitionId instanceof ClassDefinition) {
      return {range, placeholder: cursor.token.getStr(), type: RenameType.GlobalClass, file};
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
        return new RenameGlobalClass(this.reg).run(prepare.placeholder, params.newName);
      case RenameType.Variable:
      {
        const workspace: LServer.WorkspaceEdit = {documentChanges: []};
        const refs = new References(this.reg).references(params);
        for (const r of refs) {
          const doc: LServer.VersionedTextDocumentIdentifier = {uri: r.uri, version: 1};
          const edit = LServer.TextDocumentEdit.create(doc, [LServer.TextEdit.replace(r.range, params.newName)]);
          workspace.documentChanges?.push(edit);
        }
        return workspace;
      }
      default:
        return undefined;
    }

  }

}