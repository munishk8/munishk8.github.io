# Program to swap values of two variables

a = int(input("Enter A: "))     # Input A
b = int(input("Enter B: "))     # Input B

temp = a                        # Store value of 'A' into 'temp'
a = b                           # Store value of 'B' into 'A'
b = temp                        # Store value of 'temp' into 'B'

print("A = ", a)                # print A
print("B = ", b)                # print B

