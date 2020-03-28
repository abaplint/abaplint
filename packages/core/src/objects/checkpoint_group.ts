import {AbstractObject} from "./_abstract_object";

export class CheckpointGroup extends AbstractObject {

  public getType(): string {
    return "ACID";
  }

  public getAllowedNaming() {
    return { // todo, verify
      maxLength: 30,
      allowNamespace: true,
    };
  }
}