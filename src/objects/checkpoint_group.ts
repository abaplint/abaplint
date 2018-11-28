import {AbstractObject} from "./_abstract_object";

export class CheckpointGroup extends AbstractObject {

  public getType(): string {
    return "ACID";
  }

}