# Program to use multiple inheritence

class Father:                   # First parent class
    type1 = "father"

class Mother:                   # Second Parent Class
    type2 = "mother"

class Child(Father, Mother):    # Class derived from more than one class
    type3 = "kid"

obj = Child()                   # Initialize Object
print(obj.type3)                # Child class Properties
print(obj.type1)                # Father class properties
print(obj.type2)                # Mother class properties



