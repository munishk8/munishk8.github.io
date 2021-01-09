# Program to find the sum of two numbers using lambda function.

num1 = int(input("Enter first number: "))   # Input num1
num2 = int(input("Enter second number: "))  # Input num2

func = lambda a,b : a+b                   # define lambda function
sum = func(num1,num2)                     # call function
print("Sum of two numbers is: ",sum)        # print result





