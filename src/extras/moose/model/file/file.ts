// automatically generated code, please do not change

import {FamixMseExporter} from "../../famix_mse_exporter";
import {AbstractFile} from "./../file/abstract_file";


export class File extends AbstractFile {


  private fileNumberOfInternalClones: Number;

  // @FameProperty(name = "numberOfInternalClones")
  public getNumberOfInternalClones(): Number {
    return this.fileNumberOfInternalClones;
  }

  public setNumberOfInternalClones(fileNumberOfInternalClones: Number) {
    this.fileNumberOfInternalClones = fileNumberOfInternalClones;
  }

  private fileTotalNumberOfLinesOfText: Number;

  // @FameProperty(name = "totalNumberOfLinesOfText")
  public getTotalNumberOfLinesOfText(): Number {
    return this.fileTotalNumberOfLinesOfText;
  }

  public setTotalNumberOfLinesOfText(fileTotalNumberOfLinesOfText: Number) {
    this.fileTotalNumberOfLinesOfText = fileTotalNumberOfLinesOfText;
  }

  private fileNumberOfKiloBytes: Number;

  // @FameProperty(name = "numberOfKiloBytes")
  public getNumberOfKiloBytes(): Number {
    return this.fileNumberOfKiloBytes;
  }

  public setNumberOfKiloBytes(fileNumberOfKiloBytes: Number) {
    this.fileNumberOfKiloBytes = fileNumberOfKiloBytes;
  }

  private fileNumberOfDuplicatedFiles: Number;

  // @FameProperty(name = "numberOfDuplicatedFiles")
  public getNumberOfDuplicatedFiles(): Number {
    return this.fileNumberOfDuplicatedFiles;
  }

  public setNumberOfDuplicatedFiles(fileNumberOfDuplicatedFiles: Number) {
    this.fileNumberOfDuplicatedFiles = fileNumberOfDuplicatedFiles;
  }

  private fileNumberOfEmptyLinesOfText: Number;

  // @FameProperty(name = "numberOfEmptyLinesOfText")
  public getNumberOfEmptyLinesOfText(): Number {
    return this.fileNumberOfEmptyLinesOfText;
  }

  public setNumberOfEmptyLinesOfText(fileNumberOfEmptyLinesOfText: Number) {
    this.fileNumberOfEmptyLinesOfText = fileNumberOfEmptyLinesOfText;
  }

  private fileNumberOfCharacters: Number;

  // @FameProperty(name = "numberOfCharacters")
  public getNumberOfCharacters(): Number {
    return this.fileNumberOfCharacters;
  }

  public setNumberOfCharacters(fileNumberOfCharacters: Number) {
    this.fileNumberOfCharacters = fileNumberOfCharacters;
  }

  private fileAverageNumberOfCharactersPerLine: Number;

  // @FameProperty(name = "averageNumberOfCharactersPerLine")
  public getAverageNumberOfCharactersPerLine(): Number {
    return this.fileAverageNumberOfCharactersPerLine;
  }

  public setAverageNumberOfCharactersPerLine(fileAverageNumberOfCharactersPerLine: Number) {
    this.fileAverageNumberOfCharactersPerLine = fileAverageNumberOfCharactersPerLine;
  }

  private fileNumberOfLinesOfText: Number;

  // @FameProperty(name = "numberOfLinesOfText")
  public getNumberOfLinesOfText(): Number {
    return this.fileNumberOfLinesOfText;
  }

  public setNumberOfLinesOfText(fileNumberOfLinesOfText: Number) {
    this.fileNumberOfLinesOfText = fileNumberOfLinesOfText;
  }

  private fileNumberOfExternalClones: Number;

  // @FameProperty(name = "numberOfExternalClones")
  public getNumberOfExternalClones(): Number {
    return this.fileNumberOfExternalClones;
  }

  public setNumberOfExternalClones(fileNumberOfExternalClones: Number) {
    this.fileNumberOfExternalClones = fileNumberOfExternalClones;
  }

  private fileNumberOfInternalMultiplications: Number;

  // @FameProperty(name = "numberOfInternalMultiplications")
  public getNumberOfInternalMultiplications(): Number {
    return this.fileNumberOfInternalMultiplications;
  }

  public setNumberOfInternalMultiplications(fileNumberOfInternalMultiplications: Number) {
    this.fileNumberOfInternalMultiplications = fileNumberOfInternalMultiplications;
  }

  private fileNumberOfBytes: Number;

  // @FameProperty(name = "numberOfBytes")
  public getNumberOfBytes(): Number {
    return this.fileNumberOfBytes;
  }

  public setNumberOfBytes(fileNumberOfBytes: Number) {
    this.fileNumberOfBytes = fileNumberOfBytes;
  }



  public getMSE(): string {
    const mse: FamixMseExporter = new FamixMseExporter("FILE.File", this);
    this.addPropertiesToExporter(mse);
    return mse.getMSE();
  }

  public addPropertiesToExporter(exporter: FamixMseExporter) {
    super.addPropertiesToExporter(exporter);
    exporter.addProperty("averageNumberOfCharactersPerLine", this.getAverageNumberOfCharactersPerLine());
    exporter.addProperty("numberOfInternalClones", this.getNumberOfInternalClones());
    exporter.addProperty("totalNumberOfLinesOfText", this.getTotalNumberOfLinesOfText());
    exporter.addProperty("numberOfKiloBytes", this.getNumberOfKiloBytes());
    exporter.addProperty("numberOfDuplicatedFiles", this.getNumberOfDuplicatedFiles());
    exporter.addProperty("numberOfLinesOfText", this.getNumberOfLinesOfText());
    exporter.addProperty("numberOfEmptyLinesOfText", this.getNumberOfEmptyLinesOfText());
    exporter.addProperty("numberOfCharacters", this.getNumberOfCharacters());
    exporter.addProperty("numberOfExternalClones", this.getNumberOfExternalClones());
    exporter.addProperty("numberOfInternalMultiplications", this.getNumberOfInternalMultiplications());
    exporter.addProperty("numberOfBytes", this.getNumberOfBytes());

  }

}

