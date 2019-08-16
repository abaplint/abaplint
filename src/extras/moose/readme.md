
## Documentations
 * a good description about the MSE file format and the FAMIX model https://www.researchgate.net/publication/265428652
 

## Conversion from ABAP to the FAMIX meta model

* **Directories:** is converted into a FAMIX.package and a FAMIX.namespace. The namespace conversion is not correct,
but gives the possibility to use the "system nesting map".
* **Interface:** is converted into a FAMIX.class with attribute isInterface = true.
* **Class:** converted into a FAMIX.class with superclass and subclasses
  * **Attribute**: converted into a FAMIX.Attribute with modifiers.
  * **Method:** converted into a FAMIX.method with a parent FAMIX.class 
    * Parameters: only the returning parameter. If parameter is type of a class or interface,
    it will be linked as declaredType.
