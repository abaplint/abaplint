import {AbstractObject} from "./_abstract_object";

export class PackageInterface extends AbstractObject {

  public getType(): string {
    return "PINF";
  }

}