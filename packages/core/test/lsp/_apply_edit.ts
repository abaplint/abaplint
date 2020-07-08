import * as LServer from "vscode-languageserver-types";
import {IRegistry} from "../../src/_iregistry";
import {MemoryFile} from "../../src/files/memory_file";

// applys LServer WorkspaceEdit to abaplint Registry
export class ApplyWorkSpaceEdit {
  private readonly reg: IRegistry;

  public constructor(reg: IRegistry) {
    this.reg = reg;
  }

  public apply(edit: LServer.WorkspaceEdit) {
    if (edit.changes) {
      throw new Error("ApplyWorkSpaceEdit, expected documentChanges instead");
    } else if (edit.documentChanges === undefined) {
      return;
    }

    for (const e of edit.documentChanges) {
      if (LServer.TextDocumentEdit.is(e)) {
        this.applyEdit(e as LServer.TextDocumentEdit);
      } else if (LServer.RenameFile.is(e)) {
        this.applyRename(e as LServer.RenameFile);
      } else if (LServer.CreateFile.is(e)) {
        throw new Error("ApplyWorkSpaceEdit, CreateFile not handled");
      } else if (LServer.DeleteFile.is(e)) {
        throw new Error("ApplyWorkSpaceEdit, DeleteFile not handled");
      } else {
        throw new Error("ApplyWorkSpaceEdit, Unknown type");
      }
    }

    this.reg.parse();
  }

  private applyEdit(edit: LServer.TextDocumentEdit) {
    const old = this.reg.getFileByName(edit.textDocument.uri);
    if (old === undefined) {
      throw new Error("applyRename, file not found");
    }

    const rows = old.getRawRows();

    for (const e of edit.edits) {
      if (e.range.start.line !== e.range.end.line) {
        throw new Error("applyEdit, unsupported range, expect same line");
      }

      const line = rows[e.range.start.line];
      rows[e.range.start.line] = line.substr(0, e.range.start.character) + e.newText + line.substr(e.range.end.character);
    }

    this.reg.updateFile(new MemoryFile(edit.textDocument.uri, rows.join("\n")));
  }

  private applyRename(rename: LServer.RenameFile) {
    const old = this.reg.getFileByName(rename.oldUri);
    if (old === undefined) {
      throw new Error("applyRename, file not found");
    }

    this.reg.removeFile(old);
    this.reg.addFile(new MemoryFile(rename.newUri, old.getRaw()));
  }

}