import {AbstractType} from "./_abstract_type";

export class DataReference implements AbstractType {

  public toText() {
    return "data reference";
  }

  public isGeneric() {
    return false;
  }
}