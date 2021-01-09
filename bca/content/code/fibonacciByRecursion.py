# Program to print the fibonacci series using recursive method

a, b = 0, 1                     # Initialize a and b

def fibonacci(n):               # define function
    if n == 0: pass             # Check if n is 0 then exit
    else:                       # Otherwise
        global a, b             # Access a and b
        print(a)                # print element
        c = a + b               # add a and b as next element
        a = b                   # change a to b
        b = c                   # cahnge b to c
        fibonacci(n-1)          # again call fibonacci() with new value

num = int(input("Enter n: "))   # Input n
fibonacci(num)                  # call function








