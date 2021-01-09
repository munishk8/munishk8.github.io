# Program to reverse a string using function

def reverse_string(s):              # Define function
    rev = ""                        # Initialize rev
    for i in s:                     # loop through s
        rev = i + rev               # preappend i into reverse
    return rev                      # return 'rev'

string = input("Enter string: ")    # Input string
print(reverse_string(string))       # Call the function








