# Program to find the reverse of a number using loop

num = int(input("Enter number: "))          # Input Number
reverse = 0                                 # Initialize reverse

while num > 0:                              # Loop until num > 0 
    remainder = num % 10                    # divide num by 10 and store remainder
    reverse = (reverse * 10) + remainder    # calculate reverse
    num = num // 10                         # floor divide num by 10

print("Reverse: ", reverse)                 # Print reverse


