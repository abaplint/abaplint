// automatically generated code, please do not change

import {FamixMseExporter} from "../../famix_mse_exporter";
import {AbstractFileAnchor} from "./../famix/abstract_file_anchor";


export class FileAnchor extends AbstractFileAnchor {


  private fileAnchorEndLine: Number;

  // @FameProperty(name = "endLine")
  public getEndLine(): Number {
    return this.fileAnchorEndLine;
  }

  public setEndLine(fileAnchorEndLine: Number) {
    this.fileAnchorEndLine = fileAnchorEndLine;
  }

  private fileAnchorEndColumn: Number;

  // @FameProperty(name = "endColumn")
  public getEndColumn(): Number {
    return this.fileAnchorEndColumn;
  }

  public setEndColumn(fileAnchorEndColumn: Number) {
    this.fileAnchorEndColumn = fileAnchorEndColumn;
  }

  private fileAnchorStartColumn: Number;

  // @FameProperty(name = "startColumn")
  public getStartColumn(): Number {
    return this.fileAnchorStartColumn;
  }

  public setStartColumn(fileAnchorStartColumn: Number) {
    this.fileAnchorStartColumn = fileAnchorStartColumn;
  }

  private fileAnchorStartLine: Number;

  // @FameProperty(name = "startLine")
  public getStartLine(): Number {
    return this.fileAnchorStartLine;
  }

  public setStartLine(fileAnchorStartLine: Number) {
    this.fileAnchorStartLine = fileAnchorStartLine;
  }



  public getMSE(): string {
    const mse: FamixMseExporter = new FamixMseExporter("FAMIX.FileAnchor", this);
    this.addPropertiesToExporter(mse);
    return mse.getMSE();
  }

  public addPropertiesToExporter(exporter: FamixMseExporter) {
    super.addPropertiesToExporter(exporter);
    exporter.addProperty("endLine", this.getEndLine());
    exporter.addProperty("endColumn", this.getEndColumn());
    exporter.addProperty("startColumn", this.getStartColumn());
    exporter.addProperty("startLine", this.getStartLine());

  }

}

