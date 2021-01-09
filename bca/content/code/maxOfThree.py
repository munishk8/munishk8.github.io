# Program to find the maximun of three number using function.

def findMax(x, y, z):                       # define findMax() function
    if x > y and x > z:
        return x
    elif y > x and y > z:
        return y
    else:
        return z

a = int(input("Enter first number: "))      # Input A
b = int(input("Enter second number: "))     # Input B
c = int(input("Enter third number: "))      # Input C

print(findMax(a, b, c)," is greatest")      # call the function