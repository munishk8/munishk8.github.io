# Program to find the greatest among three numbers (using if-elif-else)

a = int(input("Enter first number: "))      # Input A
b = int(input("Enter second number: "))     # Input B
c = int(input("Enter third number: "))      # Input C

if a > b and a > c:                         # If A is grater than both B and C
    print("A is greatest.")                 # then A is greatest
elif b > a and b > c:                       # If B is greater than both A and C
    print("B is greatest.")                 # Then B is greatest
else:                                       # Otherwise
    print("C is greatest.")                 # C is greatest




        