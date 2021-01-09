# Program to use Python Method overriding

class baseClass:                    # define base class
    def Method(self):               # define a method
        print("Old Method")

class newClass(baseClass):          # define derived class
    def Method(self):               # override inherited method
        print("Overridden Method")

baseObj = baseClass()               # initialize baseClass object
newObj = newClass()                 # initialize newClass object
newObj.Method()                     # Call overridden method




