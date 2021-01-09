# Program to find the factorial of a number using loop

num = int(input("Enter Number: "))  # Input num
factorial = 1                       # initialize factorial to 1

for i in range(2, num+1):           # loop through the length of num
    factorial *= i                  # multiply each 'i' into factorial

print("Factorial is: ", factorial)  # Print Factorial



