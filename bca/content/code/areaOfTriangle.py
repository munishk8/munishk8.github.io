# Program to calculate the area of a triangle

a = int(input("Enter side A: "))        # Input side A
b = int(input("Enter side B: "))        # Input side B
c = int(input("Enter side C: "))        # Input side C

s = (a+b+c)/2                           # calculate 'S'

area = ( s*(s-a)*(s-b)*(s-c) )**0.5     # calculate Area

print("Area of triangle is: ",area)     # Print Area


