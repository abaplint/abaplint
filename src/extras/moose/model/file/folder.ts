// automatically generated code, please do not change

import {FamixMseExporter} from "../../famix_mse_exporter";
import {AbstractFile} from "./../file/abstract_file";


export class Folder extends AbstractFile {


  private folderNumberOfFiles: Number;

  // @FameProperty(name = "numberOfFiles")
  public getNumberOfFiles(): Number {
    return this.folderNumberOfFiles;
  }

  public setNumberOfFiles(folderNumberOfFiles: Number) {
    this.folderNumberOfFiles = folderNumberOfFiles;
  }

  private folderNumberOfFolders: Number;

  // @FameProperty(name = "numberOfFolders")
  public getNumberOfFolders(): Number {
    return this.folderNumberOfFolders;
  }

  public setNumberOfFolders(folderNumberOfFolders: Number) {
    this.folderNumberOfFolders = folderNumberOfFolders;
  }

  private folderTotalNumberOfLinesOfText: Number;

  // @FameProperty(name = "totalNumberOfLinesOfText")
  public getTotalNumberOfLinesOfText(): Number {
    return this.folderTotalNumberOfLinesOfText;
  }

  public setTotalNumberOfLinesOfText(folderTotalNumberOfLinesOfText: Number) {
    this.folderTotalNumberOfLinesOfText = folderTotalNumberOfLinesOfText;
  }

  private folderNumberOfLinesOfText: Number;

  // @FameProperty(name = "numberOfLinesOfText")
  public getNumberOfLinesOfText(): Number {
    return this.folderNumberOfLinesOfText;
  }

  public setNumberOfLinesOfText(folderNumberOfLinesOfText: Number) {
    this.folderNumberOfLinesOfText = folderNumberOfLinesOfText;
  }

  private folderNumberOfEmptyLinesOfText: Number;

  // @FameProperty(name = "numberOfEmptyLinesOfText")
  public getNumberOfEmptyLinesOfText(): Number {
    return this.folderNumberOfEmptyLinesOfText;
  }

  public setNumberOfEmptyLinesOfText(folderNumberOfEmptyLinesOfText: Number) {
    this.folderNumberOfEmptyLinesOfText = folderNumberOfEmptyLinesOfText;
  }



  public getMSE(): string {
    const mse: FamixMseExporter = new FamixMseExporter("FILE.Folder", this);
    this.addPropertiesToExporter(mse);
    return mse.getMSE();
  }

  public addPropertiesToExporter(exporter: FamixMseExporter) {
    super.addPropertiesToExporter(exporter);
    exporter.addProperty("numberOfFiles", this.getNumberOfFiles());
    exporter.addProperty("numberOfFolders", this.getNumberOfFolders());
    exporter.addProperty("totalNumberOfLinesOfText", this.getTotalNumberOfLinesOfText());
    exporter.addProperty("numberOfLinesOfText", this.getNumberOfLinesOfText());
    exporter.addProperty("numberOfEmptyLinesOfText", this.getNumberOfEmptyLinesOfText());

  }

}

