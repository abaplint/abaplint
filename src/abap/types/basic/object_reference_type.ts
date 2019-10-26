import {AbstractType} from "./_abstract_type";

export class ObjectReferenceType extends AbstractType {
  private readonly object: string;

  public constructor(object: string) {
    super();
    this.object = object;
  }

  public getObject() {
    return this.object;
  }

  public toText() {
    return "REF TO " + this.object;
  }

}