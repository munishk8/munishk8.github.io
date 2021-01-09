# Program to create a Python class

class newClass:                 # define class
    m = None                    # define Class Member
    def __init__(self):         # define constructor
        print("Constructor")

    def __del__(self):          # define destructor
        print("Destructor")     
        
    def method(self):           # define method
        print("Method")

obj = newClass()                # initialize object
obj.method()                    # call object method
del obj                         # delete Object


