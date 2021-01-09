# Program to demonstrate the concept of inheritence

class baseClass:                # define base class
    def method(self):           # define a method
        print("Method")

class newClass(baseClass):      # define inherited class
    def newMethod(self):        # add a new method
        print("New Method")

baseObj = baseClass()           # initialize baseClass object
newObj = newClass()             # initialize newClass object
baseObj.method()                # call baseObj method()
newObj.method()                 # call newObj method()
newObj.newMethod()              # call newObj newMethod()



