import * as Structures from "../structures";
import {IFile} from "./ifile";

export class FunctionGroupModule implements IFile {

  public matchFilename() {
    return /todo/; // todo
  }

  public getStructure() {
    return Structures.ClassImplementation; // todo
  }

}