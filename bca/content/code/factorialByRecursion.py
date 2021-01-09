# Program to find factorial using recursion

def factorial(num):                     # define function
    if num == 0:                        # check in number is 0
        return 1                        # then return 1
    else:                               # Otherwise
        return num*factorial(num-1)     # call factorial() with new value

n = int(input("Enter number: "))        # Input Number
print(factorial(n))                     # Print Factorial





