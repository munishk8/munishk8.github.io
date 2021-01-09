# Program to print the fibonacci series using loop

n = int(input("Enter n: "))
a = 0                       # Initialize a
b = 1                       # Initialize b

for i in range(2,n+2):        # Loop upto n
    c = a + b               # add previous 2 element
    a = b                   # change a to b
    b = c                   # change b to c
    print(a)                # Print Element



