# Program to find the greatest among three numbers (using if-else)

a = int(input("Enter first number: "))      # Input A
b = int(input("Enter second number: "))     # Input B
c = int(input("Enter third number: "))      # Input C

if a > b:                                   # If A is greater than B
    if a > c:                               # If A is also greater the C
        print("A is greatest.")             # then A is greatest
    else:                                   # otherwise
        print("C is gratest.")              # C is greatest
else:                                       # Otherwise
    if b > c:                               # If B is greater than C
        print("B is greatest.")             # B is greatest
    else:                                   # Otherwise
        print("C is greatest.")             # C is greatest




        