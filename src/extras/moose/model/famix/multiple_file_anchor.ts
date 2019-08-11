// automatically generated code, please do not change

import {FamixMseExporter} from "../../famix_mse_exporter";
import {FileAnchor} from "./../famix/file_anchor";
import {SourceAnchor} from "./../famix/source_anchor";


export class MultipleFileAnchor extends SourceAnchor {


  private multipleFileAnchorAllFiles: Set<FileAnchor> = new Set();

  // @FameProperty(name = "allFiles")
  // many.getter
  public getAllFiles(): Set<FileAnchor> {
    return this.multipleFileAnchorAllFiles;
  }

  // many.Setter
  public addAllFiles(newAllFiles: FileAnchor) {
    if (!this.multipleFileAnchorAllFiles.has(newAllFiles)) {
      this.multipleFileAnchorAllFiles.add(newAllFiles);
    }
  }



  public getMSE(): string {
    const mse: FamixMseExporter = new FamixMseExporter("FAMIX.MultipleFileAnchor", this);
    this.addPropertiesToExporter(mse);
    return mse.getMSE();
  }

  public addPropertiesToExporter(exporter: FamixMseExporter) {
    super.addPropertiesToExporter(exporter);
    exporter.addProperty("allFiles", this.getAllFiles());

  }

}

