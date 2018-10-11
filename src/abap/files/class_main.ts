import * as Structures from "../structures";
import {IFile} from "./ifile";

export class ClassMain implements IFile {

  public matchFilename() {
    return /todo/; // todo
  }

  public getStructure() {
    return Structures.ClassGlobal; // todo
  }

}