# Program to demonstrate mult-level inheritence

class GroundLevel:                  # base class
    def __init__(self):             
        print("Ground Level")        

class FirstLevel(GroundLevel):      # class derived from base class
    def __init__(self):
        print("First Level")

class SecondLevel(FirstLevel):      # class derived from derived class
    def __init__(self):
        print("Second Level")

GroundObj = GroundLevel()           # initialize objects
FirstObj = FirstLevel()
SecondObj = SecondLevel()



