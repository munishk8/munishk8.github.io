# Program using lambda function: filter()

ls = [1,2,3,4,5,6,7,8,9,10]                         # Taken a list

newList = list(filter(lambda x:((x%2)==0), ls))     # Filter even numbers
print(newList)                                      # Print result



